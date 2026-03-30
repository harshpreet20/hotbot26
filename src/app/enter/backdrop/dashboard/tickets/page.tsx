"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Ticket, TicketStatus, TicketComment } from "@/types/dashboard";

function getSecret() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : ""; }

const STATUS_META: Record<TicketStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b" },
  waiting:     { label: "Waiting",     color: "#8b5cf6" },
  resolved:    { label: "Resolved",    color: "#22c55e" },
  closed:      { label: "Closed",      color: "#475569" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#64748b", medium: "#3b82f6", high: "#f59e0b", critical: "#ef4444",
};

export default function TicketsPage() {
  const router = useRouter();
  const [tickets,  setTickets]  = useState<Ticket[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<TicketStatus | "">("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply,    setReply]    = useState("");
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/tickets", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => { if (r.status === 401) { sessionStorage.clear(); router.replace("/enter/backdrop"); return null; } return r.json(); })
      .then((d) => { if (d) setTickets((d as { tickets: Ticket[] }).tickets); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function updateStatus(id: string, status: TicketStatus) {
    const res = await fetch("/api/dashboard/tickets", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const data = await res.json() as { ticket: Ticket };
      setTickets((p) => p.map((t) => t.id === id ? data.ticket : t));
      if (selected?.id === id) setSelected(data.ticket);
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/tickets", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, type: "comment", text: reply.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { comment: TicketComment };
        const updated: Ticket = { ...selected, comments: [...(selected.comments ?? []), data.comment] };
        setSelected(updated);
        setTickets((p) => p.map((t) => t.id === selected.id ? updated : t));
        setReply("");
      }
    } finally {
      setSending(false);
    }
  }

  async function deleteTicket(id: string) {
    if (!confirm("Delete this ticket?")) return;
    const res = await fetch(`/api/dashboard/tickets?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getSecret()}` } });
    if (res.ok) { setTickets((p) => p.filter((t) => t.id !== id)); if (selected?.id === id) setSelected(null); }
  }

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [t.title, t.requesterName, t.requesterEmail, t.ticketNumber].some((v) => v.toLowerCase().includes(q));
    return matchSearch && (!filter || t.status === filter);
  });

  const counts = Object.keys(STATUS_META).reduce((acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }), {} as Record<string, number>);

  return (
    <DashboardShell>
      <div className="flex h-screen max-h-screen overflow-hidden">
        {/* Left: ticket list */}
        <div className="flex flex-col border-r" style={{ width: selected ? 360 : undefined, flex: selected ? "none" : 1, borderColor: "rgba(255,255,255,0.07)" }}>
          <header className="px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-white font-semibold text-sm">Tickets</h1>
              <span className="text-slate-500 text-xs">{tickets.length} total</span>
            </div>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full px-3 py-1.5 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none mb-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <div className="flex gap-1 overflow-x-auto">
              <FilterChip label="All" count={tickets.length} active={filter === ""} onClick={() => setFilter("")} color="#64748b" />
              {(Object.keys(STATUS_META) as TicketStatus[]).map((s) => (
                <FilterChip key={s} label={STATUS_META[s].label} count={counts[s] ?? 0} active={filter === s} onClick={() => setFilter(filter === s ? "" : s)} color={STATUS_META[s].color} />
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-slate-500 text-xs text-center py-16">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-slate-600 text-xs text-center py-16">No tickets.</div>
            ) : (
              filtered.map((t) => {
                const sm = STATUS_META[t.status];
                const pc = PRIORITY_COLORS[t.priority] ?? "#64748b";
                return (
                  <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left px-4 py-3 border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: "rgba(255,255,255,0.05)", background: selected?.id === t.id ? "rgba(99,102,241,0.08)" : "transparent" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{t.title}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 truncate">{t.requesterName} · {t.requesterEmail}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono text-slate-600">{t.ticketNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${sm.color}18`, color: sm.color }}>{sm.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc }} />
                      <span className="text-[10px] text-slate-600 capitalize">{t.priority}</span>
                      <span className="text-[10px] text-slate-700 ml-auto">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: ticket detail */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 py-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div>
                <p className="text-slate-500 text-[10px] font-mono">{selected.ticketNumber}</p>
                <h2 className="text-white text-sm font-semibold">{selected.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as TicketStatus)}
                  className="px-2 py-1 rounded-lg text-xs outline-none"
                  style={{ background: `${STATUS_META[selected.status].color}15`, color: STATUS_META[selected.status].color, border: `1px solid ${STATUS_META[selected.status].color}40` }}
                >
                  {(Object.keys(STATUS_META) as TicketStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
                <button onClick={() => deleteTicket(selected.id)} className="text-red-500/50 hover:text-red-400 text-xs transition-colors">Delete</button>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xs transition-colors ml-1">✕</button>
              </div>
            </div>

            {/* Ticket info */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div><p className="text-slate-600">From</p><p className="text-slate-300">{selected.requesterName}</p><p className="text-slate-500 text-[11px]">{selected.requesterEmail}</p></div>
                <div><p className="text-slate-600">Category</p><p className="text-slate-300 capitalize">{selected.category}</p></div>
                <div><p className="text-slate-600">Priority</p><p style={{ color: PRIORITY_COLORS[selected.priority] }} className="font-medium capitalize">{selected.priority}</p></div>
              </div>
              {selected.description && <p className="text-slate-400 text-sm leading-relaxed">{selected.description}</p>}
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {(selected.comments ?? []).length === 0 ? (
                <p className="text-slate-600 text-xs">No replies yet.</p>
              ) : (
                (selected.comments ?? []).map((c: TicketComment) => (
                  <div key={c.id} className={`flex gap-3 ${c.isStaff ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: c.isStaff ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)" }}>
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-[80%] ${c.isStaff ? "items-end" : "items-start"} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">{c.isStaff ? `Staff · ${c.authorName}` : c.authorName}</span>
                        <span className="text-[10px] text-slate-700">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="rounded-xl px-3 py-2 text-sm text-slate-300" style={{ background: c.isStaff ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply */}
            {!["resolved","closed"].includes(selected.status) && (
              <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex gap-2">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }}} rows={2} placeholder="Write a reply to the requester…" className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button onClick={sendReply} disabled={sending || !reply.trim()} className="px-3 rounded-xl text-sm text-white self-stretch disabled:opacity-50" style={{ background: "rgba(99,102,241,0.8)" }}>
                    {sending ? "…" : "Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">Select a ticket to view details</div>
        )}
      </div>
    </DashboardShell>
  );
}

function FilterChip({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} className="shrink-0 px-2 py-1 rounded-full text-[10px] font-medium transition-all" style={{ background: active ? `${color}20` : "transparent", color: active ? color : "#64748b", border: `1px solid ${active ? `${color}40` : "rgba(255,255,255,0.07)"}` }}>
      {label} {count > 0 && <span>({count})</span>}
    </button>
  );
}
