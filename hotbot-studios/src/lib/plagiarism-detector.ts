/**
 * HotBot Studios — Content Plagiarism Detector
 *
 * Zero external API calls. Compares submitted content against the stored
 * blog post database using n-gram (shingle) fingerprinting + sentence-level
 * near-duplicate detection.
 *
 * Algorithm:
 *  1. Tokenise → 5-word shingles (Jaccard similarity per stored post)
 *  2. Sentence-level phrase matching (8-word run check)
 *  3. Aggregate: highest similarity determines risk level
 */

import { stripHtml, wordCount } from "./seo-analyzer";
import { readPosts } from "./postsStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlagiarismMatch {
  postSlug: string;
  postTitle: string;
  similarityScore: number;    // 0–100
  matchedSentences: string[]; // Up to 5 near-verbatim matched phrases
}

export interface PlagiarismResult {
  overallRisk: "none" | "low" | "medium" | "high";
  overallSimilarity: number;  // 0–100 (max across all compared posts)
  uniquenessScore: number;    // 100 − overallSimilarity
  matches: PlagiarismMatch[]; // Top 5 posts with non-trivial similarity
  summary: string;
  recommendations: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Generate k-word shingles from a token list */
function shingle(tokens: string[], k: number): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i <= tokens.length - k; i++) {
    set.add(tokens.slice(i, i + k).join(" "));
  }
  return set;
}

/** Jaccard similarity between two shingle sets (0–1) */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  a.forEach((v) => { if (b.has(v)) intersection++; });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Extract plain sentences (5+ word sentences only) */
function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 5);
}

/**
 * Find sentences from `submitted` that appear near-verbatim in `targetTokens`.
 * Uses an 8-word run check. Returns up to 5 matches.
 */
function findMatchingSentences(
  submittedSentences: string[],
  targetTokens: string[],
  minRunLength = 8,
): string[] {
  const targetText = targetTokens.join(" ");
  const matches: string[] = [];
  for (const sentence of submittedSentences) {
    if (matches.length >= 5) break;
    const tokens = tokenise(sentence);
    if (tokens.length < minRunLength) continue;
    const run = tokens.slice(0, minRunLength).join(" ");
    if (targetText.includes(run)) {
      matches.push(sentence.slice(0, 120) + (sentence.length > 120 ? "…" : ""));
    }
  }
  return matches;
}

// ── Risk & Summary ─────────────────────────────────────────────────────────────

function riskLevel(score: number): "none" | "low" | "medium" | "high" {
  if (score < 5)  return "none";
  if (score < 20) return "low";
  if (score < 40) return "medium";
  return "high";
}

function buildSummary(
  risk: "none" | "low" | "medium" | "high",
  score: number,
  matchCount: number,
): string {
  const against = matchCount > 0 ? `${matchCount} existing post${matchCount > 1 ? "s" : ""}` : "the blog database";
  switch (risk) {
    case "none":
      return `Content appears original (${score}% similarity against ${against}). No significant overlap detected.`;
    case "low":
      return `Low similarity detected (${score}% max). Minor overlapping phrases are common in niche topics — content is substantially original.`;
    case "medium":
      return `Moderate similarity detected (${score}% max) with ${against}. Review flagged sections and rephrase any closely matched passages.`;
    case "high":
      return `High similarity detected (${score}% max) with ${against}. Significant content overlap — substantial rewriting required before publishing.`;
  }
}

function buildRecommendations(risk: "none" | "low" | "medium" | "high"): string[] {
  switch (risk) {
    case "none":
      return ["Content appears original — proceed with publishing."];
    case "low":
      return [
        "Minor overlap is common in niche topics. Review flagged phrases and confirm intent.",
        "Rephrase any directly copied sentences to improve originality.",
      ];
    case "medium":
      return [
        "Review the flagged sections and rewrite matched passages in your own words.",
        "Add unique insights, personal experience, or original data to differentiate.",
        "Consider citing similar posts as references rather than reproducing content.",
      ];
    case "high":
      return [
        "Substantial rewriting required — this content shares too many phrases with existing posts.",
        "Rewrite flagged sections entirely using fresh structure, examples, and phrasing.",
        "If referencing another post, use blockquotes and attribution rather than reproduced paragraphs.",
        "Run the analysis again after rewriting to confirm originality.",
      ];
  }
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Detect plagiarism in `submittedContent` against the live blog post database.
 *
 * @param submittedContent  HTML content to analyse
 * @param excludeSlug       Slug of the post being edited (excluded from comparison)
 */
export function detectPlagiarism(
  submittedContent: string,
  excludeSlug?: string,
): PlagiarismResult {
  const plain = stripHtml(submittedContent);
  const tokens = tokenise(plain);
  const shingles = shingle(tokens, 5);
  const sentences = extractSentences(plain);

  const { posts } = readPosts();
  const candidates = posts.filter(
    (p) => p.slug !== excludeSlug,
  );

  const matches: PlagiarismMatch[] = [];

  for (const post of candidates) {
    const postPlain = stripHtml(post.content || "");
    const postTokens = tokenise(postPlain);
    if (postTokens.length < 30) continue;

    const postShingles = shingle(postTokens, 5);
    const sim = Math.round(jaccard(shingles, postShingles) * 100);

    if (sim < 3) continue; // negligible — skip

    const matchedSentences = findMatchingSentences(sentences, postTokens);
    matches.push({
      postSlug: post.slug,
      postTitle: post.title,
      similarityScore: sim,
      matchedSentences,
    });
  }

  matches.sort((a, b) => b.similarityScore - a.similarityScore);
  const topMatches = matches.slice(0, 5);
  const maxSim = topMatches.length > 0 ? topMatches[0].similarityScore : 0;
  const risk = riskLevel(maxSim);

  return {
    overallRisk: risk,
    overallSimilarity: maxSim,
    uniquenessScore: 100 - maxSim,
    matches: topMatches,
    summary: buildSummary(risk, maxSim, topMatches.length),
    recommendations: buildRecommendations(risk),
  };
}
