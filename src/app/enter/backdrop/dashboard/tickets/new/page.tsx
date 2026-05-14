"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { TicketPriority, TicketCategory, TicketStatus } from "@/types/dashboard";

function getSecret() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : ""; }

const DRAFT_KEY = "backdrop_new_ticket_draft";

interface DraftData {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  status: TicketStatus;
  requesterName: string;
  requesterEmail: string;
  assignedTo: string;
  dueDate: string;
  labels: string;
}

function loadDraft(): Partial<DraftData> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
    return raw ? JSON.parse(raw) as DraftData : {};
  } catch { return {}; }
}

export default function NewTicketPage() {
  const router = useRouter();
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  const d = loadDraft();
  const [title,          setTitle]          = useState(d.title ?? "");
  const [description,    setDescription]    = useState(d.description ?? "");
  const [priority,       setPriority]       = useState<TicketPriority>(d.priority ?? "medium");
  const [category,       setCategory]       = useState<TicketCategory>(d.category ?? "general");
  const [status,         setStatus]         = useState<TicketStatus>(d.status ?? "draft");
  const [requesterName,  setRequesterName]  = useState(d.requesterName ?? "");
  const [requesterEmail, setRequesterEmail] = useState(d.requesterEmail ?? "");
  const [assignedTo,     setAssignedTo]     = useState(d.assignedTo ?? "");
  const [dueDate,        setDueDate]        = useState(d.dueDate ?? "");
  const [labelsRaw,      setLabelsRaw]      = useState(d.labels ?? "");

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft: DraftData = { title, description, priority, category, status, requesterName, requesterEmail, assignedTo, dueDate, labels: labelsRaw };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, description, priority, category, status, requesterName, requesterEmail, assignedTo, dueDate, labelsRaw]);

  async function handleSubmit(submitStatus: TicketStatus) {
    if (!title.trim()) { setError("Title is required."); return; }
    setError("");
    setSaving(true);
    try {
      const labels = labelsRaw.split(",").map((l) => l.trim()).filter(Boolean);
      const res = await fetch("/api/dashboard/tickets", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority, category, status: submitStatus, requesterName: requesterName.trim(), requesterEmail: requesterEmail.trim(), assignedTo: assignedTo.trim() || undefined, dueDate: dueDate || undefined, labels }),
      });
      if (!res.ok) { setError("Failed to create ticket."); return; }
      localStorage.removeItem(DRAFT_KEY);
      router.push("/enter/backdrop/dashboard/tickets");
    } finally {
      setSaving(false);
    }
  }

  function saveDraft() {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
  const focusStyle = { borderColor: "rgba(99,102,241,0.5)" };

  return (
    <DashboardShell>
      <div className="p-6 max-w-2xl">
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
          {/* Title */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className={inputCls}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detailed description, steps to reproduce, etc."
              className={`${inputCls} resize-y`}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
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
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Requester Name</label>
              <input value={requesterName} onChange={(e) => setRequesterName(e.target.value)} placeholder="Customer name" className={inputCls} style={inputStyle} onFocus={(e) => Object.assign(e.target.style, focusStyle)} onBlur={(e) => Object.assign(e.target.style, inputStyle)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Requester Email</label>
              <input type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} placeholder="customer@example.com" className={inputCls} style={inputStyle} onFocus={(e) => Object.assign(e.target.style, focusStyle)} onBlur={(e) => Object.assign(e.target.style, inputStyle)} />
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Assign To (username)</label>
              <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="username" className={inputCls} style={inputStyle} onFocus={(e) => Object.assign(e.target.style, focusStyle)} onBlur={(e) => Object.assign(e.target.style, inputStyle)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Labels (comma-separated)</label>
            <input value={labelsRaw} onChange={(e) => setLabelsRaw(e.target.value)} placeholder="bug, urgent, customer-request" className={inputCls} style={inputStyle} onFocus={(e) => Object.assign(e.target.style, focusStyle)} onBlur={(e) => Object.assign(e.target.style, inputStyle)} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveDraft}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 transition-all hover:text-slate-200"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Save Draft Locally
            </button>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit("open")}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              {saving ? "Creating…" : "Create Ticket"}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
