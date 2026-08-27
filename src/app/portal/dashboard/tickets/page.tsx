"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

const CATEGORIES = ["general", "support", "billing", "bug", "feature"];
const PRIORITIES  = ["low", "medium", "high", "critical"];

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
      {status.replace(/_/g, " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority?.toLowerCase()] ?? "#94a3b8";
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: "capitalize" }}>
      {priority || "—"}
    </span>
  );
}

const selectStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  color: "#e2e8f0",
  padding: "9px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  color: "#e2e8f0",
  padding: "9px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function PortalTicketsPage() {
  return (
    <Suspense fallback={<div style={{ padding:32, color:"#64748b", fontSize:14 }}>Loading…</div>}>
      <TicketsInner />
    </Suspense>
  );
}

function TicketsInner() {
  const searchParams = useSearchParams();
  const isFeatureTab = searchParams.get("tab") === "feature";
  const didAutoOpen = useRef(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title: "", category: isFeatureTab ? "feature" : "general", priority: "medium", description: "" });

  function loadTickets() {
    return fetch("/api/portal/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets ?? d ?? []))
      .catch(console.error);
  }

  useEffect(() => {
    loadTickets().finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFeatureTab && !didAutoOpen.current) {
      didAutoOpen.current = true;
      setForm(f => ({ ...f, category: "feature" }));
      setShowForm(true);
    }
  }, [isFeatureTab]);

  const baseTickets = isFeatureTab ? tickets.filter(t => t.category === "feature") : tickets;
  const filtered = filter === "all" ? baseTickets : baseTickets.filter((t) => t.status === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to submit ticket."); return; }
      setShowForm(false);
      setForm({ title: "", category: "general", priority: "medium", description: "" });
      await loadTickets();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "32px 36px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.2px" }}>
            {isFeatureTab ? "Feature Requests" : "My Tickets"}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {isFeatureTab
              ? "Share ideas to improve our products and services"
              : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {isFeatureTab && (
            <button
              onClick={() => { setForm(f=>({...f,category:"feature",priority:"medium"})); setShowForm(!showForm); setFormError(""); }}
              style={{
                padding: "9px 18px", borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: "pointer",
                color: "#fbbf24", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
                display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.2s",
              }}
            >
              ⭐ {showForm ? "Cancel" : "+ Request Feature"}
            </button>
          )}
          <button
            onClick={() => { setForm(f=>({...f,category:isFeatureTab?"feature":"general"})); setShowForm(!showForm); setFormError(""); }}
            style={{
              padding: "9px 18px", borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: "pointer",
              color: "#ffffff", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none", display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        </div>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 24,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>
            {form.category === "feature" ? "Submit a Feature Request" : "Submit a Support Ticket"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Briefly describe your issue"
                style={inputStyle}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                  Category
                </label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={selectStyle}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} style={{ background: "#0f1729" }}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                  Priority
                </label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={selectStyle}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p} style={{ background: "#0f1729" }}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide more details about your issue..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            {formError && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#fca5a5",
                }}
              >
                {formError}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(""); }}
                style={{
                  padding: "9px 18px",
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#64748b",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "9px 22px",
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  color: "#ffffff",
                  background: submitting ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#475569", fontSize: 14 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite", marginRight: 10 }}>
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
            borderRadius: 24,
          }}
        >
          <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
            {filter === "all"
              ? "No tickets yet. Click \"New Ticket\" to submit one."
              : `No ${filter.replace(/_/g, " ")} tickets.`}
          </p>
        </div>
      ) : (
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
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
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
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
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#6366f1", whiteSpace: "nowrap" }}>
                    {ticket.ticketNumber}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#cbd5e1", fontWeight: 500, maxWidth: 280 }}>
                    {ticket.title}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {ticket.category || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569", fontSize: 12, whiteSpace: "nowrap" }}>
                    {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
