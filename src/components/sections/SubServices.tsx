import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

interface SubService {
  icon: string;
  title: string;
  desc: string;
}

interface SubServicesProps {
  services: SubService[];
  title?: string;
  columns?: 2 | 3 | 4;
}

export function SubServices({ services, title, columns = 3 }: SubServicesProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <section className="relative z-10 py-12 px-6 max-w-6xl mx-auto">
      {title && (
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{title}</h2>
        </Reveal>
      )}
      <div className={`grid grid-cols-1 ${gridCols} gap-5`}>
        {services.map((s, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6" hover>
              <div className="text-2xl mb-3">{s.icon}</div>
              <h3 className="font-semibold text-white text-base mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
