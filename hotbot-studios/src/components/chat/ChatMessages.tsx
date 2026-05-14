"use client";

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

export function ChatMessages({ msgs, typing, scrollRef }: ChatMessagesProps) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
      {msgs.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
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
              background:
                m.role === "user"
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "rgba(255,255,255,0.06)",
              color: "white",
              borderBottomRightRadius: m.role === "user" ? 6 : 16,
              borderBottomLeftRadius: m.role === "bot" ? 6 : 16,
            }}
          >
            {m.text}
          </div>
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
