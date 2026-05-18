import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { isVercelAnalyticsEnabled, getAnalyticsBundle } from "@/lib/vercelAnalytics";
import type { AnalyticsBundle } from "@/lib/vercelAnalytics";
import OpenAI from "openai";

// ── GET: fetch all analytics data ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isVercelAnalyticsEnabled()) {
    return NextResponse.json(
      { error: "Vercel Analytics not configured" },
      { status: 503 }
    );
  }

  try {
    const bundle = await getAnalyticsBundle();
    return NextResponse.json(bundle);
  } catch (err) {
    console.error("[analytics/GET]", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST: AI analysis ────────────────────────────────────────────────────────

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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { overview, timeseries = [], topPages = [], sources = [], devices = [] } = body;

  // Trend direction from timeseries
  const mid = Math.floor(timeseries.length / 2);
  const firstHalf = timeseries.slice(0, mid).reduce((s, d) => s + d.visitors, 0);
  const secondHalf = timeseries.slice(mid).reduce((s, d) => s + d.visitors, 0);
  const trendDirection =
    secondHalf > firstHalf ? "increasing" : secondHalf < firstHalf ? "decreasing" : "flat";

  const firstDate = timeseries[0]?.date ?? "n/a";
  const lastDate = timeseries[timeseries.length - 1]?.date ?? "n/a";

  const highBouncePages = topPages.filter((p) => p.bounceRate > 0.7);
  const topSource = sources[0];
  const sourceConcentration = topSource
    ? `${topSource.source} dominates at ${topSource.pct}%`
    : "no source data";

  const prompt = `You are a senior web analytics consultant. Analyse the following Vercel Analytics data (last 30 days vs previous 30 days) and provide a structured, actionable report.

OVERVIEW (current vs trend):
- Visitors: ${overview?.visitors ?? 0} (trend: ${overview?.visitorsTrend ?? 0}%)
- Pageviews: ${overview?.pageviews ?? 0} (trend: ${overview?.pageviewsTrend ?? 0}%)
- Bounce Rate: ${((overview?.bounceRate ?? 0) * 100).toFixed(1)}% (trend: ${overview?.bounceRateTrend ?? 0}%)
- Avg Duration: ${Math.round(overview?.avgDuration ?? 0)}s (trend: ${overview?.avgDurationTrend ?? 0}%)

TREND: Traffic is ${trendDirection} (${firstDate} → ${lastDate}). First-half visitors: ${firstHalf}, second-half: ${secondHalf}.

TOP TRAFFIC SOURCES: ${sources.slice(0, 5).map((s) => `${s.source} ${s.pct}%`).join(", ")}
Source concentration: ${sourceConcentration}

TOP PAGES (visitors | bounce rate):
${topPages.slice(0, 5).map((p) => `  ${p.page}: ${p.visitors} visitors, ${(p.bounceRate * 100).toFixed(0)}% bounce`).join("\n")}

HIGH BOUNCE PAGES (>70%): ${highBouncePages.length > 0 ? highBouncePages.map((p) => p.page).join(", ") : "none"}

DEVICE / OS SPLIT: ${devices.map((d) => `${d.device} ${d.pct}%`).join(", ")}

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
- sections.conversions: paragraph about conversion signals (inferred from pages/sources)
- sections.recommendations: 3-5 concrete, prioritised action items`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert web analytics consultant. Always respond with valid JSON only, no markdown fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
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
      const stripped = raw
        .replace(/```json?\n?/g, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(stripped) as typeof parsed;
    }

    return NextResponse.json({
      healthScore: parsed.healthScore ?? 5,
      flags: parsed.flags ?? [],
      sections: {
        traffic: parsed.sections?.traffic ?? "",
        engagement: parsed.sections?.engagement ?? "",
        conversions: parsed.sections?.conversions ?? "",
        recommendations: parsed.sections?.recommendations ?? [],
      },
    });
  } catch (err) {
    console.error("[analytics/POST]", err);
    const message =
      err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
