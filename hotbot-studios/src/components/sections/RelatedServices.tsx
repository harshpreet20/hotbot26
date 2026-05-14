import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { ArrowRight } from "lucide-react";

interface RelatedService {
  title: string;
  href: string;
  desc: string;
  icon?: string;
}

interface RelatedServicesProps {
  services: RelatedService[];
  title?: string;
}

export function RelatedServices({ services, title = "Explore Related Services" }: RelatedServicesProps) {
  return (
    <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
      <Reveal>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{title}</h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Link href={s.href}>
              <div
                className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group"
              >
                {s.icon && <div className="text-2xl mb-3">{s.icon}</div>}
                <h3 className="font-semibold text-white text-base mb-2 group-hover:text-blue-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold">
                  Learn more <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
