/**
 * POST /api/content/intelligence
 *
 * Layer 2: API Gateway for the Content Intelligence Engine.
 *
 * Responsibilities:
 *  - Authentication (session token required — admin or manager)
 *  - Per-user rate limiting (5 requests / 60 s)
 *  - Input validation and length enforcement
 *  - Delegates to Layer 3 (content-intelligence.ts) for rule scoring + AI evaluation
 *  - Returns structured ContentIntelligenceResult + rule_scores
 *
 * Security:
 *  - All prompt logic is in content-intelligence.ts (server-side only)
 *  - Internal scoring details are never returned to the client
 *  - Request body is validated before any processing
 */

import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { analyzeAll } from "@/lib/seo-analyzer";
import {
  evaluateContent,
  checkIntelligenceRateLimit,
  getRateLimitRemaining,
} from "@/lib/content-intelligence";
import type { AnalyzerInput } from "@/lib/seo-analyzer";

const MAX_CONTENT_LENGTH = 60_000; // ~12k words of HTML

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const token = extractToken(req);
  const session = authorizeAny(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  if (!checkIntelligenceRateLimit(session.userId)) {
    return NextResponse.json(
      { error: "Rate limit reached. You can run 5 AI analyses per minute. Please wait." },
      { status: 429 },
    );
  }

  // ── Input validation ──────────────────────────────────────────────────────
  let body: Partial<AnalyzerInput>;
  try {
    body = await req.json() as Partial<AnalyzerInput>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "Content is required for analysis." }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Content exceeds maximum length (${MAX_CONTENT_LENGTH} chars).` },
      { status: 400 },
    );
  }

  const input: AnalyzerInput = {
    title:            (body.title            || "").slice(0, 300),
    slug:             (body.slug             || "").slice(0, 200),
    content,
    excerpt:          (body.excerpt          || "").slice(0, 600),
    metaTitle:        (body.metaTitle        || "").slice(0, 120),
    metaDescription:  (body.metaDescription  || "").slice(0, 320),
    focusKeyword:     (body.focusKeyword     || "").slice(0, 120),
    featuredImageAlt: (body.featuredImageAlt || "").slice(0, 250),
  };

  // ── Layer 3: Rule-based pre-analysis (zero API calls, instant) ────────────
  const ruleAnalysis = analyzeAll(input);

  // ── Layer 3→4: AI evaluation via Claude ──────────────────────────────────
  try {
    const aiResult = await evaluateContent(input, ruleAnalysis);

    return NextResponse.json({
      ...aiResult,
      // Rule scores included for UI display — algorithm details stay hidden
      rule_scores: {
        overall:      ruleAnalysis.overall.score,
        seo:          ruleAnalysis.seo.score,
        aeo:          ruleAnalysis.aeo.score,
        geo:          ruleAnalysis.geo.score,
        local:        ruleAnalysis.local.score,
        readability:  ruleAnalysis.readability.score,
      },
      // Helpful for the UI to know remaining quota
      rate_limit_remaining: getRateLimitRemaining(session.userId),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[content/intelligence] AI evaluation error:", msg);

    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI analysis is not configured. Set the ANTHROPIC_API_KEY environment variable." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "AI analysis failed. Please try again in a moment." },
      { status: 500 },
    );
  }
}
