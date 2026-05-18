"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}
function getRole() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") || "" : "";
}

interface OverviewMetrics { sessions: number; users: number; pageviews: number; bounceRate: number; avgSessionDuration: number; newUsers: number }
interface SessionsByDate  { date: string; sessions: number }
interface TopPage         { page: string; sessions: number; bounceRate: number }
interface TrafficSource   { source: string; sessions: number; percentage: number }
interface DeviceBreakdown { device: string; sessions: number; percentage: number }
interface EventCount      { eventName: string; count: number }

interface AnalyticsData {
  overview:       OverviewMetrics;
  sessionsByDate: SessionsByDate[];
  topPages:       TopPage[];
  trafficSources: TrafficSource[];
  deviceBreakdown:DeviceBreakdown[];
  eventCounts:    EventCount[];
}

interface AIResult { healthScore: number; flags: string[]; analysis: string }

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60), s = Math.floor(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function bounceColor(rate: number) {
  if (rate < 0.4) return "#22c55e";
  if (rate < 0.7) return "#f59e0b";
  return "#ef4444";
}

// Simple SVG sparkline for sessions over time
function Sparkline({ data }: { data: SessionsByDate[] }) {
  if (!data.length) return <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#334155", fontSize: 12 }}>No data</span></div>;
  const vals = data.map(d => d.sessions);
  const max  = Math.max(...vals, 1);
  const W = 600, H = 80, pad = 4;
  const pts = vals.map((v, i) => {
    const x = pad + (i / Math.max(vals.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((v / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(" ");
  const fillPts = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ items, color = "#3b82f6" }: { items: { label: string; value: number; pct: number }[]; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{item.label}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{item.value.toLocaleString()} <span style={{ color: "#475569", fontWeight: 400 }}>({item.pct}%)</span></span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${item.pct}%`, borderRadius: 99, background: color, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const CARD = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" } as React.CSSProperties;

export default function AnalyticsPage() {
  const router = useRouter();
  const [data,      setData]      = useState<AnalyticsData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [aiResult,  setAiResult]  = useState<AIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError,   setAiError]   = useState("");

  useEffect(() => {
    const secret = getSecret();
    const role   = getRole();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    if (role && role !== "super_admin" && role !== "admin") { router.replace("/enter/backdrop/dashboard"); return; }

    fetch("/api/dashboard/analytics", { headers: { Authorization: `Bearer ${secret}` } })
      .then(r => r.json() as Promise<AnalyticsData & { error?: string }>)
      .then(d => {
        if (d.error) { setError(d.error); } else { setData(d); }
      })
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [router]);

  async function runAI() {
    if (!data) return;
    setAnalyzing(true); setAiError(""); setAiResult(null);
    const secret = getSecret();
    try {
      const res  = await fetch("/api/dashboard/analytics", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json() as AIResult & { error?: string };
      if (d.error) { setAiError(d.error); } else { setAiResult(d); }
    } catch { setAiError("AI analysis failed. Please try again."); }
    finally { setAnalyzing(false); }
  }

  const statsCards = data ? [
    { label: "Sessions",           value: data.overview.sessions.toLocaleString(),                       color: "#3b82f6" },
    { label: "Users",              value: data.overview.users.toLocaleString(),                          color: "#8b5cf6" },
    { label: "Pageviews",          value: data.overview.pageviews.toLocaleString(),                      color: "#06b6d4" },
    { label: "Bounce Rate",        value: `${(data.overview.bounceRate * 100).toFixed(1)}%`,             color: bounceColor(data.overview.bounceRate) },
    { label: "Avg Duration",       value: fmtDuration(data.overview.avgSessionDuration),                 color: "#22c55e" },
    { label: "New Users",          value: data.overview.newUsers.toLocaleString(),                       color: "#f59e0b" },
  ] : [];

  const healthColor = (s: number) => s >= 8 ? "#22c55e" : s >= 5 ? "#f59e0b" : "#ef4444";

  return (
    <DashboardShell>
      <div style={{ padding: "24px 28px", maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Analytics</h1>
            <p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0" }}>Last 30 days · Google Analytics 4</p>
          </div>
          <button
            onClick={runAI}
            disabled={analyzing || !data}
            style={{
              padding: "10px 20px", borderRadius: 12, border: "none", cursor: analyzing || !data ? "not-allowed" : "pointer",
              background: analyzing ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              opacity: !data ? 0.5 : 1,
            }}
          >
            {analyzing ? "Analysing…" : "✦ Run AI Analysis"}
          </button>
        </div>

        {/* GA4 not configured */}
        {!loading && error === "GA4 not configured" && (
          <div style={{ ...CARD, borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.04)" }}>
            <p style={{ color: "#fbbf24", fontWeight: 600, marginBottom: 8 }}>Google Analytics 4 not configured</p>
            <p style={{ color: "#78350f", fontSize: 13, margin: 0 }}>Add these two environment variables in Vercel to enable this dashboard:</p>
            <pre style={{ color: "#fde68a", fontSize: 12, marginTop: 12, padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 8 }}>
{`GA4_PROPERTY_ID         = your_numeric_property_id
GA4_SERVICE_ACCOUNT_JSON = {"type":"service_account","project_id":"...","private_key":"...","client_email":"...",...}`}
            </pre>
          </div>
        )}

        {/* Generic error */}
        {!loading && error && error !== "GA4 not configured" && (
          <div style={{ ...CARD, borderColor: "rgba(239,68,68,0.2)" }}>
            <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...CARD, height: 80, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {statsCards.map(c => (
                <div key={c.label} style={CARD}>
                  <p style={{ color: "#475569", fontSize: 12, margin: "0 0 6px" }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 26, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Sparkline */}
            <div style={{ ...CARD, marginBottom: 24 }}>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>Sessions over time</p>
              <Sparkline data={data.sessionsByDate} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ color: "#334155", fontSize: 11 }}>{data.sessionsByDate[0]?.date ?? ""}</span>
                <span style={{ color: "#334155", fontSize: 11 }}>{data.sessionsByDate[data.sessionsByDate.length - 1]?.date ?? ""}</span>
              </div>
            </div>

            {/* Two-column: sources + devices */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 16px", fontWeight: 600 }}>Traffic Sources</p>
                <BarChart
                  items={data.trafficSources.map(s => ({ label: s.source, value: s.sessions, pct: s.percentage }))}
                  color="#8b5cf6"
                />
              </div>
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 16px", fontWeight: 600 }}>Device Breakdown</p>
                <BarChart
                  items={data.deviceBreakdown.map(d => ({ label: d.device, value: d.sessions, pct: d.percentage }))}
                  color="#06b6d4"
                />
              </div>
            </div>

            {/* Top pages */}
            <div style={{ ...CARD, marginBottom: 24 }}>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 16px", fontWeight: 600 }}>Top Pages</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Page", "Sessions", "Bounce Rate"].map(h => (
                      <th key={h} style={{ color: "#334155", fontSize: 11, fontWeight: 600, textAlign: h === "Page" ? "left" : "right", padding: "0 0 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p, i) => (
                    <tr key={i}>
                      <td style={{ color: "#94a3b8", fontSize: 13, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.page}</td>
                      <td style={{ color: "#fff", fontSize: 13, textAlign: "right", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{p.sessions.toLocaleString()}</td>
                      <td style={{ textAlign: "right", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: bounceColor(p.bounceRate), fontSize: 13, fontWeight: 600 }}>{(p.bounceRate * 100).toFixed(0)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top events */}
            {data.eventCounts.length > 0 && (
              <div style={{ ...CARD, marginBottom: 24 }}>
                <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 16px", fontWeight: 600 }}>Top Events</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
                  {data.eventCounts.slice(0, 12).map(e => (
                    <div key={e.eventName} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{e.eventName}</span>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{e.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: 0 }}>AI Insights</p>
                {aiResult && (
                  <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: `${healthColor(aiResult.healthScore)}18`, color: healthColor(aiResult.healthScore), border: `1px solid ${healthColor(aiResult.healthScore)}33` }}>
                    Health {aiResult.healthScore}/10
                  </span>
                )}
              </div>

              {!aiResult && !analyzing && !aiError && (
                <p style={{ color: "#334155", fontSize: 13, margin: 0 }}>Click <strong style={{ color: "#64748b" }}>Run AI Analysis</strong> above to get an intelligent breakdown of your traffic, engagement, and conversion health.</p>
              )}

              {analyzing && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ color: "#475569", fontSize: 13 }}>Analysing your data…</span>
                </div>
              )}

              {aiError && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{aiError}</p>}

              {aiResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {aiResult.flags.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {aiResult.flags.map((f, i) => (
                        <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5", fontSize: 13 }}>{f}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding: "16px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#94a3b8", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {aiResult.analysis}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.7; } }
      `}</style>
    </DashboardShell>
  );
}
