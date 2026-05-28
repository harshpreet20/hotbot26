"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import { GoogleMeetButton } from "@/components/backdrop/GoogleMeetButton";
import { WhiteboardModal } from "@/components/backdrop/WhiteboardModal";
import type { Ticket, TicketStatus, TicketPriority, TicketCategory, TicketComment, TicketActivity } from "@/types/dashboard";

function getSecret() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : ""; }

const STATUS_META: Record<TicketStatus, { label: string; color: string }> = {
  draft:       { label: "Draft",       color: "#64748b" },
  open:        { label: "Open",        color: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  waiting:     { label: "Waiting",     color: "#8b5cf6" },
  resolved:    { label: "Resolved",    color: "#22c55e" },
  closed:      { label: "Closed",      color: "#475569" },
};

const PRIORITY_META: Record<TicketPriority, { label: string; color: string }> = {
  low:      { label: "Low",      color: "#64748b" },
  medium:   { label: "Medium",   color: "#3b82f6" },
  high:     { label: "High",     color: "#f59e0b" },
  critical: { label: "Critical", color: "#ef4444" },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug: "Bug", feature: "Feature", support: "Support", billing: "Billing", general: "General",
};

const ACTIVITY_ICONS: Record<string, string> = {
  created: "✦", status_changed: "↻", priority_changed: "↕", assigned: "→",
  unassigned: "←", comment_added: "💬", internal_note: "🔒", label_added: "+",
  label_removed: "−", due_date_set: "📅",
};

function formatActivity(act: TicketActivity): string {
  const m = act.metadata ?? {};
  switch (act.type) {
    case "created":        return `${act.actorName} created this ticket`;
    case "status_changed": return `${act.actorName} changed status from ${m.from} to ${m.to}`;
    case "priority_changed": return `${act.actorName} changed priority from ${m.from} to ${m.to}`;
    case "assigned":       return `${act.actorName} assigned to ${m.to}`;
    case "unassigned":     return `${act.actorName} unassigned ${m.from}`;
    case "comment_added":  return `${act.actorName} replied`;
    case "internal_note":  return `${act.actorName} added an internal note`;
    case "due_date_set":   return m.date ? `${act.actorName} set due date to ${new Date(m.date).toLocaleDateString()}` : `${act.actorName} cleared due date`;
    default:               return `${act.actorName} ${act.type.replace(/_/g, " ")}`;
  }
}

type CommentTab = "reply" | "note";

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket]         = useState<Ticket | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentTab, setCommentTab] = useState<CommentTab>("reply");
  const [sending, setSending]       = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [editTitle, setEditTitle]   = useState(false);
  const [titleVal, setTitleVal]     = useState("");
  const [editDesc, setEditDesc]     = useState(false);
  const [descVal, setDescVal]       = useState("");
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch(`/api/dashboard/tickets?id=${id}`, { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) { sessionStorage.clear(); router.replace("/enter/backdrop"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.ticket) {
          setTicket(d.ticket as Ticket);
          setTitleVal((d.ticket as Ticket).title);
          setDescVal((d.ticket as Ticket).description);
        } else if (d) {
          router.replace("/enter/backdrop/dashboard/tickets");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  async function patch(body: object): Promise<Ticket | null> {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/tickets", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) return null;
      const data = await res.json() as { ticket?: Ticket; comment?: TicketComment };
      if (data.ticket) { setTicket(data.ticket); return data.ticket; }
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function sendComment() {
    if (!commentText.trim() || !ticket) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/tickets", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: commentTab === "note" ? "internal_note" : "comment", text: commentText.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { comment: TicketComment };
        setTicket((prev) => prev ? { ...prev, comments: [...(prev.comments ?? []), data.comment], updatedAt: new Date().toISOString() } : prev);
        setCommentText("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } finally {
      setSending(false);
    }
  }

  async function saveTitle() {
    if (!titleVal.trim() || titleVal === ticket?.title) { setEditTitle(false); return; }
    await patch({ title: titleVal.trim() });
    setEditTitle(false);
  }

  async function saveDesc() {
    if (descVal === ticket?.description) { setEditDesc(false); return; }
    await patch({ description: descVal });
    setEditDesc(false);
  }

  async function addLabel(label: string) {
    if (!label.trim() || !ticket) return;
    const labels = [...new Set([...(ticket.labels ?? []), label.trim()])];
    await patch({ labels });
    setLabelInput("");
  }

  async function removeLabel(label: string) {
    if (!ticket) return;
    await patch({ labels: (ticket.labels ?? []).filter((l) => l !== label) });
  }

  async function deleteTicket() {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    const res = await fetch(`/api/dashboard/tickets?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getSecret()}` } });
    if (res.ok) router.push("/enter/backdrop/dashboard/tickets");
  }

  // Merge comments + activity for timeline
  type TimelineItem =
    | { kind: "comment"; data: TicketComment; ts: string }
    | { kind: "activity"; data: TicketActivity; ts: string };

  const timeline: TimelineItem[] = ticket ? [
    ...(ticket.comments ?? []).map((c) => ({ kind: "comment" as const, data: c, ts: c.createdAt })),
    ...(ticket.activity ?? []).map((a) => ({ kind: "activity" as const, data: a, ts: a.createdAt })),
  ].sort((a, b) => a.ts.localeCompare(b.ts)) : [];

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full text-slate-500 text-sm py-24">Loading…</div>
      </DashboardShell>
    );
  }

  if (!ticket) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
          <p className="text-slate-500 text-sm">Ticket not found.</p>
          <Link href="/enter/backdrop/dashboard/tickets" className="text-indigo-400 text-sm hover:text-indigo-300">← Back to tickets</Link>
        </div>
      </DashboardShell>
    );
  }

  const sm = STATUS_META[ticket.status];
  const pm = PRIORITY_META[ticket.priority];
  const isClosed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <DashboardShell>
      <div className="flex min-h-full">
        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b shrink-0 flex items-start justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link href="/enter/backdrop/dashboard/tickets" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">← Tickets</Link>
                <span className="text-slate-700 text-xs">/</span>
                <span className="text-slate-500 font-mono text-xs">{ticket.ticketNumber}</span>
              </div>
              {editTitle ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    value={titleVal}
                    onChange={(e) => setTitleVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditTitle(false); }}
                    autoFocus
                    className="flex-1 text-white text-lg font-semibold bg-transparent outline-none border-b border-indigo-500 pb-0.5"
                  />
                  <button onClick={saveTitle} disabled={saving} className="text-xs text-indigo-400 hover:text-indigo-300">Save</button>
                  <button onClick={() => setEditTitle(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                </div>
              ) : (
                <h1
                  className="text-white text-lg font-semibold leading-snug cursor-pointer hover:text-indigo-200 transition-colors"
                  onClick={() => setEditTitle(true)}
                  title="Click to edit title"
                >
                  {ticket.title}
                </h1>
              )}
            </div>
            <button onClick={deleteTicket} className="shrink-0 text-xs text-red-500/50 hover:text-red-400 transition-colors mt-1">Delete</button>
          </div>

          {/* Description */}
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {editDesc ? (
              <div className="space-y-2">
                <textarea
                  value={descVal}
                  onChange={(e) => setDescVal(e.target.value)}
                  autoFocus
                  rows={5}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-y"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.4)" }}
                />
                <div className="flex gap-2">
                  <button onClick={saveDesc} disabled={saving} className="text-xs text-indigo-400 hover:text-indigo-300">Save</button>
                  <button onClick={() => { setEditDesc(false); setDescVal(ticket.description); }} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                </div>
              </div>
            ) : (
              <p
                className="text-slate-400 text-sm leading-relaxed cursor-pointer hover:text-slate-300 transition-colors whitespace-pre-wrap"
                onClick={() => setEditDesc(true)}
                title="Click to edit description"
              >
                {ticket.description || <span className="text-slate-600 italic">No description. Click to add one.</span>}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="flex-1 px-6 py-4 space-y-4">
            {timeline.length === 0 ? (
              <p className="text-slate-600 text-xs">No activity yet.</p>
            ) : (
              timeline.map((item) => {
                if (item.kind === "activity") {
                  const act = item.data;
                  return (
                    <div key={act.id} className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-600 text-xs mt-0.5">
                        {ACTIVITY_ICONS[act.type] ?? "·"}
                      </span>
                      <div>
                        <p className="text-slate-500 text-xs">{formatActivity(act)}</p>
                        <p className="text-slate-700 text-[10px] mt-0.5">{new Date(act.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                }

                const c = item.data;
                const isInternalNote = c.isInternal;
                return (
                  <div key={c.id} className={`flex gap-3 ${c.isStaff ? "flex-row-reverse" : ""}`}>
                    <div
                      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: isInternalNote ? "rgba(245,158,11,0.2)" : c.isStaff ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)" }}
                    >
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-[75%] flex flex-col ${c.isStaff ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">
                          {isInternalNote ? `🔒 ${c.authorName} (internal note)` : c.isStaff ? `Staff · ${c.authorName}` : c.authorName}
                        </span>
                        <span className="text-[10px] text-slate-700">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div
                        className="rounded-xl px-3 py-2 text-sm text-slate-300 whitespace-pre-wrap"
                        style={{
                          background: isInternalNote ? "rgba(245,158,11,0.07)" : c.isStaff ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isInternalNote ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)"}`,
                        }}
                      >
                        {c.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          {!isClosed && (
            <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {/* Tabs */}
              <div className="flex gap-1 mb-2">
                {(["reply", "note"] as CommentTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCommentTab(tab)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: commentTab === tab ? (tab === "note" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)") : "transparent",
                      color: commentTab === tab ? (tab === "note" ? "#f59e0b" : "#818cf8") : "#64748b",
                      border: `1px solid ${commentTab === tab ? (tab === "note" ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.3)") : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    {tab === "reply" ? "Reply to requester" : "🔒 Internal note"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
                  rows={2}
                  placeholder={commentTab === "note" ? "Private note - only visible to staff…" : "Write a reply to the requester…"}
                  className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${commentTab === "note" ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.1)"}` }}
                />
                <button
                  onClick={sendComment}
                  disabled={sending || !commentText.trim()}
                  className="px-4 rounded-xl text-sm text-white self-stretch disabled:opacity-50"
                  style={{ background: commentTab === "note" ? "rgba(245,158,11,0.7)" : "rgba(99,102,241,0.8)" }}
                >
                  {sending ? "…" : commentTab === "note" ? "Add note" : "Reply"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <aside
          className="w-64 shrink-0 border-l flex flex-col gap-5 px-4 py-5 overflow-y-auto"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {/* Status */}
          <SidebarField label="Status">
            <select
              value={ticket.status}
              disabled={saving}
              onChange={(e) => patch({ status: e.target.value as TicketStatus })}
              className="w-full px-3 py-1.5 rounded-xl text-sm outline-none"
              style={{ background: `${sm.color}15`, color: sm.color, border: `1px solid ${sm.color}40` }}
            >
              {(Object.keys(STATUS_META) as TicketStatus[]).map((s) => (
                <option key={s} value={s} style={{ background: "#1e293b" }}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </SidebarField>

          {/* Priority */}
          <SidebarField label="Priority">
            <select
              value={ticket.priority}
              disabled={saving}
              onChange={(e) => patch({ priority: e.target.value as TicketPriority })}
              className="w-full px-3 py-1.5 rounded-xl text-sm outline-none"
              style={{ background: `${pm.color}15`, color: pm.color, border: `1px solid ${pm.color}40` }}
            >
              {(Object.keys(PRIORITY_META) as TicketPriority[]).map((p) => (
                <option key={p} value={p} style={{ background: "#1e293b" }}>{PRIORITY_META[p].label}</option>
              ))}
            </select>
          </SidebarField>

          {/* Category */}
          <SidebarField label="Category">
            <select
              value={ticket.category}
              disabled={saving}
              onChange={(e) => patch({ category: e.target.value as TicketCategory })}
              className="w-full px-3 py-1.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((c) => (
                <option key={c} value={c} style={{ background: "#1e293b" }}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </SidebarField>

          {/* Assignee */}
          <SidebarField label="Assignee">
            <input
              type="text"
              defaultValue={ticket.assignedTo ?? ""}
              placeholder="username"
              className="w-full px-3 py-1.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val !== (ticket.assignedTo ?? "")) patch({ assignedTo: val || null });
              }}
            />
          </SidebarField>

          {/* Due Date */}
          <SidebarField label="Due Date">
            <input
              type="date"
              defaultValue={ticket.dueDate ?? ""}
              className="w-full px-3 py-1.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val !== (ticket.dueDate ?? "")) patch({ dueDate: val || null });
              }}
            />
          </SidebarField>

          {/* Labels */}
          <SidebarField label="Labels">
            <div className="flex flex-wrap gap-1 mb-2">
              {(ticket.labels ?? []).map((label) => (
                <span key={label} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-indigo-300" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
                  {label}
                  <button onClick={() => removeLabel(label)} className="text-indigo-400 hover:text-red-400 transition-colors leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLabel(labelInput); } }}
                placeholder="Add label…"
                className="flex-1 px-2 py-1 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button onClick={() => addLabel(labelInput)} className="text-xs text-indigo-400 hover:text-indigo-300 px-1">+</button>
            </div>
          </SidebarField>

          {/* Google Meet */}
          <SidebarField label="Google Meet">
            <GoogleMeetButton
              entityType="ticket"
              entityId={ticket.id}
              meetUrl={(ticket as Record<string, unknown>).meetUrl as string | undefined}
              onUpdate={(url) => setTicket((prev) => prev ? { ...prev, meetUrl: url } as Ticket : prev)}
            />
          </SidebarField>

          {/* Whiteboard */}
          <SidebarField label="Whiteboard">
            <button
              onClick={() => setWhiteboardOpen(true)}
              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Open Whiteboard
            </button>
          </SidebarField>

          {/* Requester */}
          <SidebarField label="Requester">
            <p className="text-slate-300 text-sm">{ticket.requesterName}</p>
            <p className="text-slate-500 text-xs">{ticket.requesterEmail}</p>
          </SidebarField>

          {/* Dates */}
          <SidebarField label="Dates">
            <div className="space-y-1 text-xs text-slate-500">
              <p>Created: <span className="text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span></p>
              <p>Updated: <span className="text-slate-400">{new Date(ticket.updatedAt).toLocaleDateString()}</span></p>
              {ticket.resolvedAt && <p>Resolved: <span className="text-green-400">{new Date(ticket.resolvedAt).toLocaleDateString()}</span></p>}
            </div>
          </SidebarField>
        </aside>
      </div>

      {whiteboardOpen && ticket && (
        <WhiteboardModal
          entityType="ticket"
          entityId={ticket.id}
          entityLabel={ticket.ticketNumber + " · " + ticket.title}
          onClose={() => setWhiteboardOpen(false)}
        />
      )}
    </DashboardShell>
  );
}

function SidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">{label}</p>
      {children}
    </div>
  );
}
