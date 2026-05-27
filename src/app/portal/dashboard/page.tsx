"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  status: string;
  client_name: string;
  client_company?: string;
  total: number;
  currency: string;
  issued_date: string;
  due_date: string;
  paid_date?: string;
  subtotal: number;
  tax_amount: number;
  discount: number;
  line_items: unknown;
}

interface PortalData {
  email: string;
  invoices: InvoiceRow[];
  payments: unknown[];
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Draft",     color: "#64748b", bg: "#f1f5f9" },
  sent:      { label: "Sent",      color: "#3b82f6", bg: "#eff6ff" },
  viewed:    { label: "Viewed",    color: "#8b5cf6", bg: "#f5f3ff" },
  paid:      { label: "Paid",      color: "#16a34a", bg: "#f0fdf4" },
  overdue:   { label: "Overdue",   color: "#dc2626", bg: "#fef2f2" },
  cancelled: { label: "Cancelled", color: "#475569", bg: "#f8fafc" },
};

function currencySymbol(currency: string) {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  if (currency === "EUR") return "€";
  return currency + " ";
}

function fmtAmount(amount: number, currency: string) {
  return `${currencySymbol(currency)}${(amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(inv: InvoiceRow): boolean {
  if (inv.status === "paid" || inv.status === "cancelled") return false;
  return new Date(inv.due_date) < new Date();
}

function agingBucket(dueDate: string): string {
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
  if (days > 60) return "60+ days";
  if (days > 30) return "31–60 days";
  return "0–30 days";
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/portal");
          return null;
        }
        return res.json() as Promise<PortalData>;
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => router.replace("/portal"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    // Clear cookie by setting expired
    await fetch("/api/portal/logout", { method: "POST" }).catch(() => null);
    // Clear cookie client-side as fallback
    document.cookie = "portal_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/portal");
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #e5e7eb",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Loading your invoices…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const invoices = data.invoices ?? [];
  const currency = invoices[0]?.currency ?? "INR";
  const totalBilled = invoices.reduce((s, i) => s + (i.total ?? 0), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total ?? 0), 0);
  const outstanding = totalBilled - totalPaid;
  const overdueInvoices = invoices.filter(i => isOverdue(i));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)",
        padding: "0",
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Image
              src="/logos/brand-logo.png"
              alt="HotBot Studios"
              width={130}
              height={33}
              style={{ objectFit: "contain" }}
            />
            <span style={{
              color: "#a5b4fc",
              fontSize: "12px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 500,
              paddingLeft: "16px",
              borderLeft: "1px solid rgba(165,180,252,0.3)",
            }}>
              Invoice Portal
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#a5b4fc", fontSize: "13px" }}>{data.email}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.1)",
                color: "#e0e7ff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#111827" }}>
            Your Account
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            View and manage your invoices from HotBot Studios
          </p>
        </div>

        {/* Summary cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}>
          {[
            { label: "Total Billed", value: fmtAmount(totalBilled, currency), color: "#6366f1", bg: "#eff6ff" },
            { label: "Amount Paid", value: fmtAmount(totalPaid, currency), color: "#16a34a", bg: "#f0fdf4" },
            { label: "Outstanding Balance", value: fmtAmount(outstanding, currency), color: outstanding > 0 ? "#dc2626" : "#16a34a", bg: outstanding > 0 ? "#fef2f2" : "#f0fdf4" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                {card.label}
              </p>
              <p style={{ margin: 0, fontSize: "26px", fontWeight: 700, color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Invoice table */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)",
          marginBottom: "28px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
              Invoices ({invoices.length})
            </h2>
          </div>

          {invoices.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#9ca3af" }}>
              No invoices found.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Invoice #", "Issued", "Due Date", "Amount", "Status", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "1px solid #f1f5f9",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => {
                    const meta = STATUS_META[inv.status] ?? STATUS_META.draft;
                    const overdue = isOverdue(inv);
                    const isPaid = inv.status === "paid";
                    return (
                      <tr key={inv.id} style={{
                        borderBottom: idx < invoices.length - 1 ? "1px solid #f8fafc" : "none",
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                      >
                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                          {inv.invoice_number}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6b7280" }}>
                          {fmtDate(inv.issued_date)}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: overdue ? "#dc2626" : "#6b7280", fontWeight: overdue ? 600 : 400 }}>
                          {fmtDate(inv.due_date)}
                          {overdue && <span style={{ marginLeft: "4px", fontSize: "11px" }}>overdue</span>}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                          {fmtAmount(inv.total, inv.currency)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 12px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: meta.color,
                            background: meta.bg,
                          }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <a
                              href={`/invoice/${inv.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "6px 14px",
                                background: "#f1f5f9",
                                color: "#475569",
                                borderRadius: "7px",
                                fontSize: "12px",
                                fontWeight: 600,
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              View / PDF
                            </a>
                            {!isPaid && (
                              <a
                                href={`/invoice/${inv.id}`}
                                style={{
                                  padding: "6px 14px",
                                  background: "#6366f1",
                                  color: "#ffffff",
                                  borderRadius: "7px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Pay Now
                              </a>
                            )}
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

        {/* Account Statement / Overdue section */}
        {overdueInvoices.length > 0 && (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                Outstanding Items
              </h2>
              <span style={{
                padding: "3px 10px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 700,
              }}>
                {overdueInvoices.length} overdue
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Invoice #", "Due Date", "Amount", "Days Overdue", "Aging", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "1px solid #f1f5f9",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overdueInvoices.map((inv, idx) => {
                    const daysOverdue = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
                    const bucket = agingBucket(inv.due_date);
                    const bucketColor = daysOverdue > 60 ? "#dc2626" : daysOverdue > 30 ? "#f59e0b" : "#6b7280";
                    return (
                      <tr key={inv.id} style={{
                        borderBottom: idx < overdueInvoices.length - 1 ? "1px solid #f8fafc" : "none",
                      }}>
                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                          {inv.invoice_number}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
                          {fmtDate(inv.due_date)}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                          {fmtAmount(inv.total, inv.currency)}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
                          {daysOverdue} days
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            display: "inline-flex",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: bucketColor,
                            background: `${bucketColor}18`,
                          }}>
                            {bucket}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <a
                            href={`/invoice/${inv.id}`}
                            style={{
                              padding: "6px 14px",
                              background: "#6366f1",
                              color: "#ffffff",
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Pay Now
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>
            &copy; {new Date().getFullYear()} HotBot Studios &nbsp;&middot;&nbsp;
            <a href="/" style={{ color: "#6366f1", textDecoration: "none" }}>hotbotstudios.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
