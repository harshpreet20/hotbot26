/**
 * Vercel Analytics REST API client.
 *
 * Required env vars:
 *   VERCEL_ACCESS_TOKEN  — from vercel.com/account/tokens
 *   VERCEL_PROJECT_ID    — from Project Settings → General
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Overview {
  visitors: number;
  pageviews: number;
  bounceRate: number;
  avgDuration: number;
  visitorsTrend: number;
  pageviewsTrend: number;
  bounceRateTrend: number;
  avgDurationTrend: number;
}

export interface TimePoint {
  date: string;
  visitors: number;
  pageviews: number;
}

export interface TopPage {
  page: string;
  visitors: number;
  bounceRate: number;
}

export interface Source {
  source: string;
  visitors: number;
  pct: number;
}

export interface DeviceSplit {
  device: string;
  visitors: number;
  pct: number;
}

export interface AnalyticsBundle {
  overview: Overview;
  timeseries: TimePoint[];
  topPages: TopPage[];
  sources: Source[];
  devices: DeviceSplit[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isVercelAnalyticsEnabled(): boolean {
  return !!(process.env.VERCEL_ACCESS_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function safeNum(val: unknown): number {
  if (typeof val === "number" && isFinite(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    if (isFinite(n)) return n;
  }
  return 0;
}

function trend(current: number, previous: number): number {
  if (previous === 0) return 0;
  const raw = ((current - previous) / previous) * 100;
  // Clamp to ±200 %
  return Math.max(-200, Math.min(200, Math.round(raw * 10) / 10));
}

function dateRange(daysAgo: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysAgo);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { from: fmt(from), to: fmt(to) };
}

async function vercelFetch<T>(
  path: string,
  extraParams: Record<string, string> = {},
  period: "current" | "previous" = "current"
): Promise<T | null> {
  const token = process.env.VERCEL_ACCESS_TOKEN!;
  const projectId = process.env.VERCEL_PROJECT_ID!;

  const { from, to } =
    period === "current" ? dateRange(30) : (() => {
      const t = new Date();
      t.setDate(t.getDate() - 30);
      const f = new Date(t);
      f.setDate(f.getDate() - 30);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      return { from: fmt(f), to: fmt(t) };
    })();

  const params = new URLSearchParams({
    projectId,
    from,
    to,
    environment: "production",
    ...extraParams,
  });

  const url = `https://vercel.com/api${path}?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    // Log but don't throw — callers handle null gracefully
    console.warn(`[vercelAnalytics] ${res.status} ${res.statusText} — ${path}`);
    return null;
  }

  return res.json() as Promise<T>;
}

// Try multiple candidate paths and return the first that succeeds
async function vercelFetchAny<T>(
  candidates: string[],
  extraParams: Record<string, string> = {}
): Promise<T | null> {
  for (const path of candidates) {
    const result = await vercelFetch<T>(path, extraParams);
    if (result !== null) return result;
  }
  return null;
}

// ── Raw API response types ────────────────────────────────────────────────────

interface StatsResponse {
  data?: {
    pageViews?: { value?: number; previousValue?: number };
    visitors?: { value?: number; previousValue?: number };
    bounceRate?: { value?: number; previousValue?: number };
    avgDuration?: { value?: number; previousValue?: number };
  };
}

interface TimeseriesItem {
  key?: string;
  total?: number;
  devices?: { mobile?: number; desktop?: number; tablet?: number };
}

interface TimeseriesResponse {
  data?: TimeseriesItem[];
}

interface PagesItem {
  key?: string;
  total?: number;
  bounceRate?: number;
}

interface PagesResponse {
  data?: PagesItem[];
}

interface ReferrersItem {
  key?: string;
  total?: number;
}

interface ReferrersResponse {
  data?: ReferrersItem[];
}

interface OsItem {
  key?: string;
  total?: number;
}

interface OsResponse {
  data?: OsItem[];
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function getAnalyticsBundle(): Promise<AnalyticsBundle> {
  const [statsData, prevStatsData, tsData, pagesData, refData, osData] =
    await Promise.all([
      vercelFetch<StatsResponse>("/v1/web-analytics/stats", {}, "current"),
      vercelFetch<StatsResponse>("/v1/web-analytics/stats", {}, "previous"),
      vercelFetchAny<TimeseriesResponse>(["/v1/web-analytics/timeseries", "/v1/web-analytics/time-series"], { granularity: "1d" }),
      vercelFetchAny<PagesResponse>(["/v1/web-analytics/pages", "/v1/web-analytics/page"], { limit: "10" }),
      vercelFetchAny<ReferrersResponse>(["/v1/web-analytics/referrers", "/v1/web-analytics/referrer", "/v1/web-analytics/sources", "/v1/web-analytics/source"], { limit: "10" }),
      vercelFetchAny<OsResponse>(["/v1/web-analytics/os", "/v1/web-analytics/devices", "/v1/web-analytics/device"]),
    ]);

  // ── Overview ────────────────────────────────────────────────────────────────
  const sd = (statsData ?? {}).data ?? {};
  const psd = (prevStatsData ?? {}).data ?? {};

  const visitors = safeNum(sd.visitors?.value);
  const pageviews = safeNum(sd.pageViews?.value);
  const bounceRate = safeNum(sd.bounceRate?.value);
  const avgDuration = safeNum(sd.avgDuration?.value);

  // Use embedded previousValue if the API provides it, fall back to separate call
  const prevVisitors = safeNum(sd.visitors?.previousValue ?? psd.visitors?.value);
  const prevPageviews = safeNum(sd.pageViews?.previousValue ?? psd.pageViews?.value);
  const prevBounceRate = safeNum(sd.bounceRate?.previousValue ?? psd.bounceRate?.value);
  const prevAvgDuration = safeNum(sd.avgDuration?.previousValue ?? psd.avgDuration?.value);

  const overview: Overview = {
    visitors,
    pageviews,
    bounceRate,
    avgDuration,
    visitorsTrend: trend(visitors, prevVisitors),
    pageviewsTrend: trend(pageviews, prevPageviews),
    // For bounce rate, negative trend = improvement (lower is better)
    bounceRateTrend: trend(bounceRate, prevBounceRate),
    avgDurationTrend: trend(avgDuration, prevAvgDuration),
  };

  // ── Timeseries ──────────────────────────────────────────────────────────────
  const timeseries: TimePoint[] = ((tsData ?? {}).data ?? []).map((item) => {
    const devs = item.devices ?? {};
    const totalDevices =
      safeNum(devs.mobile) + safeNum(devs.desktop) + safeNum(devs.tablet);
    return {
      date: item.key ?? "",
      visitors: totalDevices || safeNum(item.total),
      pageviews: safeNum(item.total),
    };
  });

  // ── Top pages ───────────────────────────────────────────────────────────────
  const topPages: TopPage[] = ((pagesData ?? {}).data ?? []).map((item) => ({
    page: item.key ?? "/",
    visitors: safeNum(item.total),
    bounceRate: safeNum(item.bounceRate),
  }));

  // ── Sources ─────────────────────────────────────────────────────────────────
  const rawSources = (refData ?? {}).data ?? [];
  const totalSourceVisitors = rawSources.reduce(
    (sum, s) => sum + safeNum(s.total),
    0
  );
  const sources: Source[] = rawSources.map((item) => {
    const v = safeNum(item.total);
    return {
      source: item.key ?? "Direct",
      visitors: v,
      pct:
        totalSourceVisitors > 0
          ? Math.round((v / totalSourceVisitors) * 1000) / 10
          : 0,
    };
  });

  // ── Devices ─────────────────────────────────────────────────────────────────
  const rawOs = (osData ?? {}).data ?? [];
  const totalOsVisitors = rawOs.reduce((sum, d) => sum + safeNum(d.total), 0);
  const devices: DeviceSplit[] = rawOs.map((item) => {
    const v = safeNum(item.total);
    return {
      device: item.key ?? "Unknown",
      visitors: v,
      pct:
        totalOsVisitors > 0
          ? Math.round((v / totalOsVisitors) * 1000) / 10
          : 0,
    };
  });

  return { overview, timeseries, topPages, sources, devices };
}
