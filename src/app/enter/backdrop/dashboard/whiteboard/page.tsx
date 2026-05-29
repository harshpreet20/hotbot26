"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Whiteboard } from "@/types/dashboard";

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: "16px 20px",
};

// ── Error boundary ────────────────────────────────────────────────────────────
class WhiteboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error("Whiteboard canvas error:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:16, flexDirection:"column", gap:8 }}>
          <p style={{ color:"#f87171", fontSize:13 }}>Canvas error — click to reload</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ padding:"6px 14px", borderRadius:10, fontSize:12, cursor:"pointer", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Canvas types ───────────────────────────────────────────────────────────────
type Tool = "pen" | "rect" | "text" | "eraser";

interface Stroke  { type: "stroke"; points: [number,number][]; color: string; width: number; }
interface Rect    { type: "rect";   x: number; y: number; w: number; h: number; color: string; width: number; }
interface TextEl  { type: "text";   x: number; y: number; text: string; color: string; }
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
        if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
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

function Canvas({
  elements, setElements, tool, color, lineWidth, saving, onSave,
}: {
  elements: DrawEl[];
  setElements: React.Dispatch<React.SetStateAction<DrawEl[]>>;
  tool: Tool;
  color: string;
  lineWidth: number;
  saving: boolean;
  onSave: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const startPos  = useRef<[number,number]>([0,0]);
  const currentEl = useRef<DrawEl | null>(null);

  function redraw(els: DrawEl[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAll(ctx, els);
  }

  useEffect(() => { redraw(elements); }, [elements]);

  function getPos(e: React.MouseEvent): [number,number] | null {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function onMouseDown(e: React.MouseEvent) {
    if (tool === "text") {
      const text = prompt("Enter text:");
      if (!text) return;
      const pos = getPos(e);
      if (!pos) return;
      const [x,y] = pos;
      setElements(prev => [...prev, { type:"text", x, y, text, color }]);
      return;
    }
    drawing.current = true;
    const pos = getPos(e);
    if (!pos) return;
    const [x,y] = pos;
    startPos.current = [x,y];
    if (tool === "pen" || tool === "eraser") {
      currentEl.current = { type:"stroke", points:[[x,y]], color: tool==="eraser"?"#0f1629":color, width: tool==="eraser"?24:lineWidth };
    } else if (tool === "rect") {
      currentEl.current = { type:"rect", x, y, w:0, h:0, color, width:lineWidth };
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drawing.current || !currentEl.current) return;
    const pos = getPos(e);
    if (!pos) return;
    const [x,y] = pos;
    if (currentEl.current.type === "stroke") {
      currentEl.current.points.push([x,y]);
    } else if (currentEl.current.type === "rect") {
      const [sx,sy] = startPos.current;
      currentEl.current.w = x - sx;
      currentEl.current.h = y - sy;
    }
    // Live preview
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawAll(ctx, elements);
    drawAll(ctx, [currentEl.current]);
  }

  function onMouseUp() {
    if (!drawing.current || !currentEl.current) return;
    drawing.current = false;
    setElements(prev => [...prev, currentEl.current!]);
    currentEl.current = null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={900} height={600}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ display:"block", background:"#0f1629", borderRadius:16, cursor: tool==="text"?"text":"crosshair", maxWidth:"100%", border:"1px solid rgba(255,255,255,0.08)" }}
    />
  );
}

export default function WhiteboardPage() {
  const [boards, setBoards]       = useState<Whiteboard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [active, setActive]       = useState<Whiteboard | null>(null);
  const [elements, setElements]   = useState<DrawEl[]>([]);
  const [tool, setTool]           = useState<Tool>("pen");
  const [color, setColor]         = useState("#818cf8");
  const [lineWidth, setLineWidth] = useState(2);
  const [saving, setSaving]       = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [newName, setNewName]     = useState("");
  const [newClientId, setNewClientId]  = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [creating, setCreating]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/dashboard/whiteboards", { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) { const d = await res.json() as { whiteboards: Whiteboard[] }; setBoards(d.whiteboards); }
      else { setLoadError(true); }
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openBoard(b: Whiteboard) {
    setActive(b);
    try { setElements(JSON.parse(b.elements || "[]") as DrawEl[]); } catch { setElements([]); }
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    try {
      await fetch("/api/dashboard/whiteboards", {
        method: "PATCH",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ id: active.id, elements: JSON.stringify(elements) }),
      });
      await load();
    } finally { setSaving(false); }
  }

  async function create() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/whiteboards", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ name: newName, clientId: newClientId, clientEmail: newClientEmail }),
      });
      if (res.ok) {
        const d = await res.json() as { whiteboard: Whiteboard };
        setShowNew(false); setNewName(""); setNewClientId(""); setNewClientEmail("");
        await load();
        openBoard(d.whiteboard);
      }
    } finally { setCreating(false); }
  }

  async function deleteBoard(id: string) {
    if (!confirm("Delete this whiteboard?")) return;
    await fetch(`/api/dashboard/whiteboards?id=${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` } });
    if (active?.id === id) setActive(null);
    await load();
  }

  const INPUT: React.CSSProperties = { width:"100%", padding:"8px 12px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", fontSize:14, outline:"none" };

  const TOOLS: { key: Tool; icon: React.ReactNode; label: string }[] = [
    { key:"pen", label:"Pen", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> },
    { key:"rect", label:"Rect", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> },
    { key:"text", label:"Text", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
    { key:"eraser", label:"Eraser", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 20 8.5 8.5"/><path d="M8.5 8.5L4 13 9 18l4.5-4.5"/><line x1="4" y1="20" x2="20" y2="20"/></svg> },
  ];

  return (
    <DashboardShell>
      <div className="flex gap-4 p-6 h-full min-h-0">
        {/* Sidebar: board list */}
        <div className="w-64 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">Whiteboards</h1>
            <button onClick={() => setShowNew(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl"
              style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8" }}>
              + New
            </button>
          </div>

          {loading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : loadError ? (
            <div style={{ textAlign:"center", padding:"24px 16px" }}>
              <p className="text-red-400 text-sm mb-2">Failed to load whiteboards</p>
              <button onClick={() => void load()} className="text-xs text-indigo-400 hover:text-indigo-300">Retry</button>
            </div>
          ) : boards.length === 0 ? (
            <div style={{ ...CARD, textAlign:"center", padding:"24px 16px" }}>
              <p className="text-slate-400 text-sm">No whiteboards yet</p>
              <p className="text-slate-600 text-xs mt-1">Create your first board</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto">
              {boards.map(b => (
                <div key={b.id}
                  onClick={() => openBoard(b)}
                  style={{ ...CARD, padding:"12px 16px", cursor:"pointer", border: active?.id===b.id ? "1px solid rgba(99,102,241,0.4)" : CARD.border, background: active?.id===b.id ? "rgba(99,102,241,0.08)" : CARD.background }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{b.name}</p>
                      {b.clientId && <p className="text-slate-500 text-xs mt-0.5 truncate">{b.clientId}</p>}
                      <p className="text-slate-600 text-[10px] mt-0.5">
                        {b.lastEditedBy ? `Edited by ${b.lastEditedBy}` : `Created by ${b.createdBy}`}
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); void deleteBoard(b.id); }}
                      className="shrink-0 text-slate-600 hover:text-red-400 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Canvas area */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {active ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1">
                  {TOOLS.map(t => (
                    <button key={t.key} onClick={() => setTool(t.key)} title={t.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-colors"
                      style={{ background: tool===t.key ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)", color: tool===t.key ? "#818cf8" : "#64748b", border: `1px solid ${tool===t.key ? "rgba(99,102,241,0.3)" : "transparent"}` }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Color</label>
                  <input type="color" value={color} onChange={e=>setColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Width</label>
                  <input type="range" min={1} max={12} value={lineWidth} onChange={e=>setLineWidth(+e.target.value)} className="w-20" />
                  <span className="text-xs text-slate-500">{lineWidth}px</span>
                </div>

                <div className="flex gap-2 ml-auto">
                  <button onClick={() => setElements([])}
                    className="px-3 py-1.5 text-xs rounded-xl"
                    style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
                    Clear
                  </button>
                  <button onClick={() => void save()} disabled={saving}
                    className="px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors"
                    style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity: saving ? 0.6 : 1 }}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 min-h-0 overflow-auto">
                <WhiteboardErrorBoundary key={active?.id}>
                  <Canvas key={active?.id} elements={elements} setElements={setElements} tool={tool} color={color} lineWidth={lineWidth} saving={saving} onSave={save} />
                </WhiteboardErrorBoundary>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ background:"rgba(255,255,255,0.02)", borderRadius:20, border:"1px solid rgba(255,255,255,0.06)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4">
                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
              <p className="text-slate-400 font-medium">Select a whiteboard to start drawing</p>
              <p className="text-slate-600 text-sm mt-1">Or create a new one from the sidebar</p>
            </div>
          )}
        </div>
      </div>

      {/* New board modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4" style={{ background:"#0f1629", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">New Whiteboard</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name *</label>
                <input style={INPUT} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Project Kickoff Board" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client ID (optional)</label>
                <input style={INPUT} value={newClientId} onChange={e=>setNewClientId(e.target.value)} placeholder="client-ref" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Email (optional)</label>
                <input style={INPUT} value={newClientEmail} onChange={e=>setNewClientEmail(e.target.value)} placeholder="client@example.com" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-xl" style={{ background:"rgba(255,255,255,0.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={() => void create()} disabled={creating || !newName.trim()}
                className="px-4 py-2 text-sm font-semibold rounded-xl"
                style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity: creating || !newName.trim() ? 0.5 : 1 }}>
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
