"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { DashboardShell } from "@/components/backdrop/DashboardShell";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

type EmailLog = {
  id: string;
  resend_id: string | null;
  to_email: string;
  subject: string;
  email_type: string;
  status: string;
  last_event: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  created_at: string;
};

type Stats = {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  queued:    { label: "Queued",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  sent:      { label: "Sent",       color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  delayed:   { label: "Delayed",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  delivered: { label: "Delivered",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  opened:    { label: "Opened",     color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  clicked:   { label: "Clicked",    color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  bounced:   { label: "Bounced",    color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  complained:{ label: "Spam",       color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  failed:    { label: "Failed",     color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const TYPE_LABELS: Record<string, string> = {
  registration:         "Registration",
  password_reset:       "Password Reset",
  contact_confirmation: "Contact Form",
  lead_confirmation:    "Lead",
  newsletter_welcome:   "Newsletter",
  callback_confirmation:"Callback",
  chat_transcript:      "Chat Transcript",
  ticket_confirmation:  "Ticket Created",
  ticket_reply:         "Ticket Reply",
  ticket_status_update: "Ticket Status",
  user_approved:        "User Approved",
  user_rejected:        "User Rejected",
  feature_broadcast:    "Broadcast",
  transactional:        "Transactional",
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
    </div>
  );
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
}

export default function EmailLogsPage() {
  const router = useRouter();
  const [logs,    setLogs]    = useState<EmailLog[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const limit = 50;

  const load = useCallback(async (p: number, q: string, t: string, s: string) => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (q) params.set("q", q);
    if (t) params.set("type", t);
    if (s) params.set("status", s);
    try {
      const res = await fetch(`/api/dashboard/email-logs?${params}`, { headers: { Authorization: `Bearer ${secret}` } });
      if (res.status === 401 || res.status === 403) { router.replace("/enter/backdrop"); return; }
      const data = await res.json() as { logs: EmailLog[]; total: number; stats: Stats };
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(page, search, typeFilter, statusFilter); }, [load, page, search, typeFilter, statusFilter]);

  // Subscribe to email_logs via Supabase Realtime — auto-refresh when any row changes
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const sb = createClient(url, key);
    const channel = sb
      .channel("email-logs-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "email_logs" }, () => {
        load(page, search, typeFilter, statusFilter);
      })
      .subscribe();
    return () => { void sb.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const inputCls   = "px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" };

  return (
    <DashboardShell>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Email Logs</h1>
            <p className="text-slate-500 text-xs mt-0.5">{total.toLocaleString()} emails tracked</p>
          </div>
          <button
            onClick={() => load(page, search, typeFilter, statusFilter)}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 transition-colors hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            Refresh
          </button>
        </header>

        {/* Stats */}
        {stats && (
          <div className="px-6 pt-5 pb-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 shrink-0">
            <StatCard label="Total"     value={stats.total}     color="#e2e8f0" />
            <StatCard label="Sent"      value={stats.sent}      color="#60a5fa" />
            <StatCard label="Delivered" value={stats.delivered} color="#34d399" />
            <StatCard label="Opened"    value={stats.opened}    color="#a78bfa" />
            <StatCard label="Clicked"   value={stats.clicked}   color="#818cf8" />
            <StatCard label="Bounced"   value={stats.bounced}   color="#f87171" />
            <StatCard label="Spam"      value={stats.complained} color="#fb923c" />
            <StatCard label="Failed"    value={stats.failed}    color="#ef4444" />
          </div>
        )}

        {/* Delivery & Open rates */}
        {stats && stats.total > 0 && (
          <div className="px-6 pt-2 pb-4 flex flex-wrap gap-4 shrink-0">
            {[
              { label: "Delivery rate", value: ((stats.delivered + stats.opened + stats.clicked) / stats.total * 100).toFixed(1), color: "#34d399" },
              { label: "Open rate",     value: (stats.total > 0 ? ((stats.opened + stats.clicked) / stats.total * 100).toFixed(1) : "0.0"), color: "#a78bfa" },
              { label: "Click rate",    value: (stats.total > 0 ? (stats.clicked / stats.total * 100).toFixed(1) : "0.0"), color: "#818cf8" },
              { label: "Bounce rate",   value: (stats.total > 0 ? (stats.bounced / stats.total * 100).toFixed(1) : "0.0"), color: "#f87171" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-sm">
                <span className="text-slate-500">{label}: </span>
                <span className="font-semibold" style={{ color }}>{value}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-3 border-b flex flex-wrap gap-3 shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <input
            type="text"
            placeholder="Search email or subject…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${inputCls} w-64`}
            style={inputStyle}
          />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className={inputCls} style={inputStyle}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls} style={inputStyle}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <p className="text-slate-500 text-sm p-6">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="text-slate-500 text-sm p-6">No emails found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["To", "Subject", "Type", "Status", "Sent", "Opened"].map((h) => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const st = STATUS_STYLE[log.status] ?? { label: log.status, color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
                  const isOpen = expanded === log.id;
                  return [
                    <tr
                      key={log.id}
                      onClick={() => setExpanded(isOpen ? null : log.id)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate">{log.to_email}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-[260px] truncate">{log.subject}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{TYPE_LABELS[log.email_type] ?? log.email_type}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmt(log.sent_at ?? log.created_at)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{fmt(log.opened_at)}</td>
                    </tr>,
                    isOpen && (
                      <tr key={`${log.id}-detail`} style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-xs">
                            {[
                              ["Resend ID",    log.resend_id ?? "—"],
                              ["Created",      fmt(log.created_at)],
                              ["Sent",         fmt(log.sent_at)],
                              ["Delivered",    fmt(log.delivered_at)],
                              ["Opened",       fmt(log.opened_at)],
                              ["Clicked",      fmt(log.clicked_at)],
                              ["Bounced",      fmt(log.bounced_at)],
                              ["Complained",   fmt(log.complained_at)],
                              ["Last event",   log.last_event ?? "—"],
                            ].map(([label, value]) => (
                              <div key={label}>
                                <span className="text-slate-600">{label}: </span>
                                <span className="text-slate-300 font-mono break-all">{value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t shrink-0 flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
