"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { ChatSession } from "@/types/dashboard";

function getSecret() {
  return typeof window !== "undefined"
    ? sessionStorage.getItem("backdrop_secret") || ""
    : "";
}

function getUsername() {
  return typeof window !== "undefined"
    ? sessionStorage.getItem("backdrop_username") || ""
    : "";
}

export default function ChatsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState("");
  const [sending, setSending] = useState(false);

  const fetchSessions = useCallback(() => {
    const secret = getSecret();
    if (!secret) {
      router.replace("/enter/backdrop");
      return;
    }
    fetch("/api/dashboard/chats", {
      headers: { Authorization: `Bearer ${secret}` },
    })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem("backdrop_secret");
          sessionStorage.removeItem("backdrop_role");
          sessionStorage.removeItem("backdrop_username");
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setSessions((d as { sessions: ChatSession[] }).sessions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Sort: needsHuman first, then by lastMessageAt / startedAt descending
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.needsHuman && !b.needsHuman) return -1;
    if (!a.needsHuman && b.needsHuman) return 1;
    const aTime = a.lastMessageAt || a.startedAt;
    const bTime = b.lastMessageAt || b.startedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const selected = sessions.find((s) => s.id === active) ?? null;

  async function handleAgentReply() {
    if (!selected || !agentInput.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/chats/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSecret()}`,
        },
        body: JSON.stringify({ sessionId: selected.id, message: agentInput.trim() }),
      });
      if (res.ok) {
        setAgentInput("");
        fetchSessions();
      } else {
        const err = (await res.json()) as { error?: string };
        console.error("Reply failed:", err.error);
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex min-h-full">
        {/* Session list */}
        <div
          className="w-72 shrink-0 border-r flex flex-col"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="px-4 py-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            <h1 className="text-white font-semibold">Chat Logs</h1>
            <p className="text-slate-500 text-xs mt-0.5">{sessions.length} sessions</p>
          </div>

          {loading ? (
            <div className="text-slate-500 text-sm p-4">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="text-slate-500 text-sm p-4">No chat sessions yet.</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {sortedSessions.map((s) => {
                const displayName =
                  s.guestName ||
                  s.messages.find((m) => m.role === "user")?.text.slice(0, 60) ||
                  "Session";
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(isActive ? null : s.id)}
                    className="w-full text-left px-4 py-3 border-b hover:bg-white/[0.03] transition-colors"
                    style={{
                      borderColor: "rgba(255,255,255,0.05)",
                      borderLeft: s.needsHuman ? "2px solid #ef4444" : "2px solid transparent",
                      background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {s.needsHuman && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
                      <p className="text-slate-300 text-xs font-medium truncate flex-1">
                        {displayName}
                      </p>
                      {s.needsHuman && (
                        <span className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600 text-[10px]">{s.messages.length} msgs</span>
                      <span className="text-slate-700 text-[10px]">·</span>
                      <span className="text-slate-600 text-[10px]">
                        {new Date(s.startedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {s.needsHuman && (
                        <>
                          <span className="text-slate-700 text-[10px]">·</span>
                          <span className="text-red-400 text-[10px]">Awaiting agent</span>
                        </>
                      )}
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
              {/* Session header */}
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <p className="text-white text-sm font-medium">
                    {selected.guestName || "Anonymous"}
                  </p>
                  {selected.needsHuman && (
                    <span className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      LIVE
                    </span>
                  )}
                  {selected.agentUsername && (
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Agent: {selected.agentUsername}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {selected.guestEmail && (
                    <span className="text-slate-500 text-xs">{selected.guestEmail}</span>
                  )}
                  {selected.guestPhone && (
                    <span className="text-slate-500 text-xs">{selected.guestPhone}</span>
                  )}
                  <span className="text-slate-500 text-xs">{selected.ip}</span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(selected.startedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {selected.messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const isAgentMsg =
                    !isUser && !!selected.agentUsername && selected.agentTookOverAt
                      ? msg.ts >= new Date(selected.agentTookOverAt).getTime()
                      : false;
                  return (
                    <div
                      key={i}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm"
                        style={
                          isUser
                            ? {
                                background:
                                  "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "#fff",
                              }
                            : {
                                background: "rgba(255,255,255,0.06)",
                                color: "#cbd5e1",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }
                        }
                      >
                        {msg.text}
                        {isAgentMsg && (
                          <span className="block text-[10px] text-slate-500 mt-1">
                            (agent: {selected.agentUsername ?? getUsername()})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agent reply box */}
              <div
                className="px-5 py-4 border-t"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex gap-3">
                  <textarea
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        void handleAgentReply();
                      }
                    }}
                    placeholder="Reply as agent… (Ctrl+Enter to send)"
                    rows={2}
                    className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:ring-1 focus:ring-indigo-500/50"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                  <button
                    onClick={() => void handleAgentReply()}
                    disabled={!agentInput.trim() || sending}
                    className="self-end px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: sending
                        ? "rgba(99,102,241,0.4)"
                        : "linear-gradient(135deg, #6366f1, #4f46e5)",
                      color: "#fff",
                    }}
                  >
                    {sending ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
