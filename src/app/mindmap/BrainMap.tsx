"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";

// ── Category config ──────────────────────────────────────────────────────────

type Cat = "core"|"ai"|"crm"|"email"|"ops"|"analytics"|"content"|"mcp"|"infra"|"security";

const COLORS: Record<Cat, string> = {
  core:"#e0e7ff", ai:"#a855f7", crm:"#3b82f6", email:"#06b6d4", ops:"#f59e0b",
  analytics:"#22c55e", content:"#ec4899", mcp:"#fbbf24", infra:"#f97316", security:"#ef4444",
};
const CAT_NAMES: Record<Cat, string> = {
  core:"Platform Core", ai:"AI Products", crm:"CRM & Sales", email:"Email System",
  ops:"Operations", analytics:"Analytics", content:"Content",
  mcp:"MCP Servers", infra:"Infrastructure", security:"Security",
};

// ── Node data ────────────────────────────────────────────────────────────────

interface NodeDef { id:string; label:string; cat:Cat; r:number; desc:string; x:number; y:number; z:number; }

const CLUSTERS: Record<Cat,[number,number,number]> = {
  core:[0,20,0], ai:[130,-50,30], crm:[-130,-50,30], email:[155,50,-10],
  ops:[0,-155,50], analytics:[-75,90,20], content:[-155,50,-10],
  mcp:[75,90,20], infra:[0,140,-60], security:[10,105,-125],
};

function mkRng(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s^(s>>>15),0x6c62272e)^Math.imul(s^(s<<7),0x4c957f2d))>>>0;return s/0xffffffff;};}

function buildNodes():NodeDef[]{
  const rng=mkRng(42),sp=52;
  const raw:Omit<NodeDef,"x"|"y"|"z">[]=[
    {id:"core",label:"HotBot Studios",cat:"core",r:18,desc:"AI-Native Digital Agency Platform"},
    {id:"heka",label:"Heka Voice AI",cat:"ai",r:9,desc:"24/7 AI Voice Receptionist · Sarvam AI"},
    {id:"seo-ai",label:"SEO Intelligence",cat:"ai",r:8,desc:"50+ checks · AEO + GEO + Readability"},
    {id:"ai-analyst",label:"AI Analyst",cat:"ai",r:8,desc:"Automated CRM insights via GPT-4o"},
    {id:"gpt",label:"GPT Integration",cat:"ai",r:7,desc:"OpenAI GPT-4o · Claude powered"},
    {id:"content-intel",label:"Content Intelligence",cat:"ai",r:7,desc:"Composite intelligence engine"},
    {id:"ai-detect",label:"AI Detection",cat:"ai",r:6,desc:"Heuristic AI content scoring"},
    {id:"leads",label:"Lead Pipeline",cat:"crm",r:9,desc:"7-stage: New → Qualified → Won"},
    {id:"clients",label:"Client CRM",cat:"crm",r:8,desc:"Full lifecycle management"},
    {id:"contacts",label:"Contacts",cat:"crm",r:7,desc:"Raw inbound message store"},
    {id:"callbacks",label:"Callbacks",cat:"crm",r:6,desc:"Voice callback trigger · Sarvam AI"},
    {id:"chats",label:"Live Chat",cat:"crm",r:6,desc:"RAG-powered real-time chat"},
    {id:"email-engine",label:"Email Engine",cat:"email",r:8,desc:"15 transactional templates"},
    {id:"pixel",label:"Pixel Tracking",cat:"email",r:7,desc:"1×1 GIF open tracking (in-house)"},
    {id:"click",label:"Click Tracking",cat:"email",r:6,desc:"Link wrap + redirect counter"},
    {id:"email-logs",label:"Email History",cat:"email",r:7,desc:"Per-entity open/click/bounce logs"},
    {id:"newsletter",label:"Newsletter",cat:"email",r:7,desc:"Broadcast + subscriber management"},
    {id:"invoices",label:"Invoicing",cat:"ops",r:8,desc:"PDF generation + email + tracking"},
    {id:"tickets",label:"Ticketing",cat:"ops",r:8,desc:"Support queue with SLA workflow"},
    {id:"tasks",label:"Task Manager",cat:"ops",r:7,desc:"Browser push notifications"},
    {id:"team-chat",label:"Team Chat",cat:"ops",r:6,desc:"Internal communication system"},
    {id:"analytics",label:"Analytics",cat:"analytics",r:8,desc:"Sessions · pageviews · UTM attribution"},
    {id:"journey",label:"Journey Events",cat:"analytics",r:6,desc:"Lead → Client → Invoice milestones"},
    {id:"activity",label:"Audit Log",cat:"analytics",r:6,desc:"Complete team action trail"},
    {id:"blog",label:"Blog CMS",cat:"content",r:7,desc:"TipTap editor + real-time SEO panel"},
    {id:"knowledge",label:"Knowledge Base",cat:"content",r:6,desc:"Internal articles + resources"},
    {id:"mcp-supabase",label:"Supabase MCP",cat:"mcp",r:9,desc:"Live SQL migrations via AI session"},
    {id:"mcp-github",label:"GitHub MCP",cat:"mcp",r:8,desc:"Branch · PR · code review via AI"},
    {id:"mcp-vercel",label:"Vercel MCP",cat:"mcp",r:8,desc:"Deployments + build log diagnosis"},
    {id:"mcp-n8n",label:"N8N MCP",cat:"mcp",r:7,desc:"Workflow nodes wired via AI session"},
    {id:"supabase",label:"Supabase DB",cat:"infra",r:8,desc:"PostgreSQL + RLS + Realtime"},
    {id:"vercel",label:"Vercel Edge",cat:"infra",r:7,desc:"Serverless + edge deployment"},
    {id:"n8n",label:"N8N Workflows",cat:"infra",r:8,desc:"Orchestration + RAG pipelines"},
    {id:"openai",label:"OpenAI",cat:"infra",r:7,desc:"GPT-4o + embeddings"},
    {id:"sarvam",label:"Sarvam AI",cat:"infra",r:6,desc:"Indian-language voice model"},
    {id:"resend",label:"Resend",cat:"infra",r:6,desc:"Email delivery + delivery webhooks"},
    {id:"rbac",label:"9-Role RBAC",cat:"security",r:8,desc:"super_admin → agent hierarchy"},
    {id:"sessions",label:"Session Auth",cat:"security",r:6,desc:"30-day sliding window tokens"},
    {id:"rls",label:"Row-Level Security",cat:"security",r:6,desc:"Supabase RLS + service role bypass"},
  ];
  return raw.map(n=>{
    if(n.cat==="core") return{...n,x:0,y:20,z:0};
    const[cx,cy,cz]=CLUSTERS[n.cat];
    return{...n,x:cx+(rng()-0.5)*sp*2,y:cy+(rng()-0.5)*sp*2,z:cz+(rng()-0.5)*sp*2};
  });
}

const NODES=buildNodes();
const NODE_MAP=new Map(NODES.map(n=>[n.id,n]));

