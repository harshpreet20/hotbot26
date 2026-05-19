"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/backdrop/DashboardShell";

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

const CATEGORY_COLORS: Record<string, string> = {
  "Direct":         "#3b82f6",
  "Organic Search": "#22c55e",
  "Organic Social": "#8b5cf6",
  "Referral":       "#06b6d4",
  "LLM":            "#f59e0b",
  "Unassigned":     "#475569",
};

const FLAGS: Record<string, string> = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", IE: "🇮🇪", AU: "🇦🇺", CA: "🇨🇦",
  DE: "🇩🇪", FR: "🇫🇷", SG: "🇸🇬", AE: "🇦🇪", PK: "🇵🇰", PL: "🇵🇱",
  NL: "🇳🇱", SE: "🇸🇪", NZ: "🇳🇿", ZA: "🇿🇦", BR: "🇧🇷", JP: "🇯🇵",
  DK: "🇩🇰",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_LABELS = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Overview {
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  avgDuration: number;
  avgDurationMs: number;
  totalEvents?: number;
  visitorsTrend: number;
  pageviewsTrend: number;
  bounceRateTrend: number;
  avgDurationTrend: number;
}

interface TimePoint { date: string; visitors: number; pageviews: number; }
interface TopPage { page: string; visitors: number; bounceRate: number; }
interface Source { source: string; visitors: number; pct: number; }
interface DeviceSplit { device: string; visitors: number; pct: number; }
interface TopEvent { eventName: string; count: number; }
interface TrafficCategory { category: string; count: number; pct: number; }
interface CountryData { country: string; count: number; pct: number; }
interface HeatmapCell { day: number; hour: number; count: number; }

interface AnalyticsBundle {
  overview: Overview;
  timeseries: TimePoint[];
  topPages: TopPage[];
  sources: Source[];
  devices: DeviceSplit[];
  topEvents: TopEvent[];
  totalEvents: number;
  trafficSources: TrafficCategory[];
  topSources: Array<{ source: string; count: number }>;
  countries: CountryData[];
  heatmap: HeatmapCell[];
  activeUsers: number;
  newUsers: number;
  avgEngagementTime: number;
}

interface LiveItem {
  id: string;
  ts: string;
  type: "PAGE" | "EVENT";
  label: string;
  device?: string;
  isNew: boolean;
}

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function getSecret(): string {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") ?? "" : "";
}
function getRole(): string {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_role") ?? "" : "";
}

function fmtDurationMs(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60), s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtDurationSec(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function hhmmss(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toTimeString().slice(0, 8);
  } catch { return ""; }
}

function healthColor(score: number): string {
  if (score >= 8) return COLORS.green;
  if (score >= 5) return COLORS.amber;
  return COLORS.red;
}

function bounceStatusBadge(rate: number): { label: string; color: string; bg: string } {
  if (rate < 0.4) return { label: "Good",     color: COLORS.green, bg: "rgba(34,197,94,0.12)" };
  if (rate < 0.7) return { label: "Watch",    color: COLORS.amber, bg: "rgba(245,158,11,0.12)" };
  return              { label: "Critical", color: COLORS.red,   bg: "rgba(239,68,68,0.12)" };
}

function durationStatusBadge(ms: number): { label: string; color: string; bg: string } {
  const sec = ms / 1000;
  if (sec > 180) return { label: "Good",    color: COLORS.green, bg: "rgba(34,197,94,0.12)" };
  if (sec > 60)  return { label: "Average", color: COLORS.amber, bg: "rgba(245,158,11,0.12)" };
  return              { label: "Poor",    color: COLORS.red,   bg: "rgba(239,68,68,0.12)" };
}

function trendColor(pct: number, invertGood = false): string {
  const positive = invertGood ? pct < 0 : pct > 0;
  if (Math.abs(pct) < 1) return "#64748b";
  return positive ? COLORS.green : COLORS.red;
}

