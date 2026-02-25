"use client";

interface Message {
  role: "user" | "bot";
  text: string;
  ts: number;
}

interface VoiceModeProps {
  recording: boolean;
  processing: boolean;
  playing: boolean;
  pulse: number;
  onStop: () => void;
  msgs: Message[];
}

export function VoiceMode({ recording, processing, playing, pulse, onStop, msgs }: VoiceModeProps) {
  const ringColor = recording ? "245,158,11" : playing ? "139,92,246" : "59,130,246";
  const rings = [0, 1, 2, 3, 4];

  const rScale = (i: number) => {
    if (!recording && !playing) return 1;
    const s = Math.sin(((pulse + i * 40) % 360) * (Math.PI / 180));
    return 1 + (recording ? 0.12 : 0.2) * Math.abs(s) * (1 - i * 0.15);
  };

  const rOpacity = (i: number) => {
    if (!recording && !playing) return 0.04;
    const s = Math.sin(((pulse + i * 40) % 360) * (Math.PI / 180));
    return (recording ? 0.1 : 0.15) * Math.abs(s) * (1 - i * 0.15);
  };

  const lastBotMsg = msgs.filter((m) => m.role === "bot").slice(-1)[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-6">
      {/* Pulsing rings */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {rings.map((i) => (
          <div
            key={i}
            className="absolute rounded-full transition-none"
            style={{
              width: 144 + i * 28,
              height: 144 + i * 28,
              border: `1px solid rgba(${ringColor},${rOpacity(i)})`,
              transform: `scale(${rScale(i)})`,
              transition: "transform 0.05s linear",
            }}
          />
        ))}
        {/* Central orb */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, rgba(${ringColor},0.25) 0%, rgba(${ringColor},0.05) 100%)`,
            border: `2px solid rgba(${ringColor},0.4)`,
            boxShadow: `0 0 30px rgba(${ringColor},0.2)`,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`rgb(${ringColor})`} strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-white font-semibold text-base">
          {processing ? "Processing..." : playing ? "HotBot is speaking..." : recording ? "Listening..." : "Ready to listen"}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          {recording ? "Tap stop when done" : playing ? "Playing response..." : "Tap mic to speak"}
        </p>
      </div>

      {/* Last bot message */}
      {lastBotMsg && (
        <div className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <p className="text-slate-300 text-sm leading-relaxed text-center">{lastBotMsg.text}</p>
        </div>
      )}

      {/* Stop button */}
      {recording && (
        <button
          onClick={onStop}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
        >
          Stop Recording
        </button>
      )}
    </div>
  );
}
