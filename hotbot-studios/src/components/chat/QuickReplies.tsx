"use client";

const QUICK_REPLIES = [
  "What services do you offer?",
  "Tell me about AI Automation",
  "How much do your services cost?",
  "I want to get started",
];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

export function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
      {QUICK_REPLIES.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-200"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
