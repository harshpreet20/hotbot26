"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type MicState = "idle" | "recording" | "transcribing";
import { createClient } from "@supabase/supabase-js";
import { ChatMessages } from "./ChatMessages";
import { QuickReplies } from "./QuickReplies";

function sbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "bot";
  text: string;
  ts: number;
}

type Tab = "chat" | "voice" | "call";

// ─── Tab icons ────────────────────────────────────────────────────────────────
function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#f472b6" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3"/>
      <path d="M19 10a7 7 0 01-14 0"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
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

// ─── AI Voice Call Tab — Sarvam-powered with transcript storage ───────────────
function VoiceCallTab() {
  const [phase, setPhase] = useState<"intro" | "active">("intro");
  const [micState, setMicState] = useState<"idle" | "recording" | "processing" | "playing">("idle");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [error, setError] = useState("");
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns]);

  async function saveTranscript(user_message: string, ai_reply: string, language?: string) {
    try {
      await fetch("/api/voice-transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message,
          ai_reply,
          language: language || "en",
          session_id: sessionIdRef.current,
        }),
      });
    } catch { /* silently ignore — never crash the voice session */ }
  }

  async function playAudio(b64: string) {
    return new Promise<void>((resolve) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.onended = () => { URL.revokeObjectURL(url); resolve(); };
      a.onerror  = () => { URL.revokeObjectURL(url); resolve(); };
      a.play().catch(resolve);
    });
  }

  async function startCall() {
    const greeting = "Hi! I'm HotBot, your AI voice assistant. How can I help you today?";
    historyRef.current = [{ role: "assistant", content: greeting }];
    setTurns([{ role: "bot", text: greeting }]);
    setPhase("active");
    setMicState("playing");
    try {
      const res = await fetch("/api/sarvam/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: greeting }),
      });
      if (res.ok) {
        const data = await res.json() as { audio?: string };
        if (data.audio) await playAudio(data.audio);
      }
    } catch { /* proceed silently */ }
    setMicState("idle");
  }

  async function handleMic() {
    if (micState === "recording") {
      mrRef.current?.stop();
      return;
    }
    if (micState !== "idle") return;
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMicState("processing");
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const form = new FormData();
          form.append("audio", blob);
          form.append("history", JSON.stringify(historyRef.current.slice(-6)));
          const res = await fetch("/api/sarvam/voice-chat", { method: "POST", body: form });
          if (!res.ok) throw new Error("failed");
          const data = await res.json() as { transcript?: string; reply?: string; audio?: string; language?: string };
          if (data.transcript) {
            setTurns((p) => [...p, { role: "user", text: data.transcript! }]);
            historyRef.current.push({ role: "user", content: data.transcript! });
          }
          if (data.reply) {
            setTurns((p) => [...p, { role: "bot", text: data.reply! }]);
            historyRef.current.push({ role: "assistant", content: data.reply! });
          }
          // Save transcript exchange to Supabase (non-blocking)
          if (data.transcript && data.reply) {
            void saveTranscript(data.transcript, data.reply, data.language);
          }
          if (data.audio) {
            setMicState("playing");
            await playAudio(data.audio);
          }
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setMicState("idle");
        }
      };
      mr.start();
      setMicState("recording");
    } catch {
      setError("Microphone access denied. Please allow mic access.");
      setMicState("idle");
    }
  }

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(244,114,182,0.25), rgba(139,92,246,0.2))",
            border: "1px solid rgba(244,114,182,0.4)",
            boxShadow: "0 0 40px rgba(244,114,182,0.2)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f9a8d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M19 10a7 7 0 01-14 0"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="8" y1="22" x2="16" y2="22"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-base mb-1">AI Voice Call</p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
            Speak directly with HotBot&apos;s AI voice agent. Powered by Sarvam — supports Hindi, English, and more.
          </p>
        </div>
        <button
          onClick={startCall}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: "linear-gradient(135deg, #f472b6, #8b5cf6)", boxShadow: "0 4px 24px rgba(244,114,182,0.3)" }}
        >
          🎙 Start Voice Session →
        </button>
        <p className="text-slate-500 text-xs text-center">Powered by Sarvam AI · No phone number needed</p>
      </div>
    );
  }

  const micLabel = micState === "recording" ? "Listening…" : micState === "processing" ? "Thinking…" : micState === "playing" ? "Speaking…" : "Tap to speak";
  const micActive = micState === "recording";
  const micBusy   = micState === "processing" || micState === "playing";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Transcript scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
              style={{
                background: t.role === "user"
                  ? "linear-gradient(135deg, #be185d, #7c3aed)"
                  : "rgba(255,255,255,0.07)",
                color: "white",
                borderBottomRightRadius: t.role === "user" ? 4 : 16,
                borderBottomLeftRadius:  t.role === "bot"  ? 4 : 16,
              }}
            >
              {t.text}
            </div>
          </div>
        ))}
      </div>

      {/* Mic control */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pb-5 pt-3 border-t border-white/[0.06]">
        {error && <p className="text-red-400 text-[11px]">{error}</p>}
        <button
          onClick={handleMic}
          disabled={micBusy}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed"
          style={{
            background: micActive
              ? "rgba(239,68,68,0.2)"
              : micBusy
                ? "rgba(244,114,182,0.15)"
                : "linear-gradient(135deg, #f472b6, #8b5cf6)",
            border: micActive ? "2px solid rgba(239,68,68,0.7)" : "2px solid transparent",
            boxShadow: micActive
              ? "0 0 0 0 rgba(239,68,68,0.4)"
              : micBusy ? "none" : "0 0 24px rgba(244,114,182,0.4)",
            animation: micActive ? "micPulse 1s ease-in-out infinite" : "none",
          }}
        >
          {micState === "processing" || micState === "playing" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={micActive ? "#f87171" : "white"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M19 10a7 7 0 01-14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          )}
        </button>
        <p className="text-slate-400 text-[11px]">{micLabel}</p>
      </div>
    </div>
  );
}

