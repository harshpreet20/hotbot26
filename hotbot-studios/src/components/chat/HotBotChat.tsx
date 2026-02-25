"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessages } from "./ChatMessages";
import { VoiceMode } from "./VoiceMode";
import { QuickReplies } from "./QuickReplies";

interface Message {
  role: "user" | "bot";
  text: string;
  ts: number;
}

export function HotBotChat() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [msgs, setMsgs] = useState<Message[]>([
    {
      role: "bot",
      text: "Hey! I'm HotBot — your AI assistant. Ask me anything about our services, or tap the mic icon to talk.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [fabHov, setFabHov] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, typing]);

  useEffect(() => {
    if (!recording && !playing) return;
    const t = setInterval(() => setPulse((p) => (p + 1) % 360), 50);
    return () => clearInterval(t);
  }, [recording, playing]);

  const stopRecording = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setMode("chat");
      setPlaying(false);
      setProcessing(false);
    }
  }, [open, stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = handleRecordingDone;
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setMsgs((p) => [
        ...p,
        { role: "bot", text: "Microphone access denied. Please allow microphone permissions and try again.", ts: Date.now() },
      ]);
      setMode("chat");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecordingDone = async () => {
    const blob = new Blob(chunksRef.current, {
      type: chunksRef.current[0]?.type || "audio/webm",
    });
    if (blob.size < 500) {
      setTimeout(() => startRecording(), 400);
      return;
    }
    setProcessing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/n8n/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64,
            audioFormat: blob.type,
            history: msgs.slice(-10).map((m) => ({ role: m.role, content: m.text })),
          }),
        });
        const data = await res.json();
        const botText = data?.message || "I received your voice message. Our team will follow up shortly.";
        setMsgs((p) => [...p, { role: "bot", text: botText, ts: Date.now() }]);

        if (data?.audio) {
          const audioType = data?.audioFormat || "audio/mp3";
          const audioBlob = await fetch(`data:${audioType};base64,${data.audio}`).then((r) => r.blob());
          const url = URL.createObjectURL(audioBlob);
          const a = new Audio(url);
          audioRef.current = a;
          setPlaying(true);
          a.onended = () => {
            setPlaying(false);
            URL.revokeObjectURL(url);
            setTimeout(() => startRecording(), 500);
          };
          a.onerror = () => {
            setPlaying(false);
            setTimeout(() => startRecording(), 500);
          };
          a.play().catch(() => {
            setPlaying(false);
            setTimeout(() => startRecording(), 500);
          });
        } else {
          setTimeout(() => startRecording(), 600);
        }
      } catch {
        setMsgs((p) => [
          ...p,
          { role: "bot", text: "Voice message sent to our team. They'll connect via WhatsApp or Telegram.", ts: Date.now() },
        ]);
        setTimeout(() => startRecording(), 600);
      }
      setProcessing(false);
    };
    reader.readAsDataURL(blob);
  };

  const sendMsg = async (text: string) => {
    if (!text.trim()) return;
    setMsgs((p) => [...p, { role: "user", text, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/n8n/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: msgs.slice(-10).map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const botText = data?.message || "Thanks! Our team will reach out shortly.";
      setMsgs((p) => [...p, { role: "bot", text: botText, ts: Date.now() }]);
    } catch {
      setMsgs((p) => [
        ...p,
        { role: "bot", text: "Message sent. Our team will connect via WhatsApp or Telegram.", ts: Date.now() },
      ]);
    }
    setTyping(false);
  };

  const toggleVoice = () => {
    if (mode === "voice") {
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlaying(false);
      setProcessing(false);
      setMode("chat");
    } else {
      setMode("voice");
      setTimeout(() => startRecording(), 300);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg(input);
    }
  };

  return (
    <>
      {/* FAB Button */}
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
          background: open ? "#1a2240" : "linear-gradient(135deg, #3b82f6, #2563eb)",
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

      {/* Online indicator */}
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
              <p className="text-white font-semibold text-sm">HotBot</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-slate-400 text-[11px]">
                  {recording ? "Listening..." : playing ? "Speaking..." : processing ? "Processing..." : "Online"}
                </p>
              </div>
            </div>
            {/* Voice toggle */}
            <button
              onClick={toggleVoice}
              className="p-2 rounded-xl transition-all duration-300 hover:bg-white/10"
              title={mode === "voice" ? "Switch to chat" : "Switch to voice"}
              style={{
                background: mode === "voice" ? "rgba(139,92,246,0.15)" : "transparent",
                border: `1px solid ${mode === "voice" ? "rgba(139,92,246,0.3)" : "transparent"}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mode === "voice" ? "#a78bfa" : "#64748b"} strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>

          {/* Content area */}
          {mode === "voice" ? (
            <VoiceMode
              recording={recording}
              processing={processing}
              playing={playing}
              pulse={pulse}
              onStop={stopRecording}
              msgs={msgs}
            />
          ) : (
            <>
              <ChatMessages msgs={msgs} typing={typing} scrollRef={scrollRef} />
              {msgs.length <= 2 && (
                <QuickReplies onSelect={sendMsg} />
              )}
              {/* Input */}
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
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors resize-none"
                  style={{ minHeight: 44 }}
                />
                <button
                  onClick={() => sendMsg(input)}
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.05)",
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
        </div>
      )}
    </>
  );
}
