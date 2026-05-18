import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import {
  isGa4Enabled,
  getOverviewMetrics,
  getSessionsByDate,
  getTopPages,
  getTrafficSources,
  getDeviceBreakdown,
  getEventCounts,
} from "@/lib/ga4";
import OpenAI from "openai";

// ── GET: fetch all analytics data ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGa4Enabled()) {
    return NextResponse.json({ error: "GA4 not configured" }, { status: 503 });
  }

  try {
    const [overview, sessionsByDate, topPages, trafficSources, deviceBreakdown, eventCounts] =
      await Promise.all([
        getOverviewMetrics(),
        getSessionsByDate(),
        getTopPages(),
        getTrafficSources(),
        getDeviceBreakdown(),
        getEventCounts(),
      ]);

    return NextResponse.json({
      overview,
      sessionsByDate,
      topPages,
      trafficSources,
      deviceBreakdown,
      eventCounts,
    });
  } catch (err) {
    console.error("[analytics/GET]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST: AI analysis ────────────────────────────────────────────────────────

interface AnalyticsPayload {
  overview?: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
  };
  sessionsByDate?: Array<{ date: string; sessions: number }>;
  topPages?: Array<{ page: string; sessions: number; bounceRate: number }>;
  trafficSources?: Array<{ source: string; sessions: number; percentage: number }>;
  deviceBreakdown?: Array<{ device: string; sessions: number; percentage: number }>;
  eventCounts?: Array<{ eventName: string; count: number }>;
}

export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AnalyticsPayload;
  try {
    body = (await req.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { overview, sessionsByDate = [], topPages = [], trafficSources = [], deviceBreakdown = [], eventCounts = [] } = body;

  // Build a compact summary for the prompt — numbers only, no raw rows
  const firstDate = sessionsByDate[0]?.date ?? "n/a";
  const lastDate = sessionsByDate[sessionsByDate.length - 1]?.date ?? "n/a";
  const midpoint = Math.floor(sessionsByDate.length / 2);
  const firstHalf = sessionsByDate.slice(0, midpoint).reduce((s, d) => s + d.sessions, 0);
  const secondHalf = sessionsByDate.slice(midpoint).reduce((s, d) => s + d.sessions, 0);
  const trendDirection = secondHalf > firstHalf ? "increasing" : secondHalf < firstHalf ? "decreasing" : "flat";

  const formEvents = eventCounts.filter((e) =>
    ["form_submit", "generate_lead", "contact_form", "lead_form", "conversion"].some((kw) =>
      e.eventName.toLowerCase().includes(kw)
    )
  );
  const formEventsSummary = formEvents.length > 0
    ? formEvents.map((e) => `${e.eventName}: ${e.count}`).join(", ")
    : "NONE DETECTED";

  const topSource = trafficSources[0];
  const sourceConcentration = topSource
    ? `${topSource.source} dominates at ${topSource.percentage}%`
    : "no source data";

  const highBouncePages = topPages.filter((p) => p.bounceRate > 0.7);

  const prompt = `You are a senior web analytics consultant. Analyse the following Google Analytics 4 data (last 30 days) and provide a concise, actionable report.

OVERVIEW:
- Sessions: ${overview?.sessions ?? 0}
- Users: ${overview?.users ?? 0}
- Pageviews: ${overview?.pageviews ?? 0}
- Bounce Rate: ${((overview?.bounceRate ?? 0) * 100).toFixed(1)}%
- Avg Session Duration: ${Math.round((overview?.avgSessionDuration ?? 0))}s
- New Users: ${overview?.newUsers ?? 0}

TREND: Traffic is ${trendDirection} (${firstDate} → ${lastDate}). First half sessions: ${firstHalf}, second half: ${secondHalf}.

TOP TRAFFIC SOURCES: ${trafficSources.slice(0, 5).map((s) => `${s.source} ${s.percentage}%`).join(", ")}
Source concentration: ${sourceConcentration}

TOP PAGES (sessions | bounce rate):
${topPages.slice(0, 5).map((p) => `  ${p.page}: ${p.sessions} sessions, ${(p.bounceRate * 100).toFixed(0)}% bounce`).join("\n")}

HIGH BOUNCE PAGES (>70%): ${highBouncePages.length > 0 ? highBouncePages.map((p) => p.page).join(", ") : "none"}

DEVICE SPLIT: ${deviceBreakdown.map((d) => `${d.device} ${d.percentage}%`).join(", ")}

FORM/CONVERSION EVENTS: ${formEventsSummary}

TOP EVENTS: ${eventCounts.slice(0, 10).map((e) => `${e.eventName}(${e.count})`).join(", ")}

Please provide:
1. HEALTH SCORE: A single integer 1-10 (10 = excellent, 1 = critical)
2. FLAGS: Up to 5 short warning flags (each ≤ 80 chars) starting with "⚠" — only real concerns
3. ANALYSIS: 3-5 paragraphs covering: traffic trend, source diversity, bounce/engagement, conversion event health, and top actionable recommendations

Format your response EXACTLY as valid JSON:
{
  "healthScore": <number 1-10>,
  "flags": ["⚠ flag1", "⚠ flag2"],
  "analysis": "full multi-paragraph analysis text here"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert web analytics consultant. Always respond with valid JSON only, no markdown fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: { healthScore?: number; flags?: string[]; analysis?: string };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      // If model wrapped in markdown fences, strip them
      const stripped = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(stripped) as typeof parsed;
    }

    return NextResponse.json({
      analysis: parsed.analysis ?? "No analysis available.",
      healthScore: parsed.healthScore ?? 5,
      flags: parsed.flags ?? [],
    });
  } catch (err) {
    console.error("[analytics/POST]", err);
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
