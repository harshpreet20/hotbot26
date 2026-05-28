"use client";

import { useState, useEffect } from "react";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  category?: string;
  priority?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  dueDate?: string;
  issuedDate?: string;
}

interface PortalUser {
  email: string;
  name: string;
  clientRef: string;
}

const TICKET_STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  open:        { bg: "rgba(59,130,246,0.1)",   color: "#93c5fd", border: "rgba(59,130,246,0.25)"  },
  in_progress: { bg: "rgba(245,158,11,0.1)",   color: "#fcd34d", border: "rgba(245,158,11,0.25)"  },
  waiting:     { bg: "rgba(139,92,246,0.1)",   color: "#c4b5fd", border: "rgba(139,92,246,0.25)"  },
  resolved:    { bg: "rgba(34,197,94,0.1)",    color: "#86efac", border: "rgba(34,197,94,0.25)"   },
  closed:      { bg: "rgba(100,116,139,0.1)",  color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
};

const INVOICE_STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  sent:      { bg: "rgba(59,130,246,0.1)",   color: "#93c5fd", border: "rgba(59,130,246,0.25)"  },
  paid:      { bg: "rgba(34,197,94,0.1)",    color: "#86efac", border: "rgba(34,197,94,0.25)"   },
  overdue:   { bg: "rgba(239,68,68,0.1)",    color: "#fca5a5", border: "rgba(239,68,68,0.25)"   },
  draft:     { bg: "rgba(100,116,139,0.1)",  color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
  cancelled: { bg: "rgba(100,116,139,0.1)",  color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
};

function StatusBadge({ status, type }: { status: string; type: "ticket" | "invoice" }) {
  const map = type === "ticket" ? TICKET_STATUS_STYLES : INVOICE_STATUS_STYLES;
  const s = map[status] ?? { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.25)" };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 6,
        padding: "2px 8px",
        letterSpacing: "0.3px",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function SkeletonBlock({ width = "100%", height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: "rgba(255,255,255,0.07)",
        animation: "pulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(total: number, currency: string) {
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

const cardBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "20px 22px",
};

export default function PortalDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [authRes, ticketsRes, invoicesRes] = await Promise.all([
          fetch("/api/portal/auth"),
          fetch("/api/portal/tickets"),
          fetch("/api/portal/invoices"),
        ]);
        if (authRes.ok) {
          const d = await authRes.json();
          setUser(d.user ?? null);
        }
        if (ticketsRes.ok) {
          const d = await ticketsRes.json();
          setTickets(d.tickets ?? d ?? []);
        }
        if (invoicesRes.ok) {
          const d = await invoicesRes.json();
          setInvoices(d.invoices ?? d ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openTickets = tickets.filter((t) => ["open", "in_progress", "waiting"].includes(t.status)).length;
  const recentTickets = tickets.slice(0, 3);
  const recentInvoices = invoices.slice(0, 3);

  return (
    <div style={{ padding: "32px 36px 48px", maxWidth: 1100 }}>
      {/* Welcome header */}
      <div style={{ marginBottom: 32 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonBlock width={300} height={28} />
            <SkeletonBlock width={130} height={22} />
          </div>
        ) : (
          <>
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: 24,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.3px",
              }}
            >
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            {user?.clientRef && (
              <span
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6366f1",
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 6,
                  padding: "3px 10px",
                  letterSpacing: "0.5px",
                  fontFamily: "monospace",
                }}
              >
                {user.clientRef}
              </span>
            )}
          </>
        )}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          { label: "Total Tickets",  value: tickets.length,  accent: "#6366f1" },
          { label: "Open Tickets",   value: openTickets,     accent: "#f59e0b" },
          { label: "Total Invoices", value: invoices.length, accent: "#8b5cf6" },
        ].map((stat) => (
          <div key={stat.label} style={cardBase}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SkeletonBlock width="50%" height={32} />
                <SkeletonBlock width="70%" height={13} />
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: stat.accent,
                    lineHeight: 1,
                    marginBottom: 7,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{stat.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recent activity — two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

        {/* Recent Tickets */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
              Recent Tickets
            </h2>
            <a
              href="/portal/dashboard/tickets"
              style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}
            >
              View all
            </a>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ ...cardBase, padding: "16px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SkeletonBlock width="65%" height={14} />
                    <SkeletonBlock width="40%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div
              style={{
                ...cardBase,
                padding: "36px 20px",
                textAlign: "center",
                color: "#475569",
                fontSize: 14,
              }}
            >
              No tickets yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentTickets.map((ticket) => (
                <div key={ticket.id} style={{ ...cardBase, padding: "14px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#e2e8f0",
                          marginBottom: 5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ticket.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        <span style={{ fontFamily: "monospace", color: "#6366f1", fontWeight: 600 }}>
                          {ticket.ticketNumber}
                        </span>
                        {" · "}
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
              Recent Invoices
            </h2>
            <a
              href="/portal/dashboard/invoices"
              style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}
            >
              View all
            </a>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ ...cardBase, padding: "16px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SkeletonBlock width="65%" height={14} />
                    <SkeletonBlock width="40%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div
              style={{
                ...cardBase,
                padding: "36px 20px",
                textAlign: "center",
                color: "#475569",
                fontSize: 14,
              }}
            >
              No invoices yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} style={{ ...cardBase, padding: "14px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#e2e8f0",
                          marginBottom: 5,
                        }}
                      >
                        {formatCurrency(invoice.total, invoice.currency)}
                      </div>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        <span style={{ fontFamily: "monospace", color: "#6366f1", fontWeight: 600 }}>
                          {invoice.invoiceNumber}
                        </span>
                        {invoice.dueDate ? ` · Due ${formatDate(invoice.dueDate)}` : ""}
                      </div>
                    </div>
                    <StatusBadge status={invoice.status} type="invoice" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
