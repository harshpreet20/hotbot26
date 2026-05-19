"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { TeamMessage, TeamChannel } from "@/types/dashboard";

function getSecret()   { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret")  || "" : ""; }
function getUsername() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_username") || "" : ""; }
function getRole()     { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role")     || "" : ""; }

const POLL_INTERVAL = 3000; // 3 s

export default function TeamChatPage() {
  const router = useRouter();

  const [channels,        setChannels]        = useState<TeamChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>("general");
  const [messages,        setMessages]        = useState<TeamMessage[]>([]);
  const [text,            setText]            = useState("");
  const [sending,         setSending]         = useState(false);
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [editText,        setEditText]        = useState("");
  const [replyTo,         setReplyTo]         = useState<TeamMessage | null>(null);

  // New channel modal
  const [showNewChannel,  setShowNewChannel]  = useState(false);
  const [newChanName,     setNewChanName]     = useState("");
  const [newChanDesc,     setNewChanDesc]     = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string>("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load channels
  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/team-chat?type=channels", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) { router.replace("/enter/backdrop"); return null; }
        return r.json() as Promise<{ channels?: TeamChannel[] }>;
      })
      .then((d) => { if (d?.channels) setChannels(d.channels); })
      .catch(console.error);
  }, [router]);

  // Load messages when channel changes
  useEffect(() => {
    const secret = getSecret();
    if (!secret || !activeChannelId) return;

    setMessages([]);
    lastMessageIdRef.current = "";

    fetch(`/api/dashboard/team-chat?channelId=${encodeURIComponent(activeChannelId)}`, { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) { router.replace("/enter/backdrop"); return null; }
        return r.json() as Promise<{ messages?: TeamMessage[] }>;
      })
      .then((d) => {
        const msgs = d?.messages ?? [];
        setMessages(msgs);
        if (msgs.length > 0) lastMessageIdRef.current = msgs[msgs.length - 1].createdAt;
      })
      .catch(console.error);
  }, [activeChannelId]);

  // Poll for new messages
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      const secret = getSecret();
      if (!secret || !activeChannelId) return;
      const since = lastMessageIdRef.current;
      if (!since) return;

      fetch(`/api/dashboard/team-chat?channelId=${encodeURIComponent(activeChannelId)}&since=${encodeURIComponent(since)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
        .then((r) => {
          if (r.status === 401) return null;
          return r.json() as Promise<{ messages?: TeamMessage[] }>;
        })
        .then((d) => {
          const newMessages = d?.messages ?? [];
          if (newMessages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newMsgs = newMessages.filter((m) => !existingIds.has(m.id));
              if (newMsgs.length === 0) return prev;
              lastMessageIdRef.current = newMessages[newMessages.length - 1].createdAt;
              return [...prev, ...newMsgs];
            });
          }
        })
        .catch(() => {});
    }, POLL_INTERVAL);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [activeChannelId]);

  // Scroll on new messages
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  async function sendMessage() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/team-chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: activeChannelId, text: text.trim(), replyTo: replyTo?.id }),
      });
      if (res.ok) {
        const data = await res.json() as { message: TeamMessage };
        setMessages((p) => [...p, data.message]);
        lastMessageIdRef.current = data.message.createdAt;
        setText("");
        setReplyTo(null);
      }
    } finally {
      setSending(false);
    }
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return;
    const res = await fetch("/api/dashboard/team-chat", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, text: editText.trim() }),
    });
    if (res.ok) {
      const data = await res.json() as { message: TeamMessage };
      setMessages((p) => p.map((m) => m.id === id ? data.message : m));
      setEditingId(null);
    }
  }

  async function deleteMessage(id: string) {
    const res = await fetch(`/api/dashboard/team-chat?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getSecret()}` },
    });
    if (res.ok) setMessages((p) => p.filter((m) => m.id !== id));
  }

  async function createChannel() {
    if (!newChanName.trim()) return;
    const res = await fetch("/api/dashboard/team-chat", {
      method: "POST",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "channel", name: newChanName.trim(), description: newChanDesc }),
    });
    if (res.ok) {
      const data = await res.json() as { channel: TeamChannel };
      setChannels((p) => [...p, data.channel]);
      setActiveChannelId(data.channel.id);
      setNewChanName(""); setNewChanDesc(""); setShowNewChannel(false);
    }
  }

  const me   = getUsername();
  const role = getRole();
  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const replyMsg = replyTo ? messages.find((m) => m.id === replyTo.id) : null;

  // Group messages by date
  const groupedMessages: { date: string; msgs: TeamMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const last = groupedMessages[groupedMessages.length - 1];
    if (!last || last.date !== date) {
      groupedMessages.push({ date, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  });

  return (
    <DashboardShell>
      <div className="flex h-full overflow-hidden">
        {/* Channel sidebar */}
        <aside className="w-52 shrink-0 flex flex-col border-r" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div className="px-3 pt-4 pb-2 flex items-center justify-between">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Channels</p>
            {(role === "admin" || role === "manager") && (
              <button onClick={() => setShowNewChannel(true)} className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none">+</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  color: activeChannelId === ch.id ? "#e2e8f0" : "#64748b",
                  background: activeChannelId === ch.id ? "rgba(99,102,241,0.12)" : "transparent",
                }}
              >
                # {ch.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div className="px-5 py-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-white font-medium"># {activeChannel?.name ?? activeChannelId}</p>
            {activeChannel?.description && <p className="text-slate-500 text-xs mt-0.5">{activeChannel.description}</p>}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5">
            {groupedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-600 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              groupedMessages.map(({ date, msgs }) => (
                <div key={date}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                    <span className="text-slate-600 text-xs whitespace-nowrap">{date}</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  </div>
                  {msgs.map((msg, idx) => {
                    const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                    const isClumped = prevMsg?.createdBy === msg.createdBy &&
                      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000;
                    const isMe = msg.createdBy === me;
                    const replyParent = msg.replyTo ? messages.find((m) => m.id === msg.replyTo) : null;

                    return (
                      <div
                        key={msg.id}
                        className="group flex gap-3 px-2 py-0.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                        style={{ marginTop: isClumped ? 0 : 12 }}
                      >
                        {!isClumped ? (
                          <div
                            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                            style={{ background: isMe ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)" }}
                          >
                            {msg.createdBy.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          {!isClumped && (
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="text-sm font-semibold" style={{ color: isMe ? "#818cf8" : "#94a3b8" }}>
                                {msg.createdBy}
                              </span>
                              <span className="text-slate-700 text-[11px]">
                                {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                {msg.editedAt && " (edited)"}
                              </span>
                            </div>
                          )}

                          {replyParent && (
                            <div className="mb-1 pl-2 border-l-2 border-slate-600">
                              <p className="text-slate-500 text-xs">
                                <span className="font-medium text-slate-400">{replyParent.createdBy}</span>: {replyParent.text.slice(0, 80)}{replyParent.text.length > 80 ? "…" : ""}
                              </p>
                            </div>
                          )}

                          {editingId === msg.id ? (
                            <div className="flex gap-2">
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) saveEdit(msg.id); if (e.key === "Escape") setEditingId(null); }}
                                className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(99,102,241,0.4)" }}
                                autoFocus
                              />
                              <button onClick={() => saveEdit(msg.id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                          )}
                        </div>

                        {/* Actions (hover) */}
                        {editingId !== msg.id && (
                          <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setReplyTo(msg)}
                              title="Reply"
                              className="text-slate-600 hover:text-slate-300 transition-colors text-xs p-1"
                            >
                              ↩
                            </button>
                            {(isMe || role === "admin") && (
                              <>
                                <button
                                  onClick={() => { setEditingId(msg.id); setEditText(msg.text); }}
                                  title="Edit"
                                  className="text-slate-600 hover:text-slate-300 transition-colors text-xs p-1"
                                >
                                  ✏
                                </button>
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  title="Delete"
                                  className="text-slate-600 hover:text-red-400 transition-colors text-xs p-1"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply preview */}
          {replyMsg && (
            <div className="mx-5 mb-1 px-3 py-2 rounded-t-xl flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderBottom: "none" }}>
              <p className="text-xs text-slate-500">
                Replying to <span className="text-slate-400 font-medium">{replyMsg.createdBy}</span>: {replyMsg.text.slice(0, 60)}
              </p>
              <button onClick={() => setReplyTo(null)} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">✕</button>
            </div>
          )}

          {/* Input */}
          <div className="px-5 pb-5 pt-2 shrink-0">
            <div
              className="flex items-end gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder={`Message #${activeChannel?.name ?? activeChannelId}…`}
                rows={1}
                className="flex-1 bg-transparent text-slate-300 placeholder:text-slate-600 text-sm outline-none resize-none leading-relaxed"
                style={{ maxHeight: 120, overflowY: "auto" }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !text.trim()}
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: text.trim() ? "rgba(99,102,241,0.8)" : "rgba(99,102,241,0.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-slate-700 text-[11px] mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>

      {/* New channel modal */}
      {showNewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-white font-semibold mb-4">Create Channel</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Channel Name</label>
                <input value={newChanName} onChange={(e) => setNewChanName(e.target.value)} placeholder="e.g. marketing" className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} autoFocus />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Description (optional)</label>
                <input value={newChanDesc} onChange={(e) => setNewChanDesc(e.target.value)} placeholder="What is this channel for?" className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewChannel(false)} className="flex-1 px-4 py-2 rounded-xl text-sm text-slate-400 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={createChannel} disabled={!newChanName.trim()} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: "rgba(99,102,241,0.8)" }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
