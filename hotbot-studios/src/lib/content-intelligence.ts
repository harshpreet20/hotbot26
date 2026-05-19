/**
 * HotBot Studios — Local Content Intelligence Engine
 *
 * Zero external API calls. Runs entirely server-side using the rule-based
 * analysis from seo-analyzer.ts as its data source.
 *
 * Pipeline:
 *  1. Weighted score  — composite of SEO/AEO/GEO/Readability/Local
 *  2. Strengths       — high-impact checks that passed
 *  3. Weaknesses      — critical checks that failed (errors first)
 *  4. Improvements    — checks marked "improvement" across all dimensions
 *  5. Context expansion  — derived from GEO + AEO gap analysis
 *  6. Authority boosts   — derived from E-E-A-T + GEO signal gaps
 *  7. Structure upgrades — derived from readability check failures
 *  8. Quality assessment — template text generated from score patterns
 */

import type { FullAnalysis, AnalyzerInput } from "./seo-analyzer";
import { stripHtml, wordCount } from "./seo-analyzer";
import type { SeoCheck } from "@/types/blog";

// ── Public Result Type ────────────────────────────────────────────────────────

export interface ContentIntelligenceResult {
  total_score: number;
  quality_assessment: string;
  strengths: string[];
  weaknesses: string[];
  content_improvement_suggestions: string[];
  context_expansion_suggestions: string[];
  authority_boost_recommendations: string[];
  structure_upgrade_suggestions: string[];
}

// ── Weighted Score ────────────────────────────────────────────────────────────
// SEO: 30% · GEO: 25% · AEO: 20% · Readability: 20% · Local: 5%

function computeWeightedScore(analysis: FullAnalysis): number {
  return Math.round(
    analysis.seo.score         * 0.30 +
    analysis.geo.score         * 0.25 +
    analysis.aeo.score         * 0.20 +
    analysis.readability.score * 0.20 +
    analysis.local.score       * 0.05,
  );
}

// ── Strengths ─────────────────────────────────────────────────────────────────
// Pull "good" checks from the most impactful check IDs across all dimensions.

const STRENGTH_CHECK_IDS = new Set([
  "seo-kw-title", "seo-kw-intro", "seo-kw-h2", "seo-length", "seo-headings", "seo-ctr", "seo-links",
  "aeo-q-headings", "aeo-faq", "aeo-lists", "aeo-direct", "aeo-snippet",
  "geo-stats", "geo-citations", "geo-depth", "geo-expert", "geo-table", "geo-comparison",
  "geo-authority", "geo-recency",
  "read-fre", "read-passive", "read-transitions", "read-variety",
]);

function extractStrengths(analysis: FullAnalysis): string[] {
  const all: SeoCheck[] = [
    ...analysis.geo.checks,
    ...analysis.seo.checks,
    ...analysis.aeo.checks,
    ...analysis.readability.checks,
  ];
  return all
    .filter((c) => c.status === "good" && STRENGTH_CHECK_IDS.has(c.id))
    .slice(0, 5)
    .map((c) => c.message);
}

// ── Weaknesses ────────────────────────────────────────────────────────────────
// "error" checks first (critical), then unfavourable "improvement" checks.

const WEAKNESS_CHECK_IDS = new Set([
  "seo-kw-title", "seo-meta-title", "seo-meta-desc", "seo-length", "seo-density",
  "aeo-direct", "aeo-lists",
  "geo-depth", "geo-stats", "geo-citations",
  "read-fre", "read-sentence-len", "read-passive", "read-transitions",
]);

function extractWeaknesses(analysis: FullAnalysis): string[] {
  const all: SeoCheck[] = [
    ...analysis.seo.checks,
    ...analysis.geo.checks,
    ...analysis.aeo.checks,
    ...analysis.readability.checks,
  ];
  const errors = all.filter((c) => c.status === "error" && WEAKNESS_CHECK_IDS.has(c.id));
  const improvements = all.filter((c) => c.status === "improvement" && WEAKNESS_CHECK_IDS.has(c.id));
  return [...errors, ...improvements].slice(0, 5).map((c) => c.message);
}

// ── Content Improvement Suggestions ───────────────────────────────────────────
// "improvement" checks across all dimensions — already actionable messages.

