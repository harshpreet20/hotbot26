"use client";

import { useEffect, useState } from "react";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

type StatusFilter = "all" | "open" | "in_progress" | "waiting" | "resolved" | "closed";

const STATUS_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  open:        { text: "#93c5fd", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.25)"  },
  in_progress: { text: "#fcd34d", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"  },
  waiting:     { text: "#c4b5fd", bg: "rgba(139,92,246,0.1)",   border: "rgba(139,92,246,0.25)"  },
  resolved:    { text: "#86efac", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)"   },
  closed:      { text: "#94a3b8", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.25)" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low:      "#86efac",
  medium:   "#fcd34d",
  high:     "#fb923c",
  critical: "#f87171",
};

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",         label: "All"         },
  { key: "open",        label: "Open"        },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting",     label: "Waiting"     },
  { key: "resolved",    label: "Resolved"    },
  { key: "closed",      label: "Closed"      },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { text: "#94a3b8", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
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
      {status.replace(/_/g, " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority?.toLowerCase()] ?? "#94a3b8";
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color,
        textTransform: "capitalize",
      }}
    >
      {priority || "—"}
    </span>
  );
}

export default function PortalTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch("/api/portal/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets ?? d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div style={{ padding: "32px 36px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.2px" }}
        >
          My Tickets
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
        </p>
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
          Loading tickets...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
          }}
        >
          <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
            {filter === "all"
              ? "No tickets yet."
              : `No ${filter.replace(/_/g, " ")} tickets.`}
          </p>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 14,
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
                {["Ticket #", "Title", "Category", "Priority", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
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
              {filtered.map((ticket, i) => (
                <tr
                  key={ticket.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: "transparent",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
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
                    {ticket.ticketNumber}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#cbd5e1",
                      fontWeight: 500,
                      maxWidth: 280,
                    }}
                  >
                    {ticket.title}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#64748b",
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ticket.category || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#475569",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
