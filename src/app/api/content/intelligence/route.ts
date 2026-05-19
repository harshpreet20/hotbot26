/**
 * POST /api/content/intelligence
 *
 * API gateway for the local Content Intelligence Engine.
 * Zero external API calls - runs entirely from rule-based analysis.
 *
 * Auth: session token required (any authenticated role).
 */

import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { analyzeAll } from "@/lib/seo-analyzer";
import { computeLocalIntelligence } from "@/lib/content-intelligence";
import type { AnalyzerInput } from "@/lib/seo-analyzer";

const MAX_CONTENT_LENGTH = 60_000;

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const token = extractToken(req);
  if (!(await authorizeAny(token))) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
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
    return NextResponse.json({ error: "Content exceeds maximum length." }, { status: 400 });
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

  // ── Rule-based analysis + local intelligence synthesis ────────────────────
  try {
    const ruleAnalysis = analyzeAll(input);
    const result       = computeLocalIntelligence(input, ruleAnalysis);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[content/intelligence]", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
