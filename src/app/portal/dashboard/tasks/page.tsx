"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt?: string;
  linkedEntityType?: string;
  linkedEntityLabel?: string;
}

type StatusFilter = "all" | "open" | "in_progress" | "done" | "cancelled";

const STATUS_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  open:        { text: "#93c5fd", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.25)"  },
  in_progress: { text: "#fcd34d", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"  },
  done:        { text: "#86efac", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)"   },
  cancelled:   { text: "#94a3b8", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.25)" },
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
  { key: "done",        label: "Done"        },
  { key: "cancelled",   label: "Cancelled"   },
];

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PortalTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch("/api/portal/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div style={{ padding: "32px 36px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.2px" }}>
          Project Tasks
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
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
          Loading tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24 }}>
          <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
            {filter === "all" ? "No project tasks yet." : `No ${filter.replace(/_/g, " ")} tasks.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((task) => {
            const s = STATUS_STYLES[task.status] ?? STATUS_STYLES.open;
            const priorityColor = PRIORITY_COLORS[task.priority?.toLowerCase()] ?? "#94a3b8";
            const due = formatDate(task.dueDate);
            const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

            return (
              <div
                key={task.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: "18px 22px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, lineHeight: 1.5 }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      {/* Priority */}
                      <span style={{ fontSize: 12, fontWeight: 600, color: priorityColor, textTransform: "capitalize" }}>
                        {task.priority}
                      </span>
                      {/* Linked entity */}
                      {task.linkedEntityLabel && (
                        <span style={{ fontSize: 12, color: "#475569" }}>
                          · {task.linkedEntityType && `${task.linkedEntityType}: `}{task.linkedEntityLabel}
                        </span>
                      )}
                      {/* Due date */}
                      {due && (
                        <span style={{ fontSize: 12, color: isOverdue ? "#f87171" : "#475569", fontWeight: isOverdue ? 600 : 400 }}>
                          · Due {due}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status badge */}
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
                      flexShrink: 0,
                    }}
                  >
                    {task.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}
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
