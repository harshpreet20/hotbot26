"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Meeting, MeetingStatus } from "@/types/dashboard";

interface MeetingAttachment {
  id: string; meetingId: string; name: string; fileUrl: string;
  fileName: string; fileSize: number; mimeType: string;
  category: "proposal" | "agreement" | "other"; uploadedBy: string; createdAt: string;
}

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const STATUS_META: Record<MeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  scheduled:   { label: "Scheduled",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.25)"  },
  completed:   { label: "Completed",   color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)"  },
  cancelled:   { label: "Cancelled",   color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
  rescheduled: { label: "Rescheduled", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)"  },
};

const CAT_META: Record<string, { label: string; color: string; bg: string }> = {
  proposal:  { label: "Proposal",  color: "#818cf8", bg: "rgba(99,102,241,0.15)" },
  agreement: { label: "Agreement", color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  other:     { label: "Other",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

function StatusBadge({ status }: { status: MeetingStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>
      {m.label}
    </span>
  );
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(1)} MB`;
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
  width: "100%", padding: "8px 12px", borderRadius: 12,
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0", fontSize: 14, outline: "none",
};

type Tab = "all" | "upcoming" | "completed" | "cancelled";

export default function MeetingsPage() {
  const [meetings, setMeetings]   = useState<Meeting[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>("all");
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Meeting | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Google integration state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail]         = useState("");
  const [googleLoading, setGoogleLoading]     = useState(true);

  // Per-meeting attachments panel
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [attachments, setAttachments]       = useState<MeetingAttachment[]>([]);
  const [attachLoading, setAttachLoading]   = useState(false);
  const [uploading, setUploading]           = useState(false);
  const [uploadErr, setUploadErr]           = useState("");
  const [uploadCat, setUploadCat]           = useState<"proposal"|"agreement"|"other">("proposal");
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  // Active meet popup tracking
  const popupRef = useRef<Window | null>(null);
  const [meetActive, setMeetActive] = useState<string | null>(null); // meetingId with open popup

  const [team, setTeam]           = useState<{username:string;role:string}[]>([]);
  const [showHostDD, setShowHostDD] = useState(false);
  const hostDDRef                 = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", clientId: "", clientEmail: "", clientName: "",
    hostUsername: "", attendees: "", startTime: "", endTime: "", meetLink: "", notes: "",
    status: "scheduled" as MeetingStatus,
    createGoogleMeet: true,
  });

  // ─── Load Google status ───────────────────────────────────────────────────
  const loadGoogleStatus = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/dashboard/google-status", { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const d = await res.json() as { connected: boolean; email?: string };
        setGoogleConnected(d.connected);
        setGoogleEmail(d.email ?? "");
      }
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const disconnectGoogle = async () => {
    if (!confirm("Disconnect your Google account? Future meetings won't auto-generate Meet links.")) return;
    await fetch("/api/dashboard/google-status", { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setGoogleConnected(false);
    setGoogleEmail("");
  };

  const connectGoogle = () => {
    const tok = getToken();
    const returnTo = window.location.pathname;
    window.location.href = `/api/auth/google?secret=${encodeURIComponent(tok)}&returnTo=${encodeURIComponent(returnTo)}`;
  };

  // ─── Load meetings ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/meetings", { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const d = await res.json() as { meetings: Meeting[] };
        setMeetings(d.meetings ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadGoogleStatus();
    fetch("/api/dashboard/team", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : { members: [] })
      .then((d: { members?: {username:string;role:string}[] }) => setTeam(d.members ?? []));

    // Handle google_connected=1 query param after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [load, loadGoogleStatus]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (hostDDRef.current && !hostDDRef.current.contains(e.target as Node)) setShowHostDD(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Attachments ──────────────────────────────────────────────────────────
  const loadAttachments = useCallback(async (meetingId: string) => {
    setAttachLoading(true);
    setUploadErr("");
    try {
      const res = await fetch(`/api/dashboard/meetings/attachments?meetingId=${meetingId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const d = await res.json() as { attachments: MeetingAttachment[] };
        setAttachments(d.attachments ?? []);
      }
    } finally {
      setAttachLoading(false);
    }
  }, []);

  function toggleExpand(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    void loadAttachments(id);
  }

  async function uploadFile(meetingId: string, file: File) {
    if (file.size > 50 * 1024 * 1024) { setUploadErr("File exceeds 50 MB"); return; }
    setUploading(true); setUploadErr("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("meetingId", meetingId);
    fd.append("category", uploadCat);
    try {
      const res = await fetch("/api/dashboard/meetings/attachments", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setUploadErr(d.error ?? "Upload failed"); }
      else await loadAttachments(meetingId);
    } catch { setUploadErr("Network error"); }
    finally { setUploading(false); }
  }

  async function deleteAttachment(att: MeetingAttachment) {
    if (!confirm(`Delete "${att.name}"?`)) return;
    await fetch(`/api/dashboard/meetings/attachments?id=${att.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    await loadAttachments(att.meetingId);
  }

  // ─── Meet popup ───────────────────────────────────────────────────────────
  function launchMeet(m: Meeting) {
    if (!m.meetLink) return;
    const w = 1080, h = 720;
    const l = Math.round((screen.width - w) / 2);
    const t = Math.round((screen.height - h) / 2);
    const popup = window.open(m.meetLink, `meet-${m.id}`, `width=${w},height=${h},left=${l},top=${t},toolbar=no,menubar=no`);
    if (popup) {
      popupRef.current = popup;
      setMeetActive(m.id);
      const timer = setInterval(() => {
        if (popup.closed) { clearInterval(timer); setMeetActive(null); popupRef.current = null; }
      }, 1000);
    }
  }

  // ─── Form helpers ─────────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm({ title:"", description:"", clientId:"", clientEmail:"", clientName:"", hostUsername:"", attendees:"", startTime:"", endTime:"", meetLink:"", notes:"", status:"scheduled", createGoogleMeet: googleConnected });
    setError("");
    setShowForm(true);
  }

  function openEdit(m: Meeting) {
    setEditing(m);
    setForm({
      title: m.title, description: m.description ?? "", clientId: m.clientId ?? "",
      clientEmail: m.clientEmail ?? "", clientName: m.clientName ?? "",
      hostUsername: m.hostUsername ?? "",
      attendees: (m.attendees ?? []).join(", "), startTime: m.startTime.slice(0,16),
      endTime: m.endTime.slice(0,16), meetLink: m.meetLink ?? "", notes: m.notes ?? "",
      status: m.status, createGoogleMeet: false,
    });
    setError("");
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.startTime)    { setError("Start time is required"); return; }
    if (!form.endTime)      { setError("End time is required"); return; }
    setSaving(true); setError("");
    try {
      const body = {
        ...(editing ? { id: editing.id } : {}),
        title: form.title, description: form.description,
        clientId: form.clientId, clientEmail: form.clientEmail, clientName: form.clientName,
        hostUsername: form.hostUsername,
        attendees: form.attendees.split(",").map(s => s.trim()).filter(Boolean),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        meetLink: form.meetLink, notes: form.notes, status: form.status,
        ...(!editing && { createGoogleMeet: form.createGoogleMeet }),
      };
      const res = await fetch("/api/dashboard/meetings", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Save failed"); return; }
      setShowForm(false);
      await load();
    } finally { setSaving(false); }
  }

  async function deleteMeeting(id: string) {
    if (!confirm("Delete this meeting?")) return;
    try {
      const res = await fetch(`/api/dashboard/meetings?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) { if (expandedId === id) setExpandedId(null); await load(); }
      else setError("Failed to delete meeting");
    } catch { setError("Network error"); }
  }

  const now = new Date().toISOString();
  const filtered = meetings.filter(m => {
    if (tab === "upcoming")  return m.status === "scheduled" && m.startTime >= now;
    if (tab === "completed") return m.status === "completed";
    if (tab === "cancelled") return m.status === "cancelled" || m.status === "rescheduled";
    return true;
  });

  const TABS: { key: Tab; label: string }[] = [
    { key:"all", label:"All" }, { key:"upcoming", label:"Upcoming" },
    { key:"completed", label:"Completed" }, { key:"cancelled", label:"Cancelled/Rescheduled" },
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 p-6 h-full">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Meetings</h1>
            <p className="text-slate-400 text-sm mt-0.5">Schedule and manage client meetings with Google Meet</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
            style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Schedule Meeting
          </button>
        </div>

        {/* Google Connect Banner */}
        {!googleLoading && (
          googleConnected ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)" }}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M22 12.5V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h8"/><polyline points="22,15 17,20 15,18"/></svg>
                <span className="text-sm text-slate-300">Google connected as <span className="font-semibold text-green-400">{googleEmail}</span> — Meet links auto-generated on new meetings</span>
              </div>
              <button onClick={() => void disconnectGoogle()} className="text-xs px-3 py-1 rounded-lg" style={{ color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)" }}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)" }}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-sm text-slate-400">Connect your Google account to auto-generate Meet links and sync to Google Calendar</span>
              </div>
              <button onClick={connectGoogle} className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5" style={{ color:"#818cf8", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M14 12H3"/></svg>
                Connect Google
              </button>
            </div>
          )
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl transition-colors"
              style={{ background: tab===t.key ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", color: tab===t.key ? "#818cf8" : "#64748b", border: `1px solid ${tab===t.key ? "rgba(99,102,241,0.3)" : "transparent"}` }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Meeting list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={CARD} className="flex flex-col items-center justify-center py-16 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p className="text-slate-400 font-medium">No meetings found</p>
            <p className="text-slate-600 text-sm mt-1">Schedule your first meeting with a client</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(m => {
              const isExpanded = expandedId === m.id;
              const isActive   = meetActive === m.id;
              return (
                <div key={m.id} style={{ ...CARD, padding:0, overflow:"hidden" }}>
                  {/* Meeting row */}
                  <div className="flex items-start gap-4" style={{ padding:"20px 24px" }}>
                    {/* Date column */}
                    <div className="shrink-0 text-center" style={{ minWidth:52 }}>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider">
                        {new Date(m.startTime).toLocaleString("en-US",{month:"short"})}
                      </p>
                      <p className="text-2xl font-bold text-white leading-none">
                        {new Date(m.startTime).getDate()}
                      </p>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{m.title}</p>
                        <StatusBadge status={m.status} />
                        {m.googleEventId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ color:"#4ade80", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)" }}>
                            📅 Calendar
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium animate-pulse" style={{ color:"#f59e0b", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)" }}>
                            🔴 Live Meeting
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        {formatDT(m.startTime)} → {formatDT(m.endTime)}
                        {m.clientName && <span className="ml-2 text-slate-500">· {m.clientName}</span>}
                        {m.hostUsername && <span className="ml-2 text-slate-600">· Host: {m.hostUsername}</span>}
                      </p>
                      {m.description && <p className="text-slate-500 text-xs mt-1 truncate">{m.description}</p>}
                      {m.attendees && m.attendees.length > 0 && (
                        <p className="text-slate-600 text-xs mt-0.5">Attendees: {m.attendees.join(", ")}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {/* Meet button */}
                      {m.meetLink ? (
                        isActive ? (
                          <button onClick={() => popupRef.current?.focus()}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl animate-pulse"
                            style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", color:"#f59e0b" }}>
                            Meeting Active ↗
                          </button>
                        ) : (
                          <button onClick={() => launchMeet(m)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                            style={{ background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            Join Meet
                          </button>
                        )
                      ) : (
                        <span className="px-3 py-1.5 text-xs rounded-xl" style={{ color:"#475569", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                          No link
                        </span>
                      )}
                      {/* Google Calendar link */}
                      {m.googleHtmlLink && (
                        <a href={m.googleHtmlLink} target="_blank" rel="noreferrer"
                          className="px-2 py-1.5 text-xs rounded-xl"
                          title="Open in Google Calendar"
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                          📅
                        </a>
                      )}
                      {/* Files toggle */}
                      <button onClick={() => toggleExpand(m.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
                        style={{ background: isExpanded ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${isExpanded ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)"}`, color: isExpanded ? "#818cf8" : "#94a3b8" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        Files
                      </button>
                      <button onClick={() => openEdit(m)}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl transition-colors"
                        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>
                        Edit
                      </button>
                      <button onClick={() => void deleteMeeting(m.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl transition-colors"
                        style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Attachments panel */}
                  {isExpanded && (
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", background:"rgba(0,0,0,0.2)", padding:"16px 24px" }}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Files &amp; Documents</p>

                      {/* Upload row */}
                      <div className="flex items-center gap-3 mb-4">
                        <select
                          value={uploadCat}
                          onChange={e => setUploadCat(e.target.value as typeof uploadCat)}
                          style={{ ...INPUT, width:"auto", padding:"6px 10px", fontSize:12 }}>
                          <option value="proposal">Proposal</option>
                          <option value="agreement">Agreement</option>
                          <option value="other">Other</option>
                        </select>
                        <input ref={fileInputRef} type="file" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) void uploadFile(m.id, f); e.target.value = ""; }} />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
                          style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", color:"#818cf8", opacity: uploading ? 0.6 : 1 }}>
                          {uploading ? "Uploading…" : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Upload File
                            </>
                          )}
                        </button>
                        {uploadErr && <span className="text-xs text-red-400">{uploadErr}</span>}
                      </div>

                      {/* Attachments list */}
                      {attachLoading ? (
                        <p className="text-slate-600 text-xs">Loading files…</p>
                      ) : attachments.length === 0 ? (
                        <p className="text-slate-600 text-xs">No files yet — upload a proposal or agreement above.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {attachments.map(att => {
                            const cat = CAT_META[att.category] ?? CAT_META.other;
                            return (
                              <div key={att.id} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ color:cat.color, background:cat.bg }}>
                                  {cat.label}
                                </span>
                                <span className="text-slate-300 text-xs font-medium flex-1 truncate">{att.name}</span>
                                <span className="text-slate-600 text-xs shrink-0">{fmtBytes(att.fileSize)}</span>
                                <span className="text-slate-600 text-xs shrink-0">by {att.uploadedBy}</span>
                                <a href={att.fileUrl} target="_blank" rel="noreferrer"
                                  className="text-xs px-2 py-1 rounded-lg shrink-0"
                                  style={{ color:"#60a5fa", background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.2)" }}>
                                  Open
                                </a>
                                <button onClick={() => void deleteAttachment(att)}
                                  className="text-xs px-2 py-1 rounded-lg shrink-0"
                                  style={{ color:"#f87171", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)" }}>
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" style={{ background:"#0f1629", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">{editing ? "Edit Meeting" : "Schedule Meeting"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            {error && <p className="text-red-400 text-sm px-3 py-2 rounded-xl" style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)" }}>{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input style={INPUT} value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="Meeting title" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Name</label>
                <input style={INPUT} value={form.clientName} onChange={e => setForm(p=>({...p,clientName:e.target.value}))} placeholder="Client name" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Email</label>
                <input style={INPUT} value={form.clientEmail} onChange={e => setForm(p=>({...p,clientEmail:e.target.value}))} placeholder="client@example.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Host (Team Member)</label>
                <div style={{ position:"relative" }} ref={hostDDRef}>
                  <input
                    style={INPUT}
                    value={form.hostUsername}
                    onChange={e => { setForm(p=>({...p,hostUsername:e.target.value})); setShowHostDD(true); }}
                    onFocus={() => setShowHostDD(true)}
                    placeholder="Search teammate…"
                  />
                  {showHostDD && team.length > 0 && (
                    <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#0f1729", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", maxHeight:200, overflowY:"auto", marginTop:4 }}>
                      {team.filter(mb=>{ const q=form.hostUsername.toLowerCase(); return !q||mb.username.toLowerCase().includes(q)||mb.role.toLowerCase().includes(q); }).map(mb=>(
                        <div key={mb.username}
                          onMouseDown={() => { setForm(p=>({...p,hostUsername:mb.username})); setShowHostDD(false); }}
                          style={{ padding:"9px 14px", cursor:"pointer", fontSize:13, borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.05)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="")}>
                          <span style={{ color:"#e2e8f0", fontWeight:600 }}>{mb.username}</span>
                          <span style={{ color:"#64748b", marginLeft:8, fontSize:11 }}>{mb.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Time *</label>
                <input type="datetime-local" style={INPUT} value={form.startTime} onChange={e => setForm(p=>({...p,startTime:e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End Time *</label>
                <input type="datetime-local" style={INPUT} value={form.endTime} onChange={e => setForm(p=>({...p,endTime:e.target.value}))} />
              </div>

              {/* Google Meet toggle — only for new meetings when Google connected */}
              {!editing && googleConnected && (
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm(p=>({...p, createGoogleMeet: !p.createGoogleMeet}))}
                      style={{
                        width:40, height:22, borderRadius:11, position:"relative", cursor:"pointer",
                        background: form.createGoogleMeet ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)",
                        border: `1px solid ${form.createGoogleMeet ? "rgba(74,222,128,0.6)" : "rgba(255,255,255,0.15)"}`,
                        transition:"background 0.2s",
                      }}>
                      <div style={{
                        position:"absolute", top:2, left: form.createGoogleMeet ? 20 : 2,
                        width:16, height:16, borderRadius:"50%",
                        background: form.createGoogleMeet ? "#4ade80" : "#64748b",
                        transition:"left 0.2s",
                      }} />
                    </div>
                    <span className="text-sm text-slate-300">
                      Auto-generate Google Meet link
                      <span className="ml-1 text-slate-500 text-xs">(via {googleEmail})</span>
                    </span>
                  </label>
                </div>
              )}

              {/* Manual meet link — shown when toggle off or no Google, or when editing */}
              {(!googleConnected || !form.createGoogleMeet || editing) && (
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">
                    {editing ? "Meet Link" : "Meet Link (optional)"}
                  </label>
                  <input style={INPUT} value={form.meetLink} onChange={e => setForm(p=>({...p,meetLink:e.target.value}))} placeholder="https://meet.google.com/..." />
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Attendees (comma-separated emails)</label>
                <input style={INPUT} value={form.attendees} onChange={e => setForm(p=>({...p,attendees:e.target.value}))} placeholder="a@example.com, b@example.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea style={{...INPUT, resize:"vertical"}} rows={2} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Agenda or notes…" />
              </div>
              {editing && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select style={INPUT} value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value as MeetingStatus}))}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-xl" style={{ background:"rgba(255,255,255,0.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)" }}>
                Cancel
              </button>
              <button onClick={() => void save()} disabled={saving}
                className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
                style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
