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

  const baseParams: Record<string, string> = { projectId, from, to, environment: "production" };
  if (teamId) baseParams.teamId = teamId;

  async function probe(path: string, extra: Record<string, string> = {}) {
    const params = new URLSearchParams({ ...baseParams, ...extra });
    const url = `https://vercel.com/api${path}?${params}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const text = await res.text();
      let json: unknown;
      try { json = JSON.parse(text); } catch { json = text; }
      return { status: res.status, ok: res.ok, body: json };
    } catch (e) {
      return { status: 0, ok: false, body: String(e) };
    }
  }

  const [stats, timeseries, pages, referrers, sources, os, devices, browsers] = await Promise.all([
    probe("/v1/web-analytics/stats"),
    probe("/v1/web-analytics/timeseries", { granularity: "1d" }),
    probe("/v1/web-analytics/pages", { limit: "5" }),
    probe("/v1/web-analytics/referrers", { limit: "5" }),
    probe("/v1/web-analytics/sources", { limit: "5" }),
    probe("/v1/web-analytics/os"),
    probe("/v1/web-analytics/devices"),
    probe("/v1/web-analytics/browsers"),
  ]);

  return NextResponse.json({
    env: { token: token ? `${token.slice(0, 8)}...` : "MISSING", projectId, teamId: teamId ?? "not set" },
    endpoints: { stats, timeseries, pages, referrers, sources, os, devices, browsers },
  });
}
