"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Invoice, InvoiceStatus } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "#64748b" },
  sent:      { label: "Sent",      color: "#3b82f6" },
  viewed:    { label: "Viewed",    color: "#8b5cf6" },
  paid:      { label: "Paid",      color: "#22c55e" },
  overdue:   { label: "Overdue",   color: "#ef4444" },
  cancelled: { label: "Cancelled", color: "#475569" },
};

function formatCurrency(amount: number, currency: string) {
  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency + " ";
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<InvoiceStatus | "">("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/invoices", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.clear();
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => { if (d) setInvoices((d as { invoices: Invoice[] }).invoices); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function updateStatus(id: string, status: InvoiceStatus) {
    const secret = getSecret();
    setUpdating(id);
    try {
      const res = await fetch("/api/dashboard/invoices", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const data = await res.json() as { invoice: Invoice };
        setInvoices((prev) => prev.map((inv) => inv.id === id ? data.invoice : inv));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    const secret = getSecret();
    const res = await fetch(`/api/dashboard/invoices?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (res.ok) setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [inv.clientName, inv.clientEmail, inv.clientCompany ?? "", inv.invoiceNumber].some((v) => v.toLowerCase().includes(q));
    const matchFilter = !filter || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pendingAmount = invoices.filter((i) => ["sent", "viewed"].includes(i.status)).reduce((s, i) => s + i.total, 0);

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Invoices</h1>
            <p className="text-slate-500 text-xs mt-0.5">{invoices.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-44"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as InvoiceStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <Link
              href="/enter/backdrop/dashboard/invoices/new"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              + New Invoice
            </Link>
          </div>
        </header>

        {/* Summary cards */}
        {!loading && (
          <div className="flex gap-4 px-6 pt-5">
            <SummaryCard label="Total Revenue" value={formatCurrency(totalRevenue, "INR")} color="#22c55e" />
            <SummaryCard label="Pending Payment" value={formatCurrency(pendingAmount, "INR")} color="#f59e0b" />
            <SummaryCard label="Invoices Issued" value={String(invoices.filter((i) => i.status !== "draft").length)} color="#3b82f6" />
            <SummaryCard label="Overdue" value={String(invoices.filter((i) => i.status === "overdue").length)} color="#ef4444" />
          </div>
        )}

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search || filter ? "No matching invoices." : "No invoices yet. Create your first invoice →"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Invoice #", "Client", "Amount", "Status", "Issued", "Due", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const sm = STATUS_META[inv.status];
                    return (
                      <tr key={inv.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Link href={`/enter/backdrop/dashboard/invoices/${inv.id}`} className="text-indigo-400 font-mono text-xs hover:text-indigo-300">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="text-white text-sm font-medium">{inv.clientName}</p>
                          <p className="text-slate-500 text-xs">{inv.clientEmail}</p>
                        </td>
                        <td className="py-3 px-3 text-white font-medium whitespace-nowrap tabular-nums">
                          {formatCurrency(inv.total, inv.currency)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <select
                            value={inv.status}
                            disabled={updating === inv.id}
                            onChange={(e) => updateStatus(inv.id, e.target.value as InvoiceStatus)}
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer outline-none"
                            style={{ background: `${sm.color}18`, color: sm.color, border: `1px solid ${sm.color}40` }}
                          >
                            {Object.entries(STATUS_META).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                          {inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                          <span style={{ color: inv.status === "overdue" ? "#ef4444" : undefined }}>
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/enter/backdrop/dashboard/invoices/${inv.id}`}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="text-xs text-red-500 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 flex-1" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}
