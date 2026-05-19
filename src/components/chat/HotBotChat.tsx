"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessages } from "./ChatMessages";
import { QuickReplies } from "./QuickReplies";
import { useRecaptcha } from "@/hooks/useRecaptcha";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "bot";
  text: string;
  ts: number;
}

type Tab = "chat" | "whatsapp" | "call";

const WHATSAPP_NUMBER = "919700001534";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi HotBot Studios! I'd like to learn more about your services."
);
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

// ─── Tab icons ────────────────────────────────────────────────────────────────
function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function WAIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "#22c55e" : "#64748b"}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#a78bfa" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

// ─── WhatsApp Tab ─────────────────────────────────────────────────────────────
function WhatsAppTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
      {/* WhatsApp branding orb */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 40px rgba(34,197,94,0.25)" }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-white font-semibold text-base mb-1">Chat on WhatsApp</p>
        <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
          Get instant replies from our AI assistant - powered by AI Sensy on WhatsApp Business.
        </p>
      </div>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 rounded-2xl font-semibold text-white text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-500/30"
        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
      >
        Open WhatsApp →
      </a>

      <p className="text-slate-500 text-xs text-center">
        +91 97000 01534 · Typically replies in minutes
      </p>
    </div>
  );
}

// ─── Call Tab ─────────────────────────────────────────────────────────────────
function CallTab() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const recaptchaToken = await getToken("callback_form");
      const res = await fetch("/api/forms/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), recaptchaToken }),
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      // Network error - still confirm so user isn't stuck
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5 text-center">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-base mb-1">Call Scheduled!</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our AI voice assistant will call <span className="text-white">{phone}</span> within 2 minutes.
            Make sure you&apos;re available.
          </p>
        </div>
        <button
          onClick={() => { setDone(false); setName(""); setPhone(""); }}
          className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
        >
          Request another call
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-5">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 30px rgba(139,92,246,0.15)" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l.82-.82a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-white font-semibold text-base mb-1">Request a Callback</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          Our AI voice agent (powered by Sarvam) will call you back within 2 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 97000 01534"
            required
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading || !name.trim() || !phone.trim()}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
        >
          {loading ? "Requesting..." : "Call Me Now →"}
        </button>
      </form>

      <p className="text-slate-500 text-xs text-center">
        Powered by Sarvam AI · Calls from +91 97000 01534
      </p>
    </div>
  );
}

// ─── Pre-chat form ────────────────────────────────────────────────────────────
function PreChatForm({ onDone }: { onDone: (name: string, email: string, phone: string) => void }) {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr]     = useState("");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Please enter your name."); return; }
    if (!emailOk)     { setErr("Please enter a valid email."); return; }
    onDone(name.trim(), email.trim(), phone.trim());
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-5 py-4 gap-4">
      <div className="text-center">
        <p className="text-white font-semibold text-sm mb-1">Before we chat…</p>
        <p className="text-slate-400 text-xs leading-relaxed">Just a quick intro so HotBot can personalise your experience.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Your name *"
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors"
        />
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address *"
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors"
        />
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (optional)"
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors"
        />
        {err && <p className="text-red-400 text-xs">{err}</p>}
        <button
          type="submit"
          disabled={!name.trim() || !emailOk}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Start Chat →
        </button>
      </form>
      <p className="text-slate-600 text-[10px] text-center">Your info helps us follow up and personalise your experience.</p>
    </div>
  );
}

