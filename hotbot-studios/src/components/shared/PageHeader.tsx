import { Reveal } from "./Reveal";

interface PageHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  gradient?: string;
}

export function PageHeader({ label, title, subtitle, gradient }: PageHeaderProps) {
  return (
    <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      <Reveal>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-5 sm:mb-6"
          style={{
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "#93c5fd",
          }}
        >
          {label}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5 sm:mb-6">
          {gradient ? (
            <>
              <span className="text-white">{title.split(gradient)[0]}</span>
              <span
                className="inline-block"
                style={{
                  background: `linear-gradient(135deg, ${gradient}, #8b5cf6)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {gradient}
              </span>
              <span className="text-white">{title.split(gradient)[1]}</span>
            </>
          ) : (
            <span>{title}</span>
          )}
        </h1>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </Reveal>
      )}
    </section>
  );
}
