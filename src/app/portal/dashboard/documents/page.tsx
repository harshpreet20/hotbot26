"use client";
import { useEffect, useState } from "react";
import type { PortalDocument, DocumentSuggestion } from "@/app/api/dashboard/documents/route";

const STATUS_META: Record<PortalDocument["status"], { label: string; color: string; bg: string }> = {
  draft:    { label: "Draft",    color: "#94a3b8", bg: "rgba(100,116,139,0.12)" },
  sent:     { label: "Sent",     color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  signed:   { label: "Signed",   color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  declined: { label: "Declined", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: "20px 24px",
};

const INPUT: React.CSSProperties = {
  width:"100%", padding:"8px 12px", borderRadius:14,
  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
  color:"#e2e8f0", fontSize:14, outline:"none",
};

export default function PortalDocumentsPage() {
  const [docs, setDocs]         = useState<PortalDocument[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<PortalDocument | null>(null);
  const [comment, setComment]   = useState("");
  const [suggest, setSuggest]   = useState({ original:"", suggested:"", open:false });
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned]     = useState(false);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/documents");
      if (res.ok) { const d = await res.json() as { documents: PortalDocument[] }; setDocs(d.documents); }
    } finally { setLoading(false); }
  }

  async function refreshSelected(id: string) {
    const res = await fetch(`/api/portal/documents?id=${id}`);
    if (res.ok) { const d = await res.json() as { document: PortalDocument }; setSelected(d.document); }
    await loadDocs();
  }

  useEffect(() => { void loadDocs(); }, []);

  async function postAction(action: "comment"|"suggest"|"sign", extra?: object) {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/documents", {
        method: "PATCH",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ id: selected.id, action, ...extra }),
      });
      if (res.ok) {
        if (action === "comment") setComment("");
        if (action === "suggest") setSuggest({ original:"", suggested:"", open:false });
        if (action === "sign") setSigned(true);
        await refreshSelected(selected.id);
      }
    } finally { setSubmitting(false); }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="text-slate-400 text-sm mt-0.5">Proposals and contracts shared with you</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm py-8 text-center">Loading…</div>
      ) : docs.length === 0 ? (
        <div style={{ ...CARD, textAlign:"center", padding:"48px 24px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4 mx-auto">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p className="text-slate-400 font-medium">No documents yet</p>
          <p className="text-slate-600 text-sm mt-1">Proposals and contracts from your account manager will appear here</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Doc list */}
          <div className="flex flex-col gap-2" style={{ minWidth:220 }}>
            {docs.map(d => (
              <div key={d.id} onClick={() => { setSelected(d); setSigned(false); setComment(""); }}
                style={{ ...CARD, padding:"14px 18px", cursor:"pointer", border:selected?.id===d.id?"1px solid rgba(99,102,241,0.4)":CARD.border, background:selected?.id===d.id?"rgba(99,102,241,0.08)":CARD.background }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-medium">{d.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 capitalize">{d.type}</p>
                    <span style={{ display:"inline-block", marginTop:4, padding:"1px 8px", borderRadius:12, fontSize:10, fontWeight:600, color:STATUS_META[d.status].color, background:STATUS_META[d.status].bg }}>
                      {STATUS_META[d.status].label}
                    </span>
                  </div>
                  {d.comments.length > 0 && <span className="text-xs text-slate-600">{d.comments.length} 💬</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Doc viewer */}
          {selected ? (
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                  <p className="text-slate-400 text-sm capitalize">{selected.type} · {new Date(selected.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600, color:STATUS_META[selected.status].color, background:STATUS_META[selected.status].bg }}>
                    {STATUS_META[selected.status].label}
                  </span>
                  {selected.status === "sent" && (
                    <button onClick={() => void postAction("sign")} disabled={submitting}
                      className="px-4 py-2 text-sm font-bold rounded-xl"
                      style={{ background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399", opacity:submitting?0.6:1 }}>
                      ✍ Sign Document
                    </button>
                  )}
                </div>
              </div>

              {signed && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", color:"#34d399" }}>
                  Document signed successfully. Your signature has been recorded.
                </div>
              )}

              {/* Content */}
              <div style={CARD}>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.content || <span className="text-slate-600 italic">No content available</span>}
                </div>
              </div>

              {/* Signatures */}
              {selected.signatures.length > 0 && (
                <div style={CARD}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Signatures</h3>
                  {selected.signatures.map(s => (
                    <div key={s.id} className="flex items-center gap-3 py-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <div>
                        <p className="text-sm text-white font-medium">{s.signerName}</p>
                        <p className="text-xs text-slate-500">Signed {new Date(s.signedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comments */}
              <div style={CARD}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Comments</h3>
                {selected.comments.length > 0 && (
                  <div className="flex flex-col gap-3 mb-4">
                    {selected.comments.map(c => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background:"rgba(99,102,241,0.2)", color:"#818cf8" }}>
                          {c.author[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{c.author} · {new Date(c.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-300 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input style={INPUT} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment…"
                    onKeyDown={e=>{ if(e.key==="Enter"&&comment.trim()) void postAction("comment",{text:comment}); }} />
                  <button onClick={() => void postAction("comment",{text:comment})} disabled={submitting||!comment.trim()}
                    className="px-4 py-2 text-sm font-semibold rounded-xl"
                    style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity:submitting||!comment.trim()?0.5:1, whiteSpace:"nowrap" }}>
                    Post
                  </button>
                </div>
              </div>

              {/* Suggest edits */}
              {selected.status === "sent" && (
                <div style={CARD}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggest Edits</h3>
                    <button onClick={() => setSuggest(p=>({...p,open:!p.open}))}
                      className="text-xs text-slate-400 hover:text-slate-200">
                      {suggest.open ? "Close" : "+ Suggest"}
                    </button>
                  </div>

                  {selected.suggestions.length > 0 && (
                    <div className="flex flex-col gap-2 mb-4">
                      {selected.suggestions.map((s: DocumentSuggestion) => (
                        <div key={s.id} className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${s.status==="pending"?"rgba(251,191,36,0.15)":s.status==="accepted"?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.1)"}` }}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                            <span className="text-[10px] font-semibold capitalize" style={{ color:s.status==="pending"?"#fbbf24":s.status==="accepted"?"#34d399":"#f87171" }}>{s.status}</span>
                          </div>
                          <p className="text-xs text-red-300 line-through">{s.originalText}</p>
                          <p className="text-xs text-green-300">{s.suggestedText}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {suggest.open && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Original text to replace</label>
                        <textarea style={{...INPUT,resize:"vertical"}} rows={2} value={suggest.original} onChange={e=>setSuggest(p=>({...p,original:e.target.value}))} placeholder="Paste the text you'd like to change…" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Your suggested replacement</label>
                        <textarea style={{...INPUT,resize:"vertical"}} rows={2} value={suggest.suggested} onChange={e=>setSuggest(p=>({...p,suggested:e.target.value}))} placeholder="Type your suggested replacement…" />
                      </div>
                      <button onClick={() => void postAction("suggest",{originalText:suggest.original,suggestedText:suggest.suggested})}
                        disabled={submitting||!suggest.original.trim()||!suggest.suggested.trim()}
                        className="self-end px-4 py-2 text-sm font-semibold rounded-xl"
                        style={{ background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", opacity:submitting||!suggest.original.trim()||!suggest.suggested.trim()?0.5:1 }}>
                        Submit Suggestion
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm" style={{ background:"rgba(255,255,255,0.02)", borderRadius:20, minHeight:200 }}>
              Select a document to view
            </div>
          )}
        </div>
      )}
    </div>
  );
}
