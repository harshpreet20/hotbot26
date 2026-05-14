/**
 * HotBot Studios — AI Content Detector
 *
 * Zero external API calls. Detects AI-generated text through heuristic
 * linguistic analysis based on published research into LLM output patterns.
 *
 * Signals analysed:
 *  1. Sentence-length burstiness   — Human writing has high variance; AI is uniform
 *  2. AI signature vocabulary      — LLMs overuse specific words ("delve", "utilize", etc.)
 *  3. AI pattern phrases           — Characteristic openers, closers, and filler
 *  4. Paragraph length uniformity  — AI produces suspiciously even block lengths
 *  5. Transition word overuse      — LLMs are over-structured by default
 *  6. Repetitive sentence starters — AI falls into opener repetition
 *  7. AI disclaimer / hedge phrases — "It is important to note", "feel free to", etc.
 */

import { stripHtml, wordCount } from "./seo-analyzer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AiDetectionSignal {
  id: string;
  label: string;
  detected: boolean;
  confidence: "low" | "medium" | "high";
  detail: string;
}

export interface AiDetectionResult {
  aiProbability: number;  // 0–100 — estimated likelihood of AI authorship
  verdict: "human" | "mixed" | "likely_ai" | "ai";
  signals: AiDetectionSignal[];
  summary: string;
  recommendations: string[];
}

// ── Utility Helpers ───────────────────────────────────────────────────────────

function getSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 3);
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// ── Signal 1: Sentence Burstiness ─────────────────────────────────────────────
// Human writers naturally vary sentence rhythm (high σ). AI output is uniform (low σ).

function detectBurstiness(sentences: string[]): AiDetectionSignal {
  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const sd = lengths.length >= 4 ? stdDev(lengths) : 999;

  const isHigh   = sd < 6  && lengths.length >= 8;
  const isMedium = sd >= 6 && sd < 9 && lengths.length >= 10;
  const detected = isHigh || isMedium;

  return {
    id: "burstiness",
    label: "Sentence length uniformity",
    detected,
    confidence: isHigh ? "high" : isMedium ? "medium" : "low",
    detail: isHigh
      ? `Very uniform sentence lengths (σ=${sd.toFixed(1)} words) — human writers naturally vary rhythm much more than this.`
      : isMedium
      ? `Moderately uniform sentence lengths (σ=${sd.toFixed(1)} words) — some AI-uniformity signal present.`
      : `Good sentence length variety (σ=${sd.toFixed(1)} words) — consistent with human writing patterns.`,
  };
}

// ── Signal 2: AI Signature Vocabulary ─────────────────────────────────────────
// LLMs consistently overuse a set of formal, impressive-sounding words.

const AI_VOCAB = [
  "delve", "delving", "delved", "realm", "realms", "leverage", "leveraging",
  "leveraged", "utilise", "utilize", "utilising", "utilizing", "utilization",
  "pivotal", "paramount", "multifaceted", "nuanced", "robust", "seamless",
  "seamlessly", "groundbreaking", "revolutionize", "revolutionizing",
  "transformative", "synergy", "synergies", "holistic", "comprehensive",
  "meticulous", "meticulously", "intricate", "intricacies", "vibrant",
  "embark", "embarking", "embodies", "tapestry", "landscape", "evolving",
  "navigate", "navigating", "foster", "fostering", "streamline",
  "streamlining", "harness", "harnessing", "underscore", "underscores",
  "elevate", "elevating", "illuminate", "illuminates", "supercharge",
  "unlock", "unlocking",
];

function detectAiVocab(text: string): AiDetectionSignal {
  const lower = text.toLowerCase();
  const wordList = lower.split(/\s+/);
  const hits = AI_VOCAB.filter((w) => lower.includes(w));
  const density = wordList.length > 0 ? (hits.length / wordList.length) * 1000 : 0;

  const detected = hits.length >= 3 || density >= 2;
  const high     = hits.length >= 6 || density >= 4;

  return {
    id: "ai-vocab",
    label: "AI signature vocabulary",
    detected,
    confidence: high ? "high" : detected ? "medium" : "low",
    detail: detected
      ? `${hits.length} AI-characteristic word${hits.length > 1 ? "s" : ""} found: ${hits.slice(0, 6).join(", ")}. LLMs consistently overuse these terms.`
      : "No significant AI vocabulary patterns detected. Word choice appears natural.",
  };
}