const EDGES:[string,string][]=[
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

function ry(x:number,y:number,z:number,a:number):[number,number,number]{const c=Math.cos(a),s=Math.sin(a);return[x*c+z*s,y,-x*s+z*c];}
function rx(x:number,y:number,z:number,a:number):[number,number,number]{const c=Math.cos(a),s=Math.sin(a);return[x,y*c-z*s,y*s+z*c];}
function hexToRgb(hex:string){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`${r},${g},${b}`;}

interface Particle{edge:number;t:number;speed:number;color:string;rgb:string;}
interface PulseWave{nodeId:string;startTick:number;color:string;}
interface TooltipState{node:NodeDef;x:number;y:number;}

const CONNECTIONS=new Map<string,string[]>();
for(const[a,b] of EDGES){
  if(!CONNECTIONS.has(a))CONNECTIONS.set(a,[]);
  if(!CONNECTIONS.has(b))CONNECTIONS.set(b,[]);
  CONNECTIONS.get(a)!.push(b);CONNECTIONS.get(b)!.push(a);
}

const JOURNEY_CHAPTERS=[
  {title:"The First Spark",subtitle:"N8N changed everything",accent:"#f59e0b",nodes:["n8n","mcp-n8n","core"]},
  {title:"MCP Revolution",subtitle:"One AI session. Any database. Any deployment.",accent:"#fbbf24",nodes:["mcp-supabase","mcp-github","mcp-vercel","mcp-n8n","core","supabase","vercel","n8n"]},
  {title:"The Infrastructure",subtitle:"Supabase, Vercel, Resend — the backbone",accent:"#f97316",nodes:["supabase","vercel","resend","rls","sessions","core"]},
  {title:"Voice + Intelligence",subtitle:"Sarvam for voice. OpenAI for intelligence.",accent:"#a855f7",nodes:["sarvam","openai","heka","gpt","callbacks","chats","core"]},
  {title:"The Full Backdrop",subtitle:"100+ pages. 55+ routes. Built solo.",accent:"#e0e7ff",nodes:[]},
];

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes characterBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.985) translateY(2px)}}
  @keyframes dotPulse{0%,80%,100%{transform:scale(0.7);opacity:0.5}40%{transform:scale(1);opacity:1}}
  @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
  @keyframes pulseDot{0%,100%{opacity:1;box-shadow:0 0 12px #818cf8}50%{opacity:0.5;box-shadow:0 0 4px #818cf8}}
  @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scrollBounce{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}
  @keyframes spotlightPulse{0%,100%{opacity:0.35}50%{opacity:0.6}}
  @keyframes particleRise{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-220px) scale(0.2);opacity:0}}
  @keyframes flickerIn{0%{opacity:0}5%{opacity:0.8}7%{opacity:0}15%{opacity:0}17%{opacity:0.9}19%{opacity:0}70%{opacity:0}72%{opacity:0.6}75%{opacity:0}85%{opacity:0}87%{opacity:1}100%{opacity:1}}
  @keyframes sweepLine{0%{width:0;opacity:1}80%{opacity:1}100%{width:100%;opacity:0.7}}
  @keyframes chromaShift{0%,100%{text-shadow:-2px 0 #ff006666,2px 0 #0066ff66}50%{text-shadow:-4px 0 #ff006699,4px 0 #0066ff99}}
  @keyframes wordSlam{0%{transform:scale(1.8) translateY(-30px);opacity:0;filter:blur(12px)}60%{transform:scale(0.95) translateY(4px);filter:blur(0)}100%{transform:scale(1) translateY(0);opacity:1;filter:blur(0)}}
  @keyframes shockwave{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(4);opacity:0}}
  @keyframes drawPath{from{stroke-dashoffset:1200}to{stroke-dashoffset:0}}
  @keyframes neonFlicker{0%,19%,21%,23%,25%,54%,56%,100%{opacity:1}20%,22%,24%,55%{opacity:0.15}}
  @keyframes marqueeGlow{0%,100%{opacity:0.55;text-shadow:0 0 8px currentColor}50%{opacity:1;text-shadow:0 0 30px currentColor,0 0 60px currentColor}}
  @keyframes flashWhite{0%,100%{opacity:0}35%{opacity:1}70%{opacity:0.3}}
  @keyframes borderPulse{0%,100%{border-color:rgba(99,102,241,0.3)}50%{border-color:rgba(99,102,241,0.8)}}
  @keyframes impactShake{0%,100%{transform:none}20%{transform:translate(-4px,3px)}40%{transform:translate(4px,-3px)}60%{transform:translate(-3px,-4px)}80%{transform:translate(3px,4px)}}
  @keyframes swordCut{from{scaleY:0;opacity:0.8}to{scaleY:1;opacity:1}}
  @keyframes ringExpand{0%{transform:scale(0.3);opacity:0.9;border-width:3px}100%{transform:scale(3);opacity:0;border-width:1px}}
  @keyframes dealCard{0%{transform:translate(-120%,-80%) rotate(-25deg);opacity:0}100%{transform:translate(0,0) rotate(0deg);opacity:1}}
  .deal-0{animation:dealCard 0.6s 0.6s cubic-bezier(0.22,1,0.36,1) both}
  .deal-1{animation:dealCard 0.6s 0.72s cubic-bezier(0.22,1,0.36,1) both}
  .deal-2{animation:dealCard 0.6s 0.84s cubic-bezier(0.22,1,0.36,1) both}
  .deal-3{animation:dealCard 0.6s 0.96s cubic-bezier(0.22,1,0.36,1) both}
`;

// ── Spotlight cone ────────────────────────────────────────────────────────────

function SpotlightCone({color="#f59e0b",x=50,angle=24,opacity=0.45}:{color?:string;x?:number;angle?:number;opacity?:number}){
  return(
    <div style={{position:"absolute",top:0,left:`${x}%`,transform:"translateX(-50%)",width:900,height:"100%",
      background:`conic-gradient(from 180deg at 50% 0%, transparent 0deg, ${color}12 ${90-angle/2}deg, ${color}22 90deg, ${color}12 ${90+angle/2}deg, transparent 180deg)`,
      filter:"blur(24px)",pointerEvents:"none",animation:"spotlightPulse 4s ease-in-out infinite",opacity}}/>
  );
}

// ── Theatre particles ─────────────────────────────────────────────────────────

function TheatreParticles({count=35,color="#f59e0b"}:{count?:number;color?:string}){
  const items=useMemo(()=>Array.from({length:count},(_,i)=>({
    left:(i*37+13)%100, bottom:(i*19+7)%40,
    delay:(i*0.28)%3.5, dur:2.5+(i*0.41)%2.5,
    size:1+(i*0.31)%2, op:0.25+(i*0.06)%0.55,
  })),[count]);
  return(
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
      {items.map((p,i)=>(
        <div key={i} style={{position:"absolute",left:`${p.left}%`,bottom:`${p.bottom}%`,
          width:p.size,height:p.size,borderRadius:"50%",background:color,opacity:p.op,
          animation:`particleRise ${p.dur}s ${p.delay}s ease-out infinite`}}/>
      ))}
    </div>
  );
}

// ── Shockwave ring ────────────────────────────────────────────────────────────

function ShockwaveRing({color="#a855f7",size=200}:{color?:string;size?:number}){
  return(
    <div style={{position:"absolute",width:size,height:size,borderRadius:"50%",
      border:`3px solid ${color}`,animation:"ringExpand 0.8s ease-out forwards",pointerEvents:"none"}}/>
  );
}

// ── Marquee title (bulb lights) ───────────────────────────────────────────────

function MarqueeTitle({text,color="#f59e0b"}:{text:string;color?:string}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.02em",flexWrap:"wrap"}}>
      {text.split("").map((ch,i)=>(
        <span key={i} style={{color,fontSize:"clamp(32px,5.5vw,72px)",fontWeight:900,letterSpacing:"-0.01em",
          animation:`marqueeGlow ${0.6+Math.random()*0.8}s ${i*0.04}s ease-in-out infinite`,display:"inline-block",
          textShadow:`0 0 20px ${color}88`}}>
          {ch===" "?"  ":ch}
        </span>
      ))}
    </div>
  );
}

// ── Word slam reveal ──────────────────────────────────────────────────────────

function WordSlam({words,inView,baseDelay=0.1}:{words:string[];inView:boolean;baseDelay?:number}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      {words.map((word,i)=>(
        <div key={word} style={{overflow:"hidden",position:"relative"}}>
          {/* flash behind word */}
          {inView&&(
            <motion.div initial={{opacity:0}} animate={{opacity:[0,0.15,0]}}
              transition={{duration:0.3,delay:baseDelay+i*0.25}}
              style={{position:"absolute",inset:"-20%",background:"white",borderRadius:8,zIndex:0}}/>
          )}
          <motion.div
            initial={{y:"110%",opacity:0}}
            animate={inView?{y:"0%",opacity:1}:{y:"110%",opacity:0}}
            transition={{duration:0.55,delay:baseDelay+i*0.22,ease:[0.22,1,0.36,1]}}
            style={{position:"relative",zIndex:1,
              fontSize:"clamp(56px,9.5vw,130px)",fontWeight:900,lineHeight:0.95,
              letterSpacing:"-0.02em",whiteSpace:"nowrap",
              color:i===1?"#6366f1":"white",
              filter:i===words.length-1?"none":"none",
            }}>
            {word}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

// ── Character SVG ─────────────────────────────────────────────────────────────

function HarshCharacter({pose,scale=1}:{pose:"normal"|"thinking"|"excited"|"pointing";scale?:number}){
  return(
    <svg viewBox="0 0 160 250" xmlns="http://www.w3.org/2000/svg"
      style={{width:160*scale,height:250*scale,animation:"characterBreathe 3s ease-in-out infinite",flexShrink:0}}>
      <rect x="42" y="148" width="76" height="80" rx="8" fill="#374151"/>
      <polygon points="80,155 60,148 55,200 72,200" fill="#1f2937"/>
      <polygon points="80,155 100,148 105,200 88,200" fill="#1f2937"/>
      <rect x="74" y="148" width="12" height="52" fill="#f1f5f9"/>
      <polygon points="80,152 76,160 78,195 80,200 82,195 84,160" fill="#0d9488"/>
      {pose==="normal"&&(<><rect x="24" y="150" width="18" height="55" rx="9" fill="#374151"/><ellipse cx="33" cy="208" rx="9" ry="8" fill="#c4855a"/><rect x="118" y="150" width="18" height="55" rx="9" fill="#374151"/><ellipse cx="127" cy="208" rx="9" ry="8" fill="#c4855a"/></>)}
      {pose==="thinking"&&(<><rect x="24" y="150" width="18" height="55" rx="9" fill="#374151"/><ellipse cx="33" cy="208" rx="9" ry="8" fill="#c4855a"/><path d="M118,152 C130,152 138,145 135,128 C132,118 125,118 122,122" stroke="#374151" strokeWidth="18" fill="none" strokeLinecap="round"/><ellipse cx="121" cy="122" rx="9" ry="8" fill="#c4855a"/></>)}
      {pose==="excited"&&(<><path d="M42,155 C30,145 22,130 26,112 C28,105 35,104 40,108" stroke="#374151" strokeWidth="18" fill="none" strokeLinecap="round"/><ellipse cx="40" cy="108" rx="9" ry="8" fill="#c4855a"/><path d="M118,155 C130,145 138,130 134,112 C132,105 125,104 120,108" stroke="#374151" strokeWidth="18" fill="none" strokeLinecap="round"/><ellipse cx="120" cy="108" rx="9" ry="8" fill="#c4855a"/></>)}
      {pose==="pointing"&&(<><rect x="24" y="150" width="18" height="55" rx="9" fill="#374151"/><ellipse cx="33" cy="208" rx="9" ry="8" fill="#c4855a"/><path d="M118,155 C126,150 136,148 148,148" stroke="#374151" strokeWidth="16" fill="none" strokeLinecap="round"/><ellipse cx="150" cy="148" rx="8" ry="7" fill="#c4855a"/><rect x="154" y="145" width="14" height="6" rx="3" fill="#c4855a"/></>)}
      <rect x="71" y="130" width="18" height="22" rx="6" fill="#c4855a"/>
      <ellipse cx="80" cy="118" rx="32" ry="34" fill="#c4855a"/>
      <path d="M54,126 C52,138 56,148 68,152 C74,154 86,154 92,152 C104,148 108,138 106,126 C100,130 92,133 80,133 C68,133 60,130 54,126Z" fill="#2d1a0e" opacity="0.85"/>
      <ellipse cx="68" cy="113" rx="7" ry="7.5" fill="white"/><ellipse cx="69" cy="113" rx="4" ry="4.5" fill="#1a0a00"/><ellipse cx="70" cy="111" rx="1.5" ry="1.5" fill="white"/>
      <ellipse cx="92" cy="113" rx="7" ry="7.5" fill="white"/><ellipse cx="93" cy="113" rx="4" ry="4.5" fill="#1a0a00"/><ellipse cx="94" cy="111" rx="1.5" ry="1.5" fill="white"/>
      <path d="M62,106 C65,103 73,103 76,105" stroke="#2d1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M84,105 C87,103 95,103 98,106" stroke="#2d1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {pose==="excited"?<path d="M70,128 C73,134 87,134 90,128" stroke="#2d1a0e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>:<path d="M71,128 C74,131 86,131 89,128" stroke="#2d1a0e" strokeWidth="2" fill="none" strokeLinecap="round"/>}
      <ellipse cx="80" cy="90" rx="38" ry="32" fill="#6b1a1a"/>
      <ellipse cx="80" cy="76" rx="30" ry="24" fill="#7a1e1e"/>
      <ellipse cx="80" cy="65" rx="22" ry="16" fill="#8b2222"/>
      <path d="M44,98 C52,92 68,88 80,88 C92,88 108,92 116,98" stroke="#5a1515" strokeWidth="2.5" fill="none" opacity="0.7"/>
      <path d="M46,91 C54,85 68,82 80,82 C92,82 106,85 114,91" stroke="#5a1515" strokeWidth="2" fill="none" opacity="0.6"/>
      <ellipse cx="80" cy="98" rx="11" ry="8" fill="#7a1e1e"/>
      <ellipse cx="80" cy="98" rx="7" ry="5" fill="#8b2222"/>
      <ellipse cx="80" cy="98" rx="4" ry="3" fill="#9b2626"/>
      <path d="M62,72 C68,67 75,65 80,65" stroke="rgba(255,180,180,0.2)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M64,148 L72,148 L75,155 L80,152 L85,155 L88,148 L96,148 L90,143 L80,140 L70,143 Z" fill="#f1f5f9"/>
    </svg>
  );
}

// ── Phone mockup ──────────────────────────────────────────────────────────────

function PhoneMockup(){
  return(
    <svg viewBox="0 0 140 240" width="140" height="240" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="5" width="120" height="230" rx="18" fill="#1e1b2e" stroke="#4c1d95" strokeWidth="2"/>
      <rect x="16" y="20" width="108" height="200" rx="10" fill="#0d0b1a"/>
      <rect x="50" y="12" width="40" height="8" rx="4" fill="#4c1d95"/>
      <rect x="22" y="55" width="96" height="70" rx="8" fill="#2d1b69" stroke="#7c3aed" strokeWidth="1"/>
      <rect x="28" y="62" width="40" height="12" rx="3" fill="#7c3aed"/>
      <text x="48" y="72" textAnchor="middle" fill="white" fontSize="6" fontWeight="700">SABUDH</text>
      <text x="30" y="84" fill="#c4b5fd" fontSize="7" fontWeight="600">Free AI Workshop:</text>
      <text x="30" y="95" fill="#c4b5fd" fontSize="7">Basics to Automation</text>
      <text x="30" y="108" fill="#7c3aed" fontSize="6">Tap to register →</text>
      <rect x="22" y="140" width="50" height="8" rx="4" fill="#1e1b2e"/>
      <rect x="22" y="155" width="80" height="8" rx="4" fill="#1e1b2e"/>
      <rect x="22" y="170" width="60" height="8" rx="4" fill="#1e1b2e"/>
    </svg>
  );
}

// ── Editorial bottom strip ────────────────────────────────────────────────────

function Strip({label,text,inView,delay=1.3}:{label:string;text:string;inView:boolean;delay?:number}){
  return(
    <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{opacity:0,y:20}}
      transition={{duration:0.6,delay}}
      style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",gap:0,
        borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.65)",
        backdropFilter:"blur(12px)"}}>
      <div style={{background:"rgba(255,255,255,0.04)",padding:"10px 20px",borderRight:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
        <span style={{color:"#334155",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase"}}>{label}</span>
      </div>
      <div style={{padding:"10px 20px",flex:1}}>
        <span style={{color:"#64748b",fontSize:11,fontWeight:500,fontStyle:"italic"}}>{text}</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 0: THE CURTAIN OPENS
// ─────────────────────────────────────────────────────────────────────────────

function Scene0({onSkip}:{onSkip:()=>void}){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      {/* Spotlight */}
      <SpotlightCone color="#f59e0b" x={50} angle={30} opacity={0.5}/>
      {/* Particles */}
      <TheatreParticles count={40} color="#f59e0b"/>
      {/* Vignette */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 40%,transparent 35%,rgba(0,0,0,0.7) 100%)",pointerEvents:"none",zIndex:1}}/>

      {/* Skip */}
      <button onClick={onSkip} style={{position:"absolute",top:20,right:24,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 16px",color:"#334155",fontSize:11,fontWeight:600,cursor:"pointer",zIndex:20}}>
        Skip →
      </button>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0,zIndex:2,textAlign:"center",padding:"0 8%"}}>
        {/* Pre-label */}
        <motion.div initial={{opacity:0,letterSpacing:"0.5em"}} animate={inView?{opacity:1,letterSpacing:"0.25em"}:{opacity:0,letterSpacing:"0.5em"}}
          transition={{duration:1.4,delay:0.1}}
          style={{color:"#3d2a00",fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:32}}>
          Case Study · 2024–2025 · India
        </motion.div>

        {/* HARSHPREET */}
        <div style={{overflow:"hidden",marginBottom:4}}>
          <motion.h1 initial={{y:"110%"}} animate={inView?{y:"0%"}:{y:"110%"}}
            transition={{duration:0.9,delay:0.35,ease:[0.22,1,0.36,1]}}
            style={{fontSize:"clamp(56px,11vw,148px)",fontWeight:900,letterSpacing:"-0.03em",color:"white",margin:0,lineHeight:0.92,
              animation:inView?"flickerIn 1.4s 0.35s both":"none",
              textShadow:"0 0 60px rgba(245,158,11,0.15)"}}>
            HARSHPREET
          </motion.h1>
        </div>
        {/* SINGH */}
        <div style={{overflow:"hidden",marginBottom:24}}>
          <motion.h1 initial={{y:"110%"}} animate={inView?{y:"0%"}:{y:"110%"}}
            transition={{duration:0.9,delay:0.5,ease:[0.22,1,0.36,1]}}
            style={{fontSize:"clamp(56px,11vw,148px)",fontWeight:900,letterSpacing:"-0.03em",color:"#f59e0b",margin:0,lineHeight:0.92,
              textShadow:"0 0 40px rgba(245,158,11,0.4)"}}>
            SINGH
          </motion.h1>
        </div>

        {/* Gold sweep line */}
        <div style={{width:"80%",maxWidth:640,height:1,background:"rgba(245,158,11,0.15)",marginBottom:24,overflow:"hidden",position:"relative"}}>
          {inView&&<motion.div initial={{width:0,opacity:0}} animate={{width:"100%",opacity:1}}
            transition={{duration:1.2,delay:0.9,ease:[0.22,1,0.36,1]}}
            style={{position:"absolute",top:0,left:0,height:"100%",background:"linear-gradient(90deg,transparent,#f59e0b,transparent)"}}/>}
        </div>

        {/* Role */}
        <motion.div initial={{opacity:0,y:16}} animate={inView?{opacity:1,y:0}:{opacity:0,y:16}}
          transition={{duration:0.7,delay:1.05}}
          style={{color:"#6b4f00",fontSize:"clamp(12px,1.8vw,18px)",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>
          Founder · AI Engineer · Full-Stack Developer
        </motion.div>

        {/* Tagline */}
        <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}}
          transition={{duration:0.8,delay:1.2}}
          style={{fontSize:"clamp(12px,1.6vw,16px)",fontStyle:"italic",margin:"0 0 36px",maxWidth:500,lineHeight:1.75,color:"#78502a"}}>
          &ldquo;From a Sabudh Foundation notification to a 100-page,<br/>production-grade AI platform — in 90 days. Solo.&rdquo;
        </motion.p>

        {/* Stat pills */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:48}}>
          {[["90","Days"],["100+","Pages"],["Claude Code","Built With"],["MCP","Servers"]].map(([v,l],i)=>(
            <motion.div key={l} initial={{opacity:0,y:20,scale:0.8}} animate={inView?{opacity:1,y:0,scale:1}:{opacity:0,y:20,scale:0.8}}
              transition={{delay:1.3+i*0.07,type:"spring",stiffness:220,damping:20}}
              style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 16px",textAlign:"center"}}>
              <div style={{color:"#f59e0b",fontSize:14,fontWeight:800}}>{v}</div>
              <div style={{color:"#3d2800",fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase"}}>{l}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div initial={{opacity:0}} animate={inView?{opacity:0.4}:{opacity:0}}
        transition={{delay:1.7}}
        style={{position:"absolute",bottom:24,left:"50%",color:"#6b4f00",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",animation:"scrollBounce 2s ease-in-out infinite",zIndex:2}}>
        ↓ scroll
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1: THE SPARK
// ─────────────────────────────────────────────────────────────────────────────

function Scene1({onSkip}:{onSkip:()=>void}){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",
      background:"radial-gradient(ellipse at 50% 30%,#1a0845 0%,#0c0624 40%,#060310 100%)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <SpotlightCone color="#7c3aed" x={50} angle={28} opacity={0.4}/>
      <TheatreParticles count={25} color="#a855f7"/>

      <button onClick={onSkip} style={{position:"absolute",top:20,right:24,background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"7px 16px",color:"#334155",fontSize:11,fontWeight:600,cursor:"pointer",zIndex:20}}>Skip →</button>

      {/* Grid lines (subtle) */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>

      <div style={{display:"flex",alignItems:"center",gap:80,padding:"0 8%",width:"100%",justifyContent:"center",zIndex:2}}>
        {/* Character */}
        <motion.div initial={{x:-120,opacity:0}} animate={inView?{x:0,opacity:1}:{x:-120,opacity:0}}
          transition={{duration:0.9,delay:0.3,type:"spring",stiffness:100,damping:18}}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          {/* Speech bubble */}
          <motion.div initial={{opacity:0,scale:0.6}} animate={inView?{opacity:1,scale:1}:{opacity:0,scale:0.6}}
            transition={{duration:0.5,delay:0.8,type:"spring",stiffness:200,damping:20}}
            style={{background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.35)",borderRadius:16,padding:"14px 20px",maxWidth:260,color:"#e2e8f0",fontSize:14,lineHeight:1.65,marginBottom:10,position:"relative",boxShadow:"0 0 40px rgba(124,58,237,0.15)"}}>
            <span style={{color:"#c4b5fd"}}>AI classes? This could be a </span>
            <em style={{color:"#a855f7",fontStyle:"normal",fontWeight:700}}>marketing goldmine</em>
            <span style={{color:"#c4b5fd"}}> for HotBot Studios...</span>
            <div style={{position:"absolute",bottom:-8,left:32,width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"8px solid rgba(124,58,237,0.35)"}}/>
          </motion.div>
          <HarshCharacter pose="normal" scale={1.1}/>
        </motion.div>

        {/* Phone — drops from above with glow */}
        <motion.div initial={{y:-160,opacity:0,rotate:-8}} animate={inView?{y:0,opacity:1,rotate:0}:{y:-160,opacity:0,rotate:-8}}
          transition={{duration:0.8,delay:0.45,type:"spring",stiffness:150,damping:18}}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{animation:"floatY 4s ease-in-out infinite",filter:"drop-shadow(0 0 40px rgba(124,58,237,0.6))"}}>
            <PhoneMockup/>
          </div>
          {/* Glow ring under phone */}
          <motion.div initial={{opacity:0,scale:0}} animate={inView?{opacity:1,scale:1}:{opacity:0,scale:0}}
            transition={{delay:0.9,type:"spring"}}
            style={{width:100,height:12,borderRadius:"50%",background:"rgba(124,58,237,0.3)",filter:"blur(8px)"}}/>
          <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}}
            transition={{delay:1.0}}
            style={{background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"7px 14px",color:"#c4b5fd",fontSize:11,fontWeight:600}}>
            🔔 Sabudh Foundation · Free AI Workshop
          </motion.div>
        </motion.div>
      </div>

      {/* Chapter tag */}
      <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}}
        transition={{delay:0.1}}
        style={{position:"absolute",top:24,left:28,color:"#2d1860",fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase"}}>
        Act I
      </motion.div>

      <Strip label="Insight" text="AI education events = untapped B2B lead pools. One notification. One spark." inView={inView} delay={1.3}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2: THE QUESTION
// ─────────────────────────────────────────────────────────────────────────────

function Scene2(){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});
  const [showShock,setShowShock]=useState(false);

  useEffect(()=>{
    if(inView){const t=setTimeout(()=>setShowShock(true),700);return()=>clearTimeout(t);}
    setShowShock(false);
  },[inView]);

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",
      background:"#020617",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24}}>
      <SpotlightCone color="#4f46e5" x={50} angle={40} opacity={0.3}/>

      {/* Act tag */}
      <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:0.05}}
        style={{position:"absolute",top:24,left:28,color:"#1e1b4b",fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase"}}>
        Act II
      </motion.div>

      {/* Shockwave */}
      <AnimatePresence>
        {showShock&&<div style={{position:"absolute",top:"45%",left:"50%",transform:"translate(-50%,-50%)",zIndex:0}}><ShockwaveRing color="#6366f1" size={300}/></div>}
      </AnimatePresence>

      {/* Main text */}
      <div style={{zIndex:2,textAlign:"center"}}>
        <WordSlam words={["WHAT'S","THE LOSS","AFTERALL?"]} inView={inView} baseDelay={0.15}/>
      </div>

      {/* Character + thought bubble */}
      <div style={{display:"flex",alignItems:"flex-end",gap:20,zIndex:2}}>
        <motion.div initial={{opacity:0,y:40}} animate={inView?{opacity:1,y:0}:{opacity:0,y:40}}
          transition={{duration:0.7,delay:1.0}}>
          <HarshCharacter pose="thinking" scale={0.72}/>
        </motion.div>
        <motion.div initial={{opacity:0,scale:0.6}} animate={inView?{opacity:1,scale:1}:{opacity:0,scale:0.6}}
          transition={{delay:1.2,type:"spring",stiffness:200,damping:20}}
          style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:18,padding:"16px 20px",display:"flex",flexWrap:"wrap",gap:8,maxWidth:200}}>
          {["🤖 N8N","✨ Claude","🎙 Sarvam","💡 OpenAI"].map((t,i)=>(
            <motion.span key={t} initial={{opacity:0,scale:0.4}} animate={inView?{opacity:1,scale:1}:{opacity:0,scale:0.4}}
              transition={{delay:1.3+i*0.08}}
              style={{background:"rgba(99,102,241,0.18)",border:"1px solid rgba(99,102,241,0.35)",borderRadius:8,padding:"5px 10px",color:"#a5b4fc",fontSize:11,fontWeight:700}}>
              {t}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <Strip label="Decision" text="Ship it. Learn fast. Automate everything. At worst — some business cards. At best — a platform." inView={inView} delay={1.6}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3: THE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function Scene3(){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});

  const wNodes=[
    {label:"TRIGGER",x:60, y:95,color:"#f59e0b"},
    {label:"AI NODE",x:195,y:95,color:"#a855f7"},
    {label:"EMAIL",  x:330,y:55,color:"#06b6d4"},
    {label:"CRM",    x:330,y:135,color:"#3b82f6"},
    {label:"DONE",   x:460,y:95,color:"#22c55e"},
  ];

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",
      background:"linear-gradient(160deg,#010f04 0%,#020c02 50%,#000 100%)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <SpotlightCone color="#22c55e" x={50} angle={35} opacity={0.35}/>
      <TheatreParticles count={20} color="#22c55e"/>

      <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:0.05}}
        style={{position:"absolute",top:24,left:28,color:"#052010",fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase"}}>
        Act III
      </motion.div>

      <div style={{display:"flex",alignItems:"center",gap:40,padding:"0 6%",width:"100%",justifyContent:"center",zIndex:2}}>
        <div style={{display:"flex",flexDirection:"column",gap:20,flex:1,maxWidth:560}}>
          {/* Title */}
          <div style={{overflow:"hidden"}}>
            <motion.div initial={{y:"-110%"}} animate={inView?{y:"0%"}:{y:"-110%"}}
              transition={{duration:0.75,delay:0.15,ease:[0.22,1,0.36,1]}}
              style={{fontSize:"clamp(40px,6.5vw,80px)",fontWeight:900,letterSpacing:"0.04em",color:"#22c55e",
                textShadow:"0 0 40px rgba(34,197,94,0.5)",lineHeight:1}}>
              AUTOMATION
            </motion.div>
          </div>
          <motion.div initial={{opacity:0,x:-20}} animate={inView?{opacity:1,x:0}:{opacity:0,x:-20}}
            transition={{delay:0.35}}
            style={{color:"#14532d",fontSize:12,fontWeight:600,fontStyle:"italic"}}>
            Week 1: 12 automated workflows. Zero manual hand-offs.
          </motion.div>

          {/* Circuit board */}
          <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:0.5,duration:0.6}}
            style={{background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.12)",borderRadius:16,padding:"24px",position:"relative"}}>
            <svg viewBox="0 0 560 190" width="100%" height="auto" style={{overflow:"visible"}}>
              {inView&&(<>
                <path d="M115,95 L165,95" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="120" style={{animation:"drawPath 0.5s 0.7s ease-out forwards",strokeDashoffset:120}}/>
                <path d="M250,95 L305,55" stroke="#a855f7" strokeWidth="2.5" fill="none" strokeDasharray="150" style={{animation:"drawPath 0.5s 1.0s ease-out forwards",strokeDashoffset:150}}/>
                <path d="M250,95 L305,135" stroke="#a855f7" strokeWidth="2.5" fill="none" strokeDasharray="150" style={{animation:"drawPath 0.5s 1.1s ease-out forwards",strokeDashoffset:150}}/>
                <path d="M385,55 L435,95"  stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeDasharray="130" style={{animation:"drawPath 0.5s 1.3s ease-out forwards",strokeDashoffset:130}}/>
                <path d="M385,135 L435,95" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeDasharray="130" style={{animation:"drawPath 0.5s 1.3s ease-out forwards",strokeDashoffset:130}}/>
                {/* Arrow tips */}
                {([[165,95,"#f59e0b"],[305,55,"#a855f7"],[305,135,"#a855f7"],[435,95,"#22c55e"]] as [number,number,string][]).map(([x,y,c],i)=>(
                  <polygon key={i} points={`${x-8},${y-5} ${x},${y} ${x-8},${y+5}`} fill={c} style={{opacity:0,animation:`fadeIn 0.3s ${0.9+i*0.18}s forwards`}}/>
                ))}
              </>)}
              {wNodes.map((n,i)=>(
                <g key={n.label}>
                  <rect x={n.x} y={n.y-20} width="80" height="40" rx="6" fill={`${n.color}18`} stroke={n.color} strokeWidth="1.5"
                    style={{opacity:0,animation:`fadeIn 0.4s ${0.55+i*0.12}s forwards`}}/>
                  {/* Glow rect */}
                  <rect x={n.x-2} y={n.y-22} width="84" height="44" rx="7" fill="none" stroke={`${n.color}44`} strokeWidth="4"
                    style={{opacity:0,animation:`fadeIn 0.4s ${0.6+i*0.12}s forwards`,filter:`blur(3px)`}}/>
                  <text x={n.x+40} y={n.y+6} textAnchor="middle" fill={n.color} fontSize="9.5" fontWeight="800"
                    style={{opacity:0,animation:`fadeIn 0.4s ${0.65+i*0.12}s forwards`}}>{n.label}</text>
                </g>
              ))}
            </svg>
          </motion.div>
        </div>

        {/* Character */}
        <motion.div initial={{opacity:0,x:60}} animate={inView?{opacity:1,x:0}:{opacity:0,x:60}}
          transition={{duration:0.8,delay:0.5,type:"spring",stiffness:100,damping:16}}
          style={{flexShrink:0}}>
          <HarshCharacter pose="pointing" scale={1.1}/>
        </motion.div>
      </div>

      <Strip label="Tech" text="N8N orchestrated 12+ automated pipelines in week 1. CRM → Email → AI → WhatsApp. Fully wired." inView={inView} delay={1.7}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4: THE REVOLUTION
// ─────────────────────────────────────────────────────────────────────────────

function Scene4(){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});
  const [shock,setShock]=useState(false);

  useEffect(()=>{
    if(inView){const t=setTimeout(()=>setShock(true),450);return()=>clearTimeout(t);}
    setShock(false);
  },[inView]);

  const cards=[
    {name:"Supabase MCP",icon:"🗄",color:"#22c55e",from:"top-left"},
    {name:"GitHub MCP",  icon:"📦",color:"#60a5fa",from:"top-right"},
    {name:"Vercel MCP",  icon:"🚀",color:"#f97316",from:"bottom-left"},
    {name:"N8N MCP",     icon:"⚡",color:"#fbbf24",from:"bottom-right"},
  ];

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",
      background:"radial-gradient(ellipse at 50% 45%,#1a0035 0%,#0c0018 40%,#000 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <SpotlightCone color="#a855f7" x={50} angle={32} opacity={0.45}/>
      <TheatreParticles count={30} color="#a855f7"/>

      <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:0.05}}
        style={{position:"absolute",top:24,left:28,color:"#200035",fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase"}}>
        Act IV
      </motion.div>

      {/* Shockwave on title collision */}
      <AnimatePresence>
        {shock&&<div style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",zIndex:0}}><ShockwaveRing color="#a855f7" size={400}/></div>}
      </AnimatePresence>
      {shock&&<div style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",zIndex:0}}><ShockwaveRing color="#6d28d9" size={250}/></div>}

      {/* Title crash */}
      <div style={{textAlign:"center",zIndex:2,position:"relative"}}>
        <div style={{overflow:"hidden"}}>
          <motion.div initial={{y:"-200%",scale:1.6,opacity:0,filter:"blur(16px)"}}
            animate={inView?{y:"0%",scale:1,opacity:1,filter:"blur(0px)"}:{y:"-200%",scale:1.6,opacity:0,filter:"blur(16px)"}}
            transition={{type:"spring",stiffness:220,damping:18,delay:0.1}}
            style={{fontSize:"clamp(50px,8.5vw,108px)",fontWeight:900,letterSpacing:"0.04em",color:"white",lineHeight:1,
              animation:inView?"impactShake 0.4s 0.5s ease-out":"none"}}>
            THE MCP
          </motion.div>
        </div>
        <div style={{overflow:"hidden"}}>
          <motion.div initial={{y:"200%",scale:1.6,opacity:0,filter:"blur(16px)"}}
            animate={inView?{y:"0%",scale:1,opacity:1,filter:"blur(0px)"}:{y:"200%",scale:1.6,opacity:0,filter:"blur(16px)"}}
            transition={{type:"spring",stiffness:220,damping:18,delay:0.2}}
            style={{fontSize:"clamp(50px,8.5vw,108px)",fontWeight:900,letterSpacing:"0.04em",color:"#a855f7",lineHeight:1,
              textShadow:"0 0 60px #a855f7",
              animation:inView?"impactShake 0.4s 0.6s ease-out":"none"}}>
            REVOLUTION
          </motion.div>
        </div>
      </div>

      {/* Cards — dealt like playing cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,zIndex:2}}>
        {cards.map((c,i)=>(
          <div key={c.name} className={`deal-${i}`}
            style={{background:`${c.color}10`,border:`1px solid ${c.color}44`,borderRadius:14,padding:"16px 20px",
              color:c.color,fontSize:12,fontWeight:700,textAlign:"center",minWidth:130,
              boxShadow:`0 0 28px ${c.color}22`,opacity:0}}>
            <div style={{fontSize:20,marginBottom:6}}>{c.icon}</div>
            {c.name}
          </div>
        ))}
      </div>

      {/* Character */}
      <motion.div initial={{opacity:0,y:60}} animate={inView?{opacity:1,y:0}:{opacity:0,y:60}}
        transition={{duration:0.7,delay:1.0,type:"spring",stiffness:120}}
        style={{zIndex:2}}>
        <HarshCharacter pose="excited" scale={0.8}/>
      </motion.div>

      <Strip label="Breakthrough" text="MCP servers → AI session to live schema change to deployed PR. Iteration time: minutes, not days." inView={inView} delay={1.4}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5: THE DUEL
// ─────────────────────────────────────────────────────────────────────────────

function Scene5(){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",
      background:"#040008",display:"flex",alignItems:"stretch"}}>

      <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:0.05}}
        style={{position:"absolute",top:24,left:28,color:"#1a0028",fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",zIndex:20}}>
        Act V
      </motion.div>

      {/* Left — Sarvam */}
      <motion.div initial={{x:"-100%"}} animate={inView?{x:"0%"}:{x:"-100%"}}
        transition={{duration:0.85,delay:0.1,ease:[0.22,1,0.36,1]}}
        style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"40px 32px 80px",
          background:"linear-gradient(135deg,#1e1b4b 0%,#0c0a20 100%)",clipPath:"polygon(0 0,100% 0,82% 100%,0 100%)"}}>
        <motion.div initial={{opacity:0,y:-24}} animate={inView?{opacity:1,y:0}:{opacity:0,y:-24}}
          transition={{delay:0.5}} style={{color:"#a855f7",fontSize:"clamp(18px,3vw,30px)",fontWeight:900,letterSpacing:"0.1em"}}>
          SARVAM AI
        </motion.div>
        <div style={{animation:"floatY 3s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(168,85,247,0.5))"}}>
          <svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
            {[4,8,16,24,32,20,28,14,22,10,18,6].map((h,i)=>(
              <rect key={i} x={5+i*9} y={(40-h)/2} width="5" height={h} rx="2.5" fill="#a855f7" opacity={0.5+(h/64)}/>
            ))}
          </svg>
        </div>
        {["🎙 Voice STT · TTS","🌐 11 Indian Languages","🤖 Heka Voice Agent","📞 Callbacks Automated"].map((t,i)=>(
          <motion.div key={t} initial={{opacity:0,x:-20}} animate={inView?{opacity:1,x:0}:{opacity:0,x:-20}}
            transition={{delay:0.6+i*0.09}} style={{color:"#c4b5fd",fontSize:11,fontWeight:600}}>
            {t}
          </motion.div>
        ))}
        <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#4c1d95,#7c3aed)",border:"2px solid #a855f733",display:"flex",alignItems:"center",justifyContent:"center",color:"#e9d5ff",fontSize:22,boxShadow:"0 0 30px rgba(168,85,247,0.4)"}}>
          🎙
        </div>
      </motion.div>

      {/* Sword cut divider — animates scaleY top→bottom */}
      <motion.div initial={{scaleY:0,opacity:0}} animate={inView?{scaleY:1,opacity:1}:{scaleY:0,opacity:0}}
        transition={{duration:0.7,delay:0.3,ease:[0.22,1,0.36,1]}}
        style={{position:"absolute",left:"50%",top:0,bottom:80,width:2,transformOrigin:"top",
          background:"linear-gradient(to bottom,transparent,#818cf8,#a855f7,#818cf8,rgba(255,255,255,0.5),#818cf8,transparent)",
          boxShadow:"0 0 20px #818cf899,0 0 60px #818cf844",zIndex:10}}>
        {/* Flash at the tip */}
        <motion.div initial={{opacity:0}} animate={inView?{opacity:[0,1,0]}:{opacity:0}}
          transition={{delay:1.0,duration:0.4}}
          style={{position:"absolute",bottom:0,left:"-20px",width:40,height:40,borderRadius:"50%",
            background:"radial-gradient(circle,white 0%,transparent 70%)",filter:"blur(4px)"}}/>
      </motion.div>

      {/* Center character */}
      <div style={{position:"absolute",left:"50%",bottom:80,transform:"translateX(-50%)",zIndex:15,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <motion.div initial={{opacity:0,scale:0.7}} animate={inView?{opacity:1,scale:1}:{opacity:0,scale:0.7}}
          transition={{delay:0.9,type:"spring",stiffness:180,damping:20}}
          style={{background:"rgba(129,140,248,0.1)",border:"1px solid rgba(129,140,248,0.28)",borderRadius:14,padding:"10px 18px",maxWidth:220,color:"#e2e8f0",fontSize:11,lineHeight:1.65,textAlign:"center"}}>
          Sarvam for voice. OpenAI for intelligence.<br/>
          <em style={{color:"#818cf8",fontStyle:"normal",fontWeight:700}}>HotBot got both.</em>
        </motion.div>
        <motion.div initial={{opacity:0,y:40}} animate={inView?{opacity:1,y:0}:{opacity:0,y:40}}
          transition={{delay:0.7,type:"spring",stiffness:100}}>
          <HarshCharacter pose="pointing" scale={0.8}/>
        </motion.div>
      </div>

      {/* Right — OpenAI */}
      <motion.div initial={{x:"100%"}} animate={inView?{x:"0%"}:{x:"100%"}}
        transition={{duration:0.85,delay:0.15,ease:[0.22,1,0.36,1]}}
        style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"40px 32px 80px",
          background:"linear-gradient(225deg,#0c2040 0%,#04090f 100%)",clipPath:"polygon(18% 0,100% 0,100% 100%,0 100%)"}}>
        <motion.div initial={{opacity:0,y:-24}} animate={inView?{opacity:1,y:0}:{opacity:0,y:-24}}
          transition={{delay:0.55}} style={{color:"#60a5fa",fontSize:"clamp(18px,3vw,30px)",fontWeight:900,letterSpacing:"0.1em"}}>
          OPENAI
        </motion.div>
        <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#1e3a5f,#0c1d2e)",border:"2px solid #60a5fa33",display:"flex",alignItems:"center",justifyContent:"center",color:"#60a5fa",fontSize:26,fontWeight:900,animation:"floatY 3.5s 0.5s ease-in-out infinite",boxShadow:"0 0 30px rgba(96,165,250,0.3)"}}>⬡</div>
        {["🧠 GPT-4o Intelligence","🔍 Embeddings + Vision","📝 Content Generation","🤖 AI Analyst Insights"].map((t,i)=>(
          <motion.div key={t} initial={{opacity:0,x:20}} animate={inView?{opacity:1,x:0}:{opacity:0,x:20}}
            transition={{delay:0.65+i*0.09}} style={{color:"#bfdbfe",fontSize:11,fontWeight:600}}>
            {t}
          </motion.div>
        ))}
      </motion.div>

      <Strip label="Stack" text="Sarvam for voice (11 Indian languages). OpenAI for intelligence. Zero vendor lock-in. Dual-engine AI." inView={inView} delay={1.1}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 6: THE FINALE
// ─────────────────────────────────────────────────────────────────────────────

function Scene6({onEnterMap}:{onEnterMap:()=>void}){
  const ref=useRef<HTMLDivElement>(null);
  const inView=useInView(ref,{once:false,amount:0.4});

  const stats=[
    {label:"100+",sub:"Pages",          tx:"-100px",ty:"-90px", delay:0.10,color:"#6366f1"},
    {label:"55+", sub:"API Routes",     tx:"100px", ty:"-90px", delay:0.16,color:"#a855f7"},
    {label:"90+", sub:"Components",     tx:"-120px",ty:"0",     delay:0.22,color:"#06b6d4"},
    {label:"15",  sub:"Email Templates",tx:"120px", ty:"0",     delay:0.28,color:"#22c55e"},
    {label:"10",  sub:"Integrations",   tx:"-100px",ty:"90px",  delay:0.34,color:"#f59e0b"},
    {label:"50",  sub:"Platform Nodes", tx:"100px", ty:"90px",  delay:0.40,color:"#ec4899"},
  ];

  return(
    <div ref={ref} style={{height:"100vh",scrollSnapAlign:"start",flexShrink:0,position:"relative",overflow:"hidden",
      background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <SpotlightCone color="#f59e0b" x={50} angle={50} opacity={0.3}/>
      <TheatreParticles count={45} color="#f59e0b"/>

      {/* Flash */}
      {inView&&<div style={{position:"absolute",inset:0,background:"white",animation:"flashWhite 1.1s 1.5s ease-in-out forwards",opacity:0,pointerEvents:"none",zIndex:20}}/>}

      <motion.div initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:0.05}}
        style={{position:"absolute",top:24,left:28,color:"#3d2800",fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase"}}>
        Finale
      </motion.div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,zIndex:2}}>
        {stats.map(s=>(
          <motion.div key={s.label}
            initial={{opacity:0,x:parseFloat(s.tx),y:parseFloat(s.ty),scale:0.3}}
            animate={inView?{opacity:1,x:0,y:0,scale:1}:{opacity:0,x:parseFloat(s.tx),y:parseFloat(s.ty),scale:0.3}}
            transition={{type:"spring",stiffness:220,damping:18,delay:s.delay}}
            style={{background:`${s.color}0d`,border:`1px solid ${s.color}33`,borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
            <div style={{color:s.color,fontSize:22,fontWeight:900,lineHeight:1.1}}>{s.label}</div>
            <div style={{color:"#334155",fontSize:9,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Character */}
      <motion.div initial={{opacity:0,y:40}} animate={inView?{opacity:1,y:0}:{opacity:0,y:40}}
        transition={{duration:0.7,delay:0.55,type:"spring",stiffness:120}} style={{zIndex:2}}>
        <HarshCharacter pose="excited" scale={0.8}/>
      </motion.div>

      {/* Marquee title */}
      <motion.div initial={{opacity:0,scale:0.85}} animate={inView?{opacity:1,scale:1}:{opacity:0,scale:0.85}}
        transition={{duration:0.8,delay:0.8}} style={{zIndex:2,textAlign:"center"}}>
        <MarqueeTitle text="HOTBOT STUDIOS" color="#f59e0b"/>
        <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{opacity:0}} transition={{delay:1.1}}
          style={{color:"#3d2800",fontSize:11,fontStyle:"italic",marginTop:6,fontWeight:600}}>
          Built solo. Powered by Claude Code + MCP Servers. 90 days.
        </motion.p>
      </motion.div>

      {/* CTAs */}
      <motion.div initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{opacity:0,y:20}}
        transition={{duration:0.6,delay:1.1}}
        style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",zIndex:2}}>
        <motion.button onClick={onEnterMap}
          whileHover={{scale:1.05,boxShadow:"0 0 50px rgba(99,102,241,0.5)"}} whileTap={{scale:0.97}}
          style={{background:"linear-gradient(135deg,rgba(99,102,241,0.22),rgba(99,102,241,0.06))",border:"1.5px solid rgba(99,102,241,0.55)",borderRadius:12,padding:"12px 24px",color:"#818cf8",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.03em",animation:"borderPulse 2.5s ease-in-out infinite"}}>
          Explore The Architecture →
        </motion.button>
        <motion.a href="https://wa.me/919700001534" target="_blank" rel="noopener noreferrer"
          whileHover={{scale:1.05}} whileTap={{scale:0.97}}
          style={{background:"rgba(34,197,94,0.08)",border:"1.5px solid rgba(34,197,94,0.35)",borderRadius:12,padding:"12px 24px",color:"#4ade80",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.03em",textDecoration:"none",display:"flex",alignItems:"center",gap:7}}>
          💬 Book a Call
        </motion.a>
        <motion.a href="https://linkedin.com/in/harshpreetsingh" target="_blank" rel="noopener noreferrer"
          whileHover={{scale:1.05}} whileTap={{scale:0.97}}
          style={{background:"rgba(59,130,246,0.08)",border:"1.5px solid rgba(59,130,246,0.35)",borderRadius:12,padding:"12px 24px",color:"#60a5fa",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.03em",textDecoration:"none",display:"flex",alignItems:"center",gap:7}}>
          🔗 LinkedIn
        </motion.a>
      </motion.div>

      <Strip label="Result" text="Solo-built. 100+ pages. 55+ API routes. Production-grade. 90 days. This is what obsession looks like." inView={inView} delay={1.35}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage{role:"user"|"assistant";text:string;}

function ChatPanel({onHighlight}:{onHighlight:(ids:string[])=>void}){
  const[open,setOpen]=useState(false);
  const[messages,setMessages]=useState<ChatMessage[]>([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[recording,setRecording]=useState(false);
  const mediaRef=useRef<MediaRecorder|null>(null);
  const chunksRef=useRef<Blob[]>([]);
  const bottomRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  function parseHighlight(text:string):{clean:string;ids:string[]}{
    const match=text.match(/\[highlight:([\w,\-]+)\]/);
    if(!match) return{clean:text.trim(),ids:[]};
    return{clean:text.replace(match[0],"").trim(),ids:match[1].split(",").map(s=>s.trim()).filter(Boolean)};
  }

  async function sendText(){
    const q=input.trim();if(!q||loading)return;
    setInput("");
    setMessages(prev=>[...prev,{role:"user",text:q}]);
    setLoading(true);
    try{
      const res=await fetch("/api/mindmap/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history:messages.slice(-8).map(m=>({role:m.role,content:m.text}))})});
      const data=await res.json();
      const raw=data.reply??data.answer??data.text??"...";
      const{clean,ids}=parseHighlight(raw);
      setMessages(prev=>[...prev,{role:"assistant",text:clean}]);
      if(ids.length)onHighlight(ids);
    }catch{setMessages(prev=>[...prev,{role:"assistant",text:"Error reaching the server."}]);}
    finally{setLoading(false);}
  }

  async function toggleRecording(){
    if(recording){mediaRef.current?.stop();setRecording(false);return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mr=new MediaRecorder(stream);
      chunksRef.current=[];
      mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
      mr.onstop=async()=>{
        stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunksRef.current,{type:"audio/webm"});
        setLoading(true);setMessages(prev=>[...prev,{role:"user",text:"🎙 [Voice message]"}]);
        try{
          const fd=new FormData();fd.append("audio",blob,"voice.webm");
          const sttRes=await fetch("/api/sarvam/stt",{method:"POST",body:fd});
          const{transcript}=await sttRes.json();
          if(transcript){
            const askRes=await fetch("/api/mindmap/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:transcript})});
            const data=await askRes.json();
            const raw=data.reply??data.answer??data.text??"...";
            const{clean,ids}=parseHighlight(raw);
            setMessages(prev=>[...prev,{role:"assistant",text:clean}]);
            if(ids.length)onHighlight(ids);
          }
        }catch{setMessages(prev=>[...prev,{role:"assistant",text:"Voice error."}]);}
        finally{setLoading(false);}
      };
      mr.start();mediaRef.current=mr;setRecording(true);
    }catch{alert("Microphone access denied.");}
  }

  if(!open)return(
    <button onClick={()=>setOpen(true)} style={{position:"fixed",right:20,bottom:80,background:"rgba(15,23,42,0.92)",border:"1px solid #6366f155",borderRadius:14,padding:"10px 18px",color:"#818cf8",fontSize:13,fontWeight:700,cursor:"pointer",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",boxShadow:"0 4px 24px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",gap:8,zIndex:50}}>
      💬 Ask HotBot AI
    </button>
  );

  return(
    <div style={{position:"fixed",right:16,bottom:16,width:340,height:480,background:"rgba(9,11,20,0.97)",border:"1px solid #6366f133",borderRadius:18,display:"flex",flexDirection:"column",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",boxShadow:"0 8px 48px rgba(0,0,0,0.7)",zIndex:50,overflow:"hidden",animation:"slideUp 0.3s both"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #1e293b",background:"rgba(15,23,42,0.8)"}}>
        <div><span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>HotBot AI</span><div style={{color:"#475569",fontSize:10,marginTop:2}}>⌨ OpenAI · 🎙 Sarvam</div></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"#475569",fontSize:18,cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
        {messages.length===0&&<div style={{color:"#334155",fontSize:12,textAlign:"center",marginTop:20}}>Ask me anything about HotBot Studios architecture.</div>}
        {messages.map((m,i)=>(
          <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",background:m.role==="user"?"rgba(99,102,241,0.18)":"rgba(30,41,59,0.8)",border:m.role==="user"?"1px solid #6366f133":"1px solid #1e293b",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 14px",maxWidth:"85%",color:"#e2e8f0",fontSize:13,lineHeight:1.6,animation:"slideUp 0.2s both"}}>{m.text}</div>
        ))}
        {loading&&<div style={{alignSelf:"flex-start",display:"flex",gap:4,padding:"10px 14px"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#6366f1",animation:`dotPulse 1.4s ${i*0.2}s infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"10px 12px",borderTop:"1px solid #1e293b",display:"flex",gap:8}}>
        <button onClick={toggleRecording} style={{background:recording?"rgba(239,68,68,0.2)":"rgba(99,102,241,0.12)",border:recording?"1px solid #ef444455":"1px solid #6366f133",borderRadius:10,width:38,height:38,cursor:"pointer",color:recording?"#ef4444":"#818cf8",fontSize:16,flexShrink:0,animation:recording?"micPulse 1s infinite":"none"}} title={recording?"Stop":"Voice"}>🎙</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendText();}} placeholder="Ask about the architecture..." style={{flex:1,background:"rgba(15,23,42,0.8)",border:"1px solid #1e293b",borderRadius:10,padding:"0 12px",color:"#e2e8f0",fontSize:13,outline:"none"}}/>
        <button onClick={sendText} disabled={!input.trim()||loading} style={{background:"rgba(99,102,241,0.2)",border:"1px solid #6366f133",borderRadius:10,width:38,height:38,cursor:"pointer",color:"#818cf8",fontSize:16,flexShrink:0,opacity:(!input.trim()||loading)?0.4:1}}>↑</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BrainMap(){
  const[phase,setPhase]=useState<"story"|"map">("story");

  const canvasRef=useRef<HTMLCanvasElement>(null);
  const stRef=useRef({ry:0.3,rx:0.15,velY:0.0008,velX:0,dragging:false,lastX:0,lastY:0,hovered:null as string|null,selected:null as string|null,tick:0,particles:[] as Particle[],pulseWaves:[] as PulseWave[],W:0,H:0,didDrag:false,journeyActive:false,journeyChapter:0,highlightedNodes:null as string[]|null,highlightTick:0});
  const rafRef=useRef<number>(0);
  const[tooltip,setTooltip]=useState<TooltipState|null>(null);
  const[selected,setSelected]=useState<NodeDef|null>(null);
  const[mapReady,setMapReady]=useState(false);
  const[journeyActive,setJourneyActive]=useState(false);
  const[journeyChapter,setJourneyChapter]=useState(0);

  const enterMap=useCallback(()=>setPhase("map"),[]);

  const handleHighlight=useCallback((ids:string[])=>{
    stRef.current.highlightedNodes=ids;stRef.current.highlightTick=stRef.current.tick;
    for(const id of ids){const node=NODE_MAP.get(id);if(node)stRef.current.pulseWaves.push({nodeId:id,startTick:stRef.current.tick,color:COLORS[node.cat]});}
    setTimeout(()=>{stRef.current.highlightedNodes=null;},5000);
  },[]);

  const toggleJourney=useCallback(()=>{const next=!journeyActive;setJourneyActive(next);stRef.current.journeyActive=next;if(next){setJourneyChapter(0);stRef.current.journeyChapter=0;}},[journeyActive]);
  const setChapter=useCallback((i:number)=>{setJourneyChapter(i);stRef.current.journeyChapter=i;},[]);

  // Canvas
  useEffect(()=>{
    if(phase!=="map")return;
    const canvas=canvasRef.current!,ctx=canvas.getContext("2d")!,dpr=window.devicePixelRatio||1,st=stRef.current;
    function resize(){st.W=window.innerWidth;st.H=window.innerHeight;canvas.width=st.W*dpr;canvas.height=st.H*dpr;canvas.style.width=st.W+"px";canvas.style.height=st.H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);}
    resize();window.addEventListener("resize",resize);
    const rng2=mkRng(99);st.particles=[];
    for(let i=0;i<70;i++){const ei=Math.floor(rng2()*EDGES.length);const fromId=EDGES[ei][0];const c=COLORS[NODE_MAP.get(fromId)?.cat??"core"];st.particles.push({edge:ei,t:rng2(),speed:0.0007+rng2()*0.0009,color:c,rgb:hexToRgb(c)});}
    const stars:{x:number;y:number;r:number;a:number}[]=[],srng=mkRng(777);
    for(let i=0;i<180;i++)stars.push({x:srng()*2-1,y:srng()*2-1,r:srng()*1.2,a:srng()*0.25+0.05});
    const FOV=420;
    function proj(x:number,y:number,z:number,W:number,H:number):[number,number,number]{const scale=FOV/(z+FOV);return[W/2+x*scale,H/2+y*scale,scale];}
    function projNode(n:NodeDef,W:number,H:number):[number,number,number,number]{let[vx,vy,vz]=ry(n.x,n.y,n.z,st.ry);[vx,vy,vz]=rx(vx,vy,vz,st.rx);const[sx,sy,sc]=proj(vx,vy,vz,W,H);return[sx,sy,sc,vz];}
    function draw(){
      const{W,H,tick,hovered,particles,pulseWaves}=st;const cx=W/2,cy=H/2;
      const journeyNodes:Set<string>|null=st.journeyActive?(JOURNEY_CHAPTERS[st.journeyChapter].nodes.length===0?null:new Set(JOURNEY_CHAPTERS[st.journeyChapter].nodes)):null;
      const journeyAccent=st.journeyActive?JOURNEY_CHAPTERS[st.journeyChapter].accent:null;
      const chatHighlight:Set<string>|null=st.highlightedNodes?new Set(st.highlightedNodes):null;
      ctx.fillStyle="#020617";ctx.fillRect(0,0,W,H);
      for(const s of stars){ctx.beginPath();ctx.arc(s.x*W+cx,s.y*H+cy,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(148,163,184,${s.a})`;ctx.fill();}
      const ng=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.42);
      ng.addColorStop(0,"rgba(79,70,229,0.10)");ng.addColorStop(0.5,"rgba(139,92,246,0.05)");ng.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=ng;ctx.fillRect(0,0,W,H);
      for(const[cat,[ccx,ccy,ccz]] of Object.entries(CLUSTERS) as [Cat,[number,number,number]][]){
        if(cat==="core")continue;let[vx,vy,vz]=ry(ccx,ccy,ccz,st.ry);[vx,vy,vz]=rx(vx,vy,vz,st.rx);
        const[sx,sy]=proj(vx,vy,vz,W,H);const depth=(vz+250)/500;if(depth<0.1)continue;
        const gr=ctx.createRadialGradient(sx,sy,0,sx,sy,90);const rgb=hexToRgb(COLORS[cat]);
        gr.addColorStop(0,`rgba(${rgb},${0.07*depth})`);gr.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle=gr;ctx.fillRect(sx-90,sy-90,180,180);
      }
      const pMap=new Map<string,[number,number,number,number]>();
      for(const n of NODES)pMap.set(n.id,projNode(n,W,H));
      const activeId=st.selected??hovered;const connSet=new Set<string>();
      if(activeId)for(const id of(CONNECTIONS.get(activeId)??[]))connSet.add(id);
      for(const[a,b] of EDGES){
        const pa=pMap.get(a),pb=pMap.get(b);if(!pa||!pb)continue;
        const isHl=activeId&&(a===activeId||b===activeId);const avgZ=(pa[3]+pb[3])/2;const depth=Math.max(0,(avgZ+250)/500);
        const jDim=journeyNodes?!(journeyNodes.has(a)&&journeyNodes.has(b)):false;
        if(isHl){const activeNode=activeId?NODE_MAP.get(activeId):undefined;const rgb=hexToRgb(COLORS[activeNode?.cat??"core"]);ctx.beginPath();ctx.moveTo(pa[0],pa[1]);ctx.lineTo(pb[0],pb[1]);ctx.strokeStyle=`rgba(${rgb},0.75)`;ctx.lineWidth=1.2;ctx.stroke();}
        else{const dimmed=!!activeId||jDim;const alpha=dimmed?Math.max(0.01,Math.min(0.05,depth*0.06)):Math.max(0.02,Math.min(0.14,depth*0.18));ctx.beginPath();ctx.moveTo(pa[0],pa[1]);ctx.lineTo(pb[0],pb[1]);ctx.strokeStyle=`rgba(148,163,184,${alpha})`;ctx.lineWidth=0.4;ctx.stroke();}
      }
      for(const p of particles){
        const[a,b]=EDGES[p.edge];const pa=pMap.get(a),pb=pMap.get(b);if(!pa||!pb)continue;
        const px=pa[0]+(pb[0]-pa[0])*p.t,py=pa[1]+(pb[1]-pa[1])*p.t,pz=pa[3]+(pb[3]-pa[3])*p.t;
        const depth=Math.max(0,(pz+250)/500);if(depth<0.12){p.t=(p.t+p.speed)%1;continue;}
        const alpha=Math.min(1,depth*1.4);const gr=ctx.createRadialGradient(px,py,0,px,py,3.5);
        gr.addColorStop(0,`rgba(${p.rgb},${alpha})`);gr.addColorStop(1,`rgba(${p.rgb},0)`);
        ctx.fillStyle=gr;ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fill();p.t=(p.t+p.speed)%1;
      }
      const livePulses:PulseWave[]=[];
      for(const pw of pulseWaves){const age=tick-pw.startTick;if(age>120)continue;livePulses.push(pw);const p=pMap.get(pw.nodeId);if(!p)continue;const[sx,sy]=p;const progress=age/120,radius=20+progress*60,alpha=(1-progress)*0.5;const rgb=hexToRgb(pw.color);ctx.beginPath();ctx.arc(sx,sy,radius,0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=2;ctx.stroke();}
      st.pulseWaves=livePulses;
      const sorted=[...NODES].sort((a,b)=>(pMap.get(a.id)?.[3]??0)-(pMap.get(b.id)?.[3]??0));
      for(const n of sorted){
        const p=pMap.get(n.id);if(!p)continue;const[sx,sy,sc,vz]=p;const depth=Math.max(0,(vz+250)/500);
        const isHov=n.id===hovered&&!st.selected,isSel=n.id===st.selected,isConn=connSet.has(n.id);
        const inJourney=journeyNodes?journeyNodes.has(n.id):true,jDimNode=journeyNodes?!inJourney:false;
        const inChatHl=chatHighlight?chatHighlight.has(n.id):false;
        const isDim=(!!activeId&&!isSel&&!isConn&&n.id!==activeId)||jDimNode;
        const pulse=n.cat==="core"?1+Math.sin(tick*0.04)*0.14:1;const baseR=n.r*sc*pulse;
        const radius=baseR*(isSel?1.6:isHov?1.4:isConn?1.1:inChatHl?1.5:1);
        const color=inJourney&&journeyAccent?journeyAccent:(inChatHl?"#e0e7ff":COLORS[n.cat]);const rgb=hexToRgb(color);
        const alpha=isDim?Math.max(0.03,depth*0.15):Math.max(0.2,depth);
        const glowR=radius*(isHov?5.5:inChatHl?7:isConn?4:3),glowA=isHov?0.55:inChatHl?0.7:isConn?0.3:0.15;
        const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,glowR);glow.addColorStop(0,`rgba(${rgb},${glowA*alpha})`);glow.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,glowR,0,Math.PI*2);ctx.fill();
        const sGrad=ctx.createRadialGradient(sx-radius*0.32,sy-radius*0.32,0,sx,sy,radius);
        sGrad.addColorStop(0,`rgba(${rgb},${alpha})`);sGrad.addColorStop(0.55,`rgba(${rgb},${alpha*0.75})`);sGrad.addColorStop(1,`rgba(${rgb},${alpha*0.25})`);
        ctx.fillStyle=sGrad;ctx.beginPath();ctx.arc(sx,sy,radius,0,Math.PI*2);ctx.fill();
        if(depth>0.45){const glint=ctx.createRadialGradient(sx-radius*0.35,sy-radius*0.35,0,sx-radius*0.35,sy-radius*0.35,radius*0.45);glint.addColorStop(0,`rgba(255,255,255,${depth*0.45})`);glint.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=glint;ctx.beginPath();ctx.arc(sx,sy,radius,0,Math.PI*2);ctx.fill();}
        if(isHov||isSel||inChatHl){if(isSel){ctx.save();ctx.setLineDash([6,4]);ctx.lineDashOffset=-(tick*0.5%10);}ctx.beginPath();ctx.arc(sx,sy,radius+(isSel?6:inChatHl?8:4),0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${isSel?0.9:inChatHl?0.8:0.7})`;ctx.lineWidth=isSel?1.5:inChatHl?2:1;ctx.stroke();if(isSel)ctx.restore();}
        const showLabel=depth>0.50||isHov||isConn||isSel||inChatHl||inJourney;
        if(showLabel){const sz=Math.max(9,Math.min(13,9+depth*6));ctx.font=`${isSel||isHov||inChatHl?"700 ":isConn||inJourney?"600 ":""}${sz}px 'Plus Jakarta Sans',system-ui,sans-serif`;ctx.textAlign="center";ctx.globalAlpha=Math.min(1,alpha*1.3);ctx.fillStyle="rgba(2,6,23,0.9)";ctx.fillText(n.label,sx+1,sy+radius+14);ctx.fillStyle=n.cat==="core"?"#ffffff":`rgba(203,213,225,${Math.min(1,alpha*1.3)})`;ctx.fillText(n.label,sx,sy+radius+13);ctx.globalAlpha=1;}
      }
      st.tick++;
      if(!st.dragging){st.velY+=(0.0008-st.velY)*0.018;st.velX*=0.94;st.rx+=st.velX;st.rx=Math.max(-0.55,Math.min(0.55,st.rx));}
      st.ry+=st.velY;rafRef.current=requestAnimationFrame(draw);
    }
    rafRef.current=requestAnimationFrame(draw);setMapReady(true);
    function hitTest(mx:number,my:number):NodeDef|null{const{W,H}=st;let best:NodeDef|null=null,bestDist=32;for(const n of NODES){const[sx,sy,sc]=projNode(n,W,H);const dist=Math.hypot(mx-sx,my-sy),hit=Math.max(14,n.r*sc*1.8);if(dist<hit&&dist<bestDist){bestDist=dist;best=n;}}return best;}
    function onMouseMove(e:MouseEvent){if(st.dragging){const dx=e.clientX-st.lastX,dy=e.clientY-st.lastY;if(Math.abs(dx)>2||Math.abs(dy)>2)st.didDrag=true;st.velY=dx*0.003;st.velX=dy*0.003;st.ry+=dx*0.004;st.rx+=dy*0.004;st.rx=Math.max(-0.6,Math.min(0.6,st.rx));st.lastX=e.clientX;st.lastY=e.clientY;st.hovered=null;setTooltip(null);}else{const hit=hitTest(e.clientX,e.clientY);st.hovered=hit?.id??null;canvas.style.cursor=hit?"pointer":"grab";if(hit&&!st.selected){setTooltip({node:hit,x:Math.min(e.clientX+18,st.W-230),y:Math.min(e.clientY-12,st.H-110)});}else{setTooltip(null);}}}
    function onMouseDown(e:MouseEvent){st.dragging=true;st.didDrag=false;st.lastX=e.clientX;st.lastY=e.clientY;canvas.style.cursor="grabbing";}
    function onMouseUp(e:MouseEvent){st.dragging=false;canvas.style.cursor="grab";if(st.didDrag)return;const hit=hitTest(e.clientX,e.clientY);if(hit){if(st.selected===hit.id){st.selected=null;setSelected(null);}else{st.selected=hit.id;setSelected(hit);setTooltip(null);}}else{st.selected=null;setSelected(null);}}
    let lx=0,ly=0;
    function onTouchStart(e:TouchEvent){e.preventDefault();st.dragging=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;}
    function onTouchMove(e:TouchEvent){e.preventDefault();const dx=e.touches[0].clientX-lx,dy=e.touches[0].clientY-ly;st.ry+=dx*0.004;st.rx+=dy*0.004;st.rx=Math.max(-0.6,Math.min(0.6,st.rx));lx=e.touches[0].clientX;ly=e.touches[0].clientY;}
    function onTouchEnd(){st.dragging=false;}
    canvas.addEventListener("mousemove",onMouseMove);canvas.addEventListener("mousedown",onMouseDown);canvas.addEventListener("mouseup",onMouseUp);canvas.addEventListener("mouseleave",onMouseUp);
    canvas.addEventListener("touchstart",onTouchStart,{passive:false});canvas.addEventListener("touchmove",onTouchMove,{passive:false});canvas.addEventListener("touchend",onTouchEnd);
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener("resize",resize);canvas.removeEventListener("mousemove",onMouseMove);canvas.removeEventListener("mousedown",onMouseDown);canvas.removeEventListener("mouseup",onMouseUp);canvas.removeEventListener("mouseleave",onMouseUp);canvas.removeEventListener("touchstart",onTouchStart);canvas.removeEventListener("touchmove",onTouchMove);canvas.removeEventListener("touchend",onTouchEnd);};
  },[phase]);

  // ── Story phase ─────────────────────────────────────────────────────────────

  if(phase==="story"){
    return(
      <div style={{position:"fixed",inset:0,overflowY:"scroll",scrollSnapType:"y mandatory"}}>
        <style>{CSS}</style>
        <div style={{display:"flex",flexDirection:"column"}}>
          <Scene0 onSkip={enterMap}/>
          <Scene1 onSkip={enterMap}/>
          <Scene2/>
          <Scene3/>
          <Scene4/>
          <Scene5/>
          <Scene6 onEnterMap={enterMap}/>
        </div>
      </div>
    );
  }

  // ── Map phase ────────────────────────────────────────────────────────────────

  return(
    <div style={{position:"fixed",inset:0,background:"#020617",overflow:"hidden"}}>
      <style>{CSS}</style>
      <canvas ref={canvasRef} style={{display:"block",cursor:"grab"}}/>

      <div style={{position:"absolute",top:24,left:28,pointerEvents:"none",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#818cf8",boxShadow:"0 0 10px #818cf8",display:"inline-block",animation:"pulseDot 2s infinite"}}/>
          <span style={{color:"#6366f1",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Platform Architecture</span>
        </div>
        <h1 style={{color:"#e0e7ff",fontSize:24,fontWeight:800,margin:0,lineHeight:1.15}}>HotBot Studios</h1>
        <p style={{color:"#334155",fontSize:11,margin:"5px 0 0",fontWeight:500}}>AI-Native Digital Agency · Built with Claude + MCP Servers</p>
      </div>

      <button onClick={()=>setPhase("story")} style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",background:"rgba(15,23,42,0.8)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"7px 16px",color:"#6366f1",fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:"0.06em",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:20}}>
        ← Origin Story
      </button>
      <button onClick={toggleJourney} style={{position:"absolute",top:20,left:"50%",transform:"translateX(calc(-50% + 110px))",background:journeyActive?"rgba(99,102,241,0.25)":"rgba(15,23,42,0.8)",border:`1px solid ${journeyActive?"#6366f1":"rgba(99,102,241,0.2)"}`,borderRadius:8,padding:"7px 16px",color:journeyActive?"#818cf8":"#6366f1",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:20}}>
        {journeyActive?"⏹ Stop Journey":"▶ Play The Journey"}
      </button>

      <div style={{position:"absolute",top:20,right:20,background:"rgba(15,23,42,0.80)",border:"1px solid rgba(99,102,241,0.18)",borderRadius:14,padding:"12px 16px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",pointerEvents:"none",userSelect:"none"}}>
        <p style={{color:"#475569",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 9px"}}>Systems</p>
        {(Object.entries(CAT_NAMES) as [Cat,string][]).map(([cat,label])=>(
          <div key={cat} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:COLORS[cat],boxShadow:`0 0 7px ${COLORS[cat]}99`,flexShrink:0}}/>
            <span style={{color:"#64748b",fontSize:11}}>{label}</span>
          </div>
        ))}
      </div>

      {journeyActive&&(
        <div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",display:"flex",gap:12,zIndex:30,animation:"slideUp 0.3s both"}}>
          {JOURNEY_CHAPTERS.map((ch,i)=>(
            <button key={i} onClick={()=>setChapter(i)} style={{background:journeyChapter===i?`${ch.accent}22`:"rgba(15,23,42,0.85)",border:`1px solid ${journeyChapter===i?ch.accent:ch.accent+"44"}`,borderRadius:12,padding:"12px 16px",color:journeyChapter===i?ch.accent:"#475569",fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"left",minWidth:110,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",transition:"all 0.2s",boxShadow:journeyChapter===i?`0 0 20px ${ch.accent}33`:"none"}}>
              <div style={{fontSize:10,opacity:0.6,marginBottom:4}}>{String(i+1).padStart(2,"0")}</div>
              <div style={{lineHeight:1.3,marginBottom:2}}>{ch.title}</div>
              <div style={{fontSize:9,opacity:0.6,fontWeight:500}}>{ch.subtitle}</div>
            </button>
          ))}
        </div>
      )}

      {selected&&(
        <div style={{position:"absolute",left:24,bottom:80,background:"rgba(15,23,42,0.94)",border:`1px solid ${COLORS[selected.cat]}55`,borderRadius:16,padding:"18px 20px",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",width:260,boxShadow:`0 0 40px ${COLORS[selected.cat]}22,0 4px 24px rgba(0,0,0,0.6)`,zIndex:20,animation:"slideUp 0.2s ease"}}>
          <button onClick={()=>{stRef.current.selected=null;setSelected(null);}} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.06)",border:"none",borderRadius:6,color:"#475569",fontSize:14,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,background:COLORS[selected.cat],boxShadow:`0 0 12px ${COLORS[selected.cat]}`}}/>
            <span style={{color:"#e2e8f0",fontSize:15,fontWeight:700,lineHeight:1.2}}>{selected.label}</span>
          </div>
          <p style={{color:"#64748b",fontSize:12,margin:"0 0 12px",lineHeight:1.5}}>{selected.desc}</p>
          <div style={{display:"inline-block",background:`${COLORS[selected.cat]}18`,border:`1px solid ${COLORS[selected.cat]}33`,borderRadius:6,padding:"3px 9px",color:COLORS[selected.cat],fontSize:10,fontWeight:700,marginBottom:14}}>{CAT_NAMES[selected.cat].toUpperCase()}</div>
          {(CONNECTIONS.get(selected.id)??[]).length>0&&(
            <div>
              <p style={{color:"#334155",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 8px"}}>Connected Systems ({(CONNECTIONS.get(selected.id)??[]).length})</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {(CONNECTIONS.get(selected.id)??[]).map(cid=>{const cn=NODE_MAP.get(cid);if(!cn)return null;return(<button key={cid} onClick={()=>{stRef.current.selected=cid;setSelected(cn);}} style={{background:`${COLORS[cn.cat]}15`,border:`1px solid ${COLORS[cn.cat]}33`,borderRadius:6,padding:"3px 8px",color:COLORS[cn.cat],fontSize:10,fontWeight:600,cursor:"pointer"}}>{cn.label}</button>);})}
              </div>
            </div>
          )}
        </div>
      )}

      {tooltip&&!selected&&(
        <div style={{position:"absolute",left:tooltip.x,top:tooltip.y,background:"rgba(15,23,42,0.94)",border:`1px solid ${COLORS[tooltip.node.cat]}44`,borderRadius:12,padding:"11px 15px",pointerEvents:"none",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",maxWidth:210,zIndex:10,boxShadow:`0 0 20px ${COLORS[tooltip.node.cat]}22`}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:COLORS[tooltip.node.cat],boxShadow:`0 0 8px ${COLORS[tooltip.node.cat]}`,flexShrink:0}}/>
            <span style={{color:"#e2e8f0",fontSize:13,fontWeight:700}}>{tooltip.node.label}</span>
          </div>
          <p style={{color:"#64748b",fontSize:11,margin:0,lineHeight:1.5}}>{tooltip.node.desc}</p>
          <p style={{color:COLORS[tooltip.node.cat],fontSize:10,margin:"6px 0 0",fontWeight:600}}>{CAT_NAMES[tooltip.node.cat]}</p>
        </div>
      )}

      <div style={{position:"absolute",bottom:28,right:24,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",pointerEvents:"none",userSelect:"none"}}>
        {(([["100+","Pages"],["55+","API Routes"],["90+","Components"],["15","Email Templates"],["10","Integrations"]] as const)).map(([n,l])=>(
          <div key={l} style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{color:"#6366f1",fontSize:15,fontWeight:800}}>{n}</span>
            <span style={{color:"#1e293b",fontSize:10,fontWeight:600}}>{l}</span>
          </div>
        ))}
      </div>

      <p style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",color:"#1e293b",fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",pointerEvents:"none",userSelect:"none",margin:0}}>
        Drag to rotate · Hover to inspect · Click to explore
      </p>
      <div style={{position:"absolute",bottom:24,left:24,display:"flex",alignItems:"center",gap:6,background:"rgba(15,23,42,0.70)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:8,padding:"6px 11px",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",pointerEvents:"none",userSelect:"none"}}>
        <span style={{fontSize:10,color:"#334155",fontWeight:500}}>Built with</span>
        <span style={{fontSize:10,color:"#818cf8",fontWeight:700}}>Claude Code</span>
        <span style={{fontSize:10,color:"#334155"}}>+</span>
        <span style={{fontSize:10,color:"#fbbf24",fontWeight:700}}>MCP Servers</span>
      </div>

      <ChatPanel onHighlight={handleHighlight}/>
      {mapReady===false&&null}
    </div>
  );
}
