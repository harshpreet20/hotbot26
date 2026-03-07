"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { ChatSession } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

export default function ChatsPage() {
  const router   = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState<string | null>(null);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch('/api/dashboard/chats', { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => r.status === 401 ? (router.replace("/enter/backdrop"), null) : r.json())
      .then((d) => { if (d) setSessions((d as { sessions: ChatSession[] }).sessions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const selected = sessions.find((s) => s.id === active);

  return (
    <DashboardShell>
      <div className="flex min-h-full">
        {/* Session list */}
        <div className="w-72 shrink-0 border-r flex flex-col" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h1 className="text-white font-semibold">Chat Logs</h1>
            <p className="text-slate-500 text-xs mt-0.5">{sessions.length} sessions</p>
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm p-4">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="text-slate-500 text-sm p-4">No chat sessions yet.</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {sessions.map((s) => {
                const firstMsg = s.messages.find((m) => m.role === "user");
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(isActive ? null : s.id)}
                    className="w-full text-left px-4 py-3 border-b hover:bg-white/[0.03] transition-colors"
                    style={{
                      borderColor: "rgba(255,255,255,0.05)",
                      background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                    }}
                  >
                    <p className="text-slate-300 text-xs font-medium truncate">
                      {firstMsg?.text.slice(0, 60) || "Session"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600 text-[10px]">{s.messages.length} msgs</span>
                      <span className="text-slate-700 text-[10px]">·</span>
                      <span className="text-slate-600 text-[10px]">
                        {new Date(s.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
              Select a session to view messages
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <p className="text-white text-sm font-medium">Session</p>
                <p className="text-slate-500 text-xs mt-0.5">{selected.ip} · {new Date(selected.startedAt).toLocaleString()}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {selected.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm"
                      style={
                        msg.role === "user"
                          ? { background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff" }
                          : { background: "rgba(255,255,255,0.06)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
