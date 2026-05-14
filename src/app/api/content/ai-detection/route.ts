/**
 * POST /api/content/ai-detection
 *
 * Detects likely AI-generated content using heuristic linguistic analysis.
 * Zero external API calls - runs entirely server-side.
 *
 * Auth: session token required (any authenticated role).
 *
 * Request body:
 *   { content: string }
 *
 * Response: AiDetectionResult
 *   {
 *     aiProbability: number,                      // 0–100
 *     verdict: "human" | "mixed" | "likely_ai" | "ai",
 *     signals: AiDetectionSignal[],
 *     summary: string,
 *     recommendations: string[]
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { detectAiContent } from "@/lib/ai-content-detector";

const MAX_CONTENT_LENGTH = 60_000;

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const token = extractToken(req);
  if (!await authorizeAny(token)) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  // ── Input validation ────────────────────────────────────────────────────────
  let body: { content?: string };
  try {
    body = await req.json() as { content?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "Content is required for AI detection analysis." }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Content exceeds maximum length." }, { status: 400 });
  }

  // ── Analysis ────────────────────────────────────────────────────────────────
  try {
    const result = detectAiContent(content);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[content/ai-detection]", err);
    return NextResponse.json({ error: "AI detection analysis failed. Please try again." }, { status: 500 });
  }
}
