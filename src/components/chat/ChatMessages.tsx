"use client";

import { useState } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
  ts: number;
}

interface ChatMessagesProps {
  msgs: Message[];
  typing: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

function SpeakButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");

  async function speak() {
    if (state !== "idle") return;
    setState("loading");
    try {
      const res = await fetch("/api/sarvam/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const data = await res.json() as { audio?: string };
      if (!data.audio) throw new Error("No audio");

      // Decode base64 WAV → Blob → play
      const bytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setState("playing");
      audio.onended = () => { setState("idle"); URL.revokeObjectURL(url); };
      audio.onerror  = () => { setState("idle"); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      onClick={speak}
      title={state === "loading" ? "Generating audio…" : state === "playing" ? "Playing…" : "Listen"}
      style={{
        background: "none", border: "none", cursor: state === "idle" ? "pointer" : "default",
        padding: "2px 4px", borderRadius: 6, color: "#475569",
        opacity: state === "idle" ? 0 : 1,
        transition: "opacity 0.15s, color 0.15s",
        flexShrink: 0, alignSelf: "flex-end", marginBottom: 2,
      }}
      className="speak-btn"
    >
      {state === "loading" ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ) : state === "playing" ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#60a5fa" }}>
          <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 010 7.07"/>
        </svg>
      )}
    </button>
  );
}

export function ChatMessages({ msgs, typing, scrollRef }: ChatMessagesProps) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
      <style>{`
        .msg-row:hover .speak-btn { opacity: 1 !important; }
      `}</style>

      {msgs.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2 msg-row`}>
          {m.role === "bot" && (
            <div
              className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black text-white self-end"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              H
            </div>
          )}
          <div
            className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
            style={{
              background: m.role === "user"
                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                : "rgba(255,255,255,0.06)",
              color: "white",
              borderBottomRightRadius: m.role === "user" ? 6 : 16,
              borderBottomLeftRadius:  m.role === "bot"  ? 6 : 16,
            }}
          >
            {m.text}
          </div>
          {m.role === "bot" && <SpeakButton text={m.text} />}
        </div>
      ))}

      {typing && (
        <div className="flex justify-start gap-2">
          <div
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            H
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/[0.06]" style={{ borderBottomLeftRadius: 6 }}>
            <div className="flex gap-1 items-center h-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
