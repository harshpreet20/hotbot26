"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { EntityEmailHistory } from "@/components/backdrop/EntityEmailHistory";
import type { Lead, LeadStatus, CRMUpdate, CRMTask, Invoice, UpdateType, TaskPriority } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getUsername() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_username") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

const STATUS_META: Record<LeadStatus, { label: string; color: string }> = {
  new:         { label: "New",         color: "#3b82f6" },
  contacted:   { label: "Contacted",   color: "#8b5cf6" },
  qualified:   { label: "Qualified",   color: "#06b6d4" },
  proposal:    { label: "Proposal",    color: "#f59e0b" },
  negotiation: { label: "Negotiation", color: "#f97316" },
  won:         { label: "Won",         color: "#22c55e" },
  lost:        { label: "Lost",        color: "#ef4444" },
  converted:   { label: "Converted",   color: "#22c55e" },
};

const UPDATE_ICONS: Record<UpdateType, string> = {
  note:           "📝",
  call:           "📞",
  email:          "✉️",
  meeting:        "🤝",
  status_change:  "🔄",
  assignment:     "👤",
  task_linked:    "✅",
  invoice_linked: "🧾",
};

export default function LeadDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [lead,      setLead]      = useState<Lead | null>(null);
  const [updates,   setUpdates]   = useState<CRMUpdate[]>([]);
  const [tasks,     setTasks]     = useState<CRMTask[]>([]);
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  // Inline edit
  const [editMode,   setEditMode]   = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [status,     setStatus]     = useState<LeadStatus>("new");
  const [notes,      setNotes]      = useState("");

  // New update
  const [updateText, setUpdateText] = useState("");
  const [updateType, setUpdateType] = useState<UpdateType>("note");
  const [postingUpdate, setPostingUpdate] = useState(false);

  // New task
  const [taskTitle,    setTaskTitle]    = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDue,      setTaskDue]      = useState("");

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }

    Promise.all([
      fetch(`/api/dashboard/leads`, { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.json() as Promise<{ leads: Lead[] }>),
      fetch(`/api/dashboard/crm-updates?leadId=${id}`, { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.json() as Promise<{ updates: CRMUpdate[] }>),
      fetch(`/api/dashboard/tasks?leadId=${id}`, { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.json() as Promise<{ tasks: CRMTask[] }>),
      fetch(`/api/dashboard/invoices?leadId=${id}`, { headers: { Authorization: `Bearer ${secret}` } })
        .then((r) => r.json() as Promise<{ invoices: Invoice[] }>),
    ])
      .then(([leadData, updateData, taskData, invoiceData]) => {
        const l = leadData.leads.find((lead) => lead.id === id);
        if (!l) { router.replace("/enter/backdrop/dashboard/leads"); return; }
        setLead(l);
        setAssignedTo(l.assignedTo ?? "");
        setStatus(l.status ?? "new");
        setNotes(l.notes ?? "");
        setUpdates(updateData.updates);
        setTasks(taskData.tasks);
        setInvoices(invoiceData.invoices);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  async function saveEdit() {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, assignedTo: assignedTo || undefined, notes }),
      });
      if (res.ok) {
        const data = await res.json() as { lead: Lead };
        setLead(data.lead);
        // Refetch updates to catch auto-logged status/assignment changes
        const upRes = await fetch(`/api/dashboard/crm-updates?leadId=${id}`, {
          headers: { Authorization: `Bearer ${getSecret()}` },
        });
        const upData = await upRes.json() as { updates: CRMUpdate[] };
        setUpdates(upData.updates);
        setEditMode(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function postUpdate() {
    if (!updateText.trim()) return;
    setPostingUpdate(true);
    try {
      const res = await fetch("/api/dashboard/crm-updates", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id, type: updateType, content: updateText.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { update: CRMUpdate };
        setUpdates((p) => [data.update, ...p]);
        setUpdateText("");
      }
    } finally {
      setPostingUpdate(false);
    }
  }

  async function addTask() {
    if (!taskTitle.trim()) return;
    const res = await fetch("/api/dashboard/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle.trim(), leadId: id, priority: taskPriority, dueDate: taskDue || undefined }),
    });
    if (res.ok) {
      const data = await res.json() as { task: CRMTask };
      setTasks((p) => [data.task, ...p]);
      setTaskTitle(""); setTaskDue("");
    }
  }

  async function toggleTask(taskId: string, done: boolean) {
    const res = await fetch("/api/dashboard/tasks", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: done ? "done" : "open" }),
    });
    if (res.ok) {
      const data = await res.json() as { task: CRMTask };
      setTasks((p) => p.map((t) => t.id === taskId ? data.task : t));
    }
  }

  async function deleteUpdate(updateId: string) {
    const res = await fetch(`/api/dashboard/crm-updates?id=${updateId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getSecret()}` },
    });
    if (res.ok) setUpdates((p) => p.filter((u) => u.id !== updateId));
  }

  if (loading) return <><div className="p-6 text-slate-500">Loading…</div></>;
  if (!lead)   return null;

  const sm = STATUS_META[lead.status ?? "new"];

  return (
    <>
      <div className="p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-white text-xl font-semibold">{lead.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${sm.color}18`, color: sm.color }}>
                {sm.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <a href={`mailto:${lead.email}`} className="hover:text-blue-400 transition-colors">{lead.email}</a>
              {lead.phone && <span>{lead.phone}</span>}
              {lead.company && <span>{lead.company}</span>}
              <span>Source: {lead.source}</span>
            </div>
          </div>
          <Link href="/enter/backdrop/dashboard/leads" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back</Link>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left column: CRM details */}
          <div className="col-span-2 space-y-5">
            {/* Lead details & edit */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-sm font-semibold">Lead Details</h2>
                {!editMode
                  ? <button onClick={() => setEditMode(true)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                  : <div className="flex gap-2">
                      <button onClick={() => setEditMode(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                      <button onClick={saveEdit} disabled={saving} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
                    </div>
                }
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Service" value={lead.service || "-"} />
                <InfoRow label="Budget"  value={lead.budget  || "-"} />
                <InfoRow label="Form Type" value={lead.formType ?? "-"} />
                <InfoRow label="Received" value={new Date(lead.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                {lead.message && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Message</p>
                    <p className="text-slate-300 text-sm">{lead.message}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Stage</p>
                  {editMode ? (
                    <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="input-field text-sm">
                      {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${sm.color}18`, color: sm.color }}>{sm.label}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                  {editMode ? (
                    <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder={getUsername()} className="input-field text-sm" />
                  ) : (
                    <p className="text-slate-300">{lead.assignedTo || <span className="text-slate-600">Unassigned</span>}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Internal Notes</p>
                  {editMode ? (
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add internal notes…" className="input-field resize-none" />
                  ) : (
                    <p className="text-slate-400 text-sm">{lead.notes || <span className="text-slate-600">No notes.</span>}</p>
                  )}
                </div>
                {lead.lastUpdatedBy && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-600">
                      Last updated by {lead.lastUpdatedBy} · {lead.lastUpdatedAt ? new Date(lead.lastUpdatedAt).toLocaleString() : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity log */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-white text-sm font-semibold mb-4">Activity Log</h2>

              {/* Post update */}
              <div className="mb-5 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                    className="input-field w-auto text-sm"
                  >
                    <option value="note">📝 Note</option>
                    <option value="call">📞 Call</option>
                    <option value="email">✉️ Email</option>
                    <option value="meeting">🤝 Meeting</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    rows={2}
                    placeholder="Log an activity, note, or follow-up…"
                    className="input-field flex-1 resize-none text-sm"
                  />
                  <button
                    onClick={postUpdate}
                    disabled={postingUpdate || !updateText.trim()}
                    className="px-4 rounded-xl text-sm font-medium text-white self-stretch disabled:opacity-50"
                    style={{ background: "rgba(99,102,241,0.8)" }}
                  >
                    {postingUpdate ? "…" : "Log"}
                  </button>
                </div>
              </div>

              {/* Timeline */}
              {updates.length === 0 ? (
                <p className="text-slate-600 text-xs">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {updates.map((u) => (
                    <div key={u.id} className="flex gap-3">
                      <span className="text-base shrink-0 mt-0.5">{UPDATE_ICONS[u.type] ?? "💬"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300 text-sm">{u.content}</p>
                        <p className="text-slate-600 text-xs mt-0.5">
                          {u.createdBy} · {new Date(u.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {(u.createdBy === getUsername()) && (
                        <button onClick={() => deleteUpdate(u.id)} className="text-slate-700 hover:text-red-400 text-xs shrink-0 transition-colors">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-white text-sm font-semibold mb-4">Tasks</h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                  placeholder="Add a task…"
                  className="input-field flex-1 text-sm"
                />
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)} className="input-field w-auto text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="input-field w-auto text-sm" />
                <button onClick={addTask} disabled={!taskTitle.trim()} className="px-3 rounded-xl text-sm text-white disabled:opacity-50" style={{ background: "rgba(99,102,241,0.6)" }}>Add</button>
              </div>
              {tasks.length === 0 ? (
                <p className="text-slate-600 text-xs">No tasks linked to this lead.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onChange={(e) => toggleTask(task.id, e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-500"
                      />
                      <span className={`text-sm flex-1 ${task.status === "done" ? "line-through text-slate-600" : "text-slate-300"}`}>{task.title}</span>
                      <span className="text-xs text-slate-600">{task.priority}</span>
                      {task.dueDate && <span className="text-xs text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right column: Invoices sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-sm font-semibold">Invoices</h2>
                <Link
                  href={`/enter/backdrop/dashboard/invoices/new`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  + New
                </Link>
              </div>
              {invoices.length === 0 ? (
                <p className="text-slate-600 text-xs">No invoices linked.</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/enter/backdrop/dashboard/invoices/${inv.id}`}
                      className="block rounded-xl p-3 transition-colors hover:bg-white/[0.03]"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-400 font-mono text-xs">{inv.invoiceNumber}</span>
                        <InvStatusBadge status={inv.status} />
                      </div>
                      <p className="text-white text-sm font-semibold mt-1">
                        {inv.currency === "INR" ? "₹" : inv.currency === "USD" ? "$" : inv.currency + " "}
                        {inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-slate-600 text-xs mt-0.5">Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl p-5 space-y-3" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-white text-sm font-semibold">Quick Info</h2>
              <InfoRow label="IP" value={lead.ip || "-"} />
              <InfoRow label="Source" value={lead.source ?? "-"} />
              {lead.tags && lead.tags.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] text-slate-400" style={{ background: "rgba(255,255,255,0.06)" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Email history */}
            <EntityEmailHistory entityType="lead" entityId={lead.id} role={getRole()} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field { width: 100%; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 14px; outline: none; }
        .input-field:focus { border-color: rgba(99,102,241,0.5); }
        .input-field option { background: #1e293b; }
      `}</style>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-slate-300 text-sm">{value}</p>
    </div>
  );
}

const INV_STATUS_COLORS: Record<string, string> = {
  draft: "#64748b", sent: "#3b82f6", viewed: "#8b5cf6", paid: "#22c55e", overdue: "#ef4444", cancelled: "#475569",
};

function InvStatusBadge({ status }: { status: string }) {
  const color = INV_STATUS_COLORS[status] ?? "#64748b";
  return (
    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize" style={{ background: `${color}18`, color }}>
      {status}
    </span>
  );
}
