"use client";
import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
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
  width: "100%", padding: "8px 12px", borderRadius: 12,
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0", fontSize: 14, outline: "none",
};

export default function DocumentsPage() {
  const [docs, setDocs]           = useState<PortalDocument[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<PortalDocument | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState<"all"|PortalDocument["status"]>("all");

  const [form, setForm] = useState({
    title: "", type: "proposal" as "proposal"|"contract", clientId: "",
    clientEmail: "", clientName: "", content: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/documents", { credentials: "same-origin" });
      if (res.ok) { const d = await res.json() as { documents: PortalDocument[] }; setDocs(d.documents); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    if (!form.title.trim() || !form.clientId.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/documents", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowForm(false); await load(); }
    } finally { setSaving(false); }
  }

  async function patch(id: string, updates: Partial<PortalDocument>) {
    await fetch("/api/dashboard/documents", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    await load();
    if (selected?.id === id) {
      const all = await fetch("/api/dashboard/documents", { credentials: "same-origin" }).then(r=>r.json()) as { documents: PortalDocument[] };
      const refreshed = all.documents.find(d=>d.id===id);
      if (refreshed) setSelected(refreshed);
    }
  }

  async function send(id: string) {
    await patch(id, { status: "sent" });
  }

  async function deletDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/dashboard/documents?id=${id}`, { method: "DELETE", credentials: "same-origin" });
    if (selected?.id === id) setSelected(null);
    await load();
  }

  async function acceptSuggestion(docId: string, suggestionId: string) {
    await fetch("/api/dashboard/documents", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: docId, action: "accept-suggestion", suggestionId }),
    });
    await load();
    const all = await fetch("/api/dashboard/documents", { headers: { Authorization: `Bearer ${getToken()}` } }).then(r=>r.json()) as { documents: PortalDocument[] };
    const refreshed = all.documents.find(d=>d.id===docId);
    if (refreshed) setSelected(refreshed);
  }

  async function rejectSuggestion(docId: string, suggestionId: string) {
    await fetch("/api/dashboard/documents", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: docId, action: "reject-suggestion", suggestionId }),
    });
    await load();
    const all = await fetch("/api/dashboard/documents", { headers: { Authorization: `Bearer ${getToken()}` } }).then(r=>r.json()) as { documents: PortalDocument[] };
    const refreshed = all.documents.find(d=>d.id===docId);
    if (refreshed) setSelected(refreshed);
  }

  const filtered = docs.filter(d => filter === "all" || d.status === filter);
  const FILTER_TABS: { key: "all"|PortalDocument["status"]; label: string }[] = [
    { key:"all", label:"All" }, { key:"draft", label:"Drafts" }, { key:"sent", label:"Sent" },
    { key:"signed", label:"Signed" }, { key:"declined", label:"Declined" },
  ];

  return (
    <DashboardShell>
      <div className="flex gap-4 p-6 h-full min-h-0">
        {/* Left: doc list */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">Documents</h1>
            <button onClick={() => { setShowForm(true); setForm({ title:"", type:"proposal", clientId:"", clientEmail:"", clientName:"", content:"" }); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl"
              style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8" }}>
              + New
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className="px-2.5 py-1 text-[10px] font-medium rounded-xl"
                style={{ background:filter===t.key?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.05)", color:filter===t.key?"#818cf8":"#64748b", border:`1px solid ${filter===t.key?"rgba(99,102,241,0.3)":"transparent"}` }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? <div className="text-slate-500 text-sm">Loading…</div> :
            filtered.length === 0 ? (
              <div style={{ ...CARD, textAlign:"center", padding:"24px 16px" }}>
                <p className="text-slate-400 text-sm">No documents</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto">
                {filtered.map(d => (
                  <div key={d.id} onClick={() => setSelected(d)}
                    style={{ ...CARD, padding:"12px 16px", cursor:"pointer", border: selected?.id===d.id?"1px solid rgba(99,102,241,0.4)":CARD.border, background:selected?.id===d.id?"rgba(99,102,241,0.08)":CARD.background }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{d.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{d.type} · {d.clientName || d.clientId}</p>
                        <span style={{ display:"inline-block", marginTop:4, padding:"1px 8px", borderRadius:12, fontSize:10, fontWeight:600, color:STATUS_META[d.status].color, background:STATUS_META[d.status].bg }}>
                          {STATUS_META[d.status].label}
                        </span>
                      </div>
                      <button onClick={e=>{e.stopPropagation();void deletDoc(d.id);}} className="shrink-0 text-slate-600 hover:text-red-400 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Right: doc viewer */}
        {selected ? (
          <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                <p className="text-slate-400 text-sm">{selected.clientName || selected.clientId} · {selected.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600, color:STATUS_META[selected.status].color, background:STATUS_META[selected.status].bg }}>
                  {STATUS_META[selected.status].label}
                </span>
                {selected.status === "draft" && (
                  <button onClick={() => void send(selected.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl"
                    style={{ background:"rgba(96,165,250,0.15)", border:"1px solid rgba(96,165,250,0.3)", color:"#60a5fa" }}>
                    Send to Client
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={CARD}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Content</h3>
              {selected.status === "draft" ? (
                <textarea
                  defaultValue={selected.content}
                  onBlur={e => void patch(selected.id, { content: e.target.value })}
                  style={{ ...INPUT, resize:"vertical", minHeight:200, fontFamily:"inherit" }}
                  placeholder="Write the proposal/contract content here…"
                />
              ) : (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.content || <span className="text-slate-600 italic">No content</span>}</div>
              )}
            </div>

            {/* Suggestions */}
            {selected.suggestions.length > 0 && (
              <div style={CARD}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Suggested Edits ({selected.suggestions.filter(s=>s.status==="pending").length} pending)</h3>
                <div className="flex flex-col gap-3">
                  {selected.suggestions.map((s: DocumentSuggestion) => (
                    <div key={s.id} className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${s.status==="pending"?"rgba(251,191,36,0.2)":s.status==="accepted"?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.1)"}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400">{s.author} · {new Date(s.createdAt).toLocaleDateString()}</p>
                        <span className="text-[10px] font-semibold" style={{ color:s.status==="pending"?"#fbbf24":s.status==="accepted"?"#34d399":"#f87171" }}>{s.status}</span>
                      </div>
                      <p className="text-xs text-red-300 line-through mb-1">{s.originalText}</p>
                      <p className="text-xs text-green-300">{s.suggestedText}</p>
                      {s.status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => void acceptSuggestion(selected.id, s.id)} className="px-2.5 py-1 text-[10px] font-semibold rounded-lg" style={{ background:"rgba(52,211,153,0.15)", color:"#34d399" }}>Accept</button>
                          <button onClick={() => void rejectSuggestion(selected.id, s.id)} className="px-2.5 py-1 text-[10px] font-semibold rounded-lg" style={{ background:"rgba(248,113,113,0.1)", color:"#f87171" }}>Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {selected.comments.length > 0 && (
              <div style={CARD}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Comments</h3>
                <div className="flex flex-col gap-3">
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
              </div>
            )}

            {/* Signatures */}
            {selected.signatures.length > 0 && (
              <div style={CARD}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Signatures</h3>
                {selected.signatures.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <div>
                      <p className="text-sm text-white font-medium">{s.signerName}</p>
                      <p className="text-xs text-slate-500">{s.signerEmail} · Signed {new Date(s.signedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ background:"rgba(255,255,255,0.02)", borderRadius:20, border:"1px solid rgba(255,255,255,0.06)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 mb-4">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <p className="text-slate-400 font-medium">Select a document to view</p>
            <p className="text-slate-600 text-sm mt-1">Or create a new proposal or contract</p>
          </div>
        )}
      </div>

      {/* New doc modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4" style={{ background:"#0f1629", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">New Document</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input style={INPUT} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Website Project Proposal" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select style={INPUT} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value as "proposal"|"contract"}))}>
                  <option value="proposal">Proposal</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client ID *</label>
                <input style={INPUT} value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))} placeholder="HBS-XXXXX" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Email</label>
                <input style={INPUT} value={form.clientEmail} onChange={e=>setForm(p=>({...p,clientEmail:e.target.value}))} placeholder="client@example.com" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client Name</label>
                <input style={INPUT} value={form.clientName} onChange={e=>setForm(p=>({...p,clientName:e.target.value}))} placeholder="Client Name" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Content</label>
                <textarea style={{...INPUT,resize:"vertical"}} rows={4} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Write your proposal or contract content…" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-xl" style={{ background:"rgba(255,255,255,0.06)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={() => void create()} disabled={saving || !form.title.trim() || !form.clientId.trim()}
                className="px-4 py-2 text-sm font-semibold rounded-xl"
                style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)", color:"#818cf8", opacity:saving||!form.title.trim()||!form.clientId.trim()?0.5:1 }}>
                {saving ? "Creating…" : "Create Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
