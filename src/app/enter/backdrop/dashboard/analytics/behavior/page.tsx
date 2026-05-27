"use client";
import { useEffect, useState, useCallback } from "react";

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "20px 24px",
};

interface TopEngaged {
  email: string;
  lead_quality: "cold" | "warm" | "hot";
  engagement_score: number;
  intent_score: number;
  sessions_count: number;
  last_activity: string;
  pricing_visits: number;
  proposal_views: number;
  lead_id?: string;
}

interface FunnelStage {
  stage: string;
  count: number;
  conversion_pct: number;
}

interface PortalActivity {
  client_id: string;
  email: string;
  event_count: number;
  last_active: string;
  top_event_type: string;
}

interface PortalEvent {
  email: string;
  event_type: string;
  entity_type: string | null;
  page: string | null;
  created_at: string;
}

interface BehaviorStats {
  total_visitor_profiles: number;
  hot_leads_count: number;
  warm_leads_count: number;
  active_portal_clients_7d: number;
  total_portal_events_7d: number;
}

interface BehaviorData {
  top_engaged: TopEngaged[];
  funnel: FunnelStage[];
  portal_activity: PortalActivity[];
  recent_portal_events: PortalEvent[];
  stats: BehaviorStats;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

function truncateEmail(email: string, max = 22): string {
  if (email.length <= max) return email;
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, max) + "…";
  if (domain.length + 5 >= max) return email.slice(0, max) + "…";
  const keep = max - domain.length - 2;
  return `${local.slice(0, keep)}…@${domain}`;
}

const STAGE_NAMES: Record<string, string> = {
  lead_form_submit: "Form Submitted",
  lead: "Lead Created",
  qualified: "Qualified",
  proposal: "Proposal Sent",
  proposal_viewed: "Proposal Viewed",
  payment: "Payment Received",
  onboarding: "Onboarding Started",
};

const STAGE_COLORS: Record<string, string> = {
  lead_form_submit: "#3b82f6",
  lead: "#6366f1",
  proposal: "#8b5cf6",
  payment: "#22c55e",
  onboarding: "#06b6d4",
};

const EVENT_ICONS: Record<string, string> = {
  page_view: "👁",
  project_view: "📋",
  update_view: "💬",
  invoice_view: "💰",
  file_download: "📥",
  ticket_create: "🎫",
  login: "🔐",
  comment: "💬",
  task_create: "✅",
  approval: "✅",
  file_upload: "📤",
};

