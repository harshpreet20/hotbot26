"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import type { Whiteboard } from "@/types/dashboard";

type Tool = "pen" | "rect" | "text" | "eraser";

interface Stroke  { type:"stroke"; points:[number,number][]; color:string; width:number; }
interface Rect    { type:"rect";   x:number; y:number; w:number; h:number; color:string; width:number; }
interface TextEl  { type:"text";   x:number; y:number; text:string; color:string; }
type DrawEl = Stroke | Rect | TextEl;

function drawAll(ctx: CanvasRenderingContext2D, elements: DrawEl[]) {
  for (const el of elements) {
    ctx.strokeStyle = el.color;
    ctx.fillStyle   = el.color;
    if (el.type === "stroke") {
      ctx.lineWidth = el.width;
      ctx.lineCap   = "round";
      ctx.lineJoin  = "round";
      ctx.beginPath();
      for (let i = 0; i < el.points.length; i++) {
        const [x,y] = el.points[i];
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    } else if (el.type === "rect") {
      ctx.lineWidth = el.width;
      ctx.strokeRect(el.x, el.y, el.w, el.h);
    } else if (el.type === "text") {
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText(el.text, el.x, el.y);
    }
  }
}

function Canvas({ elements, setElements, tool, color, lineWidth }: {
  elements: DrawEl[];
  setElements: React.Dispatch<React.SetStateAction<DrawEl[]>>;
  tool: Tool; color: string; lineWidth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const startPos  = useRef<[number,number]>([0,0]);
  const currentEl = useRef<DrawEl | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAll(ctx, elements);
  }, [elements]);

  function getPos(e: React.MouseEvent): [number,number] {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [e.clientX-rect.left, e.clientY-rect.top];
  }

  function onMouseDown(e: React.MouseEvent) {
    if (tool==="text") {
      const text = prompt("Enter text:");
      if (!text) return;
      const [x,y] = getPos(e);
      setElements(prev=>[...prev,{type:"text",x,y,text,color}]);
      return;
    }
    drawing.current = true;
    const [x,y] = getPos(e);
    startPos.current = [x,y];
    if (tool==="pen"||tool==="eraser") {
      currentEl.current = { type:"stroke", points:[[x,y]], color:tool==="eraser"?"#0f1629":color, width:tool==="eraser"?24:lineWidth };
    } else {
      currentEl.current = { type:"rect", x, y, w:0, h:0, color, width:lineWidth };
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drawing.current||!currentEl.current) return;
    const [x,y] = getPos(e);
    if (currentEl.current.type==="stroke") {
      currentEl.current.points.push([x,y]);
    } else if (currentEl.current.type==="rect") {
      const [sx,sy] = startPos.current;
      currentEl.current.w = x-sx;
      currentEl.current.h = y-sy;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAll(ctx,elements);
    drawAll(ctx,[currentEl.current]);
  }

  function onMouseUp() {
    if (!drawing.current||!currentEl.current) return;
    drawing.current = false;
    setElements(prev=>[...prev,currentEl.current!]);
    currentEl.current = null;
  }

  return (
    <canvas ref={canvasRef} width={860} height={540}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      style={{ display:"block", background:"#0f1629", borderRadius:16, cursor:tool==="text"?"text":"crosshair", maxWidth:"100%", border:"1px solid rgba(255,255,255,0.08)" }}
    />
  );
}

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: "14px 18px",
};

export default function PortalWhiteboardPage() {
  const [boards, setBoards]       = useState<Whiteboard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [active, setActive]       = useState<Whiteboard | null>(null);
  const [elements, setElements]   = useState<DrawEl[]>([]);
  const [tool, setTool]           = useState<Tool>("pen");
  const [color, setColor]         = useState("#818cf8");
  const [lineWidth, setLineWidth] = useState(2);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/whiteboard");
      if (res.ok) { const d = await res.json() as { whiteboards: Whiteboard[] }; setBoards(d.whiteboards); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openBoard(b: Whiteboard) {
    setActive(b);
    try { setElements(JSON.parse(b.elements||"[]") as DrawEl[]); } catch { setElements([]); }
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    try {
      await fetch("/api/portal/whiteboard", {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ id:active.id, elements:JSON.stringify(elements) }),
      });
      await load();
    } finally { setSaving(false); }
  }

  const TOOLS: { key:Tool; icon:React.ReactNode; label:string }[] = [
    { key:"pen",    label:"Pen",    icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> },
    { key:"rect",   label:"Rect",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> },
    { key:"text",   label:"Text",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
    { key:"eraser", label:"Eraser", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 20 8.5 8.5"/><path d="M8.5 8.5L4 13 9 18l4.5-4.5"/><line x1="4" y1="20" x2="20" y2="20"/></svg> },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Whiteboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Collaborate in real-time with your team</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm py-8 text-center">Loading…</div>
      ) : boards.length === 0 ? (
        <div style={{ ...CARD, textAlign:"center", padding:"48px 24px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4 mx-auto">
            <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
          <p className="text-slate-400 font-medium">No whiteboards yet</p>
          <p className="text-slate-600 text-sm mt-1">Ask your account manager to create a collaborative board</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Board list */}
          <div className="flex flex-col gap-2" style={{ minWidth:200 }}>
            {boards.map(b => (
              <div key={b.id} onClick={() => openBoard(b)} style={{ ...CARD, cursor:"pointer", border: active?.id===b.id ? "1px solid rgba(99,102,241,0.4)" : CARD.border, background: active?.id===b.id ? "rgba(99,102,241,0.08)" : CARD.background }}>
                <p className="text-white text-sm font-medium">{b.name}</p>
                {b.lastEditedBy && <p className="text-slate-600 text-xs mt-0.5">By {b.lastEditedBy}</p>}
              </div>
            ))}
          </div>

          {/* Canvas */}
          {active ? (
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1">
                  {TOOLS.map(t=>(
                    <button key={t.key} onClick={()=>setTool(t.key)} title={t.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl"
                      style={{ background:tool===t.key?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.06)", color:tool===t.key?"#818cf8":"#64748b", border:`1px solid ${tool===t.key?"rgba(99,102,241,0.3)":"transparent"}` }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="range" min={1} max={12} value={lineWidth} onChange={e=>setLineWidth(+e.target.value)} className="w-20" />
                  <span className="text-xs text-slate-500">{lineWidth}px</span>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button onClick={()=>setElements([])} className="px-3 py-1.5 text-xs rounded-xl" style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>Clear</button>
                  <button onClick={()=>void save()} disabled={saving} className="px-4 py-1.5 text-xs font-semibold rounded-xl" style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity:saving?0.6:1 }}>
                    {saving?"Saving…":"Save"}
                  </button>
                </div>
              </div>
              <Canvas elements={elements} setElements={setElements} tool={tool} color={color} lineWidth={lineWidth} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm" style={{ background:"rgba(255,255,255,0.02)", borderRadius:20, minHeight:300 }}>
              Select a board to start drawing
            </div>
          )}
        </div>
      )}
    </div>
  );
}
