import { Reveal } from "@/components/shared/Reveal";

const CURSORS = [
  { name: "Zaveri", color: "#06b6d4", top: "22%", left: "34%", cls: "animate-cursor-1" },
  { name: "Cohen",  color: "#8b5cf6", top: "46%", left: "54%", cls: "animate-cursor-2" },
  { name: "Singh",  color: "#22c55e", top: "32%", left: "63%", cls: "animate-cursor-3" },
  { name: "Johnson",color: "#f59e0b", top: "60%", left: "39%", cls: "animate-cursor-4" },
  { name: "Evans",  color: "#ec4899", top: "38%", left: "71%", cls: "animate-cursor-5" },
];

export function CollaborationWidget() {
  return (
    <section className="relative z-10 px-6 max-w-6xl mx-auto py-8">
      <Reveal>
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1 rounded-full mb-3">
            Real-Time Collaboration
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">Your Whole Team, Always in Sync</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Stakeholders review, comment, and approve campaigns in real time — no email chains, no version confusion.
          </p>
        </div>

        {/* Browser window */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ background: "#0d1220", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Toolbar */}
          <div
            className="flex items-center gap-2.5 px-5 py-3.5"
            style={{ background: "#111730", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <div
              className="flex-1 mx-4 h-6 rounded-full flex items-center px-3"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-[11px] text-slate-500">
                app.hotbotstudios.com/campaigns/q1-launch
              </span>
            </div>
            <div className="flex -space-x-1.5">
              {(["#06b6d4","#8b5cf6","#22c55e","#f59e0b","#ec4899"] as const).map((c, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ background: c, borderColor: "#111730" }}
                >
                  {["Z","C","S","J","E"][i]}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 ml-1">5 online</span>
          </div>

          {/* Three-panel content */}
          <div className="grid grid-cols-12 min-h-[290px]">
            {/* Left panel: page preview + comment */}
            <div className="col-span-4 p-5" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-3 font-medium">Page Preview</p>
              <div className="space-y-2 mb-4">
                <div className="h-4 rounded-full bg-slate-800/80 w-full" />
                <div className="h-3 rounded-full bg-slate-800/60 w-4/5" />
                <div className="h-3 rounded-full bg-slate-800/40 w-3/5" />
                <div
                  className="h-8 rounded-lg w-full mt-2"
                  style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}
                />
              </div>
              {/* Comment */}
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: "#06b6d4" }}
                  >
                    J
                  </div>
                  <div>
                    <p className="text-[10px] text-cyan-400 font-semibold mb-0.5">Jas</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Should we add a dark theme? Our users prefer it.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 pl-8">
                  <span className="text-[9px] text-slate-600 cursor-default">Reply</span>
                  <span className="text-[9px] text-slate-600 cursor-default">Resolve</span>
                </div>
              </div>
            </div>

            {/* Center panel: cursor zone */}
            <div
              className="col-span-4 relative"
              style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center opacity-20 select-none">
                  <div className="text-5xl mb-1">⚡</div>
                  <p className="text-slate-600 text-[10px]">Live editing</p>
                </div>
              </div>
            </div>

            {/* Right panel: two mini browsers */}
            <div className="col-span-4 p-4 flex flex-col gap-3">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Design Variants</p>

              {/* Mini browser 1: grid */}
              <div className="rounded-xl overflow-hidden" style={{ background: "#111730", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div
                  className="flex items-center gap-1 px-2.5 py-2"
                  style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  <span className="text-[9px] text-slate-600 ml-1">Grid layout</span>
                </div>
                <div className="p-2.5 grid grid-cols-3 gap-1.5">
                  {[0,1,2,3,4,5].map((i) => (
                    <div
                      key={i}
                      className="h-7 rounded-lg"
                      style={{
                        background: `rgba(${i % 3 === 0 ? "59,130,246" : i % 3 === 1 ? "139,92,246" : "6,182,212"},0.12)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Mini browser 2: 404 */}
              <div className="rounded-xl overflow-hidden" style={{ background: "#111730", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div
                  className="flex items-center gap-1 px-2.5 py-2"
                  style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  <span className="text-[9px] text-slate-600 ml-1">404 — missing route</span>
                </div>
                <div className="p-3 text-center">
                  <div className="text-2xl font-black text-red-400/70 leading-none">404</div>
                  <div className="text-slate-600 text-[9px] mt-0.5">Route not found</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cursors */}
          {CURSORS.map((cursor) => (
            <div
              key={cursor.name}
              className={`absolute pointer-events-none ${cursor.cls}`}
              style={{ top: cursor.top, left: cursor.left, zIndex: 10 }}
            >
              <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
                <path d="M0 0L0 14L4.5 9.5L7 16L9.5 15L7 8.5L12.5 8.5Z" fill={cursor.color} />
              </svg>
              <span
                className="inline-block text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                style={{ background: cursor.color }}
              >
                {cursor.name}
              </span>
            </div>
          ))}

          {/* Floating chat bubbles */}
          <div
            className="absolute pointer-events-none animate-chat-bubble-1"
            style={{ top: "52%", left: "33%", zIndex: 11 }}
          >
            <div
              className="text-[11px] text-white px-3 py-1.5 rounded-xl shadow-lg"
              style={{ background: "#1e2d45", border: "1px solid rgba(6,182,212,0.25)" }}
            >
              We will give it a shot! 👍
            </div>
          </div>
          <div
            className="absolute pointer-events-none animate-chat-bubble-2"
            style={{ top: "40%", left: "44%", zIndex: 11 }}
          >
            <div
              className="text-[11px] text-white px-3 py-1.5 rounded-xl shadow-lg"
              style={{ background: "#1e2d45", border: "1px solid rgba(139,92,246,0.25)" }}
            >
              Though, the Gen-Z love it Dark 😅
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