const IMPROVEMENT_CHECK_IDS = new Set([
  "seo-kw-slug", "seo-kw-meta", "seo-kw-intro", "seo-kw-h2", "seo-density", "seo-headings",
  "seo-links", "seo-img-alt", "seo-ctr",
  "aeo-q-headings", "aeo-faq", "aeo-direct", "aeo-lists", "aeo-steps", "aeo-tone", "aeo-snippet",
  "geo-comparison", "geo-authority", "geo-recency", "geo-table",
]);

function extractImprovements(analysis: FullAnalysis): string[] {
  const all: SeoCheck[] = [
    ...analysis.seo.checks,
    ...analysis.aeo.checks,
    ...analysis.geo.checks,
  ];
  return all
    .filter((c) => c.status !== "good" && IMPROVEMENT_CHECK_IDS.has(c.id))
    .slice(0, 6)
    .map((c) => c.message);
}

// ── Context Expansion ─────────────────────────────────────────────────────────
// Derived from GEO + AEO gap analysis.

function extractContextExpansion(input: AnalyzerInput, analysis: FullAnalysis): string[] {
  const suggestions: string[] = [];
  const geo = new Map(analysis.geo.checks.map((c) => [c.id, c]));
  const aeo = new Map(analysis.aeo.checks.map((c) => [c.id, c]));
  const wc = wordCount(stripHtml(input.content));

  if (geo.get("geo-depth")?.status !== "good")
    suggestions.push(
      `Expand to 1,800+ words (currently ${wc}) — add subtopics, case examples, or a step-by-step walkthrough to signal comprehensive coverage to AI engines.`,
    );

  if (geo.get("geo-comparison")?.status !== "good")
    suggestions.push(
      "Add a comparison section (X vs Y, or 'Alternative approaches') — comparison content is heavily cited by AI search engines and captures high-intent queries.",
    );

  if (aeo.get("aeo-faq")?.status !== "good")
    suggestions.push(
      "Add a FAQ section with 5–8 common questions your audience searches — captures People Also Ask boxes and AI answer panel results.",
    );

  if (geo.get("geo-table")?.status !== "good")
    suggestions.push(
      "Include a data or comparison table — structured tabular content is extracted and cited frequently by generative AI engines (ChatGPT, Perplexity, Gemini).",
    );

  if (aeo.get("aeo-steps")?.status !== "good")
    suggestions.push(
      "Add a numbered step-by-step process section — eligible for HowTo rich results and highly extractable by voice assistants and AI overviews.",
    );

  return suggestions.slice(0, 5);
}

// ── Authority Boost Recommendations ──────────────────────────────────────────
// Derived from GEO E-E-A-T signals.

function extractAuthorityBoosts(analysis: FullAnalysis): string[] {
  const boosts: string[] = [];
  const geo = new Map(analysis.geo.checks.map((c) => [c.id, c]));
  const year = new Date().getFullYear();

  if (geo.get("geo-citations")?.status !== "good")
    boosts.push(
      "Reference credible third-party sources and studies ('According to [Source]…') — attributed claims are trusted more by both readers and AI citation engines.",
    );

  if (geo.get("geo-expert")?.status !== "good")
    boosts.push(
      "Mention your own experience or client results ('We helped X businesses achieve Y') — first-hand expertise is the core E-E-A-T signal AI engines look for.",
    );

  if (geo.get("geo-stats")?.status !== "good")
    boosts.push(
      "Back claims with specific data: percentages, dollar values, timeframes (e.g. '47% of marketers report…') — data-rich content is cited 3× more by generative AI.",
    );

  if (geo.get("geo-authority")?.status !== "good")
    boosts.push(
      "Include definitive, confident statements ('X is the most effective approach for Y because…') — authoritative framing positions the article as a citable reference.",
    );

  if (geo.get("geo-recency")?.status !== "good")
    boosts.push(
      `Add ${year} year references and update any dated statistics — AI engines and Google prefer recently published or clearly updated content.`,
    );

  return boosts.slice(0, 5);
}

// ── Structure Upgrade Suggestions ─────────────────────────────────────────────
// Derived from readability + AEO structure checks.

