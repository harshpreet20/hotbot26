import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

// ── Helper: get ISO date string N days ago ────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function toDateStr(iso: string): string {
  return iso.slice(0, 10);
}

// ── Helper: clean referrer to domain ─────────────────────────────────────────
function cleanReferrer(ref: string | null): string {
  if (!ref) return "Direct";
  try {
    const u = new URL(ref.startsWith("http") ? ref : `https://${ref}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return ref.slice(0, 40) || "Direct";
  }
}

// ── GET: fetch analytics bundle from Supabase ─────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = sb();

    const now30  = daysAgo(0);
    const prev30 = daysAgo(30);
    const prev60 = daysAgo(60);

    // ── Current period data ──────────────────────────────────────────────────

    // Total pageviews current
    const { count: pvCount, error: pvErr } = await client
      .from("site_page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", prev30);

    if (pvErr) {
      console.error("[analytics] site_page_views query failed:", pvErr.message);
      return NextResponse.json({ error: `Analytics query failed: ${pvErr.message}` }, { status: 500 });
    }

    // Total visitors (distinct session_ids) — use all sessions in range
    const { data: sessionsCurrent, error: sessErr } = await client
      .from("site_sessions")
      .select("id, is_bounce, duration_ms")
      .gte("created_at", prev30);

    if (sessErr) {
      console.error("[analytics] site_sessions query failed:", sessErr.message);
      return NextResponse.json({ error: `Analytics query failed: ${sessErr.message}` }, { status: 500 });
    }

    const totalSessions  = sessionsCurrent?.length ?? 0;
    const totalVisitors  = totalSessions;
    const totalPageviews = pvCount ?? 0;
    const bounceSessions = (sessionsCurrent ?? []).filter((s) => s.is_bounce).length;
    const bounceRate     = totalSessions > 0 ? bounceSessions / totalSessions : 0;
    const durSessions    = (sessionsCurrent ?? []).filter((s) => (s.duration_ms ?? 0) > 0);
    const avgDurationMs  = durSessions.length > 0
      ? durSessions.reduce((acc, s) => acc + (s.duration_ms ?? 0), 0) / durSessions.length
      : 0;

    // ── Previous period for trends ───────────────────────────────────────────

    const { data: sessionsPrev } = await client
      .from("site_sessions")
      .select("id, is_bounce, duration_ms")
      .gte("created_at", prev60)
      .lt("created_at", prev30);

    const { count: pvCountPrev } = await client
      .from("site_page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", prev60)
      .lt("created_at", prev30);

    const prevSessions  = sessionsPrev?.length ?? 0;
    const prevPageviews = pvCountPrev ?? 0;
    const prevBounce    = prevSessions > 0
      ? (sessionsPrev ?? []).filter((s) => s.is_bounce).length / prevSessions
      : 0;
    const prevDurSessions = (sessionsPrev ?? []).filter((s) => (s.duration_ms ?? 0) > 0);
    const prevAvgDurMs    = prevDurSessions.length > 0
      ? prevDurSessions.reduce((acc, s) => acc + (s.duration_ms ?? 0), 0) / prevDurSessions.length
      : 0;

    function trend(cur: number, prev: number): number {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100 * 10) / 10;
    }

    const overview = {
      visitors:        totalVisitors,
      pageviews:       totalPageviews,
      sessions:        totalSessions,
      bounceRate:      Math.round(bounceRate * 1000) / 1000,
      avgDuration:     Math.round(avgDurationMs / 1000), // in seconds for compat
      avgDurationMs,
      newVisitors:     totalVisitors,
      visitorsTrend:   trend(totalVisitors, prevSessions),
      pageviewsTrend:  trend(totalPageviews, prevPageviews),
      bounceRateTrend: trend(bounceRate, prevBounce),
      avgDurationTrend: trend(avgDurationMs, prevAvgDurMs),
    };

    // ── Timeseries: pageviews per day last 30 days ───────────────────────────

    const { data: pvRows } = await client
      .from("site_page_views")
      .select("created_at")
      .gte("created_at", prev30)
      .order("created_at", { ascending: true });

    // Group by date
    const tsMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      tsMap.set(toDateStr(d.toISOString()), 0);
    }
    for (const row of pvRows ?? []) {
      const date = toDateStr(row.created_at);
      tsMap.set(date, (tsMap.get(date) ?? 0) + 1);
    }
    const timeseries = Array.from(tsMap.entries()).map(([date, views]) => ({
      date,
      visitors: views,
      pageviews: views,
    }));

    // ── Top pages ────────────────────────────────────────────────────────────

    const { data: allPvRows } = await client
      .from("site_page_views")
      .select("page")
      .gte("created_at", prev30);

    const pageMap = new Map<string, number>();
    for (const row of allPvRows ?? []) {
      pageMap.set(row.page, (pageMap.get(row.page) ?? 0) + 1);
    }
    const topPages = Array.from(pageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, visitors]) => ({ page, visitors, bounceRate: 0 }));

    // ── Traffic sources ──────────────────────────────────────────────────────

    const { data: sessionsWithRef } = await client
      .from("site_sessions")
      .select("referrer")
      .gte("created_at", prev30);

    const sourceMap = new Map<string, number>();
    for (const row of sessionsWithRef ?? []) {
      const src = cleanReferrer(row.referrer);
      sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
    }
    const totalSourceSessions = Array.from(sourceMap.values()).reduce((a, b) => a + b, 0) || 1;
    const sources = Array.from(sourceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, visitors]) => ({
        source,
        visitors,
        pct: Math.round((visitors / totalSourceSessions) * 100 * 10) / 10,
      }));

    // ── Device split ─────────────────────────────────────────────────────────

    const { data: sessionsWithDevice } = await client
      .from("site_sessions")
      .select("device")
      .gte("created_at", prev30);

    const deviceMap = new Map<string, number>();
    for (const row of sessionsWithDevice ?? []) {
      const dev = row.device ?? "unknown";
      deviceMap.set(dev, (deviceMap.get(dev) ?? 0) + 1);
    }
    const totalDeviceSessions = Array.from(deviceMap.values()).reduce((a, b) => a + b, 0) || 1;
    const devices = Array.from(deviceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([device, visitors]) => ({
        device,
        visitors,
        pct: Math.round((visitors / totalDeviceSessions) * 100 * 10) / 10,
      }));

    // ── Top events ───────────────────────────────────────────────────────────

    const { data: eventRows } = await client
      .from("site_events")
      .select("event_name")
      .gte("created_at", prev30);

    const eventMap = new Map<string, number>();
    for (const row of eventRows ?? []) {
      eventMap.set(row.event_name, (eventMap.get(row.event_name) ?? 0) + 1);
    }
    const topEvents = Array.from(eventMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([eventName, count]) => ({ eventName, count }));

    // ── Total events count ────────────────────────────────────────────────────
    const totalEvents = (eventRows ?? []).length;

    // ── Traffic intelligence queries (run in parallel) ───────────────────────

    const [trafficCatsResult, countriesResult, heatmapRawResult, engagementResult] = await Promise.all([
      // Traffic source categories
      client
        .from("site_sessions")
        .select("traffic_category, traffic_source")
        .gte("created_at", prev30)
        .not("traffic_category", "is", null),

      // Country breakdown
      client
        .from("site_sessions")
        .select("country")
        .gte("created_at", prev30)
        .not("country", "is", null),

      // Hourly heatmap
      client
        .from("site_page_views")
        .select("hour_utc, created_at")
        .gte("created_at", prev30)
        .not("hour_utc", "is", null),

      // Avg engagement time
      client
        .from("site_sessions")
        .select("duration_ms")
        .gte("created_at", prev30)
        .gt("duration_ms", 0),
    ]);

    // Process traffic source categories
    const catMap = new Map<string, number>();
    const srcMap = new Map<string, number>();
    for (const row of trafficCatsResult.data ?? []) {
      const cat = (row.traffic_category as string) ?? "Unassigned";
      catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
      const src = (row.traffic_source as string) ?? "unknown";
      if (src !== "direct") {
        srcMap.set(src, (srcMap.get(src) ?? 0) + 1);
      }
    }
    const totalCatSessions = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
    const trafficSources = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category,
        count,
        pct: Math.round((count / totalCatSessions) * 100 * 10) / 10,
      }));

    const topSources = Array.from(srcMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    // Process countries
    const countryMap = new Map<string, number>();
    for (const row of countriesResult.data ?? []) {
      const c = (row.country as string) ?? "Unknown";
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1);
    }
    const totalCountrySessions = Array.from(countryMap.values()).reduce((a, b) => a + b, 0) || 1;
    const countries = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({
        country,
        count,
        pct: Math.round((count / totalCountrySessions) * 100 * 10) / 10,
      }));

    // Process heatmap — 7×24 matrix keyed by day+hour
    const heatmapMap = new Map<string, number>();
    for (const row of heatmapRawResult.data ?? []) {
      const d = new Date(row.created_at);
      const day = d.getUTCDay(); // 0=Sun
      const hour = row.hour_utc as number;
      const key = `${day}-${hour}`;
      heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + 1);
    }
    const heatmap: Array<{ day: number; hour: number; count: number }> = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap.push({ day, hour, count: heatmapMap.get(`${day}-${hour}`) ?? 0 });
      }
    }

    // Active and new users
    const activeUsers = totalSessions; // distinct session count in period
    const newUsers    = totalSessions; // all sessions are first visits

    // Avg engagement time in seconds
    const engRows = engagementResult.data ?? [];
    const avgEngagementTime = engRows.length > 0
      ? Math.round(engRows.reduce((acc, r) => acc + ((r.duration_ms as number) ?? 0), 0) / engRows.length / 1000)
      : 0;

    return NextResponse.json({
      overview,
      timeseries,
      topPages,
      sources,
      devices,
      topEvents,
      totalEvents,
      trafficSources,
      topSources,
      countries,
      heatmap,
      activeUsers,
      newUsers,
      avgEngagementTime,
    });

  } catch (err) {
    console.error("[analytics/GET]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST: AI analysis ────────────────────────────────────────────────────────

interface AnalyticsBundle {
  overview?: {
    visitors?: number;
    pageviews?: number;
    sessions?: number;
    bounceRate?: number;
    avgDuration?: number;
    avgDurationMs?: number;
    visitorsTrend?: number;
    pageviewsTrend?: number;
    bounceRateTrend?: number;
    avgDurationTrend?: number;
  };
  timeseries?: Array<{ date: string; visitors: number; pageviews: number }>;
  topPages?: Array<{ page: string; visitors: number; bounceRate: number }>;
  sources?: Array<{ source: string; visitors: number; pct: number }>;
  devices?: Array<{ device: string; visitors: number; pct: number }>;
  topEvents?: Array<{ eventName: string; count: number }>;
  totalEvents?: number;
}

export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AnalyticsBundle;
  try {
    body = (await req.json()) as AnalyticsBundle;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { overview, timeseries = [], topPages = [], sources = [], devices = [], topEvents = [] } = body;

  const mid = Math.floor(timeseries.length / 2);
  const firstHalf  = timeseries.slice(0, mid).reduce((s, d) => s + d.visitors, 0);
  const secondHalf = timeseries.slice(mid).reduce((s, d) => s + d.visitors, 0);
  const trendDirection = secondHalf > firstHalf ? "increasing" : secondHalf < firstHalf ? "decreasing" : "flat";

  const firstDate = timeseries[0]?.date ?? "n/a";
  const lastDate  = timeseries[timeseries.length - 1]?.date ?? "n/a";

  const highBouncePages = topPages.filter((p) => p.bounceRate > 0.7);
  const topSource = sources[0];
  const sourceConcentration = topSource
    ? `${topSource.source} dominates at ${topSource.pct}%`
    : "no source data";

  const avgDurSec = Math.round((overview?.avgDurationMs ?? (overview?.avgDuration ?? 0) * 1000) / 1000);

  const prompt = `You are a senior web analytics consultant. Analyse the following site analytics data (last 30 days vs previous 30 days) and provide a structured, actionable report.

OVERVIEW (current vs trend):
- Visitors / Sessions: ${overview?.visitors ?? 0} (trend: ${overview?.visitorsTrend ?? 0}%)
- Pageviews: ${overview?.pageviews ?? 0} (trend: ${overview?.pageviewsTrend ?? 0}%)
- Bounce Rate: ${((overview?.bounceRate ?? 0) * 100).toFixed(1)}% (trend: ${overview?.bounceRateTrend ?? 0}%)
- Avg Session Duration: ${avgDurSec}s (trend: ${overview?.avgDurationTrend ?? 0}%)

TREND: Traffic is ${trendDirection} (${firstDate} → ${lastDate}). First-half visitors: ${firstHalf}, second-half: ${secondHalf}.

TOP TRAFFIC SOURCES: ${sources.slice(0, 5).map((s) => `${s.source} ${s.pct}%`).join(", ")}
Source concentration: ${sourceConcentration}

TOP PAGES (visitors):
${topPages.slice(0, 5).map((p) => `  ${p.page}: ${p.visitors} views`).join("\n")}

HIGH BOUNCE PAGES (>70%): ${highBouncePages.length > 0 ? highBouncePages.map((p) => p.page).join(", ") : "none"}

DEVICE SPLIT: ${devices.map((d) => `${d.device} ${d.pct}%`).join(", ")}

TOP EVENTS: ${topEvents.slice(0, 5).map((e) => `${e.eventName} (${e.count})`).join(", ")}

Respond ONLY with valid JSON (no markdown fences) in this exact shape:
{
  "healthScore": <integer 1-10>,
  "flags": ["⚠ flag1", "⚠ flag2"],
  "sections": {
    "traffic": "<one paragraph on traffic trend>",
    "engagement": "<one paragraph on bounce rate and session quality>",
    "conversions": "<one paragraph on conversion signals and opportunities>",
    "recommendations": ["action 1", "action 2", "action 3"]
  }
}

Rules:
- healthScore: 10 = excellent, 1 = critical
- flags: up to 5 short warnings (≤80 chars each), only real concerns starting with "⚠"
- sections.traffic: factual paragraph referencing the trend numbers
- sections.engagement: actionable paragraph about bounce and duration
- sections.conversions: paragraph about conversion signals (inferred from events/pages/sources)
- sections.recommendations: 3-5 concrete, prioritised action items`;

  try {
    const completion = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: "You are an expert web analytics consultant. Always respond with valid JSON only, no markdown fences.",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.content[0]?.type === "text" ? completion.content[0].text : "{}";
    let parsed: {
      healthScore?: number;
      flags?: string[];
      sections?: {
        traffic?: string;
        engagement?: string;
        conversions?: string;
        recommendations?: string[];
      };
    };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      const stripped = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(stripped) as typeof parsed;
    }

    return NextResponse.json({
      healthScore: parsed.healthScore ?? 5,
      flags: parsed.flags ?? [],
      sections: {
        traffic:         parsed.sections?.traffic         ?? "",
        engagement:      parsed.sections?.engagement      ?? "",
        conversions:     parsed.sections?.conversions     ?? "",
        recommendations: parsed.sections?.recommendations ?? [],
      },
    });
  } catch (err) {
    console.error("[analytics/POST]", err);
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
