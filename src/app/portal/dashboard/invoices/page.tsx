"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  issuedDate?: string;
  dueDate?: string;
  paidDate?: string;
}

type StatusFilter = "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled";

const STATUS_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  draft:     { text: "#94a3b8", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.25)" },
  sent:      { text: "#93c5fd", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.25)"  },
  viewed:    { text: "#a5b4fc", bg: "rgba(99,102,241,0.1)",   border: "rgba(99,102,241,0.25)"  },
  paid:      { text: "#86efac", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)"   },
  overdue:   { text: "#fca5a5", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"   },
  cancelled: { text: "#94a3b8", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.25)" },
};

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "sent",      label: "Sent"      },
  { key: "paid",      label: "Paid"      },
  { key: "overdue",   label: "Overdue"   },
  { key: "draft",     label: "Draft"     },
  { key: "cancelled", label: "Cancelled" },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { text: "#94a3b8", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        color: s.text,
        background: s.bg,
        border: `1px solid ${s.border}`,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
      }}
    >
      {status}
    </span>
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(total: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(total / 100);
  } catch {
    return `${currency} ${(total / 100).toFixed(2)}`;
  }
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? invoices : invoices.filter((inv) => inv.status === filter);

  const outstanding = invoices
    .filter((inv) => ["sent", "overdue", "viewed"].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  const defaultCurrency = invoices[0]?.currency ?? "USD";

  return (
    <div style={{ padding: "32px 36px 48px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.2px" }}>
            My Invoices
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {outstanding > 0 && (
          <div
            style={{
              padding: "12px 20px",
              borderRadius: 20,
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p
              style={{
                margin: "0 0 2px",
                fontSize: 11,
                fontWeight: 600,
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Outstanding
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fca5a5" }}>
              {formatAmount(outstanding, defaultCurrency)}
            </p>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {STATUS_FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "6px 14px",
                borderRadius: 14,
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

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            color: "#475569",
            fontSize: 14,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: "spin 1s linear infinite", marginRight: 10 }}
          >
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 24,
          }}
        >
          <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
            {filter === "all" ? "No invoices yet." : `No ${filter} invoices.`}
          </p>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {["Invoice #", "Status", "Amount", "Issued", "Due Date", ""].map((h, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: "11px 16px",
                      textAlign: idx >= 5 ? "right" : "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice, i) => (
                <tr
                  key={invoice.id}
                  onClick={() => window.open(`/invoice/${invoice.id}`, "_blank")}
                  style={{
                    borderBottom:
                      i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    cursor: "pointer",
                    background: "transparent",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#6366f1",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {invoice.invoiceNumber}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#e2e8f0",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatAmount(invoice.total, invoice.currency)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#64748b",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(invoice.issuedDate)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: invoice.status === "overdue" ? "#f87171" : "#64748b",
                      fontWeight: invoice.status === "overdue" ? 600 : 400,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <a
                      href={`/invoice/${invoice.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: 12,
                        color: "#6366f1",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      View ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
