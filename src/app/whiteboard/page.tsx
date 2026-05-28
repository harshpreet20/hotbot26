"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  { ssr: false }
);

interface WhiteboardSession {
  id: string;
  title: string;
  data: Record<string, unknown>;
  share_token: string;
  entity_type: string;
  entity_id: string;
}

function WhiteboardShareInner() {
  const params  = useSearchParams();
  const token   = params.get("token");
  const [session, setSession] = useState<WhiteboardSession | null>(null);
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) { setError("No token provided."); return; }
    fetch(`/api/dashboard/whiteboard?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d: { session?: WhiteboardSession; error?: string }) => {
        if (d.error) setError(d.error);
        else setSession(d.session ?? null);
      })
      .catch(() => setError("Failed to load whiteboard."));
  }, [token]);

  const onChange = useCallback((elements: unknown) => {
    if (!session) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/dashboard/whiteboard", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: session.id, data: { elements }, title: session.title }),
        });
      } catch { /* ignore */ }
      setSaving(false);
    }, 2500);
  }, [session]);

  const initialData = session?.data
    ? { elements: (session.data as Record<string, unknown>).elements as never[], appState: (session.data as Record<string, unknown>).appState as Record<string, unknown> }
    : undefined;

  if (error) return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#0a0f1a" }}>
      <div className="text-center">
        <p className="text-red-400 font-medium mb-2">{error}</p>
        <p className="text-slate-500 text-sm">Ask your team to share a valid whiteboard link.</p>
      </div>
    </div>
  );

  if (!session) return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#0a0f1a" }}>
      <p className="text-slate-400 animate-pulse">Loading whiteboard…</p>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#0a0f1a" }}>
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2"/><line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2"/></svg>
          </div>
          <span className="text-white text-sm font-medium">{session.title}</span>
        </div>
        {saving && <span className="text-xs text-amber-400 animate-pulse ml-2">Saving…</span>}
        <div className="ml-auto text-xs text-slate-500">HotBot Studios · Shared Whiteboard</div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Excalidraw
          key={session.id}
          initialData={initialData}
          onChange={onChange}
          theme="dark"
        />
      </div>
    </div>
  );
}

export default function WhiteboardSharePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen" style={{ background: "#0a0f1a" }}>
        <p className="text-slate-400">Loading…</p>
      </div>
    }>
      <WhiteboardShareInner />
    </Suspense>
  );
}
