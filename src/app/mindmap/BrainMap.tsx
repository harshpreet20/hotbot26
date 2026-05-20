"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "motion/react";

// ── Category config ──────────────────────────────────────────────────────────

type Cat = "core"|"ai"|"crm"|"email"|"ops"|"analytics"|"content"|"mcp"|"infra"|"security";

const COLORS: Record<Cat, string> = {
  core:      "#e0e7ff",
  ai:        "#a855f7",
  crm:       "#3b82f6",
  email:     "#06b6d4",
  ops:       "#f59e0b",
  analytics: "#22c55e",
  content:   "#ec4899",
  mcp:       "#fbbf24",
  infra:     "#f97316",
  security:  "#ef4444",
};

const CAT_NAMES: Record<Cat, string> = {
  core:      "Platform Core",
  ai:        "AI Products",
  crm:       "CRM & Sales",
  email:     "Email System",
  ops:       "Operations",
  analytics: "Analytics",
  content:   "Content",
  mcp:       "MCP Servers",
  infra:     "Infrastructure",
  security:  "Security",
};

// ── Node data ────────────────────────────────────────────────────────────────

interface NodeDef {
  id: string; label: string; cat: Cat; r: number; desc: string;
  x: number; y: number; z: number;
}

const CLUSTERS: Record<Cat, [number, number, number]> = {
  core:      [   0,   20,    0],
  ai:        [ 130,  -50,   30],
  crm:       [-130,  -50,   30],
  email:     [ 155,   50,  -10],
  ops:       [   0, -155,   50],
  analytics: [ -75,   90,   20],
  content:   [-155,   50,  -10],
  mcp:       [  75,   90,   20],
  infra:     [   0,  140,  -60],
  security:  [  10,  105, -125],
};

function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 0x6c62272e) ^ Math.imul(s ^ (s << 7), 0x4c957f2d)) >>> 0;
    return s / 0xffffffff;
  };
}

function buildNodes(): NodeDef[] {
  const rng = mkRng(42);
  const sp = 52;
  const raw: Omit<NodeDef, "x"|"y"|"z">[] = [
    { id:"core",          label:"HotBot Studios",       cat:"core",      r:18, desc:"AI-Native Digital Agency Platform" },
    { id:"heka",          label:"Heka Voice AI",         cat:"ai",        r:9,  desc:"24/7 AI Voice Receptionist · Sarvam AI" },
    { id:"seo-ai",        label:"SEO Intelligence",      cat:"ai",        r:8,  desc:"50+ checks · AEO + GEO + Readability" },
    { id:"ai-analyst",    label:"AI Analyst",            cat:"ai",        r:8,  desc:"Automated CRM insights via GPT-4o" },
    { id:"gpt",           label:"GPT Integration",       cat:"ai",        r:7,  desc:"OpenAI GPT-4o · Claude powered" },
    { id:"content-intel", label:"Content Intelligence",  cat:"ai",        r:7,  desc:"Composite intelligence engine" },
    { id:"ai-detect",     label:"AI Detection",          cat:"ai",        r:6,  desc:"Heuristic AI content scoring" },
    { id:"leads",         label:"Lead Pipeline",         cat:"crm",       r:9,  desc:"7-stage: New → Qualified → Won" },
    { id:"clients",       label:"Client CRM",            cat:"crm",       r:8,  desc:"Full lifecycle management" },
    { id:"contacts",      label:"Contacts",              cat:"crm",       r:7,  desc:"Raw inbound message store" },
    { id:"callbacks",     label:"Callbacks",             cat:"crm",       r:6,  desc:"Voice callback trigger · Sarvam AI" },
    { id:"chats",         label:"Live Chat",             cat:"crm",       r:6,  desc:"RAG-powered real-time chat" },
    { id:"email-engine",  label:"Email Engine",          cat:"email",     r:8,  desc:"15 transactional templates" },
    { id:"pixel",         label:"Pixel Tracking",        cat:"email",     r:7,  desc:"1×1 GIF open tracking (in-house)" },
    { id:"click",         label:"Click Tracking",        cat:"email",     r:6,  desc:"Link wrap + redirect counter" },
    { id:"email-logs",    label:"Email History",         cat:"email",     r:7,  desc:"Per-entity open/click/bounce logs" },
    { id:"newsletter",    label:"Newsletter",            cat:"email",     r:7,  desc:"Broadcast + subscriber management" },
    { id:"invoices",      label:"Invoicing",             cat:"ops",       r:8,  desc:"PDF generation + email + tracking" },
    { id:"tickets",       label:"Ticketing",             cat:"ops",       r:8,  desc:"Support queue with SLA workflow" },
    { id:"tasks",         label:"Task Manager",          cat:"ops",       r:7,  desc:"Browser push notifications" },
    { id:"team-chat",     label:"Team Chat",             cat:"ops",       r:6,  desc:"Internal communication system" },
    { id:"analytics",     label:"Analytics",             cat:"analytics", r:8,  desc:"Sessions · pageviews · UTM attribution" },
    { id:"journey",       label:"Journey Events",        cat:"analytics", r:6,  desc:"Lead → Client → Invoice milestones" },
    { id:"activity",      label:"Audit Log",             cat:"analytics", r:6,  desc:"Complete team action trail" },
    { id:"blog",          label:"Blog CMS",              cat:"content",   r:7,  desc:"TipTap editor + real-time SEO panel" },
    { id:"knowledge",     label:"Knowledge Base",        cat:"content",   r:6,  desc:"Internal articles + resources" },
    { id:"mcp-supabase",  label:"Supabase MCP",          cat:"mcp",       r:9,  desc:"Live SQL migrations via AI session" },
    { id:"mcp-github",    label:"GitHub MCP",            cat:"mcp",       r:8,  desc:"Branch · PR · code review via AI" },
    { id:"mcp-vercel",    label:"Vercel MCP",            cat:"mcp",       r:8,  desc:"Deployments + build log diagnosis" },
    { id:"mcp-n8n",       label:"N8N MCP",               cat:"mcp",       r:7,  desc:"Workflow nodes wired via AI session" },
    { id:"supabase",      label:"Supabase DB",           cat:"infra",     r:8,  desc:"PostgreSQL + RLS + Realtime" },
    { id:"vercel",        label:"Vercel Edge",           cat:"infra",     r:7,  desc:"Serverless + edge deployment" },
    { id:"n8n",           label:"N8N Workflows",         cat:"infra",     r:8,  desc:"Orchestration + RAG pipelines" },
    { id:"openai",        label:"OpenAI",                cat:"infra",     r:7,  desc:"GPT-4o + embeddings" },
    { id:"sarvam",        label:"Sarvam AI",             cat:"infra",     r:6,  desc:"Indian-language voice model" },
    { id:"resend",        label:"Resend",                cat:"infra",     r:6,  desc:"Email delivery + delivery webhooks" },
    { id:"rbac",          label:"9-Role RBAC",           cat:"security",  r:8,  desc:"super_admin → agent hierarchy" },
    { id:"sessions",      label:"Session Auth",          cat:"security",  r:6,  desc:"30-day sliding window tokens" },
    { id:"rls",           label:"Row-Level Security",    cat:"security",  r:6,  desc:"Supabase RLS + service role bypass" },
  ];
  return raw.map(n => {
    if (n.cat === "core") return { ...n, x: 0, y: 20, z: 0 };
    const [cx, cy, cz] = CLUSTERS[n.cat];
    return { ...n, x: cx + (rng() - 0.5) * sp * 2, y: cy + (rng() - 0.5) * sp * 2, z: cz + (rng() - 0.5) * sp * 2 };
  });
}

const NODES = buildNodes();
const NODE_MAP = new Map(NODES.map(n => [n.id, n]));

const EDGES: [string, string][] = [
  ["core","heka"],["core","leads"],["core","analytics"],["core","email-engine"],
  ["core","mcp-supabase"],["core","rbac"],["core","blog"],["core","invoices"],
  ["core","n8n"],["core","supabase"],["core","mcp-github"],
  ["heka","sarvam"],["heka","callbacks"],["heka","n8n"],
  ["seo-ai","content-intel"],["seo-ai","blog"],["seo-ai","analytics"],
  ["ai-analyst","analytics"],["ai-analyst","leads"],["ai-analyst","gpt"],
  ["gpt","openai"],["content-intel","ai-detect"],["content-intel","blog"],
  ["leads","clients"],["leads","contacts"],["leads","callbacks"],
  ["leads","chats"],["leads","email-engine"],["leads","journey"],
  ["clients","invoices"],["clients","email-engine"],["clients","journey"],
  ["callbacks","sarvam"],["callbacks","n8n"],["chats","n8n"],
  ["email-engine","pixel"],["email-engine","click"],["email-engine","email-logs"],
  ["email-engine","newsletter"],["email-engine","resend"],
  ["pixel","email-logs"],["click","email-logs"],
  ["invoices","email-engine"],["invoices","clients"],
  ["tickets","email-engine"],["tickets","tasks"],["tasks","team-chat"],
  ["analytics","journey"],["analytics","activity"],
  ["blog","newsletter"],["blog","knowledge"],
  ["mcp-supabase","supabase"],["mcp-github","vercel"],
  ["mcp-vercel","vercel"],["mcp-n8n","n8n"],
  ["mcp-supabase","rls"],["mcp-supabase","email-logs"],
  ["supabase","rls"],["supabase","sessions"],
  ["n8n","openai"],["n8n","sarvam"],["vercel","supabase"],
  ["rbac","sessions"],["rbac","rls"],
];

// ── 3-D math ─────────────────────────────────────────────────────────────────

