"use client";
import { useState } from "react";

interface Props {
  entityType: "project" | "lead" | "ticket";
  entityId: string;
  meetUrl?: string | null;
  scheduledAt?: string | null;
  onUpdate?: (url: string | null, scheduledAt?: string | null) => void;
  compact?: boolean;
}

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const GoogleMeetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8v8H9V8h6zm1.5-2H7.5C6.67 6 6 6.67 6 7.5v9C6 17.33 6.67 18 7.5 18h9c.83 0 1.5-.67 1.5-1.5v-9C18 6.67 17.33 6 16.5 6z" fill="#00832d"/>
    <path d="M19 10.5l-3 2v-1h-1V8h1V7l3 2v1.5z" fill="#00832d"/>
    <path d="M5 10.5l3 2v-1h1V8H8V7L5 9v1.5z" fill="#00832d"/>
  </svg>
);

export function GoogleMeetButton({ entityType, entityId, meetUrl, scheduledAt, onUpdate, compact }: Props) {
  const [open, setOpen]         = useState(false);
  const [customUrl, setCustomUrl] = useState(meetUrl || "");
  const [schedDate, setSchedDate] = useState(scheduledAt ? scheduledAt.slice(0, 16) : "");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  const h = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

  const call = async (action: "generate" | "clear" | "custom") => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        entityType, entityId,
        scheduledAt: schedDate ? new Date(schedDate).toISOString() : undefined,
      };
      if (action === "generate") body.action = "generate";
      else if (action === "clear") body.action = "clear";
      else body.meetUrl = customUrl;

      const r = await fetch("/api/dashboard/meet", { method: "PATCH", headers: h(), body: JSON.stringify(body) });
      const d = await r.json() as { meetUrl?: string | null };
      onUpdate?.(d.meetUrl ?? null, schedDate || null);
      setOpen(false);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const copy = () => {
    if (!meetUrl) return;
    void navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact && meetUrl) {
    return (
      <div className="flex items-center gap-1.5">
        <a
          href={meetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#00832d,#34a853)" }}
        >
          <GoogleMeetIcon />
          Join Meet
        </a>
        <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all"
        style={{
          background: meetUrl ? "linear-gradient(135deg,#00832d,#34a853)" : "rgba(255,255,255,0.06)",
          border: meetUrl ? "none" : "1px solid rgba(255,255,255,0.12)",
          color: meetUrl ? "#fff" : "#94a3b8",
        }}
      >
        <GoogleMeetIcon />
        <span>{meetUrl ? "Google Meet" : "Add Meet"}</span>
        {scheduledAt && (
          <span className="text-xs opacity-75">
            {new Date(scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-2 right-0 rounded-2xl p-4 shadow-2xl w-72"
          style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">Google Meet</p>

          {meetUrl && (
            <div className="mb-3 p-2 rounded-lg text-xs text-slate-400 break-all flex items-start gap-2" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="flex-1">{meetUrl}</span>
              <button onClick={copy} className="shrink-0 text-indigo-400 hover:text-indigo-300">
                {copied ? "✓" : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                )}
              </button>
            </div>
          )}

          {meetUrl && (
            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-white mb-3"
              style={{ background: "linear-gradient(135deg,#00832d,#34a853)" }}
            >
              <GoogleMeetIcon />
              Open in Google Meet
            </a>
          )}

          {/* Schedule */}
          <label className="block text-xs text-slate-500 mb-1">Schedule for (optional)</label>
          <input
            type="datetime-local"
            value={schedDate}
            onChange={(e) => setSchedDate(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white outline-none mb-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
          />

          {/* Custom URL */}
          <label className="block text-xs text-slate-500 mb-1">Paste existing Meet URL</label>
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white placeholder:text-slate-600 outline-none mb-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />

          <div className="flex gap-2">
            <button
              onClick={() => call("generate")}
              disabled={loading}
              className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#00832d,#34a853)" }}
            >
              {loading ? "…" : "Generate Link"}
            </button>
            {customUrl && (
              <button
                onClick={() => call("custom")}
                disabled={loading}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                Save URL
              </button>
            )}
            {meetUrl && (
              <button
                onClick={() => call("clear")}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 transition-colors"
                style={{ border: "1px solid rgba(239,68,68,0.3)" }}
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
