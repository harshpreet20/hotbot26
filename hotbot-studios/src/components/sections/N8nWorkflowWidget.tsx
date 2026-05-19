"use client";
import { Reveal } from "@/components/shared/Reveal";

// ── Layout constants ─────────────────────────────────────────────────────────
const W = 148; // node width
const H = 60;  // node height
const CANVAS_W = 1000;
const CANVAS_H = 320;

// ── Node definitions ─────────────────────────────────────────────────────────
const NODES = [
  { id: "trigger",  label: "Lead Webhook",    sub: "Trigger",       icon: "⚡", color: "#ef4444", x: 16,  y: 130 },
  { id: "qualify",  label: "GPT-4o Agent",    sub: "AI Qualify",    icon: "🧠", color: "#8b5cf6", x: 216, y: 130 },
  { id: "switch",   label: "Score Check",     sub: "IF Node",       icon: "⚖️", color: "#f59e0b", x: 420, y: 130 },
  { id: "heka",     label: "Heka Voice AI",   sub: "Place Call",    icon: "📞", color: "#06b6d4", x: 624, y: 44  },
  { id: "hubspot",  label: "HubSpot CRM",     sub: "Update Deal",   icon: "🔗", color: "#f97316", x: 832, y: 44  },
  { id: "email",    label: "Email Sequence",  sub: "Nurture Flow",  icon: "📧", color: "#3b82f6", x: 624, y: 216 },
  { id: "sheets",   label: "Google Sheets",   sub: "Log Lead",      icon: "📊", color: "#22c55e", x: 832, y: 216 },
] as const;

type NodeId = typeof NODES[number]["id"];
const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, typeof NODES[number]>;

const rightPort  = (n: typeof NODES[number]) => ({ x: n.x + W, y: n.y + H / 2 });
const leftPort   = (n: typeof NODES[number]) => ({ x: n.x,     y: n.y + H / 2 });

// ── Connections ───────────────────────────────────────────────────────────────
const CONNECTIONS: { from: NodeId; to: NodeId; label?: string; delay: string }[] = [
  { from: "trigger", to: "qualify", delay: "0s" },
  { from: "qualify", to: "switch",  delay: "0.25s" },
  { from: "switch",  to: "heka",   label: "Score ≥ 80", delay: "0.5s" },
  { from: "switch",  to: "email",  label: "Score < 80", delay: "0.5s" },
  { from: "heka",    to: "hubspot", delay: "0.75s" },
  { from: "email",   to: "sheets", delay: "0.75s" },
];

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const off = Math.max(55, Math.min(90, (x2 - x1) * 0.45));
  return `M ${x1} ${y1} C ${x1 + off} ${y1}, ${x2 - off} ${y2}, ${x2} ${y2}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function N8nWorkflowWidget() {
  return (
    <section className="relative z-10 px-6 max-w-6xl mx-auto py-10">
      {/* keyframe injected once per page */}
      <style>{`
        @keyframes n8nFlow {
          from { stroke-dashoffset: 24; }
          to   { stroke-dashoffset: 0;  }
        }
        .n8n-line { animation: n8nFlow 0.75s linear infinite; }
      `}</style>

      <Reveal>
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Live Workflow
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">
            How Your AI Automation Runs — End to End
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            A real n8n workflow we build for you: lead capture → AI qualification
            → multi-channel follow-up. Deployed in under 2 weeks.
          </p>
        </div>

        {/* Canvas card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#0d1220", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* n8n-style toolbar */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{ background: "#111730", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-slate-500 text-[11px] font-medium">
              n8n — Lead Qualification &amp; Routing Workflow
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                ● Active
              </span>
              <span className="text-[10px] text-slate-500">7 nodes · 6 connections</span>
            </div>
          </div>

          {/* Scrollable canvas */}
          <div className="overflow-x-auto">
            <div
              className="relative"
              style={{ width: CANVAS_W, height: CANVAS_H, minWidth: CANVAS_W }}
            >
              {/* SVG layer: grid + connections */}
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                className="absolute inset-0"
              >
                <defs>
                  <pattern
                    id="n8n-dots"
                    x="0" y="0"
                    width="28" height="28"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="14" cy="14" r="0.9" fill="rgba(255,255,255,0.055)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#n8n-dots)" />

                {/* Connections */}
                {CONNECTIONS.map((conn, i) => {
                  const src = nodeMap[conn.from];
                  const dst = nodeMap[conn.to];
                  const sp = rightPort(src);
                  const ep = leftPort(dst);
                  const d = bezier(sp.x, sp.y, ep.x, ep.y);
                  // midpoint for label
                  const mx = (sp.x + ep.x) / 2;
                  const my = (sp.y + ep.y) / 2;

                  return (
                    <g key={i}>
                      {/* ghost track */}
                      <path
                        d={d}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="2"
                      />
                      {/* animated flow */}
                      <path
                        d={d}
                        fill="none"
                        stroke={src.color}
                        strokeWidth="2"
                        strokeOpacity="0.55"
                        strokeDasharray="8 5"
                        className="n8n-line"
                        style={{ animationDelay: conn.delay }}
                      />
                      {/* destination port dot */}
                      <circle cx={ep.x} cy={ep.y} r="3.5" fill={dst.color} opacity="0.8" />
                      {/* branch label */}
                      {conn.label && (
                        <text
                          x={mx}
                          y={my - 7}
                          textAnchor="middle"
                          fontSize="9"
                          fontFamily="ui-monospace, monospace"
                          fill="rgba(255,255,255,0.35)"
                        >
                          {conn.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Node cards */}
              {NODES.map((node) => (
                <div
                  key={node.id}
                  className="absolute flex items-center gap-2.5 rounded-xl select-none"
                  style={{
                    left: node.x,
                    top: node.y,
                    width: W,
                    height: H,
                    background: "rgba(15,20,38,0.9)",
                    border: `1px solid ${node.color}28`,
                    boxShadow: `0 0 0 1px ${node.color}10, 0 4px 20px rgba(0,0,0,0.3)`,
                    padding: "0 12px",
                  }}
                >
                  {/* icon */}
                  <div
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[15px]"
                    style={{
                      background: `${node.color}18`,
                      border: `1px solid ${node.color}35`,
                    }}
                  >
                    {node.icon}
                  </div>

                  {/* text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] font-semibold leading-tight truncate"
                      style={{ color: "#e2e8f0" }}
                    >
                      {node.label}
                    </p>
                    <p
                      className="text-[10px] leading-tight mt-0.5 font-medium"
                      style={{ color: node.color + "b0" }}
                    >
                      {node.sub}
                    </p>
                  </div>

                  {/* output port */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full border-2"
                    style={{
                      background: "#0d1220",
                      borderColor: node.color,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Execution stats bar */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3"
            style={{ background: "#111730", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {[
              { label: "Last run",         value: "2 min ago",  color: "#94a3b8" },
              { label: "Executions today", value: "147",        color: "#94a3b8" },
              { label: "Success rate",     value: "99.3%",      color: "#22c55e" },
              { label: "Avg. runtime",     value: "1.2s",       color: "#94a3b8" },
              { label: "Leads routed",     value: "2,841",      color: "#94a3b8" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-slate-600 text-[10px]">{s.label}:</span>
                <span className="text-[10px] font-semibold" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