// ── Signal 3: AI Pattern Phrases ──────────────────────────────────────────────
// Characteristic openers, closers, and filler phrases that LLMs default to.

const AI_PHRASE_PATTERNS: RegExp[] = [
  /\bin (today['']?s|the modern|our (increasingly|ever[-\s]changing))\b/i,
  /\bit('s| is) (important|crucial|essential|vital|worth noting|worth mentioning) to\b/i,
  /\bone (must|should|cannot|can't) (underestimate|overlook|ignore|deny)\b/i,
  /\bin (conclusion|summary|essence|closing|a nutshell|this article)\b/i,
  /\bas (mentioned|discussed|noted|outlined) (earlier|above|before|previously)\b/i,
  /\bwithout (further ado|delay)\b/i,
  /\bsuffice (it )?to say\b/i,
  /\bneedless to say\b/i,
  /\bthe (importance|significance|value|role|power|impact) of .{0,60}(cannot|can't) be (overstated|understated)\b/i,
  /\bin (the realm|the world) of\b/i,
  /\bwhen it comes to\b/i,
  /\bfeel free to\b/i,
  /\bhope (this|that) (helps|answers|clarifies)\b/i,
  /\bcertainly[,!]/i,
  /\babsolutely[,!]/i,
];

function detectAiPhrases(text: string): AiDetectionSignal {
  const matched: string[] = [];
  for (const pattern of AI_PHRASE_PATTERNS) {
    const m = text.match(pattern);
    if (m) matched.push(`"${m[0].slice(0, 45)}"`);
  }

  const detected = matched.length >= 2;
  const high     = matched.length >= 4;

  return {
    id: "ai-phrases",
    label: "AI pattern phrases",
    detected,
    confidence: high ? "high" : detected ? "medium" : "low",
    detail: detected
      ? `${matched.length} AI-characteristic phrase${matched.length > 1 ? "s" : ""} detected: ${matched.slice(0, 4).join(", ")}.`
      : "No characteristic AI phrase patterns detected.",
  };
}

// ── Signal 4: Paragraph Length Uniformity ─────────────────────────────────────
// AI systems produce suspiciously even paragraph word counts.

function detectParagraphUniformity(html: string): AiDetectionSignal {
  const paras = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [])
    .map((p) => wordCount(stripHtml(p)));

  if (paras.length < 4) {
    return {
      id: "para-uniformity",
      label: "Paragraph length uniformity",
      detected: false,
      confidence: "low",
      detail: "Not enough paragraphs to assess uniformity (need 4+).",
    };
  }

  const sd       = stdDev(paras);
  const detected = sd < 15 && paras.length >= 5;
  const high     = sd < 8  && paras.length >= 6;

  return {
    id: "para-uniformity",
    label: "Paragraph length uniformity",
    detected,
    confidence: high ? "high" : detected ? "medium" : "low",
    detail: detected
      ? `Very uniform paragraph lengths (σ=${sd.toFixed(1)} words across ${paras.length} paragraphs) — AI tends to produce suspiciously even block sizes.`
      : `Natural paragraph length variation (σ=${sd.toFixed(1)} words) — consistent with human writing.`,
  };
}

// ── Signal 5: Transition Word Overuse ─────────────────────────────────────────
// AI defaults to heavy transition-word usage. Human: 15–30%. AI: 35–60%+.

const FORMAL_TRANSITIONS = [
  "furthermore", "moreover", "additionally", "consequently", "therefore",
  "however", "nevertheless", "nonetheless", "subsequently", "accordingly",
  "in addition", "as a result", "on the other hand", "in contrast",
  "by contrast", "in conclusion", "to summarize", "in summary", "overall",
  "importantly", "notably", "specifically", "particularly", "essentially",
];

function detectTransitionOveruse(sentences: string[]): AiDetectionSignal {
  if (sentences.length < 5) {
    return {
      id: "transition-overuse",
      label: "Transition word density",
      detected: false,
      confidence: "low",
      detail: "Too few sentences to assess transition density.",
    };
  }

  const withTransitions = sentences.filter((s) => {
    const sl = s.toLowerCase();
    return FORMAL_TRANSITIONS.some((t) => sl.startsWith(t) || sl.includes(", " + t + ","));
  }).length;

  const pct      = (withTransitions / sentences.length) * 100;
  const detected = pct >= 38;
  const high     = pct >= 50;

  return {
    id: "transition-overuse",
    label: "Transition word density",
    detected,
    confidence: high ? "high" : detected ? "medium" : "low",
    detail: detected
      ? `${pct.toFixed(0)}% of sentences use heavy transition words — unusually high. AI systems default to over-structured prose.`
      : `${pct.toFixed(0)}% transition density — normal range for human writing.`,
  };
}

// ── Signal 6: Repetitive Sentence Starters ────────────────────────────────────
// AI falls into structural repetition — same 2-word openers reused frequently.

function detectSentenceStructure(sentences: string[]): AiDetectionSignal {
  if (sentences.length < 6) {
    return {
      id: "sentence-structure",
      label: "Repetitive sentence structure",
      detected: false,
      confidence: "low",
      detail: "Too few sentences to assess structural patterns.",
    };
  }

  const starts = sentences.map((s) =>
    s.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase(),
  );
  const freq: Record<string, number> = {};
  starts.forEach((s) => { freq[s] = (freq[s] || 0) + 1; });
  const maxRepeat  = Math.max(...Object.values(freq));
  const repeatPct  = maxRepeat / sentences.length;
  const detected   = repeatPct >= 0.18 || maxRepeat >= 4;
  const high       = repeatPct >= 0.25 || maxRepeat >= 6;

  return {
    id: "sentence-structure",
    label: "Repetitive sentence structure",
    detected,
    confidence: high ? "high" : detected ? "medium" : "low",
    detail: detected
      ? `Same 2-word opener used ${maxRepeat} times (${(repeatPct * 100).toFixed(0)}% of sentences). AI often falls into structural repetition.`
      : "Good sentence opener variety — consistent with natural writing.",
  };
}

// ── Signal 7: AI Disclaimer / Hedge Phrases ───────────────────────────────────
// AI systems insert cautious boilerplate disclaimers throughout.

const HEDGE_PATTERNS: RegExp[] = [
  /\bit (may|might|could|should) be (noted|worth|important|helpful)/i,
  /\bplease (note|keep in mind|be aware) that\b/i,
  /\bit('s| is) (worth|important) (noting|remembering|mentioning) that\b/i,
  /\bthis (may|might) (vary|differ|depend)/i,
  /\bconsult (a|an|your) (professional|expert|specialist)/i,
  /\balways (consult|check|verify|ensure)\b/i,
  /\bthis (article|post|guide|overview) (will|aims to|seeks to|is designed to)\b/i,
  /\bby the end of this (article|post|guide|section)\b/i,
];

function detectHedgePhrases(text: string): AiDetectionSignal {
  const matched: string[] = [];
  for (const pattern of HEDGE_PATTERNS) {
    const m = text.match(pattern);
    if (m) matched.push(`"${m[0].slice(0, 50)}"`);
  }

  const detected = matched.length >= 2;
  const high     = matched.length >= 3;

  return {
    id: "hedge-phrases",
    label: "AI disclaimer / hedge phrases",
    detected,
    confidence: high ? "high" : detected ? "medium" : "low",
    detail: detected
      ? `${matched.length} AI-typical disclaimer/hedge phrase${matched.length > 1 ? "s" : ""} found: ${matched.slice(0, 3).join(", ")}.`
      : "No excessive hedging language detected.",
  };
}

// ── Composite Scoring ─────────────────────────────────────────────────────────
// Each signal contributes a weighted score based on confidence level.

const SIGNAL_WEIGHTS: Record<string, { low: number; medium: number; high: number }> = {
  "burstiness":         { low: 5,  medium: 12, high: 22 },
  "ai-vocab":           { low: 5,  medium: 10, high: 20 },
  "ai-phrases":         { low: 5,  medium: 10, high: 18 },
  "para-uniformity":    { low: 3,  medium: 8,  high: 15 },
  "transition-overuse": { low: 3,  medium: 7,  high: 12 },
  "sentence-structure": { low: 3,  medium: 7,  high: 12 },
  "hedge-phrases":      { low: 3,  medium: 6,  high: 10 },
};

function computeAiScore(signals: AiDetectionSignal[]): number {
  let score = 0;
  for (const sig of signals) {
    if (!sig.detected) continue;
    const w = SIGNAL_WEIGHTS[sig.id];
    if (!w) continue;
    score += w[sig.confidence] ?? w.low;
  }
  return Math.min(100, score);
}

function getVerdict(score: number): "human" | "mixed" | "likely_ai" | "ai" {
  if (score < 20) return "human";
  if (score < 40) return "mixed";
  if (score < 65) return "likely_ai";
  return "ai";
}

function buildSummary(verdict: "human" | "mixed" | "likely_ai" | "ai", score: number): string {
  switch (verdict) {
    case "human":
      return `Content reads as human-written (${score}% AI probability). Writing patterns, vocabulary variation, and structure are consistent with authentic authorship.`;
    case "mixed":
      return `Content shows mixed signals (${score}% AI probability). Some human-writing characteristics are present alongside AI-typical patterns — possibly AI-assisted with human editing.`;
    case "likely_ai":
      return `Content likely contains substantial AI-generated sections (${score}% AI probability). Multiple AI-typical patterns detected in vocabulary, sentence structure, and phrasing.`;
    case "ai":
      return `Content is highly likely to be AI-generated (${score}% AI probability). Strong, consistent AI-authorship signals detected across vocabulary, structure, and phrase patterns.`;
  }
}

function buildRecommendations(
  verdict: "human" | "mixed" | "likely_ai" | "ai",
  signals: AiDetectionSignal[],
): string[] {
  if (verdict === "human") {
    return ["Content appears authentically human-written. No originality changes needed."];
  }

  const recs: string[] = [];
  const detected = signals.filter((s) => s.detected);

  if (detected.find((s) => s.id === "ai-vocab"))
    recs.push("Replace AI-signature words (delve, leverage, utilize, pivotal, seamless) with everyday alternatives that match your brand voice.");

  if (detected.find((s) => s.id === "ai-phrases"))
    recs.push("Remove or rephrase AI-characteristic openers such as 'In today's world', 'It is important to note', 'In conclusion'.");

  if (detected.find((s) => s.id === "burstiness"))
    recs.push("Vary sentence lengths deliberately — mix short punchy sentences (5–8 words) with longer explanatory ones (20–30 words) for natural rhythm.");

  if (detected.find((s) => s.id === "para-uniformity"))
    recs.push("Break the uniformity of paragraph lengths — some can be 2 sentences, others 6–8, to reflect natural thinking flow.");

  if (detected.find((s) => s.id === "transition-overuse"))
    recs.push("Reduce mechanical transitions. Human writers connect ideas implicitly — not every paragraph needs 'Furthermore' or 'Moreover'.");

  if (detected.find((s) => s.id === "sentence-structure"))
    recs.push("Vary sentence starters — begin some sentences with verbs, some with time context, some with a question or a short clause.");

  if (detected.find((s) => s.id === "hedge-phrases"))
    recs.push("Remove boilerplate disclaimers ('Please note that', 'It is worth mentioning') — speak directly as an authority in your field.");

  if (recs.length === 0)
    recs.push("Review flagged signals and rewrite affected sections in your own natural voice and style.");

  if (verdict === "ai")
    recs.push("Consider rewriting the entire draft in your own words, using the AI output as a research reference only.");

  return recs;
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Analyse `htmlContent` for AI-authorship signals.
 * Returns a probability score, verdict, per-signal breakdown, and recommendations.
 */
export function detectAiContent(htmlContent: string): AiDetectionResult {
  const plain = stripHtml(htmlContent);
  const wc    = wordCount(plain);

  if (wc < 50) {
    return {
      aiProbability: 0,
      verdict: "human",
      signals: [],
      summary: "Content is too short for AI detection analysis (minimum 50 words required).",
      recommendations: ["Write at least 50 words to enable AI content analysis."],
    };
  }

  const sentences = getSentences(plain);

  const signals: AiDetectionSignal[] = [
    detectBurstiness(sentences),
    detectAiVocab(plain),
    detectAiPhrases(plain),
    detectParagraphUniformity(htmlContent),
    detectTransitionOveruse(sentences),
    detectSentenceStructure(sentences),
    detectHedgePhrases(plain),
  ];

  const aiProbability = computeAiScore(signals);
  const verdict       = getVerdict(aiProbability);

  return {
    aiProbability,
    verdict,
    signals,
    summary: buildSummary(verdict, aiProbability),
    recommendations: buildRecommendations(verdict, signals),
  };
}
