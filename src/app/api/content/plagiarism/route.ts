/**
 * POST /api/content/plagiarism
 *
 * Detects content plagiarism against the HotBot Studios blog post database.
 * Zero external API calls - uses n-gram shingle fingerprinting.
 *
 * Auth: session token required (any authenticated role).
 *
 * Request body:
 *   { content: string, excludeSlug?: string }
 *
 * Response: PlagiarismResult
 *   {
 *     overallRisk: "none" | "low" | "medium" | "high",
 *     overallSimilarity: number,   // 0–100
 *     uniquenessScore: number,     // 0–100
 *     matches: PlagiarismMatch[],
 *     summary: string,
 *     recommendations: string[]
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { detectPlagiarism } from "@/lib/plagiarism-detector";

const MAX_CONTENT_LENGTH = 60_000;

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const token = extractToken(req);
  if (!await authorizeAny(token)) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  // ── Input validation ────────────────────────────────────────────────────────
  let body: { content?: string; excludeSlug?: string };
  try {
    body = await req.json() as { content?: string; excludeSlug?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const content = (body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "Content is required for plagiarism analysis." }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Content exceeds maximum length." }, { status: 400 });
  }

  const excludeSlug = typeof body.excludeSlug === "string" ? body.excludeSlug.trim() : undefined;

  // ── Analysis ────────────────────────────────────────────────────────────────
  try {
    const result = detectPlagiarism(content, excludeSlug);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[content/plagiarism]", err);
    return NextResponse.json({ error: "Plagiarism analysis failed. Please try again." }, { status: 500 });
  }
}