function extractStructureUpgrades(analysis: FullAnalysis): string[] {
  const upgrades: string[] = [];
  const read = new Map(analysis.readability.checks.map((c) => [c.id, c]));
  const aeo  = new Map(analysis.aeo.checks.map((c) => [c.id, c]));
  const seo  = new Map(analysis.seo.checks.map((c) => [c.id, c]));

  if (read.get("read-subheadings")?.status !== "good")
    upgrades.push(
      "Add H2/H3 subheadings every ~300 words — improves scannability, reduces bounce rate, and gives search crawlers clear content anchors.",
    );

  if (read.get("read-paragraphs")?.status !== "good")
    upgrades.push(
      "Break paragraphs longer than 120 words into smaller chunks — long text blocks reduce mobile readability and dwell time.",
    );

  if (read.get("read-sentence-len")?.status !== "good")
    upgrades.push(
      "Shorten average sentence length to under 20 words — split compound sentences to improve Flesch-Kincaid scores and reader comprehension.",
    );

  if (read.get("read-passive")?.status !== "good")
    upgrades.push(
      "Rewrite passive voice sentences to active voice ('We built X' instead of 'X was built') — stronger, more persuasive, and easier to read.",
    );

  if (read.get("read-transitions")?.status !== "good")
    upgrades.push(
      "Add transition words (Furthermore, However, As a result, In contrast) — logical connectors improve flow and readability scoring.",
    );

  if (aeo.get("aeo-snippet")?.status !== "good")
    upgrades.push(
      "Write a standalone 40–60 word paragraph that directly answers the main topic — the ideal size for Google featured snippet extraction.",
    );

  if (seo.get("seo-headings")?.status !== "good")
    upgrades.push(
      "Structure content with H2 and H3 subheadings — essential for document hierarchy, accessibility, and SEO crawl signals.",
    );

  return upgrades.slice(0, 5);
}

// ── Quality Assessment Text ───────────────────────────────────────────────────
// Template-driven summary generated from score patterns.

function generateAssessmentText(
  input: AnalyzerInput,
  analysis: FullAnalysis,
  total_score: number,
): string {
  const wc = wordCount(stripHtml(input.content));
  const allChecks = [
    ...analysis.seo.checks,
    ...analysis.aeo.checks,
    ...analysis.geo.checks,
    ...analysis.readability.checks,
  ];
  const errorCount = allChecks.filter((c) => c.status === "error").length;

  const weakDims: string[] = [];
  if (analysis.seo.score < 60)         weakDims.push("SEO fundamentals");
  if (analysis.aeo.score < 60)         weakDims.push("answer engine optimisation");
  if (analysis.geo.score < 60)         weakDims.push("generative AI citation signals");
  if (analysis.readability.score < 60) weakDims.push("readability");

  const parts: string[] = [];

  if (total_score >= 75) {
    parts.push(
      `This ${wc}-word article is well-optimised, scoring ${total_score}/100 across SEO, AEO, GEO, and readability.`,
    );
    if (weakDims.length)
      parts.push(`Minor gains remain in: ${weakDims.join(", ")}.`);
    else
      parts.push("All core dimensions are performing strongly.");
  } else if (total_score >= 50) {
    parts.push(
      `This ${wc}-word article has a solid foundation but scores ${total_score}/100, with clear opportunities to improve search and AI engine performance.`,
    );
    if (weakDims.length)
      parts.push(`Priority areas: ${weakDims.join(", ")}.`);
  } else if (total_score >= 30) {
    parts.push(
      `This ${wc}-word article scores ${total_score}/100 and needs meaningful improvements to compete effectively in search and AI-generated results.`,
    );
    if (weakDims.length)
      parts.push(`Focus first on: ${weakDims.join(", ")}.`);
  } else {
    parts.push(
      `This ${wc}-word article scores ${total_score}/100 and requires significant structural and content work before it can rank or be cited by AI engines.`,
    );
    parts.push("Prioritise fixing critical errors before optimising for advanced signals.");
  }

  if (errorCount > 0)
    parts.push(
      `${errorCount} critical issue${errorCount > 1 ? "s" : ""} flagged — resolve ${errorCount > 1 ? "these" : "this"} first for the fastest score improvement.`,
    );

  return parts.join(" ");
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export function computeLocalIntelligence(
  input: AnalyzerInput,
  analysis: FullAnalysis,
): ContentIntelligenceResult {
  const total_score = computeWeightedScore(analysis);

  return {
    total_score,
    quality_assessment:              generateAssessmentText(input, analysis, total_score),
    strengths:                       extractStrengths(analysis),
    weaknesses:                      extractWeaknesses(analysis),
    content_improvement_suggestions: extractImprovements(analysis),
    context_expansion_suggestions:   extractContextExpansion(input, analysis),
    authority_boost_recommendations: extractAuthorityBoosts(analysis),
    structure_upgrade_suggestions:   extractStructureUpgrades(analysis),
  };
}