function Skeleton({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: "rgba(255,255,255,0.06)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function BehaviorPage() {
  const [data, setData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const secret =
        typeof window !== "undefined"
          ? sessionStorage.getItem("backdrop_secret") || ""
          : "";
      const res = await fetch("/api/dashboard/analytics/behavior", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) throw new Error("fetch failed");
      const json: BehaviorData = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const stats = data?.stats;
  const hotCount = data?.top_engaged.filter((l) => l.lead_quality === "hot").length ?? 0;
  const warmCount = data?.top_engaged.filter((l) => l.lead_quality === "warm").length ?? 0;
  const maxFunnelPct = data?.funnel.length
    ? Math.max(...data.funnel.map((f) => f.conversion_pct), 1)
    : 1;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "32px 28px", color: "#fff" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
            Behavioral Intelligence
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()} · Auto-refresh every 60s`
              : "Auto-refresh every 60s"}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 8,
            color: "#818cf8",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 16px",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            ...CARD,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#fca5a5" }}>Unable to load behavioral data</span>
          <button
            onClick={() => { setError(false); setLoading(true); fetchData(); }}
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "none",
              borderRadius: 6,
              color: "#fca5a5",
              cursor: "pointer",
              padding: "6px 14px",
              fontSize: 13,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
        {(
          [
            { label: "Visitor Profiles", color: "#3b82f6", key: "total_visitor_profiles" },
            { label: "Hot Leads 🔥", color: "#ef4444", key: "hot_leads_count" },
            { label: "Warm Leads", color: "#f59e0b", key: "warm_leads_count" },
            { label: "Portal Active (7d)", color: "#22c55e", key: "active_portal_clients_7d" },
            { label: "Portal Events (7d)", color: "#8b5cf6", key: "total_portal_events_7d" },
          ] as const
        ).map(({ label, color, key }) => (
          <div key={key} style={CARD}>
            {loading ? (
              <>
                <Skeleton w="60%" h={12} />
                <div style={{ marginTop: 10 }}><Skeleton w="40%" h={28} /></div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>
                  {stats ? (stats[key] ?? 0).toLocaleString() : "—"}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Lead Intelligence Table */}
          <div style={CARD}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Lead Intelligence</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                  🔥 Hot {hotCount}
                </span>
                <span style={{ fontSize: 12, background: "rgba(245,158,11,0.15)", color: "#fbbf24", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                  🌡 Warm {warmCount}
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} h={36} />)}
              </div>
            ) : !data?.top_engaged.length ? (
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                No engagement data yet — visitor tracking will populate this once leads interact with your site.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Email", "Quality", "Score", "Intent", "Sessions", "Pricing", "Proposal", "Last Seen"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_engaged.map((row, i) => {
                      const qColors =
                        row.lead_quality === "hot"
                          ? { bg: "rgba(239,68,68,0.2)", text: "#f87171", label: "🔥 Hot" }
                          : row.lead_quality === "warm"
                          ? { bg: "rgba(245,158,11,0.2)", text: "#fbbf24", label: "🌡 Warm" }
                          : { bg: "rgba(100,116,139,0.2)", text: "#94a3b8", label: "❄ Cold" };
                      const scoreColor =
                        row.engagement_score >= 7 ? "#22c55e" : row.engagement_score >= 4 ? "#f59e0b" : "#94a3b8";
                      return (
                        <tr
                          key={i}
                          onClick={() => row.lead_id && (window.location.href = `/enter/backdrop/dashboard/leads/${row.lead_id}`)}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            transition: "background 0.15s",
                            cursor: row.lead_id ? "pointer" : "default",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
                        >
                          <td style={{ padding: "10px 10px", color: "#e2e8f0", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {truncateEmail(row.email)}
                          </td>
                          <td style={{ padding: "10px 10px" }}>
                            <span style={{ background: qColors.bg, color: qColors.text, padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                              {qColors.label}
                            </span>
                          </td>
                          <td style={{ padding: "10px 10px", color: scoreColor, fontWeight: 600 }}>{row.engagement_score}</td>
                          <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{row.intent_score}</td>
                          <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{row.sessions_count}</td>
                          <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{row.pricing_visits}</td>
                          <td style={{ padding: "10px 10px", color: "#94a3b8" }}>{row.proposal_views}</td>
                          <td style={{ padding: "10px 10px", color: "#64748b", whiteSpace: "nowrap" }}>{timeAgo(row.last_activity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Conversion Funnel */}
          <div style={CARD}>
            <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 600 }}>Conversion Funnel</h2>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} h={32} />)}
              </div>
            ) : !data?.funnel.length ? (
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>No funnel data available.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {data.funnel.map((stage, i) => {
                  const barColor = STAGE_COLORS[stage.stage] ?? "#6366f1";
                  const barWidth = (stage.conversion_pct / maxFunnelPct) * 100;
                  const isLast = i === data.funnel.length - 1;
                  return (
                    <div key={stage.stage}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 130, flexShrink: 0, fontSize: 12, color: "#94a3b8", textAlign: "right" }}>
                          {STAGE_NAMES[stage.stage] ?? stage.stage}
                        </div>
                        <div style={{ flex: 1, position: "relative", height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6, overflow: "hidden" }}>
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              height: "100%",
                              width: `${barWidth}%`,
                              background: barColor,
                              borderRadius: 6,
                              opacity: 0.75,
                              transition: "width 0.5s ease",
                            }}
                          />
                          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: "#fff", zIndex: 1 }}>
                            {stage.conversion_pct.toFixed(1)}% ({stage.count.toLocaleString()})
                          </span>
                        </div>
                      </div>
                      {!isLast && (
                        <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 144, color: "#334155", fontSize: 12, lineHeight: 1 }}>
                          ↓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Portal Activity */}
          <div style={CARD}>
            <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>Portal Activity (30d)</h2>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} h={52} />)}
              </div>
            ) : !data?.portal_activity.length ? (
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>No portal activity yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.portal_activity.slice(0, 8).map((client) => (
                  <div
                    key={client.client_id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {truncateEmail(client.email)}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                        Last active {timeAgo(client.last_active)}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, background: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>
                        {client.event_count} events
                      </span>
                      <span style={{ fontSize: 11, color: "#475569", background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 10 }}>
                        {client.top_event_type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Portal Feed */}
          <div style={CARD}>
            <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>Recent Portal Events</h2>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} h={40} />)}
              </div>
            ) : !data?.recent_portal_events.length ? (
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>No recent portal events.</p>
            ) : (
              <div style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {data.recent_portal_events.slice(0, 20).map((ev, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{EVENT_ICONS[ev.event_type] ?? "⚡"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, color: "#e2e8f0" }}>{truncateEmail(ev.email, 20)}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {" — "}{ev.event_type.replace(/_/g, " ")}
                        {ev.page ? ` on ${ev.page}` : ""}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#475569", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {timeAgo(ev.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: "#334155" }}>
        Data refreshes every 60 seconds · Powered by portal behavioral tracking
      </div>
    </div>
  );
}
