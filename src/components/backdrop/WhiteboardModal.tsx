"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Excalidraw must be loaded client-side only
const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      Loading whiteboard…
    </div>
  ) }
);

interface WhiteboardSession {
  id: string;
  title: string;
  data: Record<string, unknown>;
  share_token: string;
  created_by: string;
  updated_at: string;
}

interface Props {
  entityType: "project" | "ticket" | "lead";
  entityId: string;
  entityLabel: string;
  onClose: () => void;
}

function getToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

export function WhiteboardModal({ entityType, entityId, entityLabel, onClose }: Props) {
  const [sessions, setSessions]     = useState<WhiteboardSession[]>([]);
  const [active, setActive]         = useState<WhiteboardSession | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [dirty, setDirty]           = useState(false);
  const [title, setTitle]           = useState("Whiteboard");
  const [creating, setCreating]     = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const excalidrawRef = useRef<{ getSceneElements: () => unknown; getAppState: () => unknown } | null>(null);
  const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const h = useCallback(() => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/dashboard/whiteboard?entityType=${entityType}&entityId=${entityId}`, { headers: h() });
      const d = await r.json() as { sessions?: WhiteboardSession[] };
      const list = d.sessions ?? [];
      setSessions(list);
      if (list.length > 0) setActive(list[0]);
    } catch { /* ignore */ }
    setLoading(false);
  }, [entityType, entityId, h]);

  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async (wbSession: WhiteboardSession, elements: unknown, appState: unknown) => {
    if (!wbSession) return;
    setSaving(true);
    try {
      await fetch("/api/dashboard/whiteboard", {
        method: "PATCH",
        headers: h(),
        body: JSON.stringify({
          id:    wbSession.id,
          title: wbSession.title,
          data:  { elements, appState },
        }),
      });
      setDirty(false);
    } catch { /* ignore */ }
    setSaving(false);
  }, [h]);

  const onChange = useCallback((elements: unknown) => {
    setDirty(true);
    if (!active) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void save(active, elements, {});
    }, 2000);
  }, [active, save]);

  const createNew = useCallback(async () => {
    setCreating(true);
    try {
      const r = await fetch("/api/dashboard/whiteboard", {
        method: "POST",
        headers: h(),
        body: JSON.stringify({ entityType, entityId, title }),
      });
      const d = await r.json() as { session?: WhiteboardSession };
      if (d.session) {
        setSessions((p) => [d.session!, ...p]);
        setActive(d.session!);
        setDirty(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  }, [entityType, entityId, title, h]);

  const copyShareLink = () => {
    if (!active) return;
    const url = `${window.location.origin}/whiteboard?token=${active.share_token}`;
    void navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const initialData = active?.data
    ? { elements: (active.data as Record<string, unknown>).elements as never[], appState: (active.data as Record<string, unknown>).appState as Record<string, unknown> }
    : undefined;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: "#0a0f1a" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b border-white/10">
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="text-slate-500">Whiteboard</span>
          <span className="text-slate-600">·</span>
          <span className="font-medium truncate max-w-48">{entityLabel}</span>
        </div>

        {/* Session tabs */}
        <div className="flex items-center gap-1 ml-2 overflow-x-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className="px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors"
              style={{
                background: active?.id === s.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                color: active?.id === s.id ? "#818cf8" : "#94a3b8",
                border: `1px solid ${active?.id === s.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* New whiteboard */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New whiteboard name…"
          className="px-2 py-1 rounded-lg text-xs text-white placeholder:text-slate-600 outline-none ml-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", width: 160 }}
        />
        <button
          onClick={createNew}
          disabled={creating || !title.trim()}
          className="px-3 py-1 rounded-lg text-xs font-medium text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          {creating ? "…" : "+ New"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          {saving && <span className="text-xs text-slate-500 animate-pulse">Saving…</span>}
          {!saving && dirty && <span className="text-xs text-amber-400">Unsaved</span>}

          {active && (
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              {shareToast ? "Copied!" : "Share"}
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading…</div>
        ) : !active ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-slate-500 text-sm">No whiteboards yet for this {entityType}</div>
            <button
              onClick={createNew}
              disabled={creating}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              Create First Whiteboard
            </button>
          </div>
        ) : (
          <Excalidraw
            key={active.id}
            ref={excalidrawRef as never}
            initialData={initialData}
            onChange={onChange}
            UIOptions={{
              canvasActions: { saveToActiveFile: false, loadScene: false, export: { saveFileToDisk: true } },
            }}
            theme="dark"
          />
        )}
      </div>
    </div>
  );
}
