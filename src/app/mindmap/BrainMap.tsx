"use client";

import { useRef, useState, useEffect, useCallback } from "react";

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

// ── Brain silhouette mask ─────────────────────────────────────────────────────
// Lateral left-hemisphere view: cerebrum + cerebellum + brain stem
// viewBox 0 0 220 240

const BRAIN_PATH_MAIN =
  "M110,16 C90,8 65,14 48,30 C30,48 20,72 22,98 "+
  "C14,114 12,136 20,156 C30,176 50,188 72,188 "+
  "C80,198 92,208 110,210 C128,208 140,198 148,188 "+
  "C170,188 190,176 200,156 C208,136 206,114 198,98 "+
  "C200,72 190,48 172,30 C155,14 130,8 110,16 Z";

const BRAIN_PATH_CEREBELLUM =
  "M148,188 C162,192 178,198 184,214 "+
  "C190,228 180,240 166,242 C150,244 136,234 130,218 "+
  "C124,202 132,190 148,188 Z";

const BRAIN_PATH_STEM =
  "M110,210 C108,224 106,238 102,248 "+
  "C99,255 92,258 86,254 C80,250 78,242 82,234 "+
  "C86,224 97,214 110,210 Z";

const _brainSVG =
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 260'>` +
  `<path fill='white' d='${BRAIN_PATH_MAIN}'/>` +
  `<path fill='white' d='${BRAIN_PATH_CEREBELLUM}'/>` +
  `<path fill='white' d='${BRAIN_PATH_STEM}'/>` +
  `</svg>`;

