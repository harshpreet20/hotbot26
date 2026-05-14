import { Reveal } from "@/components/shared/Reveal";

const ROWS = [
  { feature: "All growth services in one team" },
  { feature: "AI built into every campaign & workflow" },
  { feature: "Real-time performance dashboard" },
  { feature: "Strategy + execution (not just one)" },
  { feature: "Outcome-based reporting (no vanity metrics)" },
  { feature: "24-hr crisis communications response" },
  { feature: "Transparent pricing - no hidden fees" },
  { feature: "Dedicated team, not account managers" },
];

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Cross = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function WhyChooseUsSection() {
  return (
    <section className="relative z-10 py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
            HotBot Studios vs. Typical Agencies
          </h2>
          <p className="text-slate-500 text-center max-w-lg mx-auto mb-12">
            Most agencies give you one piece. We give you the whole engine - and make sure every part drives the others.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: "1fr auto auto",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Feature</div>
              <div className="px-8 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider text-center">Typical Agency</div>
              <div className="px-8 py-4 text-blue-400 text-xs font-semibold uppercase tracking-wider text-center">HotBot Studios</div>
            </div>

            {ROWS.map((row, i) => (
              <div
                key={i}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1fr auto auto",
                  borderBottom: i < ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <div className="px-6 py-4 text-slate-300 text-sm">{row.feature}</div>
                <div className="px-8 py-4 flex justify-center"><Cross /></div>
                <div className="px-8 py-4 flex justify-center"><Check /></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
