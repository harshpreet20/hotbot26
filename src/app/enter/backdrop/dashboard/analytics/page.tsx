"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";
import type { AnalyticsBundle, Overview, TimePoint, TopPage, Source, DeviceSplit } from "@/lib/vercelAnalytics";

// ── Style constants ────────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "20px 24px",
};

const COLORS = {
  blue:   "#3b82f6",
  purple: "#8b5cf6",
  green:  "#22c55e",
  amber:  "#f59e0b",
  red:    "#ef4444",
  cyan:   "#06b6d4",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getSecret(): string {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") ?? "" : "";
}
function getRole(): string {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") ?? "" : "";
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60), s = Math.floor(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function healthColor(score: number): string {
  if (score >= 8) return COLORS.green;
  if (score >= 5) return COLORS.amber;
  return COLORS.red;
}

function bounceColor(rate: number): string {
  if (rate < 0.4) return COLORS.green;
  if (rate < 0.7) return COLORS.amber;
  return COLORS.red;
}

function trendColor(pct: number, invertGood = false): string {
  // invertGood=true means lower is better (bounce rate)
  const positive = invertGood ? pct < 0 : pct > 0;
  if (Math.abs(pct) < 1) return "#64748b";
  return positive ? COLORS.green : COLORS.red;
}

function trendArrow(pct: number, invertGood = false): string {
  if (Math.abs(pct) < 0.5) return "→";
  const positive = invertGood ? pct < 0 : pct > 0;
  return positive ? "↑" : "↓";
}

function statusBadge(pct: number, invertGood = false): { label: string; color: string; bg: string } {
  const positive = invertGood ? pct < 0 : pct > 0;
  const abs = Math.abs(pct);
  if (abs < 2) return { label: "Stable",   color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  if (positive && abs >= 10) return { label: "Good",   color: COLORS.green, bg: "rgba(34,197,94,0.1)" };
  if (positive)              return { label: "Watch",  color: COLORS.amber, bg: "rgba(245,158,11,0.1)" };
  if (abs >= 10)             return { label: "Critical", color: COLORS.red,  bg: "rgba(239,68,68,0.1)" };
  return                            { label: "Watch",  color: COLORS.amber, bg: "rgba(245,158,11,0.1)" };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: "50%",
      border: `2px solid ${COLORS.blue}`, borderTopColor: "transparent",
      animation: "spin 0.8s linear infinite", display: "inline-block",
    }} />
  );
}