const BRAIN_MASK_URL = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(_brainSVG)}")`;

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes dotPulse{0%,80%,100%{transform:scale(0.7);opacity:0.5}40%{transform:scale(1);opacity:1}}
  @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
  @keyframes pulseDot{0%,100%{opacity:1;box-shadow:0 0 12px #818cf8}50%{opacity:0.5;box-shadow:0 0 4px #818cf8}}
  @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes brainPulse{0%,100%{opacity:0.55;filter:drop-shadow(0 0 6px #6366f1) drop-shadow(0 0 12px #4f46e5)}50%{opacity:0.85;filter:drop-shadow(0 0 14px #818cf8) drop-shadow(0 0 28px #6366f1)}}
  @keyframes synapseGlow{0%,100%{opacity:0.18}50%{opacity:0.42}}
`;

// ── Chat panel ────────────────────────────────────────────────────────────────

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

// ── Brain glow outline SVG ────────────────────────────────────────────────────

function BrainOutline(){
  return(
    <svg
      viewBox="0 0 220 260"
      style={{
        position:"fixed",
        width:"56vmin",
        height:"auto",
        top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        pointerEvents:"none",
        zIndex:2,
        overflow:"visible",
        animation:"brainPulse 4s ease-in-out infinite",
      }}
    >
      <defs>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="outerGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.38 0 0 0 0 0.40 0 0 0 0 0.98 0 0 0 0.5 0" in="blur"/>
        </filter>
      </defs>
      {/* Outer halo */}
      <path fill="none" stroke="#6366f1" strokeWidth="12" opacity="0.12"
        filter="url(#outerGlow)"
        d={BRAIN_PATH_MAIN}/>
      <path fill="none" stroke="#6366f1" strokeWidth="12" opacity="0.12"
        filter="url(#outerGlow)"
        d={BRAIN_PATH_CEREBELLUM}/>
      {/* Crisp outline */}
      <path fill="none" stroke="#818cf8" strokeWidth="1.2" opacity="0.7"
        filter="url(#glow)"
        d={BRAIN_PATH_MAIN}/>
      <path fill="none" stroke="#818cf8" strokeWidth="1.2" opacity="0.7"
        filter="url(#glow)"
        d={BRAIN_PATH_CEREBELLUM}/>
      <path fill="none" stroke="#818cf8" strokeWidth="1.2" opacity="0.5"
        filter="url(#glow)"
        d={BRAIN_PATH_STEM}/>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BrainMap(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const stRef=useRef({ry:0.3,rx:0.15,velY:0.0008,velX:0,dragging:false,lastX:0,lastY:0,hovered:null as string|null,selected:null as string|null,tick:0,particles:[] as Particle[],pulseWaves:[] as PulseWave[],W:0,H:0,didDrag:false,journeyActive:false,journeyChapter:0,highlightedNodes:null as string[]|null,highlightTick:0});
  const rafRef=useRef<number>(0);
  const[tooltip,setTooltip]=useState<TooltipState|null>(null);
  const[selected,setSelected]=useState<NodeDef|null>(null);
  const[journeyActive,setJourneyActive]=useState(false);
  const[journeyChapter,setJourneyChapter]=useState(0);

  const handleHighlight=useCallback((ids:string[])=>{
    stRef.current.highlightedNodes=ids;stRef.current.highlightTick=stRef.current.tick;
    for(const id of ids){const node=NODE_MAP.get(id);if(node)stRef.current.pulseWaves.push({nodeId:id,startTick:stRef.current.tick,color:COLORS[node.cat]});}
    setTimeout(()=>{stRef.current.highlightedNodes=null;},5000);
  },[]);

  const toggleJourney=useCallback(()=>{const next=!journeyActive;setJourneyActive(next);stRef.current.journeyActive=next;if(next){setJourneyChapter(0);stRef.current.journeyChapter=0;}},[journeyActive]);
  const setChapter=useCallback((i:number)=>{setJourneyChapter(i);stRef.current.journeyChapter=i;},[]);

  useEffect(()=>{
    const canvas=canvasRef.current!,ctx=canvas.getContext("2d")!,dpr=window.devicePixelRatio||1,st=stRef.current;
    function resize(){st.W=window.innerWidth;st.H=window.innerHeight;canvas.width=st.W*dpr;canvas.height=st.H*dpr;canvas.style.width=st.W+"px";canvas.style.height=st.H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);}
    resize();window.addEventListener("resize",resize);
    const rng2=mkRng(99);st.particles=[];
    for(let i=0;i<70;i++){const ei=Math.floor(rng2()*EDGES.length);const fromId=EDGES[ei][0];const c=COLORS[NODE_MAP.get(fromId)?.cat??"core"];st.particles.push({edge:ei,t:rng2(),speed:0.0007+rng2()*0.0009,color:c,rgb:hexToRgb(c)});}
    const stars:{x:number;y:number;r:number;a:number}[]=[],srng=mkRng(777);
    for(let i=0;i<180;i++)stars.push({x:srng()*2-1,y:srng()*2-1,r:srng()*1.2,a:srng()*0.25+0.05});
    const FOV=380;
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
    rafRef.current=requestAnimationFrame(draw);
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
  },[]);

  return(
    <div style={{position:"fixed",inset:0,background:"#000",overflow:"hidden"}}>
      <style>{CSS}</style>

      {/* Canvas clipped to brain shape */}
      <canvas
        ref={canvasRef}
        style={{
          display:"block",
          cursor:"grab",
          maskImage:BRAIN_MASK_URL,
          WebkitMaskImage:BRAIN_MASK_URL,
          maskSize:"56vmin",
          WebkitMaskSize:"56vmin",
          maskPosition:"center",
          WebkitMaskPosition:"center",
          maskRepeat:"no-repeat",
          WebkitMaskRepeat:"no-repeat",
        }}
      />

      {/* Glowing brain outline overlay */}
      <BrainOutline/>

      {/* Header label */}
      <div style={{position:"absolute",top:24,left:28,pointerEvents:"none",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#818cf8",boxShadow:"0 0 10px #818cf8",display:"inline-block",animation:"pulseDot 2s infinite"}}/>
          <span style={{color:"#6366f1",fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Platform Architecture</span>
        </div>
        <h1 style={{color:"#e0e7ff",fontSize:24,fontWeight:800,margin:0,lineHeight:1.15}}>HotBot Studios</h1>
        <p style={{color:"#334155",fontSize:11,margin:"5px 0 0",fontWeight:500}}>AI-Native Digital Agency · Built with Claude + MCP Servers</p>
      </div>

      {/* Journey toggle */}
      <button onClick={toggleJourney} style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",background:journeyActive?"rgba(99,102,241,0.25)":"rgba(15,23,42,0.8)",border:`1px solid ${journeyActive?"#6366f1":"rgba(99,102,241,0.2)"}`,borderRadius:8,padding:"7px 16px",color:journeyActive?"#818cf8":"#6366f1",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:20}}>
        {journeyActive?"⏹ Stop Journey":"▶ Play The Journey"}
      </button>

      {/* Legend */}
      <div style={{position:"absolute",top:20,right:20,background:"rgba(15,23,42,0.80)",border:"1px solid rgba(99,102,241,0.18)",borderRadius:14,padding:"12px 16px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",pointerEvents:"none",userSelect:"none"}}>
        <p style={{color:"#475569",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 9px"}}>Systems</p>
        {(Object.entries(CAT_NAMES) as [Cat,string][]).map(([cat,label])=>(
          <div key={cat} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:COLORS[cat],boxShadow:`0 0 7px ${COLORS[cat]}99`,flexShrink:0}}/>
            <span style={{color:"#64748b",fontSize:11}}>{label}</span>
          </div>
        ))}
      </div>

      {/* Journey chapters */}
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

      {/* Selected node panel */}
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

      {/* Hover tooltip */}
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

      {/* Stats */}
      <div style={{position:"absolute",bottom:28,right:24,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",pointerEvents:"none",userSelect:"none"}}>
        {(([["100+","Pages"],["55+","API Routes"],["90+","Components"],["15","Email Templates"],["10","Integrations"]] as const)).map(([n,l])=>(
          <div key={l} style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{color:"#6366f1",fontSize:15,fontWeight:800}}>{n}</span>
            <span style={{color:"#1e293b",fontSize:10,fontWeight:600}}>{l}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <p style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",color:"#1e293b",fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",pointerEvents:"none",userSelect:"none",margin:0,whiteSpace:"nowrap"}}>
        Drag to rotate · Hover to inspect · Click to explore
      </p>

      {/* Built with badge */}
      <div style={{position:"absolute",bottom:24,left:24,display:"flex",alignItems:"center",gap:6,background:"rgba(15,23,42,0.70)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:8,padding:"6px 11px",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",pointerEvents:"none",userSelect:"none"}}>
        <span style={{fontSize:10,color:"#334155",fontWeight:500}}>Built with</span>
        <span style={{fontSize:10,color:"#818cf8",fontWeight:700}}>Claude Code</span>
        <span style={{fontSize:10,color:"#334155"}}>+</span>
        <span style={{fontSize:10,color:"#fbbf24",fontWeight:700}}>MCP Servers</span>
      </div>

      <ChatPanel onHighlight={handleHighlight}/>
    </div>
  );
}
