"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

type ClickEvent = { url: string; at: string };

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
  last_opened_at: string | null;
  open_count: number;
  open_history: string[] | null;
  clicked_at: string | null;
  last_clicked_at: string | null;
  click_count: number;
  click_history: ClickEvent[] | null;
  bounced_at: string | null;
  complained_at: string | null;
  metadata: Record<string, unknown> | null;
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
  queued:     { label: "Queued",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  sent:       { label: "Sent",       color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  delayed:    { label: "Delayed",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  delivered:  { label: "Delivered",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  opened:     { label: "Opened",     color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  clicked:    { label: "Clicked",    color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  bounced:    { label: "Bounced",    color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  complained: { label: "Spam",       color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  failed:     { label: "Failed",     color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const TYPE_LABELS: Record<string, string> = {
  registration:         "Registration",
  password_reset:       "Password Reset",
  contact_confirmation: "Contact Form",
  lead_confirmation:    "Lead",
  newsletter_welcome:   "Newsletter",
  callback_confirmation:"Callback",
  chat_transcript:      "Chat",
  ticket_confirmation:  "Ticket Created",
  ticket_reply:         "Ticket Reply",
  ticket_status_update: "Ticket Status",
  user_approved:        "User Approved",
  user_rejected:        "User Rejected",
  feature_broadcast:    "Broadcast",
  task_assigned:        "Task Assigned",
  invoice:              "Invoice",
  transactional:        "Transactional",
};

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
      <p style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>{label}</p>
      <p style={{ color, fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1 }}>{value.toLocaleString()}</p>
      {sub && <p style={{ color: "#475569", fontSize: 11, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "medium" });
}

function shortUrl(url: string): string {
  try { const u = new URL(url); return u.hostname + u.pathname.slice(0, 30); }
  catch { return url.slice(0, 40); }
}

export default function EmailLogsPage() {
  const router = useRouter();
  const [logs,         setLogs]         = useState<EmailLog[]>([]);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [liveFlash,    setLiveFlash]    = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const res = await fetch(`/api/dashboard/email-logs?${params}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.status === 401 || res.status === 403) { router.replace("/enter/backdrop"); return; }
      const data = await res.json() as { logs: EmailLog[]; total: number; stats: Stats };
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(page, search, typeFilter, statusFilter); }, [load, page, search, typeFilter, statusFilter]);

  // Auto-poll every 10 s — Supabase RLS blocks anon realtime so we poll via our auth'd API instead
  useEffect(() => {
    const id = setInterval(() => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      setLiveFlash("Auto-refreshed");
      flashTimer.current = setTimeout(() => setLiveFlash(null), 2000);
      load(page, search, typeFilter, statusFilter);
    }, 10_000);
    return () => clearInterval(id);
  }, [load, page, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8,
    padding: "7px 12px",
    color: "#e2e8f0",
    fontSize: 13,
    outline: "none",
  };

  return (
    <DashboardShell>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>Email Logs</h1>
            <p style={{ color: "#475569", fontSize: 12, margin: "3px 0 0" }}>{total.toLocaleString()} emails tracked · 100% internal tracking</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>LIVE</span>
            </div>
            <button
              onClick={() => load(page, search, typeFilter, statusFilter)}
              style={{ ...inputStyle, cursor: "pointer", fontWeight: 600, color: "#94a3b8" }}
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        {/* Live flash banner */}
        {liveFlash && (
          <div style={{ background: "rgba(99,102,241,0.12)", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "8px 24px", fontSize: 12, color: "#a5b4fc", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
            {liveFlash}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ padding: "16px 24px 8px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10, flexShrink: 0 }}>
            <StatCard label="Total"     value={stats.total}      color="#e2e8f0" />
            <StatCard label="Sent"      value={stats.sent}       color="#60a5fa" />
            <StatCard label="Delivered" value={stats.delivered}  color="#34d399" />
            <StatCard label="Opened"    value={stats.opened}     color="#a78bfa"
              sub={stats.total > 0 ? `${((stats.opened + stats.clicked) / stats.total * 100).toFixed(1)}% rate` : undefined}
            />
            <StatCard label="Clicked"   value={stats.clicked}    color="#818cf8"
              sub={stats.total > 0 ? `${(stats.clicked / stats.total * 100).toFixed(1)}% rate` : undefined}
            />
            <StatCard label="Bounced"   value={stats.bounced}    color="#f87171" />
            <StatCard label="Spam"      value={stats.complained} color="#fb923c" />
            <StatCard label="Failed"    value={stats.failed}     color="#ef4444" />
          </div>
        )}

        {/* Filters */}
        <div style={{ padding: "10px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Search email or subject…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: 240 }}
          />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <p style={{ color: "#475569", fontSize: 13, padding: 24 }}>Loading…</p>
          ) : logs.length === 0 ? (
            <p style={{ color: "#475569", fontSize: 13, padding: 24 }}>No emails found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["To", "Subject", "Type", "Status", "Opens", "Clicks", "Sent"].map((h) => (
                    <th key={h} style={{ textAlign: "left", color: "#475569", fontSize: 11, fontWeight: 600, padding: "10px 16px", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
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
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: isOpen ? "rgba(99,102,241,0.05)" : "transparent", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                      onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "10px 16px", color: "#cbd5e1", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.to_email}</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.subject}</td>
                      <td style={{ padding: "10px 16px", color: "#64748b", whiteSpace: "nowrap" }}>{TYPE_LABELS[log.email_type] ?? log.email_type}</td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ background: st.bg, color: st.color, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        {log.open_count > 0 ? (
                          <span style={{ color: "#a78bfa", fontWeight: 700 }}>{log.open_count}×</span>
                        ) : <span style={{ color: "#334155" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        {log.click_count > 0 ? (
                          <span style={{ color: "#818cf8", fontWeight: 700 }}>{log.click_count}×</span>
                        ) : <span style={{ color: "#334155" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 16px", color: "#475569", whiteSpace: "nowrap", fontSize: 12 }}>{fmt(log.sent_at ?? log.created_at)}</td>
                    </tr>,

                    // Expanded detail row
                    isOpen && (
                      <tr key={`${log.id}-detail`} style={{ background: "rgba(99,102,241,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td colSpan={7} style={{ padding: "16px 24px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px 32px" }}>

                            {/* Column 1: Timeline */}
                            <div>
                              <p style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Timeline</p>
                              {[
                                ["Queued",    log.created_at],
                                ["Sent",      log.sent_at],
                                ["Delivered", log.delivered_at],
                                ["Bounced",   log.bounced_at],
                                ["Complained",log.complained_at],
                              ].filter(([, v]) => v).map(([label, value]) => (
                                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ color: "#64748b", fontSize: 12 }}>{label}</span>
                                  <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "monospace" }}>{fmt(value as string)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Column 2: Opens */}
                            <div>
                              <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                                Opens {log.open_count > 0 ? `(${log.open_count}×)` : ""}
                              </p>
                              {log.open_count === 0 ? (
                                <p style={{ color: "#334155", fontSize: 12 }}>Not opened yet</p>
                              ) : (
                                <div style={{ maxHeight: 120, overflowY: "auto" }}>
                                  {(log.open_history ?? []).map((ts, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                      <span style={{ color: "#64748b", fontSize: 11 }}>Open #{i + 1}</span>
                                      <span style={{ color: "#a78bfa", fontSize: 11, fontFamily: "monospace" }}>{fmtTime(ts)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Column 3: Clicks */}
                            <div>
                              <p style={{ color: "#818cf8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                                Clicks {log.click_count > 0 ? `(${log.click_count}×)` : ""}
                              </p>
                              {log.click_count === 0 ? (
                                <p style={{ color: "#334155", fontSize: 12 }}>No clicks yet</p>
                              ) : (
                                <div style={{ maxHeight: 120, overflowY: "auto" }}>
                                  {(log.click_history ?? []).map((ev, i) => (
                                    <div key={i} style={{ marginBottom: 5 }}>
                                      <div style={{ color: "#64748b", fontSize: 10, marginBottom: 1 }}>
                                        {fmtTime(ev.at)}
                                      </div>
                                      <div style={{ color: "#818cf8", fontSize: 11, wordBreak: "break-all" }} title={ev.url}>
                                        {shortUrl(ev.url)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Metadata row */}
                          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: "4px 24px" }}>
                            {[
                              ["ID",         log.id],
                              ["Resend ID",  log.resend_id ?? "—"],
                              ["Last event", log.last_event ?? "—"],
                              ...(log.metadata ? Object.entries(log.metadata).map(([k, v]) => [k, String(v)]) : []),
                            ].map(([label, value]) => (
                              <span key={label as string} style={{ fontSize: 11, color: "#475569" }}>
                                <span style={{ color: "#334155" }}>{label}: </span>
                                <span style={{ color: "#64748b", fontFamily: "monospace" }}>{value as string}</span>
                              </span>
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
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...inputStyle, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.3 : 1 }}
            >← Prev</button>
            <span style={{ color: "#475569", fontSize: 12 }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ ...inputStyle, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.3 : 1 }}
            >Next →</button>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
