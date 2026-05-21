"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { Ticket, TicketStatus } from "@/types/dashboard";

function getSecret() { return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : ""; }

const STATUS_META: Record<TicketStatus, { label: string; color: string }> = {
  draft:       { label: "Draft",       color: "#64748b" },
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<TicketStatus | "">("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const role = typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
  const canDelete = role === "super_admin";

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/tickets", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => { if (r.status === 401) { sessionStorage.clear(); router.replace("/enter/backdrop"); return null; } return r.json(); })
      .then((d) => { if (d) setTickets((d as { tickets: Ticket[] }).tickets); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function deleteTicket(id: string, title: string) {
    if (!confirm(`Permanently delete ticket "${title}"? This cannot be undone.`)) return;
    const secret = getSecret();
    setDeleting(id);
    try {
      await fetch(`/api/dashboard/tickets?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${secret}` } });
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  }

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [t.title, t.requesterName, t.requesterEmail, t.ticketNumber].some((v) => v.toLowerCase().includes(q));
    return matchSearch && (!filter || t.status === filter);
  });

  const counts = (Object.keys(STATUS_META) as TicketStatus[]).reduce(
    (acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }),
    {} as Record<string, number>,
  );

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Tickets</h1>
            <p className="text-slate-500 text-xs mt-0.5">{tickets.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none w-44"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Link
              href="/enter/backdrop/dashboard/tickets/new"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white whitespace-nowrap"
              style={{ background: "rgba(99,102,241,0.8)" }}
            >
              + New Ticket
            </Link>
          </div>
        </header>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-6 pt-4 pb-2 overflow-x-auto shrink-0">
          <FilterChip label="All" count={tickets.length} active={filter === ""} onClick={() => setFilter("")} color="#64748b" />
          {(Object.keys(STATUS_META) as TicketStatus[]).map((s) => (
            <FilterChip key={s} label={STATUS_META[s].label} count={counts[s] ?? 0} active={filter === s} onClick={() => setFilter(filter === s ? "" : s)} color={STATUS_META[s].color} />
          ))}
        </div>

        {/* Ticket table */}
        <div className="flex-1 px-6 pb-6">
          {loading ? (
            <p className="text-slate-500 text-sm py-16 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-600 text-sm py-16 text-center">
              {search || filter ? "No matching tickets." : "No tickets yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Ticket #", "Title", "Requester", "Priority", "Status", "Assignee", "Labels", "Created", "Approval", ...(canDelete ? [""] : [])].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const sm = STATUS_META[t.status];
                    const pc = PRIORITY_COLORS[t.priority] ?? "#64748b";
                    return (
                      <tr key={t.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Link href={`/enter/backdrop/dashboard/tickets/${t.id}`} className="text-indigo-400 font-mono text-xs hover:text-indigo-300">
                            {t.ticketNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <Link href={`/enter/backdrop/dashboard/tickets/${t.id}`} className="text-white text-sm hover:text-indigo-200 transition-colors line-clamp-1">
                            {t.title}
                          </Link>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="text-slate-300 text-xs">{t.requesterName}</p>
                          <p className="text-slate-600 text-[11px]">{t.requesterEmail}</p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: pc }}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pc }} />
                            <span className="capitalize">{t.priority}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${sm.color}18`, color: sm.color }}>
                            {sm.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-slate-500 text-xs">{t.assignedTo ?? "-"}</span>
                        </td>
                        <td className="py-3 px-3 max-w-[140px]">
                          <div className="flex flex-wrap gap-1">
                            {(t.labels ?? []).slice(0, 2).map((l) => (
                              <span key={l} className="px-1.5 py-0.5 rounded-full text-[10px] text-indigo-300" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>{l}</span>
                            ))}
                            {(t.labels ?? []).length > 2 && (
                              <span className="text-[10px] text-slate-600">+{(t.labels ?? []).length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-xs">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        {/* Approval actions — only shown for pending_approval tickets */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {(t as unknown as Record<string,unknown>).approval_status === "pending_approval" ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={async () => {
                                  const secret = sessionStorage.getItem("backdrop_secret") ?? "";
                                  await fetch("/api/dashboard/tickets/approve", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
                                    body: JSON.stringify({ ticket_id: t.id, action: "approve" }),
                                  });
                                  window.location.reload();
                                }}
                                className="px-2 py-1 text-[11px] font-medium rounded-md text-green-300 hover:bg-green-500/20 transition-colors"
                                style={{ border: "1px solid rgba(74,222,128,0.3)" }}
                                title="Approve request (manager+ only)"
                              >✓ Approve</button>
                              <button
                                onClick={async () => {
                                  const reason = prompt("Rejection reason (optional):");
                                  const secret = sessionStorage.getItem("backdrop_secret") ?? "";
                                  await fetch("/api/dashboard/tickets/approve", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
                                    body: JSON.stringify({ ticket_id: t.id, action: "reject", reason }),
                                  });
                                  window.location.reload();
                                }}
                                className="px-2 py-1 text-[11px] font-medium rounded-md text-red-400 hover:bg-red-500/20 transition-colors"
                                style={{ border: "1px solid rgba(248,113,113,0.3)" }}
                                title="Reject request (manager+ only)"
                              >✗ Reject</button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600">
                              {String((t as unknown as Record<string,unknown>).approval_status ?? "—")}
                            </span>
                          )}
                        </td>
                        {canDelete && (
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              onClick={() => deleteTicket(t.id, t.title)}
                              disabled={deleting === t.id}
                              className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-40 text-xs"
                              title="Delete ticket"
                            >
                              {deleting === t.id ? "…" : "✕"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function FilterChip({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
      style={{ background: active ? `${color}20` : "transparent", color: active ? color : "#64748b", border: `1px solid ${active ? `${color}40` : "rgba(255,255,255,0.07)"}` }}
    >
      {label}{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
