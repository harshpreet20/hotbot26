import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";

export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID;

  if (!token || !projectId) {
    return NextResponse.json({ error: "VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID not set" });
  }

  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const base: Record<string, string> = { projectId, from, to };
  if (teamId) base.teamId = teamId;

  async function probe(path: string, extra: Record<string, string> = {}) {
    const params = new URLSearchParams({ ...base, ...extra });
    const url = `https://vercel.com/api${path}?${params}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const text = await res.text();
      let body: unknown;
      try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
      return { status: res.status, body };
    } catch (e) {
      return { status: 0, body: String(e) };
    }
  }

  // Probe every plausible path variation
  const [
    v1Stats, v1Events, v1Pageviews,
    v9Stats, v9Analytics,
    webStats, webInsights, webByline,
    projectAnalytics, projectWebAnalytics,
    speedInsights,
  ] = await Promise.all([
    probe("/v1/web-analytics/stats"),
    probe("/v1/web-analytics/events"),
    probe("/v1/web-analytics/pageviews"),
    probe("/v9/web-analytics/stats"),
    probe("/v9/analytics"),
    probe("/web/stats"),
    probe("/web/insights/stats"),
    probe("/web/byline/stats"),
    probe(`/v9/projects/${projectId}/analytics`),
    probe(`/v9/projects/${projectId}/web-analytics`),
    probe("/v1/speed-insights/stats"),
  ]);

  return NextResponse.json({
    env: { token: `${token.slice(0, 8)}...`, projectId, teamId: teamId ?? "not set" },
    probes: {
      "/v1/web-analytics/stats": v1Stats,
      "/v1/web-analytics/events": v1Events,
      "/v1/web-analytics/pageviews": v1Pageviews,
      "/v9/web-analytics/stats": v9Stats,
      "/v9/analytics": v9Analytics,
      "/web/stats": webStats,
      "/web/insights/stats": webInsights,
      "/web/byline/stats": webByline,
      [`/v9/projects/${projectId}/analytics`]: projectAnalytics,
      [`/v9/projects/${projectId}/web-analytics`]: projectWebAnalytics,
      "/v1/speed-insights/stats": speedInsights,
    },
  });
}
