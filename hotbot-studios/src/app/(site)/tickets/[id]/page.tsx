"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Ticket, TicketComment } from "@/types/dashboard";

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  open:        { label: "Open",        color: "#3b82f6", icon: "📬" },
  in_progress: { label: "In Progress", color: "#f59e0b", icon: "🔄" },
  waiting:     { label: "Waiting",     color: "#8b5cf6", icon: "⏳" },
  resolved:    { label: "Resolved",    color: "#22c55e", icon: "✅" },
  closed:      { label: "Closed",      color: "#475569", icon: "🔒" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:      { label: "Low",      color: "#64748b" },
  medium:   { label: "Medium",   color: "#3b82f6" },
  high:     { label: "High",     color: "#f59e0b" },
  critical: { label: "Critical", color: "#ef4444" },
};

export default function TicketStatusPage() {
  const { id } = useParams() as { id: string };
  const [ticket,    setTicket]    = useState<Ticket | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyMail, setReplyMail] = useState("");
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    fetch(`/api/tickets?id=${encodeURIComponent(id)}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json() as Promise<{ ticket: Ticket }>; })
      .then((d) => { if (d) setTicket(d.ticket); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function addReply() {
    if (!replyText.trim() || !replyName.trim()) return;
    setError(""); setSending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comment", ticketId: ticket!.id, text: replyText.trim(), requesterName: replyName, requesterEmail: replyMail }),
      });
      const data = await res.json() as { error?: string; comment?: TicketComment };
      if (!res.ok) { setError(data.error ?? "Failed to add comment."); return; }
      setTicket((prev) => prev ? { ...prev, comments: [...(prev.comments ?? []), data.comment!] } : prev);
      setReplyText("");
    } finally {
      setSending(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
      <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );

  if (notFound || !ticket) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0e1a" }}>
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-white text-2xl font-bold mb-2">Ticket not found</h1>
        <p className="text-slate-400 mb-6">Check the ticket number and try again.</p>
        <Link href="/tickets" className="text-indigo-400 hover:text-indigo-300 transition-colors">← Submit a new ticket</Link>
      </div>
    </div>
  );

  const sm = STATUS_META[ticket.status] ?? STATUS_META.open;
  const pm = PRIORITY_META[ticket.priority] ?? PRIORITY_META.medium;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#0a0e1a" }}>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/tickets" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8 inline-block">← Submit another ticket</Link>

        {/* Ticket header */}
        <div className="rounded-3xl p-6 mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-500 text-xs font-mono mb-1">{ticket.ticketNumber}</p>
              <h1 className="text-white text-xl font-bold">{ticket.title}</h1>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl">{sm.icon}</span>
              <p className="text-sm font-semibold mt-0.5" style={{ color: sm.color }}>{sm.label}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Badge label={ticket.category} />
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${pm.color}18`, color: pm.color }}>
              {pm.label} priority
            </span>
            <span className="text-xs text-slate-600">
              Submitted {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {ticket.description && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-slate-300 text-sm leading-relaxed">{ticket.description}</p>
            </div>
          )}
        </div>

        {/* Status tracker */}
        <div className="rounded-2xl p-5 mb-5" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <h2 className="text-white text-sm font-semibold mb-4">Ticket Progress</h2>
          <div className="flex items-center gap-1">
            {(["open","in_progress","waiting","resolved","closed"] as const).map((s, i, arr) => {
              const meta = STATUS_META[s];
              const stages = ["open","in_progress","waiting","resolved","closed"];
              const currentIdx = stages.indexOf(ticket.status);
              const thisIdx    = stages.indexOf(s);
              const active     = thisIdx <= currentIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background: active ? `${meta.color}30` : "rgba(255,255,255,0.05)", border: `2px solid ${active ? meta.color : "rgba(255,255,255,0.1)"}` }}>
                      {active ? "✓" : ""}
                    </div>
                    <p className="text-[9px] text-slate-600 mt-1 text-center leading-tight" style={{ color: active ? meta.color : undefined }}>{meta.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 mb-3" style={{ background: active && thisIdx < currentIdx ? sm.color : "rgba(255,255,255,0.07)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <h2 className="text-white text-sm font-semibold mb-4">
            Conversation {ticket.comments && ticket.comments.length > 0 ? `(${ticket.comments.length})` : ""}
          </h2>

          {(ticket.comments ?? []).length === 0 ? (
            <p className="text-slate-600 text-sm mb-4">No replies yet. We'll respond here when we review your ticket.</p>
          ) : (
            <div className="space-y-4 mb-5">
              {(ticket.comments ?? []).map((c: TicketComment) => (
                <div key={c.id} className={`flex gap-3 ${c.isStaff ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${c.isStaff ? "text-indigo-200" : "text-white"}`}
                    style={{ background: c.isStaff ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)" }}>
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[85%] ${c.isStaff ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-400">{c.isStaff ? "Support Team" : c.authorName}</span>
                      {c.isStaff && <span className="text-[10px] px-1.5 py-0.5 rounded-full text-indigo-300" style={{ background: "rgba(99,102,241,0.15)" }}>Staff</span>}
                      <span className="text-[10px] text-slate-700">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="rounded-2xl px-4 py-3 text-sm text-slate-300 leading-relaxed"
                      style={{ background: c.isStaff ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply box (only for open/in_progress/waiting) */}
          {!["resolved","closed"].includes(ticket.status) && (
            <div className="border-t pt-4 space-y-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-xs text-slate-500">Add a reply</p>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <input value={replyName} onChange={(e) => setReplyName(e.target.value)} placeholder="Your name *" className="input-field text-sm" />
                <input type="email" value={replyMail} onChange={(e) => setReplyMail(e.target.value)} placeholder="Email (optional)" className="input-field text-sm" />
              </div>
              <div className="flex gap-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Write your reply…"
                  className="input-field flex-1 resize-none text-sm"
                />
                <button
                  onClick={addReply}
                  disabled={sending || !replyText.trim() || !replyName.trim()}
                  className="px-4 rounded-xl text-sm font-medium text-white self-stretch disabled:opacity-50"
                  style={{ background: "rgba(99,102,241,0.8)" }}
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-field { width: 100%; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; font-size: 14px; outline: none; }
        .input-field:focus { border-color: rgba(99,102,241,0.5); }
      `}</style>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400 capitalize" style={{ background: "rgba(255,255,255,0.06)" }}>
      {label}
    </span>
  );
}
