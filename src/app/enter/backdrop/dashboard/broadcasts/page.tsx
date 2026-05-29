"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/backdrop/DashboardShell";

function getSecret() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : ""; }

const SEGMENTS = ["Tickets","Leads","Analytics","Team Chat","Callbacks","Blog","Tasks","Invoices","Users / Team","Clients","CRM","General"];

export default function BroadcastsPage() {
  const [segment,  setSegment]  = useState(SEGMENTS[0]);
  const [version,  setVersion]  = useState("");
  const [changes,  setChanges]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [result,   setResult]   = useState<{ ok: boolean; msg: string } | null>(null);

  const inputCls   = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const items = changes.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!items.length) return;
    setSending(true); setResult(null);
    try {
      const res = await fetch("/api/internal/feature-broadcast", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getSecret()}` },
        body:    JSON.stringify({ segment, changes: items, version: version.trim() || undefined }),
      });
      const data = await res.json() as { success?: boolean; sent?: number; error?: string };
      if (res.ok) {
        setResult({ ok: true, msg: `Broadcast sent to ${data.sent} team member${data.sent !== 1 ? "s" : ""}.` });
        setChanges(""); setVersion("");
      } else {
        setResult({ ok: false, msg: data.error ?? "Failed to send." });
      }
    } catch {
      setResult({ ok: false, msg: "Network error." });
    } finally { setSending(false); }
  }

  return (
    <DashboardShell>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-white text-xl font-semibold">Feature Broadcast</h1>
          <p className="text-slate-500 text-sm mt-0.5">Send a feature update email to your team when you ship something new.</p>
        </div>

        {result && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm"
            style={{
              background: result.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border:     `1px solid ${result.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              color:      result.ok ? "#4ade80" : "#f87171",
            }}
          >
            {result.msg}
          </div>
        )}

        <form onSubmit={send} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Segment / Module</label>
              <select value={segment} onChange={(e) => setSegment(e.target.value)} className={inputCls} style={inputStyle}>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Version <span className="normal-case text-slate-700">(optional)</span></label>
              <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 2.4.1" className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Changes — one per line</label>
            <textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              rows={6}
              placeholder={"Added bulk close button for tickets\nFixed assignee dropdown on mobile\nImproved search speed"}
              className={`${inputCls} resize-y`}
              style={inputStyle}
              required
            />
            <p className="text-slate-600 text-xs mt-1.5">Each line becomes a bullet point in the email.</p>
          </div>

          <div className="rounded-xl p-3 text-xs text-slate-500 space-y-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-semibold text-slate-400">Recipients</p>
            <p>Emails are sent to all addresses in the <code className="text-indigo-400">TEAM_NOTIFY_EMAILS</code> environment variable (comma-separated).</p>
          </div>

          <button
            type="submit"
            disabled={sending || !changes.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: "rgba(99,102,241,0.8)" }}
          >
            {sending ? "Sending…" : "Send Broadcast Email"}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
