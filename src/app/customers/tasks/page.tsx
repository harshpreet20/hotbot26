"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trackPortalEvent } from "@/lib/portal-track";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string | null;
  assigned_to?: string | null;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pending",     color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  in_progress: { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  done:        { label: "Done",        color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  cancelled:   { label: "Cancelled",   color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#64748b" },
  medium: { label: "Medium", color: "#f59e0b" },
  high:   { label: "High",   color: "#ef4444" },
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  useEffect(() => {
    fetch("/api/customers/tasks")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.json() as Promise<{ tasks: Task[] }>;
      })
      .then((d) => {
        if (d) {
          setTasks(d.tasks ?? []);
          trackPortalEvent("page_view", { page: "/customers/tasks" });
        }
        setLoading(false);
      })
      .catch(() => router.replace("/customers"));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) { router.replace("/customers"); return; }
      const data = await res.json() as { task?: Task; error?: string };
      if (!res.ok) { setFormError(data.error ?? "Failed to submit request."); setSubmitting(false); return; }
      if (data.task) {
        setTasks((prev) => [data.task!, ...prev]);
        trackPortalEvent("task_create");
      }
      setForm({ title: "", description: "", priority: "medium" });
      setShowForm(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "32px 40px", color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#fff" }}>Task Requests</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Submit and track your task requests.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(null); }}
          style={{
            padding: "9px 18px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 9,
            color: "#a5b4fc",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showForm ? "✕ Cancel" : "+ New Request"}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: 28,
            padding: "24px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 14,
          }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>New Task Request</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Update homepage hero section"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Provide any additional details or context…"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              style={{
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {formError && (
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#ef4444" }}>{formError}</p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                background: "rgba(99,102,241,0.8)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null); setForm({ title: "", description: "", priority: "medium" }); }}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      {loading ? (
        <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 60 }}>Loading…</div>
      ) : tasks.length === 0 ? (
        <div style={{
          padding: "48px 32px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          textAlign: "center",
          color: "#64748b",
          fontSize: 14,
        }}>
          No task requests yet. Click &quot;+ New Request&quot; to submit one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((task) => {
            const statusMeta = STATUS_META[task.status] ?? { label: task.status, color: "#94a3b8", bg: "rgba(148,163,184,0.15)" };
            const priorityMeta = PRIORITY_META[task.priority] ?? { label: task.priority, color: "#94a3b8" };
            return (
              <div
                key={task.id}
                style={{
                  padding: "18px 22px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{task.title}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: statusMeta.color,
                      background: statusMeta.bg,
                      padding: "2px 8px",
                      borderRadius: 100,
                    }}>
                      {statusMeta.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: priorityMeta.color }}>
                      {priorityMeta.label} priority
                    </span>
                  </div>
                  {task.description && (
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                      {task.description}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>
                      Submitted {fmtDate(task.created_at)}
                    </span>
                    {task.due_date && (
                      <span style={{ fontSize: 12, color: "#475569" }}>
                        Due {fmtDate(task.due_date)}
                      </span>
                    )}
                    {task.assigned_to && (
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        Assigned to {task.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
