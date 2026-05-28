"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  clientName: string;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
}

type StatusFilter = "all" | "sent" | "paid" | "overdue" | "cancelled";

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  draft:     { text: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  sent:      { text: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  viewed:    { text: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  paid:      { text: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  overdue:   { text: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  cancelled: { text: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
  { key: "cancelled", label: "Cancelled" },
];

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, color, background: bg, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? invoices : invoices.filter((inv) => inv.status === filter);

  const outstanding = invoices
    .filter((inv) => ["sent", "overdue", "viewed"].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  const currency = invoices[0]?.currency ?? "INR";

  return (
    <div style={{ padding: "32px 36px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>My Invoices</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</p>
        </div>
        {outstanding > 0 && (
          <div style={{ padding: "10px 18px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.5px" }}>Outstanding</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fca5a5" }}>
              {currency} {outstanding.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                color: active ? "#e2e8f0" : "#64748b",
                background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#475569", fontSize: 14 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
            {filter === "all" ? "No invoices yet." : `No ${filter} invoices.`}
          </p>
        </div>
      ) : (
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Invoice #", "Status", "Amount", "Issued", "Due Date", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: i >= 5 ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => {
                const sc = STATUS_COLORS[inv.status] ?? { text: "#6b7280", bg: "rgba(107,114,128,0.12)" };
                return (
                  <tr key={inv.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#6366f1", whiteSpace: "nowrap" }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge label={inv.status} color={sc.text} bg={sc.bg} />
                    </td>
                    <td style={{ padding: "12px 16px", color: "#e2e8f0", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {inv.currency} {(inv.total ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>
                      {new Date(inv.issuedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px", color: inv.status === "overdue" ? "#f87171" : "#64748b", fontSize: 12, fontWeight: inv.status === "overdue" ? 600 : 400, whiteSpace: "nowrap" }}>
                      {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <a
                        href={`/invoice/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}
                      >
                        View ↗
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
