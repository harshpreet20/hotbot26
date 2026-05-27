"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackPortalEvent } from "@/lib/portal-track";

interface PortalInvoice {
  id: string;
  invoice_number: string;
  status: string;
  client_name: string;
  client_email: string;
  total: number;
  currency: string;
  issued_date: string;
  due_date: string;
  paid_date?: string | null;
}

interface Summary {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Draft",     color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  sent:      { label: "Sent",      color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  viewed:    { label: "Viewed",    color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  paid:      { label: "Paid",      color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  overdue:   { label: "Overdue",   color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  cancelled: { label: "Cancelled", color: "#475569", bg: "rgba(71,85,105,0.15)" },
};

const PAYABLE_STATUSES = ["sent", "viewed", "overdue"];

function currencySymbol(currency: string) {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  if (currency === "EUR") return "€";
  return currency + " ";
}

function fmtAmount(amount: number, currency: string) {
  return `${currencySymbol(currency)}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(invoice: PortalInvoice) {
  return invoice.status === "overdue" ||
    (PAYABLE_STATUSES.includes(invoice.status) && invoice.due_date && new Date(invoice.due_date) < new Date());
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalBilled: 0, totalPaid: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers/invoices")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.json() as Promise<{ invoices: PortalInvoice[]; summary: Summary }>;
      })
      .then((d) => {
        if (d) {
          setInvoices(d.invoices ?? []);
          setSummary(d.summary ?? { totalBilled: 0, totalPaid: 0, outstanding: 0 });
          trackPortalEvent("page_view", { page: "/customers/invoices" });
        }
        setLoading(false);
      })
      .catch(() => router.replace("/customers"));
  }, [router]);

  const overdueAmount = invoices
    .filter((i) => isOverdue(i))
    .reduce((s, i) => s + (i.total ?? 0), 0);

  const defaultCurrency = invoices[0]?.currency ?? "INR";

  return (
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Invoices</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} in your account
          </p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              <SummaryCard
                label="Total Billed"
                value={fmtAmount(summary.totalBilled, defaultCurrency)}
                color="#e2e8f0"
                icon="◎"
              />
              <SummaryCard
                label="Total Paid"
                value={fmtAmount(summary.totalPaid, defaultCurrency)}
                color="#22c55e"
                icon="✓"
              />
              <SummaryCard
                label="Outstanding"
                value={fmtAmount(summary.outstanding, defaultCurrency)}
                color="#f59e0b"
                icon="⏳"
              />
              <SummaryCard
                label="Overdue Amount"
                value={overdueAmount > 0 ? fmtAmount(overdueAmount, defaultCurrency) : "None"}
                color={overdueAmount > 0 ? "#ef4444" : "#22c55e"}
                icon={overdueAmount > 0 ? "⚠" : "✓"}
              />
            </div>

            {/* Invoice table */}
            {invoices.length === 0 ? (
              <div style={{
                padding: "48px",
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                color: "#64748b",
              }}>
                No invoices yet.
              </div>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                overflow: "hidden",
              }}>
                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 120px 130px 100px 160px",
                  gap: 8,
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {["Invoice #", "Issued", "Due", "Amount", "Status", "Action"].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Table rows */}
                {invoices.map((inv) => {
                  const overdue = isOverdue(inv);
                  const payable = PAYABLE_STATUSES.includes(inv.status);
                  const sm = STATUS_META[inv.status] ?? STATUS_META.draft;

                  return (
                    <div
                      key={inv.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 120px 120px 130px 100px 160px",
                        gap: 8,
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        borderLeft: overdue ? "3px solid #ef4444" : "3px solid transparent",
                        alignItems: "center",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", fontFamily: "monospace" }}>
                        #{inv.invoice_number}
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(inv.issued_date)}</span>
                      <span style={{
                        fontSize: 12,
                        color: overdue ? "#ef4444" : "#94a3b8",
                        fontWeight: overdue ? 600 : 400,
                      }}>
                        {fmtDate(inv.due_date)}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                        {fmtAmount(inv.total, inv.currency)}
                      </span>
                      <span style={{
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 700,
                        color: sm.color,
                        background: sm.bg,
                        padding: "3px 10px",
                        borderRadius: 100,
                      }}>
                        {sm.label}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        {payable ? (
                          <Link
                            href={`/invoice/${inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              padding: "6px 14px",
                              borderRadius: 8,
                              background: "rgba(99,102,241,0.2)",
                              border: "1px solid rgba(99,102,241,0.3)",
                              color: "#a5b4fc",
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            💳 Pay Now
                          </Link>
                        ) : (
                          <Link
                            href={`/invoice/${inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              padding: "6px 14px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#94a3b8",
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ⬇ View / PDF
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 16, color: "#475569" }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color }}>{value}</p>
    </div>
  );
}

