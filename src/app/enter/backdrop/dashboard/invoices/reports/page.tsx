"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

function authHeaders() {
  return { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" };
}

function fmtCurrency(amount: number, currency = "INR") {
  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : `${currency} `;
  return `${sym}${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Tab = "aging" | "gst" | "sales" | "outstanding" | "ai";

// ── Aging ──────────────────────────────────────────────────────────────────────
type AgingRow = {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  total: number;
  currency: string;
  due_date: string;
  status: string;
  daysOverdue: number;
};
type AgingSummaryBucket = { count: number; total: number };
type AgingData = {
  summary: {
    current: AgingSummaryBucket;
    days1_30: AgingSummaryBucket;
    days31_60: AgingSummaryBucket;
    days61_90: AgingSummaryBucket;
    days90plus: AgingSummaryBucket;
  };
  rows: AgingRow[];
};

// ── GST ───────────────────────────────────────────────────────────────────────
type GstRow = {
  invoiceNumber: string;
  clientName: string;
  issuedDate: string;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  total: number;
  currency: string;
};
type GstData = {
  totals: {
    totalTaxable: number;
    totalCgst: number;
    totalSgst: number;
    totalGst: number;
    totalRevenue: number;
  };
  rows: GstRow[];
};

// ── Sales ─────────────────────────────────────────────────────────────────────
type SalesRow = {
  month: string;
  invoiceCount: number;
  grossRevenue: number;
  collected: number;
  outstanding: number;
  currency: string;
};

// ── Outstanding ───────────────────────────────────────────────────────────────
type OutstandingRow = {
  clientEmail: string;
  clientName: string;
  clientCompany?: string;
  invoiceCount: number;
  totalOutstanding: number;
  oldestDue: string;
  latestDue: string;
  currency: string;
};
type OutstandingData = {
  grandTotal: number;
  rows: OutstandingRow[];
};

// ── AI Insights ───────────────────────────────────────────────────────────────
type AiInsights = {
  avg_days_to_pay?:   { days: number; sample_size: number };
  payment_risk?:      { score: number; overdue_count: number; total_invoices: number; label: "High" | "Medium" | "Low" };
  suggested_followup?: { days_after_issue: number; message: string };
  revenue_trend?:     { recent_3m: number; prior_3m: number; trend: "up" | "down" | "flat"; change_pct: number };
};

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-4 flex-1 min-w-[140px]" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold tabular-nums" style={{ color: color ?? "#f8fafc" }}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Table shell ───────────────────────────────────────────────────────────────
function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
function TD({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <td className={`py-3 px-3 text-sm text-slate-300 whitespace-nowrap${right ? " text-right tabular-nums" : ""}`}>
      {children}
    </td>
  );
}

export default function InvoiceReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("aging");
  const [loading, setLoading] = useState(false);

  // Aging
  const [agingData, setAgingData] = useState<AgingData | null>(null);

  // GST
  const [gstData, setGstData] = useState<GstData | null>(null);
  const [gstFrom, setGstFrom] = useState("");
  const [gstTo, setGstTo] = useState("");

  // Sales
  const [salesRows, setSalesRows] = useState<SalesRow[]>([]);

  // Outstanding
  const [outData, setOutData] = useState<OutstandingData | null>(null);

  // AI
  const [aiEmail, setAiEmail] = useState("");
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const secret = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";

  useEffect(() => {
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
  }, [router, secret]);

  const loadReport = useCallback(async (type: Tab, extra = "") => {
    if (type === "ai") return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/invoices/reports?type=${type}${extra}`, {
        headers: authHeaders(),
      });
      if (res.status === 401) { router.replace("/enter/backdrop"); return; }
      const d = await res.json() as Record<string, unknown>;
      if (type === "aging")       setAgingData(d as unknown as AgingData);
      if (type === "gst")         setGstData(d as unknown as GstData);
      if (type === "sales")       setSalesRows((d as { rows: SalesRow[] }).rows);
      if (type === "outstanding") setOutData(d as unknown as OutstandingData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load when tab changes (except GST which has manual apply, and AI)
  useEffect(() => {
    if (tab === "gst" || tab === "ai") return;
    loadReport(tab);
  }, [tab, loadReport]);

  async function computeAiInsights() {
    if (!aiEmail.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/dashboard/invoices/ai-insights", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email: aiEmail }),
      });
      const d = await res.json() as { insights: AiInsights };
      setAiInsights(d.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  async function loadAiInsights() {
    if (!aiEmail.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`/api/dashboard/invoices/ai-insights?email=${encodeURIComponent(aiEmail)}`, {
        headers: authHeaders(),
      });
      const d = await res.json() as { insights: AiInsights };
      setAiInsights(d.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "aging",       label: "Aging" },
    { key: "gst",         label: "GST" },
    { key: "sales",       label: "Sales" },
    { key: "outstanding", label: "Outstanding" },
    { key: "ai",          label: "AI Insights" },
  ];

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-4">
            <Link href="/enter/backdrop/dashboard/invoices" className="text-slate-500 hover:text-white text-sm transition-colors">
              ← Invoices
            </Link>
            <h1 className="text-white font-semibold">Invoice Reports</h1>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors"
              style={{
                color:      tab === t.key ? "#ffffff" : "#64748b",
                background: tab === t.key ? "rgba(99,102,241,0.15)" : "transparent",
                borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6">
          {loading && tab !== "ai" && (
            <div className="text-slate-500 text-sm py-20 text-center">Loading report…</div>
          )}

          {/* ── AGING TAB ─────────────────────────────────────────────────────── */}
          {tab === "aging" && !loading && agingData && (
            <div className="space-y-6">
              <div className="flex gap-3 flex-wrap">
                <Card label="Current"    value={fmtCurrency(agingData.summary.current.total)}    sub={`${agingData.summary.current.count} invoice(s)`}    color="#22c55e" />
                <Card label="1–30 Days"  value={fmtCurrency(agingData.summary.days1_30.total)}   sub={`${agingData.summary.days1_30.count} invoice(s)`}   color="#f59e0b" />
                <Card label="31–60 Days" value={fmtCurrency(agingData.summary.days31_60.total)}  sub={`${agingData.summary.days31_60.count} invoice(s)`}  color="#f97316" />
                <Card label="61–90 Days" value={fmtCurrency(agingData.summary.days61_90.total)}  sub={`${agingData.summary.days61_90.count} invoice(s)`}  color="#ef4444" />
                <Card label="90+ Days"   value={fmtCurrency(agingData.summary.days90plus.total)} sub={`${agingData.summary.days90plus.count} invoice(s)`} color="#dc2626" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <TH>Invoice #</TH><TH>Client</TH><TH>Amount</TH><TH>Status</TH><TH>Due Date</TH><TH>Days Overdue</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {agingData.rows.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <TD><span className="text-indigo-400 font-mono text-xs">{r.invoice_number}</span></TD>
                        <TD>
                          <p className="text-white text-sm font-medium">{r.client_name}</p>
                          <p className="text-slate-500 text-xs">{r.client_email}</p>
                        </TD>
                        <TD right>{fmtCurrency(r.total, r.currency)}</TD>
                        <TD><span className="capitalize">{r.status}</span></TD>
                        <TD>{fmtDate(r.due_date)}</TD>
                        <TD right>
                          <span style={{ color: r.daysOverdue > 90 ? "#dc2626" : r.daysOverdue > 60 ? "#ef4444" : r.daysOverdue > 30 ? "#f97316" : r.daysOverdue > 0 ? "#f59e0b" : "#22c55e" }}>
                            {r.daysOverdue > 0 ? `${r.daysOverdue}d` : "Current"}
                          </span>
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {agingData.rows.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-12">No overdue invoices.</p>
                )}
              </div>
            </div>
          )}

          {/* ── GST TAB ──────────────────────────────────────────────────────── */}
          {tab === "gst" && !loading && (
            <div className="space-y-6">
              {/* Date filter */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">From</label>
                  <input type="date" value={gstFrom} onChange={(e) => setGstFrom(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">To</label>
                  <input type="date" value={gstTo} onChange={(e) => setGstTo(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                <button onClick={() => loadReport("gst", `${gstFrom ? `&from=${gstFrom}` : ""}${gstTo ? `&to=${gstTo}` : ""}`)}
                  className="px-4 py-1.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: "rgba(99,102,241,0.8)" }}>
                  Apply
                </button>
              </div>

              {gstData && (
                <>
                  <div className="flex gap-3 flex-wrap">
                    <Card label="Total Taxable" value={fmtCurrency(gstData.totals.totalTaxable)} color="#a5b4fc" />
                    <Card label="CGST"          value={fmtCurrency(gstData.totals.totalCgst)}    color="#818cf8" />
                    <Card label="SGST"          value={fmtCurrency(gstData.totals.totalSgst)}    color="#818cf8" />
                    <Card label="Total GST"     value={fmtCurrency(gstData.totals.totalGst)}     color="#6366f1" />
                    <Card label="Gross Revenue" value={fmtCurrency(gstData.totals.totalRevenue)} color="#22c55e" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                          <TH>Invoice #</TH><TH>Client</TH><TH>Date</TH><TH>Subtotal</TH><TH>Discount</TH><TH>Taxable</TH><TH>Rate</TH><TH>CGST</TH><TH>SGST</TH><TH>Total</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {gstData.rows.map((r) => (
                          <tr key={r.invoiceNumber} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                            <TD><span className="text-indigo-400 font-mono text-xs">{r.invoiceNumber}</span></TD>
                            <TD>{r.clientName}</TD>
                            <TD>{fmtDate(r.issuedDate)}</TD>
                            <TD right>{fmtCurrency(r.subtotal, r.currency)}</TD>
                            <TD right>{r.discount > 0 ? fmtCurrency(r.discount, r.currency) : "—"}</TD>
                            <TD right>{fmtCurrency(r.taxableAmount, r.currency)}</TD>
                            <TD right>{r.taxRate}%</TD>
                            <TD right>{fmtCurrency(r.cgst, r.currency)}</TD>
                            <TD right>{fmtCurrency(r.sgst, r.currency)}</TD>
                            <TD right><span className="text-white font-semibold">{fmtCurrency(r.total, r.currency)}</span></TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {gstData.rows.length === 0 && <p className="text-slate-500 text-sm text-center py-12">No data for selected period.</p>}
                  </div>
                </>
              )}
              {!gstData && <p className="text-slate-500 text-sm text-center py-20">Select a date range and click Apply to load the GST report.</p>}
            </div>
          )}

          {/* ── SALES TAB ─────────────────────────────────────────────────────── */}
          {tab === "sales" && !loading && (
            <div className="space-y-6">
              {salesRows.length > 0 && (
                <>
                  {/* Bar chart (CSS only) */}
                  <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Monthly Revenue</p>
                    <div className="flex items-end gap-2 h-32 overflow-x-auto">
                      {salesRows.slice(0, 12).reverse().map((r) => {
                        const maxVal = Math.max(...salesRows.map((x) => x.grossRevenue), 1);
                        const pct    = Math.round((r.grossRevenue / maxVal) * 100);
                        return (
                          <div key={r.month} className="flex flex-col items-center gap-1 flex-shrink-0 w-10">
                            <div className="w-8 rounded-t-sm relative group" style={{ height: `${Math.max(pct, 4)}%`, background: "rgba(99,102,241,0.7)" }}>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                {fmtCurrency(r.grossRevenue, r.currency)}
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-500 rotate-45 origin-left mt-2">{r.month.slice(5)}/{r.month.slice(2, 4)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                          <TH>Month</TH><TH>Invoices</TH><TH>Gross Revenue</TH><TH>Collected</TH><TH>Outstanding</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {salesRows.map((r) => (
                          <tr key={`${r.month}-${r.currency}`} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                            <TD><span className="font-mono text-xs">{r.month}</span></TD>
                            <TD right>{r.invoiceCount}</TD>
                            <TD right><span className="text-white">{fmtCurrency(r.grossRevenue, r.currency)}</span></TD>
                            <TD right><span className="text-green-400">{fmtCurrency(r.collected, r.currency)}</span></TD>
                            <TD right><span className="text-amber-400">{fmtCurrency(r.outstanding, r.currency)}</span></TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {!loading && salesRows.length === 0 && <p className="text-slate-500 text-sm text-center py-20">No sales data found.</p>}
            </div>
          )}

          {/* ── OUTSTANDING TAB ───────────────────────────────────────────────── */}
          {tab === "outstanding" && !loading && outData && (
            <div className="space-y-6">
              <div className="flex gap-3 flex-wrap">
                <Card label="Total Outstanding" value={fmtCurrency(outData.grandTotal)} color="#ef4444" />
                <Card label="Clients Owing"     value={String(outData.rows.length)}     color="#f59e0b" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <TH>Client</TH><TH>Company</TH><TH>Invoices</TH><TH>Total Outstanding</TH><TH>Oldest Due</TH><TH>Latest Due</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {outData.rows.map((r) => (
                      <tr key={`${r.clientEmail}-${r.currency}`} className="border-b hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <TD>
                          <p className="text-white text-sm font-medium">{r.clientName}</p>
                          <p className="text-slate-500 text-xs">{r.clientEmail}</p>
                        </TD>
                        <TD>{r.clientCompany ?? "—"}</TD>
                        <TD right>{r.invoiceCount}</TD>
                        <TD right><span className="text-red-400 font-semibold">{fmtCurrency(r.totalOutstanding, r.currency)}</span></TD>
                        <TD>{fmtDate(r.oldestDue)}</TD>
                        <TD>{fmtDate(r.latestDue)}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {outData.rows.length === 0 && <p className="text-slate-500 text-sm text-center py-12">No outstanding receivables.</p>}
              </div>
            </div>
          )}

          {/* ── AI INSIGHTS TAB ───────────────────────────────────────────────── */}
          {tab === "ai" && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={aiEmail}
                  onChange={(e) => setAiEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button onClick={loadAiInsights} disabled={aiLoading || !aiEmail}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Load
                </button>
                <button onClick={computeAiInsights} disabled={aiLoading || !aiEmail}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                  style={{ background: "rgba(99,102,241,0.8)" }}>
                  {aiLoading ? "Computing…" : "Compute Insights"}
                </button>
              </div>

              {aiInsights && (
                <div className="space-y-4">
                  {/* Payment Risk */}
                  {aiInsights.payment_risk && (
                    <div className="rounded-2xl p-5 space-y-3" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Payment Risk</p>
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: aiInsights.payment_risk.label === "High" ? "rgba(239,68,68,0.15)" : aiInsights.payment_risk.label === "Medium" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
                            color: aiInsights.payment_risk.label === "High" ? "#ef4444" : aiInsights.payment_risk.label === "Medium" ? "#f59e0b" : "#22c55e",
                          }}>
                          {aiInsights.payment_risk.label} Risk
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${aiInsights.payment_risk.score}%`,
                            background: aiInsights.payment_risk.label === "High" ? "#ef4444" : aiInsights.payment_risk.label === "Medium" ? "#f59e0b" : "#22c55e",
                          }} />
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400">
                        <span>Score: <strong className="text-white">{aiInsights.payment_risk.score}/100</strong></span>
                        <span>Overdue: <strong className="text-white">{aiInsights.payment_risk.overdue_count}/{aiInsights.payment_risk.total_invoices}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Avg days to pay */}
                  {aiInsights.avg_days_to_pay && (
                    <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Avg Days to Pay</p>
                      <p className="text-3xl font-bold text-white">{Math.round(aiInsights.avg_days_to_pay.days)} <span className="text-base font-normal text-slate-500">days</span></p>
                      <p className="text-xs text-slate-500 mt-1">Based on {aiInsights.avg_days_to_pay.sample_size} paid invoice(s)</p>
                    </div>
                  )}

                  {/* Suggested follow-up */}
                  {aiInsights.suggested_followup && (
                    <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Suggested Follow-up</p>
                      <p className="text-3xl font-bold text-indigo-400">Day {aiInsights.suggested_followup.days_after_issue}</p>
                      <p className="text-xs text-slate-400 mt-1">{aiInsights.suggested_followup.message}</p>
                    </div>
                  )}

                  {/* Revenue trend */}
                  {aiInsights.revenue_trend && (
                    <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Revenue Trend (3-month)</p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {aiInsights.revenue_trend.trend === "up" ? "↑" : aiInsights.revenue_trend.trend === "down" ? "↓" : "→"}
                        </span>
                        <div>
                          <p className="text-lg font-bold"
                            style={{ color: aiInsights.revenue_trend.trend === "up" ? "#22c55e" : aiInsights.revenue_trend.trend === "down" ? "#ef4444" : "#94a3b8" }}>
                            {aiInsights.revenue_trend.change_pct > 0 ? "+" : ""}{aiInsights.revenue_trend.change_pct}%
                          </p>
                          <p className="text-xs text-slate-500">
                            Recent: {fmtCurrency(aiInsights.revenue_trend.recent_3m)} &nbsp;|&nbsp;
                            Prior: {fmtCurrency(aiInsights.revenue_trend.prior_3m)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!aiInsights && !aiLoading && (
                <p className="text-slate-500 text-sm">Enter a client email to load or compute AI insights.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
