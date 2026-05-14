import { Reveal } from "@/components/shared/Reveal";

export function PersonalizationWidget() {
  return (
    <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
      <Reveal>
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full mb-3">
            AI Personalization
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">Every Visitor Gets a Different Experience</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Dynamic content that adapts in real time to user behaviour - higher engagement, lower bounce rate, more revenue per visitor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Generic experience */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0d1220", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#111730", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-3 h-5 rounded-full flex items-center px-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-[10px] text-slate-500">store.example.com</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-500 text-xs mb-1">Welcome back, Harsh</p>
              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-3">Featured Products</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl h-16 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-slate-800/80 w-5/6" />
                <div className="h-2 rounded-full bg-slate-800/60 w-2/3" />
              </div>
            </div>
            <div className="px-5 pb-4">
              <span className="text-[11px] text-slate-500 font-medium">Generic - one-size-fits-all</span>
            </div>
          </div>

          {/* Personalized experience */}
          <div
            className="rounded-2xl overflow-hidden animate-personalize-pulse"
            style={{ background: "#0d1220", border: "1px solid rgba(59,130,246,0.35)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: "#111730", borderBottom: "1px solid rgba(59,130,246,0.12)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div
                className="flex-1 mx-3 h-5 rounded-full flex items-center px-3"
                style={{ background: "rgba(59,130,246,0.08)" }}
              >
                <span className="text-[10px] text-blue-400">store.example.com</span>
              </div>
              <span className="text-[9px] text-blue-400 font-semibold bg-blue-400/10 px-2 py-0.5 rounded-full">AI Active</span>
            </div>
            <div className="p-5">
              <p className="text-white text-xs mb-1 font-semibold">
                Welcome back, Harry <span className="text-yellow-400">✨</span>
              </p>
              <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-3">Recommended for You</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { bg: "#3b82f620", border: "#3b82f640", icon: "📊", color: "#3b82f6" },
                  { bg: "#8b5cf620", border: "#8b5cf640", icon: "🎯", color: "#8b5cf6" },
                  { bg: "#06b6d420", border: "#06b6d440", icon: "🚀", color: "#06b6d4" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl h-16 flex flex-col items-center justify-center gap-1.5"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="w-8 h-1 rounded-full" style={{ background: item.color + "80" }} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded-full w-5/6" style={{ background: "rgba(59,130,246,0.2)" }} />
                <div className="h-2 rounded-full w-2/3" style={{ background: "rgba(139,92,246,0.2)" }} />
              </div>
            </div>
            <div className="px-5 pb-4">
              <span className="text-[11px] text-blue-400 font-semibold">AI-Personalized - 2.3× more clicks</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
