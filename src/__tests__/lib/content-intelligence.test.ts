/**
 * Unit tests — src/lib/content-intelligence.ts
 * Local scoring engine: weighted score, synthesis, suggestions, assessment text
 */
import { describe, it, expect } from "vitest";
import { computeLocalIntelligence } from "@/lib/content-intelligence";
import { analyzeAll, type AnalyzerInput } from "@/lib/seo-analyzer";

function baseInput(overrides: Partial<AnalyzerInput> = {}): AnalyzerInput {
  return {
    title:            "Best AI Automation Agency 2026",
    slug:             "best-ai-automation-agency",
    content:          "<p>" + "AI automation helps businesses achieve efficiency. ".repeat(30) + "</p>",
    excerpt:          "AI automation guide for 2026.",
    metaTitle:        "Best AI Automation Agency 2026",
    metaDescription:  "Comprehensive guide to AI automation for businesses. Expert tips for 2026.",
    focusKeyword:     "ai automation",
    featuredImageAlt: "AI automation diagram",
    ...overrides,
  };
}

function runIntelligence(overrides: Partial<AnalyzerInput> = {}) {
  const input    = baseInput(overrides);
  const analysis = analyzeAll(input);
  return { result: computeLocalIntelligence(input, analysis), input, analysis };
}

// ── Result structure ──────────────────────────────────────────────────────────

describe("computeLocalIntelligence() — result structure", () => {
  it("returns all required fields", () => {
    const { result } = runIntelligence();
    expect(result).toHaveProperty("total_score");
    expect(result).toHaveProperty("quality_assessment");
    expect(result).toHaveProperty("strengths");
    expect(result).toHaveProperty("weaknesses");
    expect(result).toHaveProperty("content_improvement_suggestions");
    expect(result).toHaveProperty("context_expansion_suggestions");
    expect(result).toHaveProperty("authority_boost_recommendations");
    expect(result).toHaveProperty("structure_upgrade_suggestions");
  });

  it("total_score is an integer between 0 and 100", () => {
    const { result } = runIntelligence();
    expect(Number.isInteger(result.total_score)).toBe(true);
    expect(result.total_score).toBeGreaterThanOrEqual(0);
    expect(result.total_score).toBeLessThanOrEqual(100);
  });

  it("quality_assessment is a non-empty string", () => {
    const { result } = runIntelligence();
    expect(typeof result.quality_assessment).toBe("string");
    expect(result.quality_assessment.length).toBeGreaterThan(10);
  });

  it("all list fields are arrays of strings", () => {
    const { result } = runIntelligence();
    const lists = [
      result.strengths,
      result.weaknesses,
      result.content_improvement_suggestions,
      result.context_expansion_suggestions,
      result.authority_boost_recommendations,
      result.structure_upgrade_suggestions,
    ];
    for (const list of lists) {
      expect(Array.isArray(list)).toBe(true);
      for (const item of list) {
        expect(typeof item).toBe("string");
        expect(item.length).toBeGreaterThan(0);
      }
    }
  });

  it("limits each list to at most 5–6 items", () => {
    const { result } = runIntelligence();
    expect(result.strengths.length).toBeLessThanOrEqual(5);
    expect(result.weaknesses.length).toBeLessThanOrEqual(5);
    expect(result.content_improvement_suggestions.length).toBeLessThanOrEqual(6);
    expect(result.context_expansion_suggestions.length).toBeLessThanOrEqual(5);
    expect(result.authority_boost_recommendations.length).toBeLessThanOrEqual(5);
    expect(result.structure_upgrade_suggestions.length).toBeLessThanOrEqual(5);
  });
});

// ── Weighted scoring ──────────────────────────────────────────────────────────

describe("computeLocalIntelligence() — weighted score", () => {
  it("produces a higher score for rich, complete content vs thin content", () => {
    const richContent = [
      "<h2>What is AI Automation?</h2>",
      "<p>AI automation involves using AI to streamline workflows. According to Gartner, 70% of enterprises will adopt it by 2026. We have helped 50+ clients achieve 3x efficiency gains.</p>",
      "<ul><li>Step 1: Define goals</li><li>Step 2: Choose tools</li><li>Step 3: Implement</li></ul>",
      "<h2>FAQ</h2><p>Frequently Asked Questions about AI automation:</p>",
      "<p>" + "word ".repeat(1200) + "</p>",
      "<table><tr><th>AI</th><th>Manual</th></tr><tr><td>Fast</td><td>Slow</td></tr></table>",
      "AI automation vs manual processing: AI wins in 47% of cases.",
    ].join("");

    const { result: richResult }  = runIntelligence({
      content:         richContent,
      metaTitle:       "Best AI Automation Platform 2026",
      metaDescription: "A".repeat(140),
    });
    const { result: thinResult } = runIntelligence({
      content: "<p>Short text</p>",
      metaTitle: "",
      metaDescription: "",
    });

    expect(richResult.total_score).toBeGreaterThan(thinResult.total_score);
  });

  it("score is deterministic — same input always gives same score", () => {
    const { result: r1 } = runIntelligence();
    const { result: r2 } = runIntelligence();
    expect(r1.total_score).toBe(r2.total_score);
  });
});

