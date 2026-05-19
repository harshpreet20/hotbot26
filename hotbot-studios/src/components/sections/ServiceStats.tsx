import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { Reveal } from "@/components/shared/Reveal";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  color?: string;
}

interface ServiceStatsProps {
  stats: StatItem[];
  title?: string;
}

export function ServiceStats({ stats, title }: ServiceStatsProps) {
  return (
    <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
      {title && (
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{title}</h2>
        </Reveal>
      )}
      <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-6`}>
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div
              className="text-center p-6 rounded-2xl border"
              style={{
                background: `${s.color || "#3b82f6"}08`,
                borderColor: `${s.color || "#3b82f6"}15`,
              }}
            >
              <div
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: s.color || "#3b82f6" }}
              >
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
