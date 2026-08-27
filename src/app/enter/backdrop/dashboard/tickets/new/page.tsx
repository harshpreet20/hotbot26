"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { TicketPriority, TicketCategory, TicketStatus } from "@/types/dashboard";

function getUsername() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_username") || "" : ""; }

const DRAFT_KEY = "backdrop_new_ticket_draft";

interface DraftData {
  title: string; description: string; priority: TicketPriority; category: TicketCategory;
  status: TicketStatus; requesterName: string; requesterEmail: string;
  assignedTo: string; raisedAgainst: string; dueDate: string; labels: string; isInternal: boolean;
}

function loadDraft(): Partial<DraftData> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
    return raw ? JSON.parse(raw) as DraftData : {};
  } catch { return {}; }
}

interface Member { username: string; role: string }

export default function NewTicketPage() {
  const router = useRouter();
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [team, setTeam]             = useState<Member[]>([]);

  const d = loadDraft();
  const [title,          setTitle]          = useState(d.title ?? "");
  const [description,    setDescription]    = useState(d.description ?? "");
  const [priority,       setPriority]       = useState<TicketPriority>(d.priority ?? "medium");
  const [category,       setCategory]       = useState<TicketCategory>(d.category ?? "general");
  const [status,         setStatus]         = useState<TicketStatus>(d.status ?? "draft");
  const [requesterName,  setRequesterName]  = useState(d.requesterName ?? "");
  const [requesterEmail, setRequesterEmail] = useState(d.requesterEmail ?? "");
  const [assignedTo,     setAssignedTo]     = useState(d.assignedTo ?? "");
  const [raisedAgainst,  setRaisedAgainst]  = useState(d.raisedAgainst ?? "");
  const [isInternal,     setIsInternal]     = useState(d.isInternal ?? false);
  const [dueDate,        setDueDate]        = useState(d.dueDate ?? "");
  const [labelsRaw,      setLabelsRaw]      = useState(d.labels ?? "");

  // Fetch team members for dropdowns
  useEffect(() => {
    fetch("/api/dashboard/team", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setTeam((d as { members?: Member[] }).members ?? []))
      .catch(() => {});
  }, []);

  // Auto-fill requester name from logged-in user if internal
  useEffect(() => {
    if (isInternal && !requesterName) {
      setRequesterName(getUsername());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInternal]);

  // Auto-save draft
  useEffect(() => {
    const draft: DraftData = { title, description, priority, category, status, requesterName, requesterEmail, assignedTo, raisedAgainst, dueDate, labels: labelsRaw, isInternal };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, description, priority, category, status, requesterName, requesterEmail, assignedTo, raisedAgainst, dueDate, labelsRaw, isInternal]);

  async function handleSubmit(submitStatus: TicketStatus) {
    if (!title.trim()) { setError("Title is required."); return; }
    setError(""); setSaving(true);
    try {
      const labels = labelsRaw.split(",").map((l) => l.trim()).filter(Boolean);
      const res = await fetch("/api/dashboard/tickets", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), description: description.trim(), priority, category,
          status: submitStatus, requesterName: requesterName.trim(), requesterEmail: requesterEmail.trim(),
          assignedTo: assignedTo || undefined, dueDate: dueDate || undefined, labels,
          isInternal, raisedAgainst: raisedAgainst || undefined, raisedBy: getUsername() || undefined,
        }),
      });
      if (!res.ok) { setError("Failed to create ticket."); return; }
      localStorage.removeItem(DRAFT_KEY);
      router.push("/enter/backdrop/dashboard/tickets");
    } finally { setSaving(false); }
  }

  function saveDraft() {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <DashboardShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-xl font-semibold">New Ticket</h1>
            <p className="text-slate-500 text-sm mt-0.5">Create an internal ticket for tracking</p>
          </div>
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back</button>
        </div>

        {draftSaved && (
          <div className="mb-4 px-4 py-2 rounded-xl text-xs text-emerald-400" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            Draft saved locally
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl text-xs text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Internal toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: isInternal ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${isInternal ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}` }}>
            <button
              type="button"
              onClick={() => setIsInternal((v) => !v)}
              className="relative shrink-0 w-9 h-5 rounded-full transition-colors"
              style={{ background: isInternal ? "#6366f1" : "rgba(255,255,255,0.1)" }}
            >
              <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: isInternal ? "translateX(16px)" : "translateX(0)" }} />
            </button>
            <div>
              <p className="text-sm text-white font-medium">Internal Team Ticket</p>
              <p className="text-xs text-slate-500">Raised within the team — not from a public client</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" className={inputCls} style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Detailed description, steps to reproduce, etc." className={`${inputCls} resize-y`} style={inputStyle} />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} className={inputCls} style={inputStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} className={inputCls} style={inputStyle}>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="support">Support</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Requester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">
                {isInternal ? "Raised By" : "Requester Name"}
              </label>
              <input value={requesterName} onChange={(e) => setRequesterName(e.target.value)}
                placeholder={isInternal ? getUsername() : "Customer name"} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">
                {isInternal ? "Email (optional)" : "Requester Email"}
              </label>
              <input type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)}
                placeholder={isInternal ? "optional" : "customer@example.com"} className={inputCls} style={inputStyle} />
            </div>
          </div>

          {/* Assign To + Raised Against (internal only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Assign To</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="">— Unassigned —</option>
                {team.map((m) => <option key={m.username} value={m.username}>{m.username} ({m.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">
                Raised Against {!isInternal && <span className="text-slate-700 normal-case">(optional teammate)</span>}
              </label>
              <select value={raisedAgainst} onChange={(e) => setRaisedAgainst(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="">— None —</option>
                {team.map((m) => <option key={m.username} value={m.username}>{m.username} ({m.role})</option>)}
              </select>
            </div>
          </div>

          {/* Due date + Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Labels (comma-separated)</label>
              <input value={labelsRaw} onChange={(e) => setLabelsRaw(e.target.value)} placeholder="bug, urgent, internal" className={inputCls} style={inputStyle} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveDraft} className="px-4 py-2 rounded-xl text-sm text-slate-400 transition-all hover:text-slate-200"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Save Draft Locally
            </button>
            <button onClick={() => handleSubmit("draft")} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Save as Draft
            </button>
            <button onClick={() => handleSubmit("open")} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(99,102,241,0.8)" }}>
              {saving ? "Creating…" : isInternal ? "Raise Internal Issue" : "Create Ticket"}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
