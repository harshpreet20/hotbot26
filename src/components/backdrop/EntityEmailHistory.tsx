"use client";
import { useEffect, useState, useRef } from "react";

function getSecret(): string {
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
  last_opened_at: string | null;
  open_count: number;
  open_history: string[] | null;
  click_count: number;
  click_history: ClickEvent[] | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  registration:          "Registration",
  password_reset:        "Password Reset",
  contact_confirmation:  "Contact Form",
  lead_confirmation:     "Lead",
  newsletter_welcome:    "Newsletter",
  callback_confirmation: "Callback",
  chat_transcript:       "Chat",
  ticket_confirmation:   "Ticket Created",
  ticket_reply:          "Ticket Reply",
  ticket_status_update:  "Ticket Status",
  user_approved:         "User Approved",
  user_rejected:         "User Rejected",
  feature_broadcast:     "Broadcast",
  task_assigned:         "Task",
  client_welcome:        "Client Welcome",
  invoice:               "Invoice",
  newsletter:            "Newsletter Bulk",
  transactional:         "Transactional",
};

const STATUS_COLOR: Record<string, string> = {
  queued:     "#94a3b8",
  sent:       "#60a5fa",
  delivered:  "#34d399",
  opened:     "#a78bfa",
  clicked:    "#818cf8",
  bounced:    "#f87171",
  complained: "#fb923c",
  failed:     "#ef4444",
};

function fmtTs(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function fmtShort(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname.slice(0, 30);
  } catch {
    return url.slice(0, 40);
  }
}

interface Props {
  entityType: string;
  entityId: string;
  role?: string | null;
}

export function EntityEmailHistory({ entityType, entityId, role }: Props) {
  const [logs, setLogs]           = useState<EmailLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = async (silent = false) => {
    const secret = getSecret();
    if (!secret) return;
    try {
      const params = new URLSearchParams({
        entity_type: entityType,
        entity_id:   entityId,
        limit:       "100",
      });
      const res = await fetch(`/api/dashboard/email-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { logs: EmailLog[] };
      setLogs(data.logs ?? []);
    } catch {
      /* ignore */
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
    // Silent background poll — no loading state flicker
    intervalRef.current = setInterval(() => { void fetchLogs(true); }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  async function deleteLog(id: string) {
    if (!window.confirm("Delete this email log entry?")) return;
    const secret = getSecret();
    try {
      const res = await fetch(`/api/dashboard/email-logs?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
        if (expanded === id) setExpanded(null);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        marginTop: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Email History
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "8px 0" }}>
        {loading ? (
          <p style={{ color: "#475569", fontSize: 12, padding: "12px 16px", margin: 0 }}>Loading…</p>
        ) : logs.length === 0 ? (
          <p style={{ color: "#334155", fontSize: 12, padding: "12px 16px", margin: 0 }}>No emails sent yet.</p>
        ) : (
          logs.map((log) => {
            const isOpen       = expanded === log.id;
            const typeLabel    = TYPE_LABELS[log.email_type] ?? log.email_type;
            const statusColor  = STATUS_COLOR[log.status] ?? "#94a3b8";

            return (
              <div key={log.id}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: isOpen ? "rgba(99,102,241,0.06)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Type badge */}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      background: "rgba(99,102,241,0.15)",
                      color: "#a5b4fc",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {typeLabel}
                  </span>

                  {/* Subject */}
                  <span
                    style={{
                      color: "#cbd5e1",
                      fontSize: 12,
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={log.subject}
                  >
                    {log.subject}
                  </span>

                  {/* Status badge */}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      background: `${statusColor}18`,
                      color: statusColor,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {log.status}
                  </span>

                  {/* Opens */}
                  {log.open_count > 0 && (
                    <span style={{ fontSize: 11, color: "#a78bfa", whiteSpace: "nowrap", flexShrink: 0 }}>
                      👁 {log.open_count}×
                    </span>
                  )}

                  {/* Clicks */}
                  {log.click_count > 0 && (
                    <span style={{ fontSize: 11, color: "#818cf8", whiteSpace: "nowrap", flexShrink: 0 }}>
                      🔗 {log.click_count}×
                    </span>
                  )}

                  {/* Sent at */}
                  <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {fmtTs(log.sent_at ?? log.created_at)}
                  </span>

                  {/* Last opened */}
                  {log.last_opened_at && (
                    <span style={{ fontSize: 10, color: "#334155", whiteSpace: "nowrap", flexShrink: 0 }}>
                      Last opened: {fmtTs(log.last_opened_at)}
                    </span>
                  )}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div
                    style={{
                      background: "rgba(99,102,241,0.03)",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                      {/* Open history */}
                      <div>
                        <p style={{ color: "#a78bfa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, marginTop: 0 }}>
                          Opens {log.open_count > 0 ? `(${log.open_count}×)` : ""}
                        </p>
                        {log.open_count === 0 ? (
                          <p style={{ color: "#334155", fontSize: 11, margin: 0 }}>Not opened yet</p>
                        ) : (
                          <div style={{ maxHeight: 100, overflowY: "auto" }}>
                            {(log.open_history ?? []).map((ts, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ color: "#64748b", fontSize: 10 }}>#{i + 1}</span>
                                <span style={{ color: "#a78bfa", fontSize: 10, fontFamily: "monospace" }}>{fmtShort(ts)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Click history */}
                      <div>
                        <p style={{ color: "#818cf8", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, marginTop: 0 }}>
                          Clicks {log.click_count > 0 ? `(${log.click_count}×)` : ""}
                        </p>
                        {log.click_count === 0 ? (
                          <p style={{ color: "#334155", fontSize: 11, margin: 0 }}>No clicks yet</p>
                        ) : (
                          <div style={{ maxHeight: 100, overflowY: "auto" }}>
                            {(log.click_history ?? []).map((ev, i) => (
                              <div key={i} style={{ marginBottom: 4 }}>
                                <div style={{ color: "#64748b", fontSize: 9 }}>{fmtShort(ev.at)}</div>
                                <div style={{ color: "#818cf8", fontSize: 10, wordBreak: "break-all" }} title={ev.url}>
                                  {shortUrl(ev.url)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: meta + delete */}
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "3px 16px" }}>
                      <span style={{ fontSize: 10, color: "#334155" }}>
                        ID: <span style={{ fontFamily: "monospace", color: "#475569" }}>{log.id}</span>
                      </span>
                      {log.resend_id && (
                        <span style={{ fontSize: 10, color: "#334155" }}>
                          Resend: <span style={{ fontFamily: "monospace", color: "#475569" }}>{log.resend_id}</span>
                        </span>
                      )}
                      {log.last_event && (
                        <span style={{ fontSize: 10, color: "#334155" }}>
                          Event: <span style={{ color: "#475569" }}>{log.last_event}</span>
                        </span>
                      )}

                      {role === "super_admin" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); void deleteLog(log.id); }}
                          style={{
                            marginLeft: "auto",
                            padding: "3px 9px",
                            borderRadius: 6,
                            border: "1px solid rgba(239,68,68,0.3)",
                            background: "rgba(239,68,68,0.08)",
                            color: "#f87171",
                            fontSize: 10,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                          title="Delete log entry"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
