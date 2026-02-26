import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { Reveal } from "@/components/shared/Reveal";

interface StatsSectionProps {
  stats?: Array<{ value: number; suffix: string; label: string }>;
}

const DEFAULT_STATS = [
  { value: 200, suffix: "%", label: "Avg Conversion Increase" },
  { value: 150, suffix: "+", label: "Projects Delivered" },
  { value: 99, suffix: "%", label: "Client Satisfaction" },
  { value: 42, suffix: "+", label: "Enterprise Clients" },
];

export function StatsSection({ stats = DEFAULT_STATS }: StatsSectionProps) {
  return (
    <section className="relative z-10 py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-slate-300/70 text-sm">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