// ─── Voice turn entry ────────────────────────────────────────────────────────
interface VoiceTurn { role: "user" | "bot"; text: string; }

// ─── Call Tab — Sarvam-powered live voice conversation ───────────────────────
function CallTab() {
  const [phase, setPhase] = useState<"intro" | "active">("intro");
  const [micState, setMicState] = useState<"idle" | "recording" | "processing" | "playing">("idle");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [error, setError] = useState("");
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns]);

  async function playAudio(b64: string) {
    return new Promise<void>((resolve) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.onended = () => { URL.revokeObjectURL(url); resolve(); };
      a.onerror  = () => { URL.revokeObjectURL(url); resolve(); };
      a.play().catch(resolve);
    });
  }

  async function startCall() {
    const greeting = "Hi! I'm HotBot, your AI voice assistant. How can I help you today?";
    historyRef.current = [{ role: "assistant", content: greeting }];
    setTurns([{ role: "bot", text: greeting }]);
    setPhase("active");
    setMicState("playing");
    try {
      const res = await fetch("/api/sarvam/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: greeting }),
      });
      if (res.ok) {
        const data = await res.json() as { audio?: string };
        if (data.audio) await playAudio(data.audio);
      }
    } catch { /* proceed silently */ }
    setMicState("idle");
  }

  async function handleMic() {
    if (micState === "recording") {
      mrRef.current?.stop();
      return;
    }
    if (micState !== "idle") return;
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMicState("processing");
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const form = new FormData();
          form.append("audio", blob);
          form.append("history", JSON.stringify(historyRef.current.slice(-6)));
          const res = await fetch("/api/sarvam/voice-chat", { method: "POST", body: form });
          if (!res.ok) throw new Error("failed");
          const data = await res.json() as { transcript?: string; reply?: string; audio?: string };
          if (data.transcript) {
            setTurns((p) => [...p, { role: "user", text: data.transcript! }]);
            historyRef.current.push({ role: "user", content: data.transcript! });
          }
          if (data.reply) {
            setTurns((p) => [...p, { role: "bot", text: data.reply! }]);
            historyRef.current.push({ role: "assistant", content: data.reply! });
          }
          if (data.audio) {
            setMicState("playing");
            await playAudio(data.audio);
          }
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setMicState("idle");
        }
      };
      mr.start();
      setMicState("recording");
    } catch {
      setError("Microphone access denied. Please allow mic access.");
      setMicState("idle");
    }
  }

  if (phase === "intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.2))",
            border: "1px solid rgba(139,92,246,0.4)",
            boxShadow: "0 0 40px rgba(139,92,246,0.2)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M19 10a7 7 0 01-14 0"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="8" y1="22" x2="16" y2="22"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-base mb-1">Live Voice Agent</p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
            Speak directly with HotBot&apos;s AI voice agent. Powered by Sarvam — supports Hindi, English, and more.
          </p>
        </div>
        <button
          onClick={startCall}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", boxShadow: "0 4px 24px rgba(139,92,246,0.3)" }}
        >
          Start Voice Call →
        </button>
        <p className="text-slate-500 text-xs text-center">Powered by Sarvam AI · No phone number needed</p>
      </div>
    );
  }

  const micLabel = micState === "recording" ? "Listening…" : micState === "processing" ? "Thinking…" : micState === "playing" ? "Speaking…" : "Tap to speak";
  const micActive = micState === "recording";
  const micBusy   = micState === "processing" || micState === "playing";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Transcript scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
              style={{
                background: t.role === "user"
                  ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                  : "rgba(255,255,255,0.07)",
                color: "white",
                borderBottomRightRadius: t.role === "user" ? 4 : 16,
                borderBottomLeftRadius:  t.role === "bot"  ? 4 : 16,
              }}
            >
              {t.text}
            </div>
          </div>
        ))}
      </div>

      {/* Mic control */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pb-5 pt-3 border-t border-white/[0.06]">
        {error && <p className="text-red-400 text-[11px]">{error}</p>}
        <button
          onClick={handleMic}
          disabled={micBusy}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed"
          style={{
            background: micActive
              ? "rgba(239,68,68,0.2)"
              : micBusy
                ? "rgba(139,92,246,0.15)"
                : "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            border: micActive ? "2px solid rgba(239,68,68,0.7)" : "2px solid transparent",
            boxShadow: micActive
              ? "0 0 0 0 rgba(239,68,68,0.4)"
              : micBusy ? "none" : "0 0 24px rgba(139,92,246,0.4)",
            animation: micActive ? "micPulse 1s ease-in-out infinite" : "none",
          }}
        >
          {micState === "processing" || micState === "playing" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={micActive ? "#f87171" : "white"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M19 10a7 7 0 01-14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          )}
        </button>
        <p className="text-slate-400 text-[11px]">{micLabel}</p>
      </div>
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
  const [micState, setMicState] = useState<MicState>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgCountRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  // Realtime agent reply listener — subscribe to this session's row via Supabase
  useEffect(() => {
    if ((!needsHuman && !agentJoined) || !sessionId) return;

    function applySession(row: { messages?: Message[]; agent_username?: string }) {
      const remoteMsgs = (row.messages ?? []) as Message[];
      if (remoteMsgs.length > lastMsgCountRef.current) {
        lastMsgCountRef.current = remoteMsgs.length;
        setMsgs(remoteMsgs.map((m) => ({ role: m.role, text: m.text, ts: m.ts })));
      }
      if (row.agent_username && !agentJoined) {
        setAgentJoined(true);
        setNeedsHuman(false);
      }
    }

    const sb = sbClient();
    if (sb) {
      const channel = sb
        .channel(`chat-session-${sessionId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "chats", filter: `id=eq.${sessionId}` },
          (payload) => applySession(payload.new as { messages?: Message[]; agent_username?: string }),
        )
        .subscribe();
      return () => { void sb.removeChannel(channel); };
    }

    // Fallback poll when Supabase not configured
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/session?id=${sessionId}`);
        if (!res.ok) return;
        const data = await res.json() as { session?: { messages?: Message[]; agentUsername?: string } };
        if (data.session) applySession({ messages: data.session.messages, agent_username: data.session.agentUsername });
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
        text: "Message sent! You can also try our AI Voice Call or request a call from our team.",
        ts: Date.now(),
      }]);
    } finally {
      setTyping(false);
    }
  }, [msgs, guestName, guestEmail, guestPhone, sessionId]);

  const handleMic = useCallback(async () => {
    if (micState === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (micState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMicState("transcribing");
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const form = new FormData();
          form.append("audio", blob);
          const res = await fetch("/api/sarvam/stt", { method: "POST", body: form });
          if (res.ok) {
            const data = await res.json() as { transcript?: string };
            if (data.transcript) setInput(data.transcript);
          }
        } catch { /* ignore */ } finally {
          setMicState("idle");
        }
      };
      mr.start();
      setMicState("recording");
    } catch { setMicState("idle"); }
  }, [micState]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg(input);
    }
  };

  // Tab config
  const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { id: "chat",  label: "AI Chat",   Icon: ChatIcon },
    { id: "voice", label: "Voice AI",  Icon: MicIcon },
    { id: "call",  label: "Call",      Icon: PhoneIcon },
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
                    ? id === "chat" ? "#60a5fa" : id === "voice" ? "#f472b6" : "#a78bfa"
                    : "#475569",
                  borderBottom: tab === id
                    ? `2px solid ${id === "chat" ? "#3b82f6" : id === "voice" ? "#f472b6" : "#8b5cf6"}`
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
                  onClick={handleMic}
                  disabled={typing}
                  title={micState === "recording" ? "Stop recording" : micState === "transcribing" ? "Transcribing…" : "Voice input"}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: micState === "recording"
                      ? "rgba(239,68,68,0.2)"
                      : "rgba(255,255,255,0.05)",
                    border: micState === "recording" ? "1px solid rgba(239,68,68,0.5)" : "1px solid transparent",
                    animation: micState === "recording" ? "micPulse 1s ease-in-out infinite" : "none",
                  }}
                >
                  {micState === "transcribing" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={micState === "recording" ? "#f87171" : "#94a3b8"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="11" rx="3"/>
                      <path d="M19 10a7 7 0 01-14 0"/>
                      <line x1="12" y1="19" x2="12" y2="22"/>
                      <line x1="8" y1="22" x2="16" y2="22"/>
                    </svg>
                  )}
                </button>
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

          {tab === "voice" && <VoiceCallTab />}
          {tab === "call" && <CallTab />}
        </div>
      )}
    </>
  );
}
