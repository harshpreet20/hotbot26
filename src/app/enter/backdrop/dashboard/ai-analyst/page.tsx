"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";

type Message = { role: "user" | "assistant"; content: string; toolsUsed?: string[] };

const TOOL_LABELS: Record<string, string> = {
  get_analytics:       "Website Analytics",
  get_crm_summary:     "CRM Summary",
  get_email_stats:     "Email Stats",
  get_recent_leads:    "Recent Leads",
  get_recent_tickets:  "Recent Tickets",
};

const SUGGESTED: string[] = [
  "What are my top traffic sources this month?",
  "How is the sales funnel performing? Any bottlenecks?",
  "What's my email delivery and open rate?",
  "Which pages have the highest bounce rate?",
  "Give me a strategic overview and top 3 recommendations.",
  "How many new leads this month? What's the status breakdown?",
  "What devices are my visitors using?",
  "Are there any urgent open tickets?",
];

function ToolBadge({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
      {TOOL_LABELS[name] ?? name}
    </span>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
          style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
          AI
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-0.5">
            {[...new Set(msg.toolsUsed)].map((t) => <ToolBadge key={t} name={t} />)}
          </div>
        )}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          style={isUser
            ? { background: "rgba(99,102,241,0.18)", color: "#e2e8f0", borderRadius: "18px 18px 4px 18px" }
            : { background: "rgba(255,255,255,0.05)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 18px 18px 18px" }
          }
        >
          {msg.content}
        </div>
      </div>
      {isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
          style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
          You
        </div>
      )}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
        AI
      </div>
      <div className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 18px 18px 18px" }}>
        <span className="text-slate-500 text-xs">Fetching data</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function AiAnalystPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/ai-chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (res.status === 401 || res.status === 403) { router.replace("/enter/backdrop"); return; }
      const data = await res.json() as { reply?: string; toolsUsed?: string[]; error?: string };
      const reply = data.reply ?? data.error ?? "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, toolsUsed: data.toolsUsed }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); }
  }

  function exportChat() {
    const lines: string[] = [`HotBot Studios AI Analyst — Chat Export`, `Exported: ${new Date().toLocaleString()}`, `${"─".repeat(60)}`, ""];
    for (const m of messages) {
      lines.push(`[${m.role === "user" ? "You" : "AI Analyst"}]`);
      if (m.toolsUsed?.length) lines.push(`Data sources: ${[...new Set(m.toolsUsed)].map((t) => TOOL_LABELS[t] ?? t).join(", ")}`);
      lines.push(m.content, "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ai-analyst-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportChatJson() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ai-analyst-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  const isEmpty = messages.length === 0;

  return (
    <DashboardShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">AI Analyst</h1>
              <p className="text-slate-500 text-xs">Data-grounded business intelligence</p>
            </div>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportChat}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 transition-colors hover:text-white flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export .txt
              </button>
              <button
                onClick={exportChatJson}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 transition-colors hover:text-white flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export .json
              </button>
              <button
                onClick={() => setMessages([])}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 transition-colors hover:text-red-400"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                Clear
              </button>
            </div>
          )}
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-6">
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
                  </svg>
                </div>
                <h2 className="text-white font-semibold mb-1">Ask anything about your business</h2>
                <p className="text-slate-500 text-sm max-w-sm">I pull live data from your analytics, CRM, and email stats before answering. No guesses, only facts.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    className="text-left px-3 py-2.5 rounded-xl text-xs text-slate-400 transition-all hover:text-slate-200"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          {loading && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex gap-3 items-end rounded-2xl p-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about analytics, CRM, email, or strategy..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none px-3 py-2.5 max-h-32"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => void sendMessage(input)}
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 mr-0.5 transition-all disabled:opacity-30"
              style={{ background: input.trim() && !loading ? "#6366f1" : "rgba(99,102,241,0.2)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-slate-700 text-[10px] text-center mt-2">Enter to send · Shift+Enter for new line · All answers are grounded in live data</p>
        </div>
      </div>
    </DashboardShell>
  );
}