function trendArrow(pct: number, invertGood = false): string {
  if (Math.abs(pct) < 0.5) return "→";
  const positive = invertGood ? pct < 0 : pct > 0;
  return positive ? "↑" : "↓";
}

function genericBadge(pct: number, invertGood = false): { label: string; color: string; bg: string } {
  const positive = invertGood ? pct < 0 : pct > 0;
  const abs = Math.abs(pct);
  if (abs < 2)              return { label: "Stable",   color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  if (positive && abs >= 10) return { label: "Good",    color: COLORS.green, bg: "rgba(34,197,94,0.12)" };
  if (positive)              return { label: "Watch",   color: COLORS.amber, bg: "rgba(245,158,11,0.12)" };
  if (abs >= 10)             return { label: "Critical",color: COLORS.red,   bg: "rgba(239,68,68,0.12)" };
  return                            { label: "Watch",   color: COLORS.amber, bg: "rgba(245,158,11,0.12)" };
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
  badge?: { label: string; color: string; bg: string };
}
function VitalCard({ label, value, valueColor, trend: trendPct, invertGood = false, badge }: VitalCardProps) {
  const color  = trendColor(trendPct, invertGood);
  const arrow  = trendArrow(trendPct, invertGood);
  const bdg    = badge ?? genericBadge(trendPct, invertGood);
  return (
    <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{label}</p>
      <p style={{ color: valueColor, fontSize: 22, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ color, fontSize: 11, fontWeight: 600 }}>
          {arrow} {Math.abs(trendPct).toFixed(1)}%
        </span>
        <span style={{ padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700, color: bdg.color, background: bdg.bg }}>
          {bdg.label}
        </span>
      </div>
    </div>
  );
}

function TrafficSparkline({ data }: { data: TimePoint[] }) {
  if (!data.length) return (
    <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#334155", fontSize: 12 }}>No timeseries data</span>
    </div>
  );
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{s.source || "Direct"}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
              {s.visitors.toLocaleString()} <span style={{ color: "#475569", fontWeight: 400 }}>({s.pct}%)</span>
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(s.pct / max) * 100}%`, borderRadius: 99, background: COLORS.purple }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceBars({ devices }: { devices: DeviceSplit[] }) {
  const DEVICE_LABELS: Record<string, string> = { mobile: "Mobile", desktop: "Desktop", tablet: "Tablet" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {devices.slice(0, 5).map((d) => (
        <div key={d.device}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>{DEVICE_LABELS[d.device.toLowerCase()] ?? d.device}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{d.pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${d.pct}%`, borderRadius: 99, background: COLORS.cyan }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopPagesTable({ pages }: { pages: TopPage[] }) {
  const maxV = pages[0]?.visitors ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {pages.map((p, i) => (
        <div key={i} style={{ paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }} title={p.page}>{p.page}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{p.visitors.toLocaleString()}</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(p.visitors / maxV) * 100}%`, borderRadius: 99, background: COLORS.blue }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveFeed({ items }: { items: LiveItem[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
      {items.length === 0 && (
        <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>Waiting for live events…</p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 8,
            background: item.isNew ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
            border: item.isNew ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(255,255,255,0.04)",
            transition: "all 0.5s ease",
            fontSize: 12,
          }}
        >
          <span style={{ color: "#475569", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{hhmmss(item.ts)}</span>
          <span style={{
            padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, flexShrink: 0,
            background: item.type === "PAGE" ? "rgba(59,130,246,0.18)" : "rgba(139,92,246,0.18)",
            color: item.type === "PAGE" ? COLORS.blue : COLORS.purple,
          }}>{item.type}</span>
          <span style={{ color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{item.label}</span>
          {item.device && (
            <span style={{ color: "#334155", fontSize: 10, flexShrink: 0 }}>
              {item.device === "mobile" ? "📱" : item.device === "tablet" ? "🖥" : "💻"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Traffic Intelligence components ───────────────────────────────────────────

function SourceCategoriesBar({ trafficSources }: { trafficSources: TrafficCategory[] }) {
  const max = Math.max(...trafficSources.map(t => t.count), 1);
  const hasLLM = trafficSources.some(t => t.category === "LLM" && t.count > 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {hasLLM && (
        <div style={{
          padding: "6px 12px", borderRadius: 8,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          marginBottom: 4,
        }}>
          <span style={{ color: COLORS.amber, fontSize: 11, fontWeight: 700 }}>✦ AI Referral traffic detected</span>
        </div>
      )}
      {trafficSources.map((t) => {
        const color = CATEGORY_COLORS[t.category] ?? "#475569";
        const isLLM = t.category === "LLM";
        return (
          <div key={t.category}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
              <span style={{ color: isLLM ? COLORS.amber : "#94a3b8", fontSize: 12, fontWeight: isLLM ? 700 : 400, display: "flex", alignItems: "center", gap: 5 }}>
                {isLLM && <span style={{ fontSize: 10 }}>✦</span>}
                {t.category}
              </span>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
                {t.count.toLocaleString()} <span style={{ color: "#475569", fontWeight: 400 }}>({t.pct}%)</span>
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(t.count / max) * 100}%`, borderRadius: 99, background: color, transition: "width 0.4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CountryList({ countries }: { countries: CountryData[] }) {
  const maxCount = Math.max(...countries.map(c => c.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {countries.slice(0, 8).map((c) => {
        const flag = FLAGS[c.country] ?? "🌐";
        return (
          <div key={c.country}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{flag}</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{c.country}</span>
              </span>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
                {c.count.toLocaleString()} <span style={{ color: "#475569", fontWeight: 400 }}>({c.pct}%)</span>
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(c.count / maxCount) * 100}%`, borderRadius: 99, background: COLORS.cyan }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UserEngagementPanel({ activeUsers, newUsers, avgEngagementTime }: { activeUsers: number; newUsers: number; avgEngagementTime: number }) {
  const newPct = activeUsers > 0 ? Math.round((newUsers / activeUsers) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>Active Users</p>
          <p style={{ color: COLORS.blue, fontSize: 26, fontWeight: 800, margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{activeUsers.toLocaleString()}</p>
          <p style={{ color: "#475569", fontSize: 11, margin: "4px 0 0" }}>distinct sessions</p>
        </div>
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>New Users</p>
          <p style={{ color: COLORS.green, fontSize: 26, fontWeight: 800, margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{newUsers.toLocaleString()}</p>
          <p style={{ color: "#475569", fontSize: 11, margin: "4px 0 0" }}>first-time visits</p>
        </div>
      </div>

      <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>Avg Engagement Time</p>
        <p style={{ color: COLORS.purple, fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1 }}>{fmtDurationSec(avgEngagementTime)}</p>
        <p style={{ color: "#475569", fontSize: 11, margin: "4px 0 0" }}>per session (where duration &gt; 0)</p>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: "#64748b", fontSize: 11 }}>New users as % of active</span>
          <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{newPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${newPct}%`, borderRadius: 99, background: `linear-gradient(90deg,${COLORS.blue},${COLORS.green})` }} />
        </div>
      </div>
    </div>
  );
}

function TrafficHeatmap({ heatmap }: { heatmap: HeatmapCell[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const maxCount = Math.max(...heatmap.map(c => c.count), 1);

  const cellsByKey = new Map<string, number>();
  for (const cell of heatmap) {
    cellsByKey.set(`${cell.day}-${cell.hour}`, cell.count);
  }

  // Find peak
  const peak = heatmap.reduce((a, b) => b.count > a.count ? b : a, { day: 0, hour: 0, count: 0 });
  const peakDayName = DAYS[peak.day] ?? "—";
  const peakHourLabel = peak.hour === 0 ? "12am" : peak.hour < 12 ? `${peak.hour}am` : peak.hour === 12 ? "12pm" : `${peak.hour - 12}pm`;

  // Most active day
  const dayTotals = DAYS.map((_, d) => ({ day: d, total: heatmap.filter(c => c.day === d).reduce((a, c) => a + c.count, 0) }));
  const mostActiveDay = dayTotals.reduce((a, b) => b.total > a.total ? b : a, dayTotals[0]);

  const CELL = 28;
  const CELL_GAP = 3;
  const DAY_LABEL_W = 36;

  return (
    <div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ minWidth: 24 * (CELL + CELL_GAP) + DAY_LABEL_W + 20, position: "relative" }}>

          {/* Hour labels */}
          <div style={{ display: "flex", marginLeft: DAY_LABEL_W, marginBottom: 6 }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ width: CELL + CELL_GAP, fontSize: 9, color: h % 3 === 0 ? "#64748b" : "transparent", textAlign: "center", flexShrink: 0 }}>
                {HOUR_LABELS[h / 3]}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAYS.map((dayLabel, d) => (
            <div key={d} style={{ display: "flex", alignItems: "center", marginBottom: CELL_GAP }}>
              <div style={{ width: DAY_LABEL_W, fontSize: 10, color: "#475569", flexShrink: 0, textAlign: "right", paddingRight: 8 }}>{dayLabel}</div>
              {Array.from({ length: 24 }, (_, h) => {
                const count = cellsByKey.get(`${d}-${h}`) ?? 0;
                const alpha = count === 0 ? 0.05 : Math.max(0.1, count / maxCount);
                const bg = count === 0
                  ? `rgba(59,130,246,0.05)`
                  : `rgba(59,130,246,${alpha.toFixed(2)})`;
                const hourLabel = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
                return (
                  <div
                    key={h}
                    style={{
                      width: CELL, height: CELL, borderRadius: 4, flexShrink: 0,
                      marginRight: CELL_GAP, background: bg,
                      cursor: count > 0 ? "pointer" : "default",
                      border: count > 0 ? `1px solid rgba(59,130,246,${Math.min(alpha + 0.1, 1).toFixed(2)})` : "1px solid rgba(59,130,246,0.08)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (count > 0) {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({ x: rect.left, y: rect.top - 32, text: `${dayLabel} ${hourLabel} — ${count} pageview${count !== 1 ? "s" : ""}` });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x, top: tooltip.y,
          background: "#0f172a", border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#94a3b8",
          pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}>
          {tooltip.text}
        </div>
      )}

      {/* Legend & summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#475569" }}>Low</span>
          {[0.05, 0.2, 0.4, 0.6, 0.8, 1].map((a, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(59,130,246,${a})` }} />
          ))}
          <span style={{ fontSize: 10, color: "#475569" }}>High</span>
        </div>
        <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
          Peak hour: <span style={{ color: COLORS.blue }}>{peakDayName} {peakHourLabel} UTC</span>
          {mostActiveDay && (
            <> · Most active day: <span style={{ color: COLORS.blue }}>{DAYS[mostActiveDay.day]}</span></>
          )}
        </p>
      </div>
    </div>
  );
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
  const [liveItems, setLiveItems] = useState<LiveItem[]>([]);
  const [liveTs,    setLiveTs]    = useState<string>(new Date().toISOString());
  const [lastPollAt, setLastPollAt] = useState<string>(new Date().toISOString());
  const secretRef = useRef("");
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const secret = getSecret();
    const role   = getRole();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    if (role && role !== "super_admin" && role !== "admin") {
      router.replace("/enter/backdrop/dashboard");
      return;
    }
    secretRef.current = secret;

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

  // ── Live feed polling (every 10s) ─────────────────────────────────────────
  const pollLive = useCallback(async () => {
    try {
      const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wsucqpunleplgyrrroae.supabase.co";
      const anonKey      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

      if (!anonKey) {
        // No anon key — just update the timestamp for "live" indicator
        setLiveTs(new Date().toISOString());
        return;
      }

      const since = lastPollAt;
      const now   = new Date().toISOString();

      // Fetch recent pageviews
      const pvRes = await fetch(
        `${supabaseUrl}/rest/v1/site_page_views?select=id,session_id,page,created_at&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=10`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const pvRows = pvRes.ok ? (await pvRes.json() as Array<{ id: string; session_id: string; page: string; created_at: string }>) : [];

      // Fetch recent events
      const evRes = await fetch(
        `${supabaseUrl}/rest/v1/site_events?select=id,session_id,event_name,page,created_at&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=10`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const evRows = evRes.ok ? (await evRes.json() as Array<{ id: string; session_id: string; event_name: string; page: string; created_at: string }>) : [];

      const newItems: LiveItem[] = [
        ...pvRows.map(r => ({ id: `pv-${r.id}`, ts: r.created_at, type: "PAGE" as const, label: r.page, isNew: true })),
        ...evRows.map(r => ({ id: `ev-${r.id}`, ts: r.created_at, type: "EVENT" as const, label: r.event_name, isNew: true })),
      ].sort((a, b) => b.ts.localeCompare(a.ts));

      if (newItems.length > 0) {
        setLiveItems(prev => {
          const existing = new Set(prev.map(p => p.id));
          const incoming = newItems.filter(n => !existing.has(n.id));
          if (!incoming.length) return prev;
          // Clear "isNew" on old items after 3s
          setTimeout(() => {
            setLiveItems(curr => curr.map(c => ({ ...c, isNew: false })));
          }, 3000);
          return [...incoming, ...prev.map(p => ({ ...p, isNew: false }))].slice(0, 20);
        });
      }

      setLastPollAt(now);
      setLiveTs(now);
    } catch {
      // silently ignore
    }
  }, [lastPollAt]);

  useEffect(() => {
    pollLive();
    pollTimer.current = setInterval(pollLive, 10_000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── AI Debrief ────────────────────────────────────────────────────────────
  async function runAI() {
    if (!bundle) return;
    setAnalyzing(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("/api/dashboard/analytics", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretRef.current}`, "Content-Type": "application/json" },
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const ov              = bundle?.overview ?? null;
  const ts              = bundle?.timeseries ?? [];
  const pages           = bundle?.topPages ?? [];
  const sources         = bundle?.sources ?? [];
  const devices         = bundle?.devices ?? [];
  const events          = bundle?.topEvents ?? [];
  const trafficSources  = bundle?.trafficSources ?? [];
  const countries       = bundle?.countries ?? [];
  const heatmap         = bundle?.heatmap ?? [];
  const activeUsers     = bundle?.activeUsers ?? 0;
  const newUsers        = bundle?.newUsers ?? 0;
  const avgEngTime      = bundle?.avgEngagementTime ?? 0;

  const mid        = Math.floor(ts.length / 2);
  const firstHalf  = ts.slice(0, mid).reduce((s, d) => s + d.visitors, 0);
  const secondHalf = ts.slice(mid).reduce((s, d) => s + d.visitors, 0);
  const trendWord  = secondHalf > firstHalf ? "Accelerating" : secondHalf < firstHalf ? "Decelerating" : "Flat";
  const trendWColor = secondHalf > firstHalf ? COLORS.green : secondHalf < firstHalf ? COLORS.red : "#64748b";
  const peakDay    = ts.length ? ts.reduce((a, b) => (b.visitors > a.visitors ? b : a), ts[0]) : null;

  const isEmpty = !loading && !error && ov && ov.pageviews === 0 && ov.sessions === 0 && (bundle?.totalEvents ?? 0) === 0;

  const hscore = aiResult?.healthScore ?? 0;
  const liveLabel = `Last updated ${new Date(liveTs).toLocaleTimeString()}`;

  return (
    <DashboardShell>
      <div style={{ padding: "24px 28px", maxWidth: 1200 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              Site Command Centre
            </h1>
            <p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0" }}>
              Last 30 days · Supabase Real-time
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Live indicator */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 99,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 8px ${COLORS.green}`, animation: "pulse 2s infinite" }} />
              <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 600 }}>LIVE</span>
              <span style={{ color: "#334155", fontSize: 10 }}>{liveLabel}</span>
            </div>

            {aiResult && (
              <div style={{
                padding: "8px 16px", borderRadius: 12,
                background: `${healthColor(hscore)}18`,
                border: `1px solid ${healthColor(hscore)}44`,
                display: "flex", alignItems: "baseline", gap: 6,
              }}>
                <span style={{ color: healthColor(hscore), fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{hscore}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}>/10 health</span>
              </div>
            )}

            <button
              onClick={runAI}
              disabled={analyzing || !bundle}
              style={{
                padding: "9px 20px", borderRadius: 12, border: "none",
                cursor: analyzing || !bundle ? "not-allowed" : "pointer",
                background: analyzing ? "rgba(99,102,241,0.35)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "#fff", fontWeight: 700, fontSize: 13,
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

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div style={{ ...CARD, borderColor: "rgba(239,68,68,0.2)", marginBottom: 24 }}>
            <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...CARD, height: 100, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {isEmpty && (
          <div style={{ ...CARD, borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
            <p style={{ color: COLORS.blue, fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>
              Tracker installed — awaiting visitors
            </p>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>
              The SiteTracker component is running and will capture sessions, pageviews, and events
              as visitors arrive at hotbotstudios.com. Data will appear here within seconds of the
              first visit.
            </p>
            <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>
              Live feed polls every 10 seconds · Session data written on visit start · Page duration tracked on navigation
            </p>
          </div>
        )}

        {/* ── Main content ──────────────────────────────────────────────── */}
        {bundle && ov && !isEmpty && (
          <>
            {/* Vital Signs — 6 cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 20 }}>
              <VitalCard label="Visitors" value={ov.visitors.toLocaleString()} valueColor={COLORS.blue} trend={ov.visitorsTrend} />
              <VitalCard label="Pageviews" value={ov.pageviews.toLocaleString()} valueColor={COLORS.cyan} trend={ov.pageviewsTrend} />
              <VitalCard label="Sessions" value={ov.sessions.toLocaleString()} valueColor={COLORS.purple} trend={ov.visitorsTrend} />
              <VitalCard
                label="Bounce Rate"
                value={`${(ov.bounceRate * 100).toFixed(1)}%`}
                valueColor={bounceStatusBadge(ov.bounceRate).color}
                trend={ov.bounceRateTrend}
                invertGood
                badge={bounceStatusBadge(ov.bounceRate)}
              />
              <VitalCard
                label="Avg Duration"
                value={ov.avgDurationMs > 0 ? fmtDurationMs(ov.avgDurationMs) : fmtDurationSec(ov.avgDuration)}
                valueColor={durationStatusBadge(ov.avgDurationMs || ov.avgDuration * 1000).color}
                trend={ov.avgDurationTrend}
                badge={durationStatusBadge(ov.avgDurationMs || ov.avgDuration * 1000)}
              />
              <VitalCard label="Events" value={(bundle.totalEvents ?? 0).toLocaleString()} valueColor={COLORS.amber} trend={0} />
            </div>

            {/* AI flags strip */}
            {aiResult && aiResult.flags.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {aiResult.flags.map((flag, i) => (
                  <div key={i} style={{
                    padding: "9px 16px", borderRadius: 10,
                    background: "rgba(239,68,68,0.06)",
                    border: `1px solid rgba(239,68,68,0.18)`,
                    borderLeft: `3px solid ${COLORS.red}`,
                    color: "#fca5a5", fontSize: 13,
                  }}>
                    {flag}
                  </div>
                ))}
              </div>
            )}

            {/* ── Section A: Traffic Intelligence ────────────────────────── */}
            <div style={{ ...CARD, marginBottom: 16 }}>
              <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 18px" }}>
                Traffic Intelligence — Last 30 Days
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>

                {/* Column 1 — Source Categories */}
                <div>
                  <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Source Categories</p>
                  {trafficSources.length > 0
                    ? <SourceCategoriesBar trafficSources={trafficSources} />
                    : <p style={{ color: "#334155", fontSize: 13 }}>No category data yet — traffic_category recorded from next visit</p>
                  }
                </div>

                {/* Column 2 — Country Origin */}
                <div>
                  <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Country Origin</p>
                  {countries.length > 0
                    ? <CountryList countries={countries} />
                    : <p style={{ color: "#334155", fontSize: 13 }}>No country data yet — requires Vercel geo headers</p>
                  }
                </div>

                {/* Column 3 — User Engagement */}
                <div>
                  <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Users & Engagement</p>
                  <UserEngagementPanel activeUsers={activeUsers} newUsers={newUsers} avgEngagementTime={avgEngTime} />
                </div>
              </div>
            </div>

            {/* ── Section B: Time of Day Heatmap ─────────────────────────── */}
            <div style={{ ...CARD, marginBottom: 16 }}>
              <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 18px" }}>
                Traffic Heatmap — When Your Visitors Arrive (UTC)
              </p>
              {heatmap.length > 0 && heatmap.some(c => c.count > 0)
                ? <TrafficHeatmap heatmap={heatmap} />
                : <p style={{ color: "#334155", fontSize: 13 }}>No heatmap data yet — hour_utc recorded from next pageview</p>
              }
            </div>

            {/* Live Feed + Traffic Pulse */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16, marginBottom: 16 }}>

              {/* Live Feed */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
                  Live Feed
                </p>
                <LiveFeed items={liveItems} />
              </div>

              {/* Traffic Pulse */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
                  Traffic Pulse · Last 30 Days
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
            </div>

            {/* Top Pages + Traffic Sources + Devices */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
                  Top Pages
                </p>
                {pages.length > 0
                  ? <TopPagesTable pages={pages} />
                  : <p style={{ color: "#334155", fontSize: 13 }}>No page data yet</p>
                }
              </div>
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
                  Traffic Sources
                </p>
                {sources.length > 0
                  ? <SourcesBar sources={sources} />
                  : <p style={{ color: "#334155", fontSize: 13 }}>No source data yet</p>
                }
              </div>
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
                  Device Split
                </p>
                {devices.length > 0
                  ? <DeviceBars devices={devices} />
                  : <p style={{ color: "#334155", fontSize: 13 }}>No device data yet</p>
                }
              </div>
            </div>

            {/* Conversion Funnel + AI Debrief */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Conversion Funnel — top events */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
                  Conversion Funnel
                </p>
                {events.length === 0 && (
                  <p style={{ color: "#334155", fontSize: 13 }}>No events tracked yet</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {events.map((e, i) => {
                    const EVENT_COLORS: Record<string, string> = {
                      lead_generated:       COLORS.green,
                      contact_form_submit:  COLORS.blue,
                      newsletter_signup:    COLORS.cyan,
                    };
                    const color = EVENT_COLORS[e.eventName] ?? COLORS.purple;
                    const maxCount = events[0]?.count ?? 1;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ color: "#94a3b8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{e.eventName}</span>
                          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{e.count.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(e.count / maxCount) * 100}%`, borderRadius: 99, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Command Debrief */}
              <div style={CARD}>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
                  AI Command Debrief
                </p>

                {!aiResult && !analyzing && !aiError && (
                  <p style={{ color: "#334155", fontSize: 13, lineHeight: 1.6 }}>
                    Click <strong style={{ color: "#64748b" }}>Run AI Debrief</strong> to get your full site intelligence report — traffic trends, engagement analysis, conversion signals, and prioritised recommendations.
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
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
      `}</style>
    </DashboardShell>
  );
}