function ry(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

function rx(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a), s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Particle { edge: number; t: number; speed: number; color: string; rgb: string; }
interface PulseWave { nodeId: string; startTick: number; color: string; }
interface TooltipState { node: NodeDef; x: number; y: number; }

const CONNECTIONS = new Map<string, string[]>();
for (const [a, b] of EDGES) {
  if (!CONNECTIONS.has(a)) CONNECTIONS.set(a, []);
  if (!CONNECTIONS.has(b)) CONNECTIONS.set(b, []);
  CONNECTIONS.get(a)!.push(b);
  CONNECTIONS.get(b)!.push(a);
}

const JOURNEY_CHAPTERS = [
  { title:"The First Spark",      subtitle:"N8N changed everything",                          accent:"#f59e0b", nodes:["n8n","mcp-n8n","core"] },
  { title:"MCP Revolution",       subtitle:"One AI session. Any database. Any deployment.",   accent:"#fbbf24", nodes:["mcp-supabase","mcp-github","mcp-vercel","mcp-n8n","core","supabase","vercel","n8n"] },
  { title:"The Infrastructure",   subtitle:"Supabase, Vercel, Resend — the backbone",         accent:"#f97316", nodes:["supabase","vercel","resend","rls","sessions","core"] },
  { title:"Voice + Intelligence", subtitle:"Sarvam for voice. OpenAI for intelligence.",       accent:"#a855f7", nodes:["sarvam","openai","heka","gpt","callbacks","chats","core"] },
  { title:"The Full Backdrop",    subtitle:"100+ pages. 55+ routes. Built solo.",              accent:"#e0e7ff", nodes:[] },
];

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
  @keyframes floatY        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes characterBreathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.985) translateY(2px)} }
  @keyframes speechPop     { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
  @keyframes dotPulse      { 0%,80%,100%{transform:scale(0.7);opacity:0.5} 40%{transform:scale(1);opacity:1} }
  @keyframes micPulse      { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0)} }
  @keyframes pulseDot      { 0%,100%{opacity:1;box-shadow:0 0 12px #818cf8} 50%{opacity:0.5;box-shadow:0 0 4px #818cf8} }
  @keyframes slideUp       { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes statFlyIn     { from{opacity:0;transform:translate(var(--tx,0),var(--ty,0)) scale(0.5)} to{opacity:1;transform:translate(0,0) scale(1)} }
  @keyframes drawLine      { from{stroke-dashoffset:1200} to{stroke-dashoffset:0} }
  @keyframes orbPulse      { 0%,100%{box-shadow:0 0 30px #a855f766,0 0 0 0 #a855f733} 50%{box-shadow:0 0 80px #a855f7,0 0 0 20px transparent} }
  @keyframes flashWhite    { 0%,100%{opacity:0} 40%{opacity:1} }
  @keyframes scrollBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
  @keyframes borderPulse   { 0%,100%{border-color:rgba(99,102,241,0.3)} 50%{border-color:rgba(99,102,241,0.8)} }
  @keyframes glowText      { 0%,100%{text-shadow:0 0 20px rgba(255,255,255,0.3)} 50%{text-shadow:0 0 60px rgba(255,255,255,0.9),0 0 120px rgba(255,255,255,0.5)} }
`;

// ── Character SVG ─────────────────────────────────────────────────────────────

function HarshCharacter({ pose, scale = 1 }: { pose:"normal"|"thinking"|"excited"|"pointing"; scale?: number }) {
  return (
    <svg viewBox="0 0 160 250" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 160 * scale, height: 250 * scale, animation:"characterBreathe 3s ease-in-out infinite" }}>
      <rect x="42" y="148" width="76" height="80" rx="8" fill="#374151" />
      <polygon points="80,155 60,148 55,200 72,200" fill="#1f2937" />
      <polygon points="80,155 100,148 105,200 88,200" fill="#1f2937" />
      <rect x="74" y="148" width="12" height="52" fill="#f1f5f9" />
      <polygon points="80,152 76,160 78,195 80,200 82,195 84,160" fill="#0d9488" />
      {pose === "normal" && (<>
        <rect x="24" y="150" width="18" height="55" rx="9" fill="#374151" />
        <ellipse cx="33" cy="208" rx="9" ry="8" fill="#c4855a" />
        <rect x="118" y="150" width="18" height="55" rx="9" fill="#374151" />
        <ellipse cx="127" cy="208" rx="9" ry="8" fill="#c4855a" />
      </>)}
      {pose === "thinking" && (<>
        <rect x="24" y="150" width="18" height="55" rx="9" fill="#374151" />
        <ellipse cx="33" cy="208" rx="9" ry="8" fill="#c4855a" />
        <path d="M118,152 C130,152 138,145 135,128 C132,118 125,118 122,122" stroke="#374151" strokeWidth="18" fill="none" strokeLinecap="round" />
        <ellipse cx="121" cy="122" rx="9" ry="8" fill="#c4855a" />
      </>)}
      {pose === "excited" && (<>
        <path d="M42,155 C30,145 22,130 26,112 C28,105 35,104 40,108" stroke="#374151" strokeWidth="18" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="108" rx="9" ry="8" fill="#c4855a" />
        <path d="M118,155 C130,145 138,130 134,112 C132,105 125,104 120,108" stroke="#374151" strokeWidth="18" fill="none" strokeLinecap="round" />
        <ellipse cx="120" cy="108" rx="9" ry="8" fill="#c4855a" />
      </>)}
      {pose === "pointing" && (<>
        <rect x="24" y="150" width="18" height="55" rx="9" fill="#374151" />
        <ellipse cx="33" cy="208" rx="9" ry="8" fill="#c4855a" />
        <path d="M118,155 C126,150 136,148 148,148" stroke="#374151" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx="150" cy="148" rx="8" ry="7" fill="#c4855a" />
        <rect x="154" y="145" width="14" height="6" rx="3" fill="#c4855a" />
      </>)}
      <rect x="71" y="130" width="18" height="22" rx="6" fill="#c4855a" />
      <ellipse cx="80" cy="118" rx="32" ry="34" fill="#c4855a" />
      <path d="M54,126 C52,138 56,148 68,152 C74,154 86,154 92,152 C104,148 108,138 106,126 C100,130 92,133 80,133 C68,133 60,130 54,126Z" fill="#2d1a0e" opacity="0.85" />
      <ellipse cx="68" cy="113" rx="7" ry="7.5" fill="white" />
      <ellipse cx="69" cy="113" rx="4" ry="4.5" fill="#1a0a00" />
      <ellipse cx="70" cy="111" rx="1.5" ry="1.5" fill="white" />
      <ellipse cx="92" cy="113" rx="7" ry="7.5" fill="white" />
      <ellipse cx="93" cy="113" rx="4" ry="4.5" fill="#1a0a00" />
      <ellipse cx="94" cy="111" rx="1.5" ry="1.5" fill="white" />
      <path d="M62,106 C65,103 73,103 76,105" stroke="#2d1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M84,105 C87,103 95,103 98,106" stroke="#2d1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {pose === "excited"
        ? <path d="M70,128 C73,134 87,134 90,128" stroke="#2d1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        : <path d="M71,128 C74,131 86,131 89,128" stroke="#2d1a0e" strokeWidth="2" fill="none" strokeLinecap="round" />}
      <ellipse cx="80" cy="90" rx="38" ry="32" fill="#6b1a1a" />
      <ellipse cx="80" cy="76" rx="30" ry="24" fill="#7a1e1e" />
      <ellipse cx="80" cy="65" rx="22" ry="16" fill="#8b2222" />
      <path d="M44,98 C52,92 68,88 80,88 C92,88 108,92 116,98" stroke="#5a1515" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M46,91 C54,85 68,82 80,82 C92,82 106,85 114,91" stroke="#5a1515" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M50,84 C58,79 69,77 80,77 C91,77 102,79 110,84" stroke="#5a1515" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="80" cy="98" rx="11" ry="8" fill="#7a1e1e" />
      <ellipse cx="80" cy="98" rx="7" ry="5" fill="#8b2222" />
      <ellipse cx="80" cy="98" rx="4" ry="3" fill="#9b2626" />
      <path d="M62,72 C68,67 75,65 80,65" stroke="rgba(255,180,180,0.2)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M64,148 L72,148 L75,155 L80,152 L85,155 L88,148 L96,148 L90,143 L80,140 L70,143 Z" fill="#f1f5f9" />
    </svg>
  );
}

function PhoneMockup() {
  return (
    <svg viewBox="0 0 140 240" width="140" height="240" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="5" width="120" height="230" rx="18" fill="#1e1b2e" stroke="#4c1d95" strokeWidth="2" />
      <rect x="16" y="20" width="108" height="200" rx="10" fill="#0d0b1a" />
      <rect x="50" y="12" width="40" height="8" rx="4" fill="#4c1d95" />
      <rect x="22" y="55" width="96" height="70" rx="8" fill="#2d1b69" stroke="#7c3aed" strokeWidth="1" />
      <rect x="28" y="62" width="40" height="12" rx="3" fill="#7c3aed" />
      <text x="48" y="72" textAnchor="middle" fill="white" fontSize="6" fontWeight="700">SABUDH</text>
      <text x="30" y="84" fill="#c4b5fd" fontSize="7" fontWeight="600">Free AI Workshop:</text>
      <text x="30" y="95" fill="#c4b5fd" fontSize="7">Basics to Automation</text>
      <text x="30" y="108" fill="#7c3aed" fontSize="6">Tap to register →</text>
      <rect x="22" y="140" width="50" height="8" rx="4" fill="#1e1b2e" />
      <rect x="22" y="155" width="80" height="8" rx="4" fill="#1e1b2e" />
      <rect x="22" y="170" width="60" height="8" rx="4" fill="#1e1b2e" />
    </svg>
  );
}

function SoundWaveSVG() {
  return (
    <svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
      {[4,8,16,24,32,20,28,14,22,10,18,6].map((h,i) => (
        <rect key={i} x={5+i*9} y={(40-h)/2} width="5" height={h} rx="2.5" fill="#a855f7" opacity={0.5+(h/64)} />
      ))}
    </svg>
  );
}

// ── Cinematic text: words slide up from clip ──────────────────────────────────

function CinematicWords({ text, inView, delay = 0, style }: {
  text: string; inView: boolean; delay?: number; style?: React.CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span style={{ display:"flex", flexWrap:"wrap", gap:"0 0.3em", ...style }}>
      {words.map((word, wi) => (
        <span key={wi} style={{ overflow:"hidden", display:"inline-block" }}>
          <motion.span
            style={{ display:"inline-block" }}
            initial={{ y:"110%" }}
            animate={inView ? { y:"0%" } : { y:"110%" }}
            transition={{ duration:0.65, delay: delay + wi * 0.07, ease:[0.22,1,0.36,1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ── Section 1: The Notification ───────────────────────────────────────────────

function Section1({ onEnterMap }: { onEnterMap: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, amount:0.45 });
  const ACCENT = "#7c3aed";

  return (
    <div ref={ref} style={{
      height:"100vh", scrollSnapAlign:"start", flexShrink:0,
      position:"relative", overflow:"hidden",
      background:"linear-gradient(135deg,#0f0a1e 0%,#1a0a3e 60%,#0d0620 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      {/* Ambient glow */}
      <div style={{ position:"absolute", top:"20%", left:"40%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* Location badge */}
      <motion.div
        initial={{ opacity:0, y:-24 }}
        animate={inView ? { opacity:1, y:0 } : { opacity:0, y:-24 }}
        transition={{ duration:0.6, delay:0.15 }}
        style={{ position:"absolute", top:24, left:"50%", transform:"translateX(-50%)", background:`${ACCENT}18`, border:`1px solid ${ACCENT}55`, borderRadius:20, padding:"6px 18px", color:ACCENT, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}
      >
        📍 Late Night — Chandigarh, 2024
      </motion.div>

      {/* Skip button */}
      <button onClick={onEnterMap} style={{ position:"absolute", top:20, right:24, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 16px", color:"#475569", fontSize:11, fontWeight:600, cursor:"pointer" }}>
        Skip →
      </button>

      {/* Main content */}
      <div style={{ display:"flex", alignItems:"center", gap:60, padding:"0 8%", width:"100%", justifyContent:"center" }}>
        {/* Character + speech */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <motion.div
            initial={{ opacity:0, x:-60 }}
            animate={inView ? { opacity:1, x:0 } : { opacity:0, x:-60 }}
            transition={{ duration:0.7, delay:0.3, type:"spring", stiffness:120, damping:18 }}
          >
            <motion.div
              initial={{ opacity:0, scale:0.8 }}
              animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale:0.8 }}
              transition={{ duration:0.5, delay:0.6 }}
              style={{ background:`${ACCENT}15`, border:`1px solid ${ACCENT}44`, borderRadius:16, padding:"14px 20px", maxWidth:260, color:"#e2e8f0", fontSize:14, lineHeight:1.6, marginBottom:10, position:"relative" }}
            >
              <span style={{ color:"#c4b5fd" }}>AI classes? This could be a </span>
              <em style={{ color:ACCENT, fontStyle:"normal", fontWeight:700 }}>marketing goldmine</em>
              <span style={{ color:"#c4b5fd" }}> for HotBot Studios...</span>
              <div style={{ position:"absolute", bottom:-8, left:30, width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:`8px solid ${ACCENT}44` }} />
            </motion.div>
            <HarshCharacter pose="normal" scale={1.1} />
          </motion.div>
        </div>

        {/* Phone */}
        <motion.div
          initial={{ opacity:0, x:80, y:20 }}
          animate={inView ? { opacity:1, x:0, y:0 } : { opacity:0, x:80, y:20 }}
          transition={{ duration:0.8, delay:0.45, type:"spring", stiffness:100, damping:16 }}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}
        >
          <div style={{ animation:"floatY 4s ease-in-out infinite", filter:`drop-shadow(0 0 30px ${ACCENT}55)` }}>
            <PhoneMockup />
          </div>
          <motion.div
            initial={{ opacity:0 }}
            animate={inView ? { opacity:1 } : { opacity:0 }}
            transition={{ delay:0.9 }}
            style={{ background:`${ACCENT}18`, border:`1px solid ${ACCENT}44`, borderRadius:8, padding:"7px 14px", color:"#c4b5fd", fontSize:11, fontWeight:600 }}
          >
            🔔 Sabudh Foundation · Free AI Workshop
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom caption */}
      <motion.div
        initial={{ opacity:0 }}
        animate={inView ? { opacity:1 } : { opacity:0 }}
        transition={{ duration:0.8, delay:1.1 }}
        style={{ position:"absolute", bottom:60, left:"50%", transform:"translateX(-50%)", textAlign:"center" }}
      >
        <p style={{ color:"#4c1d95", fontSize:13, fontWeight:600, margin:0, letterSpacing:"0.06em" }}>One notification. One decision.</p>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity:0 }}
        animate={inView ? { opacity:0.5 } : { opacity:0 }}
        transition={{ delay:1.4 }}
        style={{ position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)", color:"#6366f1", fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", animation:"scrollBounce 2s ease-in-out infinite" }}
      >
        ↓ scroll
      </motion.div>
    </div>
  );
}

// ── Section 2: What's The Loss? ───────────────────────────────────────────────

function Section2() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, amount:0.45 });

  return (
    <div ref={ref} style={{
      height:"100vh", scrollSnapAlign:"start", flexShrink:0,
      position:"relative", overflow:"hidden",
      background:"#020617",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      {/* Stars */}
      {[...Array(30)].map((_,i) => (
        <div key={i} style={{ position:"absolute", width:1+Math.random()*1.5, height:1+Math.random()*1.5, borderRadius:"50%", background:"rgba(148,163,184,0.3)", top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, pointerEvents:"none" }} />
      ))}

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%", padding:"0 8%", gap:32, zIndex:1 }}>
        {/* Massive title */}
        <div style={{ textAlign:"center", lineHeight:1.05 }}>
          <div style={{ fontSize:"clamp(52px,9vw,120px)", fontWeight:900, letterSpacing:"-0.02em", color:"white" }}>
            <CinematicWords text="WHAT'S" inView={inView} delay={0.1} />
          </div>
          <div style={{ fontSize:"clamp(52px,9vw,120px)", fontWeight:900, letterSpacing:"-0.02em", color:"#6366f1" }}>
            <CinematicWords text="THE LOSS" inView={inView} delay={0.3} />
          </div>
          <div style={{ fontSize:"clamp(52px,9vw,120px)", fontWeight:900, letterSpacing:"-0.02em", color:"white" }}>
            <CinematicWords text="AFTERALL?" inView={inView} delay={0.55} />
          </div>
        </div>

        {/* Row: character + thought bubble */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:24 }}>
          <motion.div
            initial={{ opacity:0, y:40 }}
            animate={inView ? { opacity:1, y:0 } : { opacity:0, y:40 }}
            transition={{ duration:0.7, delay:0.9 }}
          >
            <HarshCharacter pose="thinking" scale={0.75} />
          </motion.div>

          <motion.div
            initial={{ opacity:0, scale:0.7 }}
            animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale:0.7 }}
            transition={{ duration:0.6, delay:1.1, type:"spring", stiffness:200, damping:20 }}
            style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:20, padding:"18px 24px", display:"flex", flexWrap:"wrap", gap:8, maxWidth:220 }}
          >
            {["🤖 N8N","✨ Claude","🎙 Sarvam","💡 OpenAI"].map((t,i) => (
              <motion.span
                key={t}
                initial={{ opacity:0, scale:0.5 }}
                animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale:0.5 }}
                transition={{ delay:1.2 + i*0.08 }}
                style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.4)", borderRadius:8, padding:"5px 10px", color:"#a5b4fc", fontSize:12, fontWeight:700 }}
              >{t}</motion.span>
            ))}
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity:0 }}
          animate={inView ? { opacity:1 } : { opacity:0 }}
          transition={{ duration:0.8, delay:1.4 }}
          style={{ color:"#334155", fontSize:14, margin:0, textAlign:"center", fontStyle:"italic" }}
        >
          One question rewired everything.
        </motion.p>
      </div>
    </div>
  );
}

// ── Section 3: N8N Automation ─────────────────────────────────────────────────

function Section3() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, amount:0.45 });

  const wNodes = [
    { label:"TRIGGER", x:60,  y:95, color:"#f59e0b" },
    { label:"AI NODE", x:195, y:95, color:"#a855f7" },
    { label:"EMAIL",   x:330, y:55, color:"#06b6d4" },
    { label:"CRM",     x:330, y:135, color:"#3b82f6" },
    { label:"DONE",    x:460, y:95, color:"#22c55e" },
  ];

  return (
    <div ref={ref} style={{
      height:"100vh", scrollSnapAlign:"start", flexShrink:0,
      position:"relative", overflow:"hidden",
      background:"linear-gradient(135deg,#030f07 0%,#010a04 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      {/* Ambient */}
      <div style={{ position:"absolute", top:"30%", left:"30%", width:500, height:300, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(34,197,94,0.06) 0%,transparent 70%)", pointerEvents:"none" }} />

      <div style={{ display:"flex", alignItems:"center", gap:40, padding:"0 6%", width:"100%", justifyContent:"center" }}>
        {/* Left: title + workflow */}
        <div style={{ display:"flex", flexDirection:"column", gap:24, flex:1, maxWidth:560 }}>
          <motion.div
            initial={{ opacity:0, y:-50 }}
            animate={inView ? { opacity:1, y:0 } : { opacity:0, y:-50 }}
            transition={{ duration:0.7, delay:0.1, type:"spring", stiffness:150, damping:20 }}
            style={{ fontSize:"clamp(36px,6vw,72px)", fontWeight:900, letterSpacing:"0.04em", color:"#22c55e", textShadow:"0 0 40px rgba(34,197,94,0.5)" }}
          >
            AUTOMATION
          </motion.div>

          <motion.div
            initial={{ opacity:0 }}
            animate={inView ? { opacity:1 } : { opacity:0 }}
            transition={{ delay:0.4, duration:0.5 }}
            style={{ background:"rgba(34,197,94,0.05)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:16, padding:"24px", position:"relative" }}
          >
            <svg viewBox="0 0 540 190" width="100%" height="auto" style={{ overflow:"visible" }}>
              {/* Paths */}
              {inView && (<>
                <path d="M115,95 L165,95" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="300" style={{ animation:"drawLine 0.8s 0.6s ease-out forwards", strokeDashoffset:300 }} />
                <path d="M250,95 L305,55" stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="300" style={{ animation:"drawLine 0.8s 0.9s ease-out forwards", strokeDashoffset:300 }} />
                <path d="M250,95 L305,135" stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="300" style={{ animation:"drawLine 0.8s 1.0s ease-out forwards", strokeDashoffset:300 }} />
                <path d="M385,55 L435,95" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="300" style={{ animation:"drawLine 0.8s 1.2s ease-out forwards", strokeDashoffset:300 }} />
                <path d="M385,135 L435,95" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="300" style={{ animation:"drawLine 0.8s 1.2s ease-out forwards", strokeDashoffset:300 }} />
              </>)}
              {/* Arrow heads */}
              {inView && wNodes.slice(1).map((n, i) => (
                <polygon key={i} points={`${n.x-8},${n.y-5} ${n.x},${n.y} ${n.x-8},${n.y+5}`} fill={n.color} style={{ opacity: 0, animation:`fadeIn 0.3s ${0.8+i*0.15}s forwards` }} />
              ))}
              {/* Nodes */}
              {wNodes.map((n, i) => (
                <g key={n.label}>
                  <rect x={n.x} y={n.y-20} width="80" height="40" rx="8" fill={`${n.color}22`} stroke={n.color} strokeWidth="1.5" style={{ opacity:0, animation:`fadeIn 0.4s ${0.5+i*0.12}s forwards` }} />
                  <text x={n.x+40} y={n.y+6} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="800" style={{ opacity:0, animation:`fadeIn 0.4s ${0.6+i*0.12}s forwards` }}>{n.label}</text>
                </g>
              ))}
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={inView ? { opacity:1, y:0 } : { opacity:0, y:20 }}
            transition={{ delay:1.5, duration:0.5 }}
            style={{ color:"#166534", fontSize:13, fontWeight:600, fontStyle:"italic" }}
          >
            &quot;Wait. N8N can connect <em style={{ color:"#22c55e", fontStyle:"normal" }}>everything</em>?&quot;
          </motion.div>
        </div>

        {/* Right: character */}
        <motion.div
          initial={{ opacity:0, x:60 }}
          animate={inView ? { opacity:1, x:0 } : { opacity:0, x:60 }}
          transition={{ duration:0.8, delay:0.5, type:"spring", stiffness:100, damping:16 }}
          style={{ flexShrink:0 }}
        >
          <HarshCharacter pose="pointing" scale={1.1} />
        </motion.div>
      </div>
    </div>
  );
}

// ── Section 4: The MCP Revolution ────────────────────────────────────────────

function Section4() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, amount:0.45 });

  const cards = [
    { name:"Supabase MCP", icon:"🗄", color:"#22c55e", from:{ x:-120, y:-80 } },
    { name:"GitHub MCP",   icon:"📦", color:"#60a5fa", from:{ x:120,  y:-80 } },
    { name:"Vercel MCP",   icon:"🚀", color:"#f97316", from:{ x:-120, y:80  } },
    { name:"N8N MCP",      icon:"⚡", color:"#fbbf24", from:{ x:120,  y:80  } },
  ];

  return (
    <div ref={ref} style={{
      height:"100vh", scrollSnapAlign:"start", flexShrink:0,
      position:"relative", overflow:"hidden",
      background:"radial-gradient(ellipse at 50% 40%,#1a0033 0%,#080010 45%,#000 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20,
    }}>
      {/* Purple nebula */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* Crashing title */}
      <div style={{ textAlign:"center", zIndex:1 }}>
        <div style={{ overflow:"hidden" }}>
          <motion.div
            initial={{ y:-200, opacity:0, scale:1.8 }}
            animate={inView ? { y:0, opacity:1, scale:1 } : { y:-200, opacity:0, scale:1.8 }}
            transition={{ type:"spring", stiffness:250, damping:22, delay:0.1 }}
            style={{ fontSize:"clamp(48px,8vw,100px)", fontWeight:900, letterSpacing:"0.06em", color:"white", lineHeight:1.1 }}
          >
            THE MCP
          </motion.div>
        </div>
        <div style={{ overflow:"hidden" }}>
          <motion.div
            initial={{ y:200, opacity:0, scale:1.8 }}
            animate={inView ? { y:0, opacity:1, scale:1 } : { y:200, opacity:0, scale:1.8 }}
            transition={{ type:"spring", stiffness:250, damping:22, delay:0.2 }}
            style={{ fontSize:"clamp(48px,8vw,100px)", fontWeight:900, letterSpacing:"0.06em", color:"#a855f7", lineHeight:1.1, textShadow:"0 0 60px #a855f7" }}
          >
            REVOLUTION
          </motion.div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, zIndex:1 }}>
        {cards.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity:0, x:c.from.x, y:c.from.y, scale:0.5 }}
            animate={inView ? { opacity:1, x:0, y:0, scale:1 } : { opacity:0, x:c.from.x, y:c.from.y, scale:0.5 }}
            transition={{ type:"spring", stiffness:200, damping:18, delay:0.5 + i*0.08 }}
            style={{ background:`${c.color}12`, border:`1px solid ${c.color}44`, borderRadius:14, padding:"16px 20px", color:c.color, fontSize:13, fontWeight:700, textAlign:"center", minWidth:130, boxShadow:`0 0 24px ${c.color}22` }}
          >
            <div style={{ fontSize:22, marginBottom:6 }}>{c.icon}</div>
            {c.name}
          </motion.div>
        ))}
      </div>

      {/* Central orb */}
      <motion.div
        initial={{ opacity:0, scale:0 }}
        animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale:0 }}
        transition={{ delay:0.35, type:"spring", stiffness:300, damping:20 }}
        style={{ position:"absolute", width:60, height:60, borderRadius:"50%", background:"radial-gradient(circle,#a855f7 0%,#7c3aed 60%,transparent 100%)", animation:"orbPulse 2s ease-in-out infinite", zIndex:0 }}
      />

      {/* Character */}
      <motion.div
        initial={{ opacity:0, y:80 }}
        animate={inView ? { opacity:1, y:0 } : { opacity:0, y:80 }}
        transition={{ duration:0.7, delay:0.8, type:"spring", stiffness:120, damping:18 }}
        style={{ zIndex:1 }}
      >
        <HarshCharacter pose="excited" scale={0.9} />
      </motion.div>

      {/* Quote */}
      <motion.p
        initial={{ opacity:0 }}
        animate={inView ? { opacity:1 } : { opacity:0 }}
        transition={{ delay:1.2, duration:0.6 }}
        style={{ color:"#7e22ce", fontSize:12, margin:0, fontStyle:"italic", fontWeight:600, zIndex:1 }}
      >
        Claude Code changed the game.
      </motion.p>
    </div>
  );
}

// ── Section 5: The AI Stack Splits ────────────────────────────────────────────

function Section5() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, amount:0.45 });

  return (
    <div ref={ref} style={{
      height:"100vh", scrollSnapAlign:"start", flexShrink:0,
      position:"relative", overflow:"hidden",
      background:"#080010",
      display:"flex", alignItems:"stretch",
    }}>
      {/* Left half — Sarvam */}
      <motion.div
        initial={{ x:"-100%", opacity:0 }}
        animate={inView ? { x:"0%", opacity:1 } : { x:"-100%", opacity:0 }}
        transition={{ duration:0.8, delay:0.1, ease:[0.22,1,0.36,1] }}
        style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:"40px 32px", background:"linear-gradient(135deg,#1e1b4b 0%,#0c0a24 100%)", clipPath:"polygon(0 0,100% 0,85% 100%,0 100%)" }}
      >
        <div style={{ color:"#a855f7", fontSize:"clamp(20px,3.5vw,32px)", fontWeight:900, letterSpacing:"0.1em" }}>SARVAM AI</div>
        <div style={{ animation:"floatY 3s ease-in-out infinite" }}>
          <SoundWaveSVG />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, textAlign:"center" }}>
          {["🎙 Voice STT · TTS","🌐 11 Indian Languages","🤖 Heka Voice Agent","📞 Callback Automation"].map((t,i) => (
            <motion.div
              key={t}
              initial={{ opacity:0, x:-20 }}
              animate={inView ? { opacity:1, x:0 } : { opacity:0, x:-20 }}
              transition={{ delay:0.5 + i*0.1 }}
              style={{ color:"#c4b5fd", fontSize:12, fontWeight:600 }}
            >{t}</motion.div>
          ))}
        </div>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#4c1d95,#7c3aed)", border:"2px solid #a855f744", display:"flex", alignItems:"center", justifyContent:"center", color:"#e9d5ff", fontSize:26, boxShadow:"0 0 30px rgba(168,85,247,0.4)" }}>
          🎙
        </div>
      </motion.div>

      {/* Center: character on the diagonal line */}
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, transform:"translateX(-50%)", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:30, zIndex:10 }}>
        <motion.div
          initial={{ opacity:0, y:60 }}
          animate={inView ? { opacity:1, y:0 } : { opacity:0, y:60 }}
          transition={{ duration:0.8, delay:0.7, type:"spring", stiffness:120, damping:16 }}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}
        >
          <motion.div
            initial={{ opacity:0, scale:0.8 }}
            animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale:0.8 }}
            transition={{ delay:1.0, duration:0.5 }}
            style={{ background:"rgba(129,140,248,0.12)", border:"1px solid rgba(129,140,248,0.3)", borderRadius:14, padding:"10px 18px", maxWidth:240, color:"#e2e8f0", fontSize:12, lineHeight:1.6, textAlign:"center" }}
          >
            Sarvam for voice. OpenAI for intelligence.<br/>
            <em style={{ color:"#818cf8", fontStyle:"normal", fontWeight:700 }}>HotBot got both.</em>
          </motion.div>
          <HarshCharacter pose="pointing" scale={0.85} />
        </motion.div>
      </div>

      {/* Glowing center divider */}
      <motion.div
        initial={{ opacity:0 }}
        animate={inView ? { opacity:1 } : { opacity:0 }}
        transition={{ delay:0.3, duration:0.6 }}
        style={{ position:"absolute", left:"50%", top:0, bottom:0, width:2, background:"linear-gradient(to bottom,transparent,#818cf8,#a855f7,#818cf8,transparent)", boxShadow:"0 0 20px #818cf888, 0 0 60px #818cf844", zIndex:5 }}
      />

      {/* Right half — OpenAI */}
      <motion.div
        initial={{ x:"100%", opacity:0 }}
        animate={inView ? { x:"0%", opacity:1 } : { x:"100%", opacity:0 }}
        transition={{ duration:0.8, delay:0.15, ease:[0.22,1,0.36,1] }}
        style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:"40px 32px", background:"linear-gradient(225deg,#0c2040 0%,#060d1a 100%)", clipPath:"polygon(15% 0,100% 0,100% 100%,0 100%)" }}
      >
        <div style={{ color:"#60a5fa", fontSize:"clamp(20px,3.5vw,32px)", fontWeight:900, letterSpacing:"0.1em" }}>OPENAI</div>
        <div style={{ width:70, height:70, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#0c2040)", border:"2px solid #60a5fa44", display:"flex", alignItems:"center", justifyContent:"center", color:"#60a5fa", fontSize:28, fontWeight:900, animation:"floatY 3.5s 0.5s ease-in-out infinite", boxShadow:"0 0 30px rgba(96,165,250,0.3)" }}>⬡</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, textAlign:"center" }}>
          {["🧠 GPT-4o Intelligence","🔍 Embeddings + Vision","📝 Content Generation","🤖 AI Analyst Insights"].map((t,i) => (
            <motion.div
              key={t}
              initial={{ opacity:0, x:20 }}
              animate={inView ? { opacity:1, x:0 } : { opacity:0, x:20 }}
              transition={{ delay:0.5 + i*0.1 }}
              style={{ color:"#bfdbfe", fontSize:12, fontWeight:600 }}
            >{t}</motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Section 6: The Backdrop ───────────────────────────────────────────────────

function Section6({ onEnterMap }: { onEnterMap: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:false, amount:0.45 });

  const stats = [
    { label:"100+\nPages",            tx:"-100px", ty:"-80px",  delay:0.1,  color:"#6366f1" },
    { label:"55+\nAPI Routes",        tx:"100px",  ty:"-80px",  delay:0.15, color:"#a855f7" },
    { label:"90+\nComponents",        tx:"-120px", ty:"0",      delay:0.2,  color:"#06b6d4" },
    { label:"15\nEmail Templates",    tx:"120px",  ty:"0",      delay:0.25, color:"#22c55e" },
    { label:"10\nIntegrations",       tx:"-100px", ty:"80px",   delay:0.3,  color:"#f59e0b" },
    { label:"50\nPlatform Nodes",     tx:"100px",  ty:"80px",   delay:0.35, color:"#ec4899" },
  ];

  return (
    <div ref={ref} style={{
      height:"100vh", scrollSnapAlign:"start", flexShrink:0,
      position:"relative", overflow:"hidden",
      background:"#000",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24,
    }}>
      {/* Flash white overlay */}
      {inView && (
        <div style={{ position:"absolute", inset:0, background:"white", animation:"flashWhite 1.2s 1.6s ease-in-out forwards", opacity:0, pointerEvents:"none", zIndex:20 }} />
      )}

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, zIndex:1 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity:0, x: parseFloat(s.tx), y: parseFloat(s.ty), scale:0.4 }}
            animate={inView ? { opacity:1, x:0, y:0, scale:1 } : { opacity:0, x: parseFloat(s.tx), y: parseFloat(s.ty), scale:0.4 }}
            transition={{ type:"spring", stiffness:200, damping:18, delay:s.delay }}
            style={{ background:`${s.color}10`, border:`1px solid ${s.color}33`, borderRadius:14, padding:"16px 18px", textAlign:"center" }}
          >
            {s.label.split("\n").map((line,li) => (
              <div key={li} style={{ color: li === 0 ? s.color : "#475569", fontSize: li === 0 ? 22 : 10, fontWeight: li === 0 ? 900 : 600, lineHeight:1.2 }}>{line}</div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Character */}
      <motion.div
        initial={{ opacity:0, y:40 }}
        animate={inView ? { opacity:1, y:0 } : { opacity:0, y:40 }}
        transition={{ duration:0.7, delay:0.6, type:"spring", stiffness:120 }}
        style={{ zIndex:1 }}
      >
        <HarshCharacter pose="excited" scale={0.85} />
      </motion.div>

      {/* Big title */}
      <motion.div
        initial={{ opacity:0, scale:0.8 }}
        animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale:0.8 }}
        transition={{ duration:0.8, delay:0.9 }}
        style={{ textAlign:"center", zIndex:1 }}
      >
        <div style={{ fontSize:"clamp(28px,5vw,60px)", fontWeight:900, letterSpacing:"0.06em", color:"white", animation: inView ? "glowText 3s 1.8s ease-in-out infinite" : "none" }}>
          HOTBOT STUDIOS
        </div>
        <div style={{ color:"#334155", fontSize:12, marginTop:6, fontWeight:600 }}>
          Built solo. Powered by Claude Code + MCP Servers.
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity:0, y:20 }}
        animate={inView ? { opacity:1, y:0 } : { opacity:0, y:20 }}
        transition={{ duration:0.6, delay:1.1 }}
        onClick={onEnterMap}
        whileHover={{ scale:1.05, boxShadow:"0 0 50px rgba(99,102,241,0.5)" }}
        whileTap={{ scale:0.97 }}
        style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(99,102,241,0.08))", border:"1.5px solid rgba(99,102,241,0.6)", borderRadius:14, padding:"16px 36px", color:"#818cf8", fontSize:15, fontWeight:800, cursor:"pointer", letterSpacing:"0.04em", boxShadow:"0 0 30px rgba(99,102,241,0.2)", zIndex:1, animation:"borderPulse 2.5s ease-in-out infinite" }}
      >
        Explore The Architecture →
      </motion.button>
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────

interface ChatMessage { role:"user"|"assistant"; text:string; }

function ChatPanel({ onHighlight }: { onHighlight: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  function parseHighlight(text: string): { clean: string; ids: string[] } {
    const match = text.match(/\[highlight:([\w,\-]+)\]/);
    if (!match) return { clean:text.trim(), ids:[] };
    const ids = match[1].split(",").map(s => s.trim()).filter(Boolean);
    return { clean:text.replace(match[0],"").trim(), ids };
  }

  async function sendText() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const newHistory = [...messages.slice(-8), { role:"user" as const, text:q }];
    setMessages(prev => [...prev, { role:"user", text:q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/mindmap/ask", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          message:q,
          history:newHistory.slice(0,-1).map(m => ({ role:m.role, content:m.text })),
        }),
      });
      const data = await res.json();
      const raw = data.reply ?? data.answer ?? data.text ?? "...";
      const { clean, ids } = parseHighlight(raw);
      setMessages(prev => [...prev, { role:"assistant", text:clean }]);
      if (ids.length) onHighlight(ids);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", text:"Error reaching the server." }]);
    } finally { setLoading(false); }
  }

  async function toggleRecording() {
    if (recording) { mediaRef.current?.stop(); setRecording(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type:"audio/webm" });
        setLoading(true);
        setMessages(prev => [...prev, { role:"user", text:"🎙 [Voice message]" }]);
        try {
          const fd = new FormData();
          fd.append("audio", blob, "voice.webm");
          const sttRes = await fetch("/api/sarvam/stt", { method:"POST", body:fd });
          const { transcript } = await sttRes.json();
          if (transcript) {
            const askRes = await fetch("/api/mindmap/ask", {
              method:"POST",
              headers:{ "Content-Type":"application/json" },
              body:JSON.stringify({ message:transcript }),
            });
            const data = await askRes.json();
            const raw = data.reply ?? data.answer ?? data.text ?? "...";
            const { clean, ids } = parseHighlight(raw);
            setMessages(prev => [...prev, { role:"assistant", text:clean }]);
            if (ids.length) onHighlight(ids);
          }
        } catch {
          setMessages(prev => [...prev, { role:"assistant", text:"Voice error." }]);
        } finally { setLoading(false); }
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch { alert("Microphone access denied."); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position:"fixed", right:20, bottom:80, background:"rgba(15,23,42,0.92)", border:"1px solid #6366f155", borderRadius:14, padding:"10px 18px", color:"#818cf8", fontSize:13, fontWeight:700, cursor:"pointer", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", boxShadow:"0 4px 24px rgba(0,0,0,0.5)", display:"flex", alignItems:"center", gap:8, zIndex:50 }}>
        💬 Ask HotBot AI
      </button>
    );
  }

  return (
    <div style={{ position:"fixed", right:16, bottom:16, width:340, height:480, background:"rgba(9,11,20,0.97)", border:"1px solid #6366f133", borderRadius:18, display:"flex", flexDirection:"column", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", boxShadow:"0 8px 48px rgba(0,0,0,0.7)", zIndex:50, overflow:"hidden", animation:"slideUp 0.3s both" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid #1e293b", background:"rgba(15,23,42,0.8)" }}>
        <div>
          <span style={{ color:"#e2e8f0", fontSize:13, fontWeight:700 }}>HotBot AI</span>
          <div style={{ color:"#475569", fontSize:10, marginTop:2 }}>⌨ OpenAI · 🎙 Sarvam</div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"#475569", fontSize:18, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.length === 0 && (
          <div style={{ color:"#334155", fontSize:12, textAlign:"center", marginTop:20 }}>
            Ask me anything about HotBot Studios architecture.<br/>
            <span style={{ color:"#1e293b" }}>e.g. &quot;How does Heka work?&quot;</span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", background:m.role==="user"?"rgba(99,102,241,0.18)":"rgba(30,41,59,0.8)", border:m.role==="user"?"1px solid #6366f133":"1px solid #1e293b", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", padding:"10px 14px", maxWidth:"85%", color:"#e2e8f0", fontSize:13, lineHeight:1.6, animation:"slideUp 0.2s both" }}>{m.text}</div>
        ))}
        {loading && (
          <div style={{ alignSelf:"flex-start", display:"flex", gap:4, padding:"10px 14px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#6366f1", animation:`dotPulse 1.4s ${i*0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding:"10px 12px", borderTop:"1px solid #1e293b", display:"flex", gap:8 }}>
        <button onClick={toggleRecording} style={{ background:recording?"rgba(239,68,68,0.2)":"rgba(99,102,241,0.12)", border:recording?"1px solid #ef444455":"1px solid #6366f133", borderRadius:10, width:38, height:38, cursor:"pointer", color:recording?"#ef4444":"#818cf8", fontSize:16, flexShrink:0, animation:recording?"micPulse 1s infinite":"none" }} title={recording?"Stop recording":"Voice input"}>🎙</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter") sendText(); }} placeholder="Ask about the architecture..." style={{ flex:1, background:"rgba(15,23,42,0.8)", border:"1px solid #1e293b", borderRadius:10, padding:"0 12px", color:"#e2e8f0", fontSize:13, outline:"none" }} />
        <button onClick={sendText} disabled={!input.trim()||loading} style={{ background:"rgba(99,102,241,0.2)", border:"1px solid #6366f133", borderRadius:10, width:38, height:38, cursor:"pointer", color:"#818cf8", fontSize:16, flexShrink:0, opacity:(!input.trim()||loading)?0.4:1 }}>↑</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BrainMap() {
  const [phase, setPhase] = useState<"story"|"map">("story");

  // Map state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({
    ry:0.3, rx:0.15,
    velY:0.0008, velX:0,
    dragging:false, lastX:0, lastY:0,
    hovered:null as string|null, selected:null as string|null,
    tick:0, particles:[] as Particle[], pulseWaves:[] as PulseWave[],
    W:0, H:0, didDrag:false,
    journeyActive:false, journeyChapter:0,
    highlightedNodes:null as string[]|null, highlightTick:0,
  });
  const rafRef = useRef<number>(0);
  const [tooltip, setTooltip] = useState<TooltipState|null>(null);
  const [selected, setSelected] = useState<NodeDef|null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyChapter, setJourneyChapter] = useState(0);

  const enterMap = useCallback(() => { setPhase("map"); }, []);

  const handleHighlight = useCallback((ids: string[]) => {
    stRef.current.highlightedNodes = ids;
    stRef.current.highlightTick = stRef.current.tick;
    for (const id of ids) {
      const node = NODE_MAP.get(id);
      if (node) stRef.current.pulseWaves.push({ nodeId:id, startTick:stRef.current.tick, color:COLORS[node.cat] });
    }
    setTimeout(() => { stRef.current.highlightedNodes = null; }, 5000);
  }, []);

  const toggleJourney = useCallback(() => {
    const next = !journeyActive;
    setJourneyActive(next);
    stRef.current.journeyActive = next;
    if (next) { setJourneyChapter(0); stRef.current.journeyChapter = 0; }
  }, [journeyActive]);

  const setChapter = useCallback((i: number) => {
    setJourneyChapter(i);
    stRef.current.journeyChapter = i;
  }, []);

  // Map canvas
  useEffect(() => {
    if (phase !== "map") return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const st = stRef.current;

    function resize() {
      st.W = window.innerWidth; st.H = window.innerHeight;
      canvas.width = st.W * dpr; canvas.height = st.H * dpr;
      canvas.style.width = st.W + "px"; canvas.style.height = st.H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const rng2 = mkRng(99);
    st.particles = [];
    for (let i = 0; i < 70; i++) {
      const ei = Math.floor(rng2() * EDGES.length);
      const fromId = EDGES[ei][0];
      const c = COLORS[NODE_MAP.get(fromId)?.cat ?? "core"];
      st.particles.push({ edge:ei, t:rng2(), speed:0.0007+rng2()*0.0009, color:c, rgb:hexToRgb(c) });
    }

    const stars: { x:number; y:number; r:number; a:number }[] = [];
    const srng = mkRng(777);
    for (let i = 0; i < 180; i++) stars.push({ x:srng()*2-1, y:srng()*2-1, r:srng()*1.2, a:srng()*0.25+0.05 });

    const FOV = 420;

    function proj(x: number, y: number, z: number, W: number, H: number): [number, number, number] {
      const scale = FOV / (z + FOV);
      return [W/2 + x*scale, H/2 + y*scale, scale];
    }

    function projNode(n: NodeDef, W: number, H: number): [number, number, number, number] {
      let [vx,vy,vz] = ry(n.x, n.y, n.z, st.ry);
      [vx,vy,vz] = rx(vx, vy, vz, st.rx);
      const [sx,sy,sc] = proj(vx, vy, vz, W, H);
      return [sx, sy, sc, vz];
    }

    function draw() {
      const { W, H, tick, hovered, particles, pulseWaves } = st;
      const cx = W/2, cy = H/2;

      const journeyNodes: Set<string>|null = st.journeyActive
        ? (JOURNEY_CHAPTERS[st.journeyChapter].nodes.length === 0 ? null : new Set(JOURNEY_CHAPTERS[st.journeyChapter].nodes))
        : null;
      const journeyAccent = st.journeyActive ? JOURNEY_CHAPTERS[st.journeyChapter].accent : null;
      const chatHighlight: Set<string>|null = st.highlightedNodes ? new Set(st.highlightedNodes) : null;

      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        ctx.beginPath(); ctx.arc(s.x*W+cx, s.y*H+cy, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(148,163,184,${s.a})`; ctx.fill();
      }

      const ng = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.42);
      ng.addColorStop(0,"rgba(79,70,229,0.10)"); ng.addColorStop(0.5,"rgba(139,92,246,0.05)"); ng.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = ng; ctx.fillRect(0,0,W,H);

      for (const [cat,[ccx,ccy,ccz]] of Object.entries(CLUSTERS) as [Cat,[number,number,number]][]) {
        if (cat === "core") continue;
        let [vx,vy,vz] = ry(ccx,ccy,ccz,st.ry); [vx,vy,vz] = rx(vx,vy,vz,st.rx);
        const [sx,sy] = proj(vx,vy,vz,W,H);
        const depth = (vz+250)/500; if (depth < 0.1) continue;
        const gr = ctx.createRadialGradient(sx,sy,0,sx,sy,90);
        const rgb = hexToRgb(COLORS[cat]);
        gr.addColorStop(0,`rgba(${rgb},${0.07*depth})`); gr.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle = gr; ctx.fillRect(sx-90,sy-90,180,180);
      }

      const pMap = new Map<string,[number,number,number,number]>();
      for (const n of NODES) pMap.set(n.id, projNode(n,W,H));

      const activeId = st.selected ?? hovered;
      const connSet = new Set<string>();
      if (activeId) for (const id of (CONNECTIONS.get(activeId)??[])) connSet.add(id);

      for (const [a,b] of EDGES) {
        const pa = pMap.get(a), pb = pMap.get(b);
        if (!pa || !pb) continue;
        const isHl = activeId && (a===activeId || b===activeId);
        const avgZ = (pa[3]+pb[3])/2;
        const depth = Math.max(0,(avgZ+250)/500);
        const jDim = journeyNodes ? !(journeyNodes.has(a)&&journeyNodes.has(b)) : false;
        if (isHl) {
          const activeNode = activeId ? NODE_MAP.get(activeId) : undefined;
          const rgb = hexToRgb(COLORS[activeNode?.cat??"core"]);
          ctx.beginPath(); ctx.moveTo(pa[0],pa[1]); ctx.lineTo(pb[0],pb[1]);
          ctx.strokeStyle=`rgba(${rgb},0.75)`; ctx.lineWidth=1.2; ctx.stroke();
        } else {
          const dimmed = !!activeId || jDim;
          const alpha = dimmed ? Math.max(0.01,Math.min(0.05,depth*0.06)) : Math.max(0.02,Math.min(0.14,depth*0.18));
          ctx.beginPath(); ctx.moveTo(pa[0],pa[1]); ctx.lineTo(pb[0],pb[1]);
          ctx.strokeStyle=`rgba(148,163,184,${alpha})`; ctx.lineWidth=0.4; ctx.stroke();
        }
      }

      for (const p of particles) {
        const [a,b] = EDGES[p.edge];
        const pa = pMap.get(a), pb = pMap.get(b);
        if (!pa || !pb) continue;
        const px = pa[0]+(pb[0]-pa[0])*p.t, py = pa[1]+(pb[1]-pa[1])*p.t;
        const pz = pa[3]+(pb[3]-pa[3])*p.t;
        const depth = Math.max(0,(pz+250)/500);
        if (depth < 0.12) { p.t=(p.t+p.speed)%1; continue; }
        const alpha = Math.min(1,depth*1.4);
        const gr = ctx.createRadialGradient(px,py,0,px,py,3.5);
        gr.addColorStop(0,`rgba(${p.rgb},${alpha})`); gr.addColorStop(1,`rgba(${p.rgb},0)`);
        ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fill();
        p.t=(p.t+p.speed)%1;
      }

      const livePulses: PulseWave[] = [];
      for (const pw of pulseWaves) {
        const age = tick - pw.startTick;
        if (age > 120) continue;
        livePulses.push(pw);
        const p = pMap.get(pw.nodeId); if (!p) continue;
        const [sx,sy] = p;
        const progress = age/120, radius = 20+progress*60, alpha = (1-progress)*0.5;
        const rgb = hexToRgb(pw.color);
        ctx.beginPath(); ctx.arc(sx,sy,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${rgb},${alpha})`; ctx.lineWidth=2; ctx.stroke();
      }
      st.pulseWaves = livePulses;

      const sorted = [...NODES].sort((a,b) => (pMap.get(a.id)?.[3]??0)-(pMap.get(b.id)?.[3]??0));

      for (const n of sorted) {
        const p = pMap.get(n.id); if (!p) continue;
        const [sx,sy,sc,vz] = p;
        const depth = Math.max(0,(vz+250)/500);
        const isHov = n.id===hovered && !st.selected;
        const isSel = n.id===st.selected;
        const isConn = connSet.has(n.id);
        const inJourney = journeyNodes ? journeyNodes.has(n.id) : true;
        const jDimNode = journeyNodes ? !inJourney : false;
        const inChatHl = chatHighlight ? chatHighlight.has(n.id) : false;
        const isDim = (!!activeId && !isSel && !isConn && n.id!==activeId) || jDimNode;
        const pulse = n.cat==="core" ? 1+Math.sin(tick*0.04)*0.14 : 1;
        const baseR = n.r*sc*pulse;
        const radius = baseR*(isSel?1.6:isHov?1.4:isConn?1.1:inChatHl?1.5:1);
        const color = inJourney&&journeyAccent ? journeyAccent : (inChatHl?"#e0e7ff":COLORS[n.cat]);
        const rgb = hexToRgb(color);
        const alpha = isDim ? Math.max(0.03,depth*0.15) : Math.max(0.2,depth);
        const glowR = radius*(isHov?5.5:inChatHl?7:isConn?4:3);
        const glowA = isHov?0.55:inChatHl?0.7:isConn?0.3:0.15;
        const glow = ctx.createRadialGradient(sx,sy,0,sx,sy,glowR);
        glow.addColorStop(0,`rgba(${rgb},${glowA*alpha})`); glow.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx,sy,glowR,0,Math.PI*2); ctx.fill();
        const sGrad = ctx.createRadialGradient(sx-radius*0.32,sy-radius*0.32,0,sx,sy,radius);
        sGrad.addColorStop(0,`rgba(${rgb},${alpha})`); sGrad.addColorStop(0.55,`rgba(${rgb},${alpha*0.75})`); sGrad.addColorStop(1,`rgba(${rgb},${alpha*0.25})`);
        ctx.fillStyle=sGrad; ctx.beginPath(); ctx.arc(sx,sy,radius,0,Math.PI*2); ctx.fill();
        if (depth > 0.45) {
          const glint = ctx.createRadialGradient(sx-radius*0.35,sy-radius*0.35,0,sx-radius*0.35,sy-radius*0.35,radius*0.45);
          glint.addColorStop(0,`rgba(255,255,255,${depth*0.45})`); glint.addColorStop(1,"rgba(255,255,255,0)");
          ctx.fillStyle=glint; ctx.beginPath(); ctx.arc(sx,sy,radius,0,Math.PI*2); ctx.fill();
        }
        if (isHov||isSel||inChatHl) {
          if (isSel) { ctx.save(); ctx.setLineDash([6,4]); ctx.lineDashOffset=-(tick*0.5%10); }
          ctx.beginPath(); ctx.arc(sx,sy,radius+(isSel?6:inChatHl?8:4),0,Math.PI*2);
          ctx.strokeStyle=`rgba(${rgb},${isSel?0.9:inChatHl?0.8:0.7})`; ctx.lineWidth=isSel?1.5:inChatHl?2:1; ctx.stroke();
          if (isSel) ctx.restore();
        }
        const showLabel = depth>0.50||isHov||isConn||isSel||inChatHl||inJourney;
        if (showLabel) {
          const sz = Math.max(9,Math.min(13,9+depth*6));
          ctx.font=`${isSel||isHov||inChatHl?"700 ":isConn||inJourney?"600 ":""}${sz}px 'Plus Jakarta Sans',system-ui,sans-serif`;
          ctx.textAlign="center"; ctx.globalAlpha=Math.min(1,alpha*1.3);
          ctx.fillStyle="rgba(2,6,23,0.9)"; ctx.fillText(n.label,sx+1,sy+radius+14);
          ctx.fillStyle=n.cat==="core"?"#ffffff":`rgba(203,213,225,${Math.min(1,alpha*1.3)})`;
          ctx.fillText(n.label,sx,sy+radius+13); ctx.globalAlpha=1;
        }
      }

      st.tick++;
      if (!st.dragging) {
        st.velY += (0.0008-st.velY)*0.018; st.velX *= 0.94;
        st.rx += st.velX; st.rx = Math.max(-0.55,Math.min(0.55,st.rx));
      }
      st.ry += st.velY;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    setMapReady(true);

    function hitTest(mx: number, my: number): NodeDef|null {
      const { W, H } = st;
      let best: NodeDef|null = null, bestDist = 32;
      for (const n of NODES) {
        const [sx,sy,sc] = projNode(n,W,H);
        const dist = Math.hypot(mx-sx,my-sy), hit = Math.max(14,n.r*sc*1.8);
        if (dist<hit && dist<bestDist) { bestDist=dist; best=n; }
      }
      return best;
    }

    function onMouseMove(e: MouseEvent) {
      if (st.dragging) {
        const dx=e.clientX-st.lastX, dy=e.clientY-st.lastY;
        if (Math.abs(dx)>2||Math.abs(dy)>2) st.didDrag=true;
        st.velY=dx*0.003; st.velX=dy*0.003;
        st.ry+=dx*0.004; st.rx+=dy*0.004;
        st.rx=Math.max(-0.6,Math.min(0.6,st.rx));
        st.lastX=e.clientX; st.lastY=e.clientY;
        st.hovered=null; setTooltip(null);
      } else {
        const hit = hitTest(e.clientX,e.clientY);
        st.hovered = hit?.id ?? null;
        canvas.style.cursor = hit?"pointer":"grab";
        if (hit&&!st.selected) {
          setTooltip({ node:hit, x:Math.min(e.clientX+18,st.W-230), y:Math.min(e.clientY-12,st.H-110) });
        } else { setTooltip(null); }
      }
    }

    function onMouseDown(e: MouseEvent) { st.dragging=true; st.didDrag=false; st.lastX=e.clientX; st.lastY=e.clientY; canvas.style.cursor="grabbing"; }
    function onMouseUp(e: MouseEvent) {
      st.dragging=false; canvas.style.cursor="grab";
      if (st.didDrag) return;
      const hit = hitTest(e.clientX,e.clientY);
      if (hit) {
        if (st.selected===hit.id) { st.selected=null; setSelected(null); }
        else { st.selected=hit.id; setSelected(hit); setTooltip(null); }
      } else { st.selected=null; setSelected(null); }
    }

    let lx=0,ly=0;
    function onTouchStart(e: TouchEvent) { e.preventDefault(); st.dragging=true; lx=e.touches[0].clientX; ly=e.touches[0].clientY; }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const dx=e.touches[0].clientX-lx, dy=e.touches[0].clientY-ly;
      st.ry+=dx*0.004; st.rx+=dy*0.004; st.rx=Math.max(-0.6,Math.min(0.6,st.rx));
      lx=e.touches[0].clientX; ly=e.touches[0].clientY;
    }
    function onTouchEnd() { st.dragging=false; }

    canvas.addEventListener("mousemove",onMouseMove);
    canvas.addEventListener("mousedown",onMouseDown);
    canvas.addEventListener("mouseup",onMouseUp);
    canvas.addEventListener("mouseleave",onMouseUp);
    canvas.addEventListener("touchstart",onTouchStart,{passive:false});
    canvas.addEventListener("touchmove",onTouchMove,{passive:false});
    canvas.addEventListener("touchend",onTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",resize);
      canvas.removeEventListener("mousemove",onMouseMove);
      canvas.removeEventListener("mousedown",onMouseDown);
      canvas.removeEventListener("mouseup",onMouseUp);
      canvas.removeEventListener("mouseleave",onMouseUp);
      canvas.removeEventListener("touchstart",onTouchStart);
      canvas.removeEventListener("touchmove",onTouchMove);
      canvas.removeEventListener("touchend",onTouchEnd);
    };
  }, [phase]);

  // ── Story phase: vertical scroll ────────────────────────────────────────────

  if (phase === "story") {
    return (
      <div style={{ position:"fixed", inset:0, overflowY:"scroll", scrollSnapType:"y mandatory" }}>
        <style>{CSS}</style>
        <div style={{ display:"flex", flexDirection:"column" }}>
          <Section1 onEnterMap={enterMap} />
          <Section2 />
          <Section3 />
          <Section4 />
          <Section5 />
          <Section6 onEnterMap={enterMap} />
        </div>
      </div>
    );
  }

  // ── Map phase ──────────────────────────────────────────────────────────────

  return (
    <div style={{ position:"fixed", inset:0, background:"#020617", overflow:"hidden" }}>
      <style>{CSS}</style>
      <canvas ref={canvasRef} style={{ display:"block", cursor:"grab" }} />

      {/* Top-left title */}
      <div style={{ position:"absolute", top:24, left:28, pointerEvents:"none", userSelect:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#818cf8", boxShadow:"0 0 10px #818cf8", display:"inline-block", animation:"pulseDot 2s infinite" }} />
          <span style={{ color:"#6366f1", fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>Platform Architecture</span>
        </div>
        <h1 style={{ color:"#e0e7ff", fontSize:24, fontWeight:800, margin:0, lineHeight:1.15 }}>HotBot Studios</h1>
        <p style={{ color:"#334155", fontSize:11, margin:"5px 0 0", fontWeight:500 }}>AI-Native Digital Agency · Built with Claude + MCP Servers</p>
      </div>

      {/* Back to story */}
      <button
        onClick={() => setPhase("story")}
        style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)", background:"rgba(15,23,42,0.8)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:8, padding:"7px 16px", color:"#6366f1", fontSize:11, fontWeight:600, cursor:"pointer", letterSpacing:"0.06em", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", zIndex:20 }}
      >
        ← Origin Story
      </button>

      {/* Journey button */}
      <button
        onClick={toggleJourney}
        style={{ position:"absolute", top:20, left:"50%", transform:"translateX(calc(-50% + 110px))", background:journeyActive?"rgba(99,102,241,0.25)":"rgba(15,23,42,0.8)", border:`1px solid ${journeyActive?"#6366f1":"rgba(99,102,241,0.2)"}`, borderRadius:8, padding:"7px 16px", color:journeyActive?"#818cf8":"#6366f1", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.06em", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", zIndex:20 }}
      >
        {journeyActive?"⏹ Stop Journey":"▶ Play The Journey"}
      </button>

      {/* Legend */}
      <div style={{ position:"absolute", top:20, right:20, background:"rgba(15,23,42,0.80)", border:"1px solid rgba(99,102,241,0.18)", borderRadius:14, padding:"12px 16px", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", pointerEvents:"none", userSelect:"none" }}>
        <p style={{ color:"#475569", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 0 9px" }}>Systems</p>
        {(Object.entries(CAT_NAMES) as [Cat,string][]).map(([cat,label]) => (
          <div key={cat} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:COLORS[cat], boxShadow:`0 0 7px ${COLORS[cat]}99`, flexShrink:0 }} />
            <span style={{ color:"#64748b", fontSize:11 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Journey chapters */}
      {journeyActive && (
        <div style={{ position:"absolute", bottom:80, left:"50%", transform:"translateX(-50%)", display:"flex", gap:12, zIndex:30, animation:"slideUp 0.3s both" }}>
          {JOURNEY_CHAPTERS.map((ch,i) => (
            <button key={i} onClick={() => setChapter(i)} style={{ background:journeyChapter===i?`${ch.accent}22`:"rgba(15,23,42,0.85)", border:`1px solid ${journeyChapter===i?ch.accent:ch.accent+"44"}`, borderRadius:12, padding:"12px 16px", color:journeyChapter===i?ch.accent:"#475569", fontSize:11, fontWeight:700, cursor:"pointer", textAlign:"left", minWidth:110, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", transition:"all 0.2s", boxShadow:journeyChapter===i?`0 0 20px ${ch.accent}33`:"none" }}>
              <div style={{ fontSize:10, opacity:0.6, marginBottom:4 }}>{String(i+1).padStart(2,"0")}</div>
              <div style={{ lineHeight:1.3, marginBottom:2 }}>{ch.title}</div>
              <div style={{ fontSize:9, opacity:0.6, fontWeight:500 }}>{ch.subtitle}</div>
            </button>
          ))}
        </div>
      )}

      {/* Selected node panel */}
      {selected && (
        <div style={{ position:"absolute", left:24, bottom:80, background:"rgba(15,23,42,0.94)", border:`1px solid ${COLORS[selected.cat]}55`, borderRadius:16, padding:"18px 20px", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", width:260, boxShadow:`0 0 40px ${COLORS[selected.cat]}22,0 4px 24px rgba(0,0,0,0.6)`, zIndex:20, animation:"slideUp 0.2s ease" }}>
          <button onClick={() => { stRef.current.selected=null; setSelected(null); }} style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.06)", border:"none", borderRadius:6, color:"#475569", fontSize:14, width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", flexShrink:0, background:COLORS[selected.cat], boxShadow:`0 0 12px ${COLORS[selected.cat]}` }} />
            <span style={{ color:"#e2e8f0", fontSize:15, fontWeight:700, lineHeight:1.2 }}>{selected.label}</span>
          </div>
          <p style={{ color:"#64748b", fontSize:12, margin:"0 0 12px", lineHeight:1.5 }}>{selected.desc}</p>
          <div style={{ display:"inline-block", background:`${COLORS[selected.cat]}18`, border:`1px solid ${COLORS[selected.cat]}33`, borderRadius:6, padding:"3px 9px", color:COLORS[selected.cat], fontSize:10, fontWeight:700, marginBottom:14 }}>
            {CAT_NAMES[selected.cat].toUpperCase()}
          </div>
          {(CONNECTIONS.get(selected.id)??[]).length > 0 && (
            <div>
              <p style={{ color:"#334155", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 8px" }}>Connected Systems ({(CONNECTIONS.get(selected.id)??[]).length})</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {(CONNECTIONS.get(selected.id)??[]).map(cid => {
                  const cn = NODE_MAP.get(cid); if (!cn) return null;
                  return (
                    <button key={cid} onClick={() => { stRef.current.selected=cid; setSelected(cn); }} style={{ background:`${COLORS[cn.cat]}15`, border:`1px solid ${COLORS[cn.cat]}33`, borderRadius:6, padding:"3px 8px", color:COLORS[cn.cat], fontSize:10, fontWeight:600, cursor:"pointer" }}>
                      {cn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && !selected && (
        <div style={{ position:"absolute", left:tooltip.x, top:tooltip.y, background:"rgba(15,23,42,0.94)", border:`1px solid ${COLORS[tooltip.node.cat]}44`, borderRadius:12, padding:"11px 15px", pointerEvents:"none", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", maxWidth:210, zIndex:10, boxShadow:`0 0 20px ${COLORS[tooltip.node.cat]}22` }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:COLORS[tooltip.node.cat], boxShadow:`0 0 8px ${COLORS[tooltip.node.cat]}`, flexShrink:0 }} />
            <span style={{ color:"#e2e8f0", fontSize:13, fontWeight:700 }}>{tooltip.node.label}</span>
          </div>
          <p style={{ color:"#64748b", fontSize:11, margin:0, lineHeight:1.5 }}>{tooltip.node.desc}</p>
          <p style={{ color:COLORS[tooltip.node.cat], fontSize:10, margin:"6px 0 0", fontWeight:600 }}>{CAT_NAMES[tooltip.node.cat]}</p>
        </div>
      )}

      {/* Stats */}
      <div style={{ position:"absolute", bottom:28, right:24, display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end", pointerEvents:"none", userSelect:"none" }}>
        {(([["100+","Pages"],["55+","API Routes"],["90+","Components"],["15","Email Templates"],["10","Integrations"]] as const)).map(([n,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <span style={{ color:"#6366f1", fontSize:15, fontWeight:800 }}>{n}</span>
            <span style={{ color:"#1e293b", fontSize:10, fontWeight:600 }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <p style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", color:"#1e293b", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", pointerEvents:"none", userSelect:"none", margin:0 }}>
        Drag to rotate · Hover to inspect · Click to explore
      </p>

      {/* Built-with badge */}
      <div style={{ position:"absolute", bottom:24, left:24, display:"flex", alignItems:"center", gap:6, background:"rgba(15,23,42,0.70)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:8, padding:"6px 11px", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", pointerEvents:"none", userSelect:"none" }}>
        <span style={{ fontSize:10, color:"#334155", fontWeight:500 }}>Built with</span>
        <span style={{ fontSize:10, color:"#818cf8", fontWeight:700 }}>Claude Code</span>
        <span style={{ fontSize:10, color:"#334155" }}>+</span>
        <span style={{ fontSize:10, color:"#fbbf24", fontWeight:700 }}>MCP Servers</span>
      </div>

      <ChatPanel onHighlight={handleHighlight} />
      {mapReady === false && null}
    </div>
  );
}