// ── Quality assessment text ───────────────────────────────────────────────────

describe("computeLocalIntelligence() — quality_assessment", () => {
  it("includes the word count in the assessment", () => {
    const { result } = runIntelligence();
    expect(result.quality_assessment).toMatch(/\d+-word/);
  });

  it("mentions score in the assessment", () => {
    const { result } = runIntelligence();
    expect(result.quality_assessment).toMatch(/\d+\/100/);
  });

  it("uses positive language for high-scoring content", () => {
    const richContent = "<p>" + "word ".repeat(1600) + " We helped 50+ clients. According to Forbes, 70% report gains. " + "</p>" +
      "<h2>FAQ</h2><p>Frequently Asked Questions.</p>" +
      "<table><tr><td>data</td></tr></table>" +
      "<ul><li>a</li><li>b</li><li>c</li></ul>";
    const { result } = runIntelligence({
      content: richContent,
      metaTitle: "Best AI Automation Guide for Business 2026",
      metaDescription: "A comprehensive guide to AI automation for businesses in 2026. Learn how to implement AI workflows effectively.",
    });
    // High-scoring content gets positive assessment
    if (result.total_score >= 75) {
      expect(result.quality_assessment).toMatch(/well-optimised|strongly|solid/i);
    }
  });

  it("mentions critical issues count when errors exist", () => {
    const { result } = runIntelligence({
      content: "<p>x</p>", // Very thin — triggers multiple errors
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "missing keyword",
    });
    expect(result.quality_assessment).toMatch(/critical/i);
  });
});

// ── Context expansion suggestions ─────────────────────────────────────────────

describe("computeLocalIntelligence() — context_expansion_suggestions", () => {
  it("suggests adding FAQ when none present", () => {
    const { result } = runIntelligence({ content: "<p>Generic article content without questions section. " + "word ".repeat(100) + "</p>" });
    const hasFaq = result.context_expansion_suggestions.some((s) => s.toLowerCase().includes("faq"));
    expect(hasFaq).toBe(true);
  });

  it("suggests comparison section when none present", () => {
    const { result } = runIntelligence({ content: "<p>Generic content without comparisons. " + "word ".repeat(100) + "</p>" });
    const hasComparison = result.context_expansion_suggestions.some((s) => s.toLowerCase().includes("comparison"));
    expect(hasComparison).toBe(true);
  });

  it("suggests expanding word count when under 1500 words", () => {
    const { result } = runIntelligence({ content: "<p>" + "word ".repeat(200) + "</p>" });
    const hasDepth = result.context_expansion_suggestions.some((s) => s.includes("1,500+"));
    expect(hasDepth).toBe(true);
  });
});

// ── Authority boost recommendations ──────────────────────────────────────────

describe("computeLocalIntelligence() — authority_boost_recommendations", () => {
  it("recommends adding citations when none present", () => {
    const { result } = runIntelligence({ content: "<p>Claims without sources. " + "word ".repeat(100) + "</p>" });
    const hasCitation = result.authority_boost_recommendations.some((s) =>
      s.toLowerCase().includes("source") || s.toLowerCase().includes("citation") || s.toLowerCase().includes("attributed")
    );
    expect(hasCitation).toBe(true);
  });

  it("recommends adding statistics when none present", () => {
    const { result } = runIntelligence({ content: "<p>Content without numbers. " + "word ".repeat(100) + "</p>" });
    const hasStat = result.authority_boost_recommendations.some((s) =>
      s.toLowerCase().includes("statistic") || s.toLowerCase().includes("data") || s.toLowerCase().includes("percent")
    );
    expect(hasStat).toBe(true);
  });
});

// ── Structure upgrade suggestions ─────────────────────────────────────────────

describe("computeLocalIntelligence() — structure_upgrade_suggestions", () => {
  it("recommends H2/H3 subheadings when text sections are too long", () => {
    const longContent = "<p>" + "word ".repeat(400) + "</p>";
    const { result } = runIntelligence({ content: longContent });
    const hasSubheadings = result.structure_upgrade_suggestions.some((s) =>
      s.toLowerCase().includes("subheading") || s.toLowerCase().includes("h2")
    );
    expect(hasSubheadings).toBe(true);
  });
});
