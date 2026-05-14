"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { CRMTask, TaskPriority, TaskStatus } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getUsername() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_username") || "" : "";
}

const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#64748b" },
  medium: { label: "Medium", color: "#3b82f6" },
  high:   { label: "High",   color: "#f59e0b" },
  urgent: { label: "Urgent", color: "#ef4444" },
};

const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  done:        { label: "Done",        color: "#22c55e" },
  cancelled:   { label: "Cancelled",   color: "#475569" },
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks,    setTasks]    = useState<CRMTask[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<TaskStatus | "">("");
  const [showNew,  setShowNew]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // New task form
  const [newTitle,    setNewTitle]    = useState("");
  const [newDesc,     setNewDesc]     = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newDue,      setNewDue]      = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/tasks", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) { sessionStorage.clear(); router.replace("/enter/backdrop"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setTasks((d as { tasks: CRMTask[] }).tasks); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function createTask() {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc, priority: newPriority, dueDate: newDue || undefined, assignedTo: newAssignee || undefined }),
      });
      if (res.ok) {
        const data = await res.json() as { task: CRMTask };
        setTasks((p) => [data.task, ...p]);
        setNewTitle(""); setNewDesc(""); setNewDue(""); setNewAssignee(""); setNewPriority("medium");
        setShowNew(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    const res = await fetch("/api/dashboard/tasks", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const data = await res.json() as { task: CRMTask };
      setTasks((p) => p.map((t) => t.id === id ? data.task : t));
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/dashboard/tasks?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getSecret()}` },
    });
    if (res.ok) setTasks((p) => p.filter((t) => t.id !== id));
  }

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [t.title, t.description ?? "", t.assignedTo ?? ""].some((v) => v.toLowerCase().includes(q));
    const matchFilter = !filter || t.status === filter;
    return matchSearch && matchFilter;
  });

  const openCount  = tasks.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const doneCount  = tasks.filter((t) => t.status === "done").length;
  const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done" && t.status !== "cancelled").length;

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Tasks</h1>
            <p className="text-slate-500 text-xs mt-0.5">{tasks.length} total · {openCount} open · {overdueCount > 0 ? <span style={{ color: "#ef4444" }}>{overdueCount} overdue</span> : "none overdue"}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-44"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as TaskStatus | "")}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              + New Task
            </button>
          </div>
        </header>

        {/* Summary */}
        {!loading && (
          <div className="flex gap-4 px-6 pt-5">
            <SummaryCard label="Open" value={String(tasks.filter((t) => t.status === "open").length)} color="#3b82f6" />
            <SummaryCard label="In Progress" value={String(tasks.filter((t) => t.status === "in_progress").length)} color="#f59e0b" />
            <SummaryCard label="Completed" value={String(doneCount)} color="#22c55e" />
            <SummaryCard label="Overdue" value={String(overdueCount)} color="#ef4444" />
          </div>
        )}

        {/* New task modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-white font-semibold mb-5">New Task</h2>
              <div className="space-y-4">
                <Field label="Title *">
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title" className="input-field" autoFocus />
                </Field>
                <Field label="Description">
                  <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} placeholder="Optional details" className="input-field resize-none" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Priority">
                    <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} className="input-field">
                      {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Due Date">
                    <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} className="input-field" />
                  </Field>
                </div>
                <Field label="Assign To (username)">
                  <input value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} placeholder={getUsername()} className="input-field" />
                </Field>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button onClick={createTask} disabled={saving || !newTitle.trim()} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: "rgba(99,102,241,0.8)" }}>
                  {saving ? "Creating…" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">
              {search || filter ? "No matching tasks." : "No tasks yet. Click \"+ New Task\" to get started."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => {
                const pm = PRIORITY_META[task.priority];
                const sm = STATUS_META[task.status];
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done" && task.status !== "cancelled";
                return (
                  <div key={task.id} className="rounded-2xl p-4 hover:bg-white/[0.02] transition-colors" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onChange={(e) => updateTaskStatus(task.id, e.target.checked ? "done" : "open")}
                        className="mt-1 w-4 h-4 rounded accent-indigo-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-slate-600" : "text-white"}`}>{task.title}</p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${pm.color}18`, color: pm.color }}>{pm.label}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${sm.color}18`, color: sm.color }}>{sm.label}</span>
                        </div>
                        {task.description && <p className="text-slate-500 text-xs mt-1">{task.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                          {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                          {task.dueDate && (
                            <span style={{ color: isOverdue ? "#ef4444" : undefined }}>
                              📅 {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {isOverdue && " · Overdue"}
                            </span>
                          )}
                          {task.leadId && <Link href={`/enter/backdrop/dashboard/leads`} className="text-indigo-400 hover:text-indigo-300">🔗 Lead</Link>}
                          {task.invoiceId && <Link href={`/enter/backdrop/dashboard/invoices/${task.invoiceId}`} className="text-indigo-400 hover:text-indigo-300">🧾 Invoice</Link>}
                          <span>by {task.createdBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="px-2 py-1 rounded-lg text-xs outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: sm.color }}
                        >
                          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button onClick={() => deleteTask(task.id)} className="text-xs text-red-500/50 hover:text-red-400 transition-colors">✕</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-field { width: 100%; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 14px; outline: none; }
        .input-field:focus { border-color: rgba(99,102,241,0.5); }
        .input-field option { background: #1e293b; }
      `}</style>
    </DashboardShell>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 flex-1" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
