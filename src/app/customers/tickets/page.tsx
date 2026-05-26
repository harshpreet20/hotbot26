"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  in_progress: { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  resolved:    { label: "Resolved",    color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  closed:      { label: "Closed",      color: "#64748b", bg: "rgba(100,116,139,0.15)" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#64748b" },
  medium: { label: "Medium", color: "#f59e0b" },
  high:   { label: "High",   color: "#ef4444" },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

export default function SupportTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");
  const [form, setForm] = useState({
    subject:     "",
    description: "",
    priority:    "medium",
  });

  async function load() {
    const res = await fetch("/api/customers/tickets");
    if (res.status === 401) { router.replace("/customers"); return; }
    const d = await res.json() as { tickets?: Ticket[] };
    setTickets(d.tickets ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.subject.trim()) { setError("Subject is required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json() as { error?: string };
      if (!res.ok) { setError(d.error ?? "Failed to submit ticket."); return; }
      setSuccess(true);
      setForm({ subject: "", description: "", priority: "medium" });
      await load();
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Support Tickets</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Submit a request or track existing support tickets.</p>
      </div>

      {/* New ticket form */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "24px",
        marginBottom: 32,
      }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Open a New Ticket</h2>

        {success && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, fontSize: 13, color: "#86efac" }}>
            Ticket submitted successfully. Our team will be in touch soon.
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Brief description of the issue"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                style={{ ...inputStyle, width: 130 }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail — what happened, what you expected, any relevant steps to reproduce..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 24px",
              background: submitting ? "rgba(99,102,241,0.5)" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      </div>

      {/* Ticket list */}
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
          Your Tickets
          {tickets.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b", fontWeight: 400 }}>({tickets.length})</span>
          )}
        </h2>

        {loading ? (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 40 }}>Loading…</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, color: "#64748b", fontSize: 13 }}>
            No tickets yet. Submit one above if you need help.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tickets.map((t) => {
              const sm = STATUS_META[t.status] ?? STATUS_META.open;
              const pm = PRIORITY_META[t.priority] ?? PRIORITY_META.medium;
              return (
                <div
                  key={t.id}
                  style={{
                    padding: "18px 20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#fff" }}>{t.subject}</p>
                      {t.description && (
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#64748b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {t.description}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sm.color, background: sm.bg, padding: "2px 8px", borderRadius: 100 }}>
                          {sm.label}
                        </span>
                        <span style={{ fontSize: 11, color: pm.color, fontWeight: 600 }}>
                          {pm.label} priority
                        </span>
                        <span style={{ fontSize: 11, color: "#475569" }}>·</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>{fmtDate(t.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