// ─── Main HotBotChat ───────────────────────────────────────────────────────────
export function HotBotChat() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");
  const [fabHov, setFabHov] = useState(false);

  // Pre-chat form
  const [preformDone, setPreformDone] = useState(false);
  const [guestName, setGuestName]     = useState("");
  const [guestEmail, setGuestEmail]   = useState("");
  const [guestPhone, setGuestPhone]   = useState("");

  // Chat state
  const [msgs, setMsgs] = useState<Message[]>([
    {
      role: "bot",
      text: "Hey! I'm HotBot - your AI assistant. Ask me anything about our services, pricing, or how we can help your business grow.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [needsHuman, setNeedsHuman] = useState(false);
  const [agentJoined, setAgentJoined] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgCountRef = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, typing]);

  useEffect(() => {
    if (!open) {
      setTab("chat");
    }
  }, [open]);

  // Poll for agent replies — starts on handoff, keeps running after agent joins
  useEffect(() => {
    if ((!needsHuman && !agentJoined) || !sessionId) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/session?id=${sessionId}`);
        if (!res.ok) return;
        const data = await res.json() as { session?: { messages?: Message[]; needsHuman?: boolean; agentUsername?: string } };
        const remoteMsgs = data.session?.messages ?? [];
        if (remoteMsgs.length > lastMsgCountRef.current) {
          lastMsgCountRef.current = remoteMsgs.length;
          setMsgs(remoteMsgs.map((m) => ({ role: m.role, text: m.text, ts: m.ts })));
        }
        if (data.session?.agentUsername && !agentJoined) {
          setAgentJoined(true);
          setNeedsHuman(false);
        }
      } catch { /* ignore */ }
    };
    pollRef.current = setInterval(poll, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsHuman, agentJoined, sessionId]);

  const sendMsg = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setMsgs((p) => [...p, { role: "user", text, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    const history = msgs.slice(-10).map((m) => ({ role: m.role, content: m.text }));
    lastMsgCountRef.current = msgs.length + 1;
    try {
      const res = await fetch("/api/forms/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          sessionId: sessionId ?? undefined,
          // Pass guest info only on the first message so the API can create a lead
          ...(history.length === 0 && guestName ? { guestName, guestEmail, guestPhone } : {}),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { message?: string; sessionId?: string; needsHuman?: boolean };
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      if (data.needsHuman) setNeedsHuman(true);
      setMsgs((p) => [...p, {
        role: "bot",
        text: data?.message || "Thanks! Our team will reach out shortly.",
        ts: Date.now(),
      }]);
      lastMsgCountRef.current += 1;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMsgs((p) => [...p, {
        role: "bot",
        text: "Message sent! You can also reach us instantly via WhatsApp or request a call.",
        ts: Date.now(),
      }]);
    } finally {
      setTyping(false);
    }
  }, [msgs, guestName, guestEmail, guestPhone, sessionId]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg(input);
    }
  };

  // Tab config
  const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { id: "chat",      label: "AI Chat",   Icon: ChatIcon },
    { id: "whatsapp",  label: "WhatsApp",  Icon: WAIcon },
    { id: "call",      label: "Call",      Icon: PhoneIcon },
  ];

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setFabHov(true)}
        onMouseLeave={() => setFabHov(false)}
        className="fixed bottom-6 right-6 z-[99998] flex items-center justify-center transition-all duration-300"
        aria-label="Open chat"
        style={{
          width: open ? 48 : 60,
          height: open ? 48 : 60,
          borderRadius: open ? 14 : 30,
          background: open
            ? "#1a2240"
            : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          border: open ? "1px solid rgba(255,255,255,0.1)" : "none",
          boxShadow: open
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : `0 8px 32px rgba(59,130,246,0.4), 0 0 ${fabHov ? "50" : "20"}px rgba(59,130,246,${fabHov ? "0.3" : "0.15"})`,
          transform: fabHov && !open ? "scale(1.1)" : "scale(1)",
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        )}
      </button>

      {/* Online dot */}
      {!open && (
        <div
          className="fixed bottom-16 right-6 z-[99998] w-3.5 h-3.5 rounded-full bg-green-400"
          style={{ border: "2px solid #0a0e1a" }}
        />
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-[99997] rounded-3xl overflow-hidden flex flex-col animate-zoom-in"
          style={{
            width: 380,
            maxWidth: "calc(100vw - 48px)",
            height: 560,
            maxHeight: "calc(100vh - 100px)",
            background: "rgba(10,14,26,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              <span className="text-white font-black text-sm">H</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">HotBot Studios</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-slate-400 text-[11px]">Online - choose how to connect</p>
              </div>
            </div>
          </div>

          {/* 3-Tab navigation */}
          <div
            className="flex-shrink-0 flex border-b border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.01)" }}
          >
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-all duration-200"
                style={{
                  color: tab === id
                    ? id === "chat" ? "#60a5fa" : id === "whatsapp" ? "#22c55e" : "#a78bfa"
                    : "#475569",
                  borderBottom: tab === id
                    ? `2px solid ${id === "chat" ? "#3b82f6" : id === "whatsapp" ? "#22c55e" : "#8b5cf6"}`
                    : "2px solid transparent",
                  background: tab === id ? "rgba(255,255,255,0.03)" : "transparent",
                }}
              >
                <Icon active={tab === id} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "chat" && !preformDone && (
            <PreChatForm onDone={(n, e, p) => {
              setGuestName(n); setGuestEmail(e); setGuestPhone(p);
              setMsgs([{ role: "bot", text: `Hi ${n}! I'm HotBot. How can I help you today?`, ts: Date.now() }]);
              setPreformDone(true);
            }} />
          )}
          {tab === "chat" && preformDone && (
            <>
              {/* Human handoff / agent status banner */}
              {needsHuman && !agentJoined && (
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs" style={{ background: "rgba(234,179,8,0.08)", borderBottom: "1px solid rgba(234,179,8,0.15)" }}>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                  <span className="text-yellow-300">Connecting you to a human agent…</span>
                </div>
              )}
              {agentJoined && (
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs" style={{ background: "rgba(34,197,94,0.08)", borderBottom: "1px solid rgba(34,197,94,0.15)" }}>
                  <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="text-green-300">A human agent has joined the conversation.</span>
                </div>
              )}
              <ChatMessages msgs={msgs} typing={typing && !needsHuman} scrollRef={scrollRef} />
              {msgs.length <= 2 && <QuickReplies onSelect={sendMsg} />}
              <div
                className="flex-shrink-0 flex items-end gap-2 p-3 border-t border-white/[0.08]"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors"
                  style={{ minHeight: 44 }}
                />
                <button
                  onClick={() => sendMsg(input)}
                  disabled={!input.trim() || typing}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22 11 13 2 9l20-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {tab === "whatsapp" && <WhatsAppTab />}
          {tab === "call" && <CallTab />}
        </div>
      )}
    </>
  );
}