interface VitalCardProps {
  label: string;
  value: string;
  valueColor: string;
  trend: number;
  invertGood?: boolean;
  subtitle?: string;
}
function VitalCard({ label, value, valueColor, trend: trendPct, invertGood = false, subtitle }: VitalCardProps) {
  const color  = trendColor(trendPct, invertGood);
  const arrow  = trendArrow(trendPct, invertGood);
  const badge  = statusBadge(trendPct, invertGood);
  return (
    <div style={CARD}>
      <p style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>{label}</p>
      <p style={{ color: valueColor, fontSize: 24, fontWeight: 700, margin: "0 0 6px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</p>
      {subtitle && (
        <p style={{ color: "#475569", fontSize: 11, margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color, fontSize: 12, fontWeight: 600 }}>
          {arrow} {Math.abs(trendPct).toFixed(1)}%
        </span>
        <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg }}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}

function TrafficSparkline({ data }: { data: TimePoint[] }) {
  if (!data.length) {
    return (
      <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#334155", fontSize: 12 }}>No timeseries data</span>
      </div>
    );
  }
  const vals = data.map(d => d.visitors);
  const max  = Math.max(...vals, 1);
  const W = 600, H = 90, pad = 6;
  const pts = vals.map((v, i) => {
    const x = pad + (i / Math.max(vals.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((v / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(" ");
  const fillPts = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 90 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.35" />
          <stop offset="100%" stopColor={COLORS.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#sparkGrad)" />
      <polyline points={pts} fill="none" stroke={COLORS.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SourcesBar({ sources }: { sources: Source[] }) {
  const max = sources[0]?.pct ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sources.slice(0, 8).map((s) => (
        <div key={s.source}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{s.source || "Direct"}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
              {s.visitors.toLocaleString()} <span style={{ color: "#475569", fontWeight: 400 }}>({s.pct}%)</span>
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(s.pct / max) * 100}%`, borderRadius: 99, background: COLORS.purple, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceDonut({ devices }: { devices: DeviceSplit[] }) {
  const DEVICE_ICONS: Record<string, string> = {
    mobile:  "📱",
    desktop: "💻",
    tablet:  "🖥",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {devices.slice(0, 6).map((d) => {
        const icon = DEVICE_ICONS[d.device.toLowerCase()] ?? "🔲";
        return (
          <div key={d.device}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>{icon} {d.device}</span>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{d.pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${d.pct}%`, borderRadius: 99, background: COLORS.cyan, transition: "width 0.6s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PageEngagementList({ pages }: { pages: TopPage[] }) {
  const maxVisitors = pages[0]?.visitors ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {pages.map((p, i) => {
        const bColor = bounceColor(p.bounceRate);
        const barW   = Math.round((p.visitors / maxVisitors) * 100);
        return (
          <div key={i} style={{ paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#94a3b8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }} title={p.page}>{p.page}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{p.visitors.toLocaleString()}</span>
                <span style={{ color: bColor, fontSize: 11, fontWeight: 700 }}>● {(p.bounceRate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barW}%`, borderRadius: 99, background: COLORS.blue }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── AI result type ────────────────────────────────────────────────────────────

interface AIResult {
  healthScore: number;
  flags: string[];
  sections: {
    traffic: string;
    engagement: string;
    conversions: string;
    recommendations: string[];
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();

  const [bundle,    setBundle]    = useState<AnalyticsBundle | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [aiResult,  setAiResult]  = useState<AIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError,   setAiError]   = useState("");

  useEffect(() => {
    const secret = getSecret();
    const role   = getRole();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    if (role && role !== "super_admin" && role !== "admin") {
      router.replace("/enter/backdrop/dashboard");
      return;
    }

    fetch("/api/dashboard/analytics", {
      headers: { Authorization: `Bearer ${secret}` },
    })
      .then(r => r.json() as Promise<AnalyticsBundle & { error?: string }>)
      .then(d => {
        if (d.error) { setError(d.error); }
        else { setBundle(d); }
      })
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [router]);

  async function runAI() {
    if (!bundle) return;
    setAnalyzing(true);
    setAiError("");
    setAiResult(null);
    const secret = getSecret();
    try {
      const res = await fetch("/api/dashboard/analytics", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify(bundle),
      });
      const d = await res.json() as AIResult & { error?: string };
      if (d.error) { setAiError(d.error); }
      else { setAiResult(d); }
    } catch {
      setAiError("AI analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  // Derived values
  const ov: Overview | null     = bundle?.overview ?? null;
  const ts: TimePoint[]         = bundle?.timeseries ?? [];
  const pages: TopPage[]        = bundle?.topPages ?? [];
  const sources: Source[]       = bundle?.sources ?? [];
  const devices: DeviceSplit[]  = bundle?.devices ?? [];

  const topSource = sources[0]?.source ?? "—";
  const topPage   = pages[0]?.page ?? "—";

  const peakDay   = ts.length
    ? ts.reduce((a, b) => (b.visitors > a.visitors ? b : a), ts[0])
    : null;

  const mid        = Math.floor(ts.length / 2);
  const firstHalf  = ts.slice(0, mid).reduce((s, d) => s + d.visitors, 0);
  const secondHalf = ts.slice(mid).reduce((s, d) => s + d.visitors, 0);
  const trendWord  = secondHalf > firstHalf ? "Accelerating" : secondHalf < firstHalf ? "Decelerating" : "Flat";
  const trendWColor = secondHalf > firstHalf ? COLORS.green : secondHalf < firstHalf ? COLORS.red : "#64748b";

  const hscore = aiResult?.healthScore ?? 0;

  return (
    <DashboardShell>
      <div style={{ padding: "24px 28px", maxWidth: 1140 }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              Site Command Centre
            </h1>
            <p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0" }}>
              Last 30 days · Vercel Analytics
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {aiResult && (
              <div style={{
                padding: "10px 20px", borderRadius: 12,
                background: `${healthColor(hscore)}18`,
                border: `1px solid ${healthColor(hscore)}44`,
                display: "flex", alignItems: "baseline", gap: 6,
              }}>
                <span style={{ color: healthColor(hscore), fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{hscore}</span>
                <span style={{ color: "#64748b", fontSize: 13 }}>/10 health</span>
              </div>
            )}
            <button
              onClick={runAI}
              disabled={analyzing || !bundle}
              style={{
                padding: "10px 22px", borderRadius: 12, border: "none",
                cursor: analyzing || !bundle ? "not-allowed" : "pointer",
                background: analyzing
                  ? "rgba(99,102,241,0.35)"
                  : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "#fff", fontWeight: 700, fontSize: 14,
                boxShadow: "0 4px 18px rgba(99,102,241,0.3)",
                opacity: !bundle ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 8,
                transition: "opacity 0.2s",
              }}
            >
              {analyzing && <Spinner />}
              {analyzing ? "Analysing…" : "✦ Run AI Debrief"}
            </button>
          </div>
        </div>

        {/* ── Not configured ───────────────────────────────────────────────── */}
        {!loading && error === "Vercel Analytics not configured" && (
          <div style={{ ...CARD, borderColor: "rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.04)", marginBottom: 24 }}>
            <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>
              Vercel Analytics not configured
            </p>
            <p style={{ color: "#92400e", fontSize: 13, margin: "0 0 12px" }}>
              Add these environment variables in Vercel (Project → Settings → Environment Variables):
            </p>
            <pre style={{ color: "#fde68a", fontSize: 12, margin: 0, padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 8, lineHeight: 1.8 }}>
{`VERCEL_ACCESS_TOKEN = get from vercel.com/account/tokens
VERCEL_PROJECT_ID   = get from Project Settings → General`}
            </pre>
          </div>
        )}

        {/* ── Generic error ────────────────────────────────────────────────── */}
        {!loading && error && error !== "Vercel Analytics not configured" && (
          <div style={{ ...CARD, borderColor: "rgba(239,68,68,0.2)", marginBottom: 24 }}>
            <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...CARD, height: 100, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        {bundle && ov && (
          <>
            {/* Vital Signs row — 6 cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 20 }}>
              <VitalCard
                label="Visitors"
                value={ov.visitors.toLocaleString()}
                valueColor={COLORS.blue}
                trend={ov.visitorsTrend}
              />
              <VitalCard
                label="Pageviews"
                value={ov.pageviews.toLocaleString()}
                valueColor={COLORS.cyan}
                trend={ov.pageviewsTrend}
              />
              <VitalCard
                label="Bounce Rate"
                value={`${(ov.bounceRate * 100).toFixed(1)}%`}
                valueColor={bounceColor(ov.bounceRate)}
                trend={ov.bounceRateTrend}
                invertGood
              />
              <VitalCard
                label="Avg Duration"
                value={fmtDuration(ov.avgDuration)}
                valueColor={COLORS.green}
                trend={ov.avgDurationTrend}
              />
              <VitalCard
                label="Top Source"
                value={topSource}
                valueColor={COLORS.purple}
                trend={0}
                subtitle={sources[0] ? `${sources[0].pct}% of traffic` : undefined}
              />
              <VitalCard
                label="Top Page"
                value={topPage}
                valueColor={COLORS.amber}
                trend={0}
                subtitle={pages[0] ? `${pages[0].visitors.toLocaleString()} visitors` : undefined}
              />
            </div>

            {/* ── Alerts strip ──────────────────────────────────────────────── */}
            {aiResult && aiResult.flags.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {aiResult.flags.map((flag, i) => (
                  <div key={i} style={{
                    padding: "10px 16px", borderRadius: 10,
                    background: "rgba(239,68,68,0.06)",
                    borderLeft: `3px solid ${COLORS.red}`,
                    border: `1px solid rgba(239,68,68,0.18)`,
                    borderLeftWidth: 3, borderLeftColor: COLORS.red,
                    color: "#fca5a5", fontSize: 13,
                  }}>
                    {flag}
                  </div>
                ))}
              </div>
            )}

            {/* ── Traffic Pulse + Page Engagement row ──────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>

              {/* Traffic Pulse */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Traffic Pulse
                </p>
                <TrafficSparkline data={ts} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
                  <div>
                    <p style={{ color: "#475569", fontSize: 10, margin: "0 0 2px" }}>DATE RANGE</p>
                    <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
                      {ts[0]?.date ?? "—"} → {ts[ts.length - 1]?.date ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#475569", fontSize: 10, margin: "0 0 2px" }}>PEAK DAY</p>
                    <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
                      {peakDay ? `${peakDay.date} (${peakDay.visitors.toLocaleString()})` : "—"}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#475569", fontSize: 10, margin: "0 0 2px" }}>TREND</p>
                    <p style={{ color: trendWColor, fontSize: 12, fontWeight: 700, margin: 0 }}>{trendWord}</p>
                  </div>
                </div>
              </div>

              {/* Page Engagement */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Page Engagement
                </p>
                {pages.length > 0
                  ? <PageEngagementList pages={pages} />
                  : <p style={{ color: "#334155", fontSize: 13 }}>No page data</p>
                }
              </div>
            </div>

            {/* ── Three-column row ──────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

              {/* Traffic Sources */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Traffic Sources
                </p>
                {sources.length > 0
                  ? <SourcesBar sources={sources} />
                  : <p style={{ color: "#334155", fontSize: 13 }}>No source data</p>
                }
              </div>

              {/* Device Split */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Device Split
                </p>
                {devices.length > 0
                  ? <DeviceDonut devices={devices} />
                  : <p style={{ color: "#334155", fontSize: 13 }}>No device data</p>
                }
              </div>

              {/* AI Insights */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  AI Insights
                </p>

                {!aiResult && !analyzing && !aiError && (
                  <p style={{ color: "#334155", fontSize: 13, lineHeight: 1.6 }}>
                    Run AI Debrief above to get your full site health report.
                  </p>
                )}

                {analyzing && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Spinner />
                    <span style={{ color: "#475569", fontSize: 13 }}>Analysing your data…</span>
                  </div>
                )}

                {aiError && (
                  <p style={{ color: COLORS.red, fontSize: 13, margin: 0 }}>{aiError}</p>
                )}

                {aiResult && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>
                    {aiResult.sections.traffic && (
                      <div>
                        <p style={{ color: COLORS.blue, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Traffic</p>
                        <p style={{ margin: 0 }}>{aiResult.sections.traffic}</p>
                      </div>
                    )}
                    {aiResult.sections.engagement && (
                      <div>
                        <p style={{ color: COLORS.cyan, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Engagement</p>
                        <p style={{ margin: 0 }}>{aiResult.sections.engagement}</p>
                      </div>
                    )}
                    {aiResult.sections.conversions && (
                      <div>
                        <p style={{ color: COLORS.green, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Conversions</p>
                        <p style={{ margin: 0 }}>{aiResult.sections.conversions}</p>
                      </div>
                    )}
                    {aiResult.sections.recommendations.length > 0 && (
                      <div>
                        <p style={{ color: COLORS.amber, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Recommendations</p>
                        <ol style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                          {aiResult.sections.recommendations.map((r, i) => (
                            <li key={i} style={{ color: "#94a3b8" }}>{r}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.7; } }
      `}</style>
    </DashboardShell>
  );
}
