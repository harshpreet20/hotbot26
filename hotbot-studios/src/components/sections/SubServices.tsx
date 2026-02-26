import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

interface SubService {
  icon: string;
  title: string;
  desc: string;
  href?: string;
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
            {s.href ? (
              <Link href={s.href} className="block h-full">
                <GlassCard className="p-6 h-full" hover>
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <h3 className="font-semibold text-white text-base mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-blue-400 text-xs font-semibold">
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            ) : (
              <GlassCard className="p-6" hover>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-white text-base mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </GlassCard>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
