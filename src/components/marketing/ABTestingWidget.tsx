import { Reveal } from "@/components/shared/Reveal";

export function ABTestingWidget() {
  return (
    <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
      <Reveal>
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full mb-3">
            A/B Testing
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">Continuous Testing That Compounds Your Results</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Headlines, CTAs, layouts, and offers tested in parallel - data picks winners automatically, results compound over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Variant A - Control */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0d1220", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: "#111730", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] text-slate-400 font-semibold bg-slate-700/60 px-2 py-0.5 rounded-full">
                Variant A - Control
              </span>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <h3 className="text-white text-sm font-bold mb-1">Marketing Agency</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  We help businesses grow with digital marketing.
                </p>
              </div>
              <div
                className="w-full py-2 rounded-lg text-center text-xs font-semibold text-white mb-5"
                style={{ background: "#3b82f6" }}
              >
                Get Started
              </div>
              <div
                className="grid grid-cols-3 gap-3 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="text-center">
                  <div className="text-xl font-black text-slate-300">2.4%</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Conv. Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-slate-300">1,240</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Visitors</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-slate-300">30</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Conversions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Variant B - Winner */}
          <div
            className="rounded-2xl overflow-hidden animate-ab-pulse-green"
            style={{ background: "#0d1220", border: "1px solid rgba(34,197,94,0.35)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: "#111730", borderBottom: "1px solid rgba(34,197,94,0.12)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">
                Variant B - Winner ↑
              </span>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <h3 className="text-white text-sm font-bold mb-1">
                  Top Marketing Agency <span className="text-yellow-300">★</span>
                </h3>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  We help US businesses achieve 3× ROAS with AI-driven campaigns.
                </p>
              </div>
              <div
                className="w-full py-2 rounded-lg text-center text-xs font-semibold text-white mb-5"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                Start Free Audit →
              </div>
              <div
                className="grid grid-cols-3 gap-3 pt-3"
                style={{ borderTop: "1px solid rgba(34,197,94,0.12)" }}
              >
                <div className="text-center">
                  <div className="text-xl font-black text-green-400">3.9%</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    Conv. Rate <span className="text-green-400">↑</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-slate-300">1,240</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Visitors</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-green-400">48</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    Conversions <span className="text-green-400">↑</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lift callout */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 bg-green-400/8 border border-green-400/20 px-5 py-2.5 rounded-2xl">
            <span className="text-green-400 text-lg font-black">+62.5%</span>
            <span className="text-slate-300 text-sm font-medium">lift in conversions</span>
            <span className="text-slate-500 text-xs">from headline + CTA copy change alone</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
