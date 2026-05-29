"use client";
import { useEffect, useState } from "react";
import type { Meeting, MeetingStatus } from "@/types/dashboard";

const STATUS_META: Record<MeetingStatus, { label: string; color: string; bg: string }> = {
  scheduled:   { label: "Scheduled",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  completed:   { label: "Completed",   color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  cancelled:   { label: "Cancelled",   color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  rescheduled: { label: "Rescheduled", color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
};

function StatusBadge({ status }: { status: MeetingStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, color:m.color, background:m.bg }}>
      {m.label}
    </span>
  );
}

function formatDT(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" });
}

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: "20px 24px",
};

const INPUT: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 14,
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0", fontSize: 14, outline: "none",
};

export default function PortalMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [form, setForm]         = useState({ preferredTime: "", notes: "" });
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch("/api/portal/meetings")
      .then(r => r.json() as Promise<{ meetings?: Meeting[] }>)
      .then(d => setMeetings(d.meetings ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function requestMeeting() {
    if (!form.preferredTime) { setError("Please select a preferred time"); return; }
    setSending(true); setError("");
    try {
      const start = new Date(form.preferredTime).toISOString();
      const end   = new Date(new Date(form.preferredTime).getTime() + 60*60*1000).toISOString();
      const res = await fetch("/api/portal/meetings", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ preferredTime: form.preferredTime, notes: form.notes, startTime: start, endTime: end }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Failed to send request"); return; }
      setSent(true);
      setShowRequest(false);
      setForm({ preferredTime:"", notes:"" });
      const d2 = await fetch("/api/portal/meetings").then(r => r.json() as Promise<{ meetings?: Meeting[] }>);
      setMeetings(d2.meetings ?? []);
    } finally { setSending(false); }
  }

  const upcoming = meetings.filter(m => m.status === "scheduled" && m.startTime >= new Date().toISOString());
  const past     = meetings.filter(m => m.status !== "scheduled" || m.startTime < new Date().toISOString());

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meetings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your scheduled calls and sessions</p>
        </div>
        <button onClick={() => { setShowRequest(true); setSent(false); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
          style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Request Meeting
        </button>
      </div>

      {sent && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", color:"#34d399" }}>
          Meeting request sent! Your account manager will confirm the time shortly.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>
      ) : meetings.length === 0 ? (
        <div style={CARD} className="flex flex-col items-center justify-center py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p className="text-slate-400 font-medium">No meetings scheduled yet</p>
          <p className="text-slate-600 text-sm mt-1">Request a meeting with your account manager</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h2>
              <div className="flex flex-col gap-3">
                {upcoming.map(m => <MeetingCard key={m.id} m={m} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h2>
              <div className="flex flex-col gap-3">
                {past.map(m => <MeetingCard key={m.id} m={m} />)}
              </div>
            </section>
          )}
        </>
      )}

      {/* Request modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4" style={{ background:"#0f1629", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Request a Meeting</h2>
              <button onClick={() => setShowRequest(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            {error && <p className="text-red-400 text-sm px-3 py-2 rounded-xl" style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)" }}>{error}</p>}

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Preferred Date & Time *</label>
                <input type="datetime-local" style={INPUT} value={form.preferredTime} onChange={e => setForm(p=>({...p, preferredTime:e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes / Agenda</label>
                <textarea style={{...INPUT, resize:"vertical"}} rows={3} value={form.notes} onChange={e => setForm(p=>({...p, notes:e.target.value}))} placeholder="What would you like to discuss?" />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRequest(false)} className="px-4 py-2 text-sm rounded-xl" style={{ background:"rgba(255,255,255,0.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={() => void requestMeeting()} disabled={sending}
                className="px-4 py-2 text-sm font-semibold rounded-xl"
                style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity: sending ? 0.6 : 1 }}>
                {sending ? "Sending…" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({ m }: { m: Meeting }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:20, padding:"16px 20px", display:"flex", alignItems:"flex-start", gap:16,
    }}>
      <div className="shrink-0 text-center" style={{ minWidth:48 }}>
        <p className="text-slate-500 text-[10px] uppercase tracking-wider">
          {new Date(m.startTime).toLocaleString("en-US",{month:"short"})}
        </p>
        <p className="text-xl font-bold text-white leading-none">{new Date(m.startTime).getDate()}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-semibold text-sm">{m.title}</p>
          <StatusBadge status={m.status} />
        </div>
        <p className="text-slate-400 text-xs mt-1">
          {formatDT(m.startTime)} → {formatDT(m.endTime)}
        </p>
        {m.notes && <p className="text-slate-500 text-xs mt-1 truncate">{m.notes}</p>}
      </div>
      {m.meetLink && m.status === "scheduled" && (
        <a href={m.meetLink} target="_blank" rel="noreferrer"
          className="shrink-0 px-4 py-2 text-sm font-semibold rounded-xl"
          style={{ background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399" }}>
          Join ↗
        </a>
      )}
    </div>
  );
}
