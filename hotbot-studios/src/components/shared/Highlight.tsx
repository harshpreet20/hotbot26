import { Reveal } from "./Reveal";

interface HighlightProps {
  icon?: string;
  title: string;
  text: string;
  color?: string;
}

export function Highlight({
  icon = "💡",
  title,
  text,
  color = "#3b82f6",
}: HighlightProps) {
  return (
    <Reveal>
      <div
        className="my-8 p-6 rounded-2xl border"
        style={{
          background: `${color}08`,
          borderColor: `${color}22`,
        }}
      >
        <div className="flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div>
            <div
              className="font-bold text-base mb-1"
              style={{ color }}
            >
              {title}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
