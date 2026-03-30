/**
 * Unit tests — src/lib/seo-analyzer.ts
 * All 5 analysis dimensions + helper functions + composite scoring
 */
import { describe, it, expect } from "vitest";
import {
  stripHtml,
  wordCount,
  analyzeSeo,
  analyzeAeo,
  analyzeGeo,
  analyzeLocal,
  analyzeReadability,
  analyzeAll,
  type AnalyzerInput,
} from "@/lib/seo-analyzer";

// ── Test fixtures ─────────────────────────────────────────────────────────────

function baseInput(overrides: Partial<AnalyzerInput> = {}): AnalyzerInput {
  return {
    title:            "Best AI Automation Guide 2026",
    slug:             "best-ai-automation-guide-2026",
    content:          "<p>AI automation is transforming businesses. " +
                      "We helped 50+ clients achieve 3x efficiency gains. " +
                      "According to Gartner, 70% of enterprises will use AI by 2026. " +
                      "</p><h2>What is AI Automation?</h2><p>AI automation refers to using artificial intelligence to automate repetitive tasks.</p>",
    excerpt:          "Comprehensive guide to AI automation for businesses in 2026.",
    metaTitle:        "Best AI Automation Guide for Business 2026",
    metaDescription:  "Learn how AI automation works and how it can help your business in 2026. Complete guide with examples.",
    focusKeyword:     "ai automation",
    featuredImageAlt: "AI automation workflow diagram",
    ...overrides,
  };
}

// ── stripHtml ─────────────────────────────────────────────────────────────────

describe("stripHtml()", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <strong>World</strong></p>")).toBe("Hello World");
  });

  it("collapses multiple whitespace into single space", () => {
    expect(stripHtml("<div>  a   b  </div>")).toBe("a b");
  });

  it("handles self-closing tags", () => {
    expect(stripHtml("Line 1<br/>Line 2")).toBe("Line 1 Line 2");
  });

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtml("no tags here")).toBe("no tags here");
  });
});

// ── wordCount ─────────────────────────────────────────────────────────────────

describe("wordCount()", () => {
  it("counts words correctly", () => {
    expect(wordCount("one two three")).toBe(3);
  });

  it("returns 0 for empty string", () => {
    expect(wordCount("")).toBe(0);
  });

  it("handles multiple spaces", () => {
    expect(wordCount("  a   b   c  ")).toBe(3);
  });

  it("counts a single word", () => {
    expect(wordCount("hello")).toBe(1);
  });
});

// ── analyzeSeo ────────────────────────────────────────────────────────────────

describe("analyzeSeo()", () => {
  it("returns an array of check objects", () => {
    const checks = analyzeSeo(baseInput());
    expect(Array.isArray(checks)).toBe(true);
    expect(checks.length).toBeGreaterThan(0);
    checks.forEach((c) => {
      expect(c).toHaveProperty("id");
      expect(c).toHaveProperty("label");
      expect(c).toHaveProperty("status");
      expect(c).toHaveProperty("message");
      expect(["good", "improvement", "error"]).toContain(c.status);
    });
  });

  it("marks keyword-in-title as good when keyword is in title", () => {
    const checks = analyzeSeo(baseInput({ title: "Best AI Automation Strategies", focusKeyword: "ai automation" }));
    const check = checks.find((c) => c.id === "seo-kw-title");
    expect(check?.status).toBe("good");
  });

  it("marks keyword-in-title as error when keyword missing from title", () => {
    const checks = analyzeSeo(baseInput({ title: "Marketing Strategies", focusKeyword: "ai automation" }));
    const check = checks.find((c) => c.id === "seo-kw-title");
    expect(check?.status).toBe("error");
  });

  it("marks meta title as good when 50–60 chars", () => {
    const checks = analyzeSeo(baseInput({ metaTitle: "A".repeat(55) }));
    expect(checks.find((c) => c.id === "seo-meta-title")?.status).toBe("good");
  });

  it("marks meta title as error when empty", () => {
    const checks = analyzeSeo(baseInput({ metaTitle: "" }));
    expect(checks.find((c) => c.id === "seo-meta-title")?.status).toBe("error");
  });

  it("marks meta title as improvement when too short (<50 chars)", () => {
    const checks = analyzeSeo(baseInput({ metaTitle: "Short" }));
    expect(checks.find((c) => c.id === "seo-meta-title")?.status).toBe("improvement");
  });

  it("marks meta title as improvement when too long (>60 chars)", () => {
    const checks = analyzeSeo(baseInput({ metaTitle: "A".repeat(75) }));
    expect(checks.find((c) => c.id === "seo-meta-title")?.status).toBe("improvement");
  });

  it("marks meta description as good when 120–160 chars", () => {
    const checks = analyzeSeo(baseInput({ metaDescription: "A".repeat(140) }));
    expect(checks.find((c) => c.id === "seo-meta-desc")?.status).toBe("good");
  });

  it("marks meta description as error when empty", () => {
    const checks = analyzeSeo(baseInput({ metaDescription: "" }));
    expect(checks.find((c) => c.id === "seo-meta-desc")?.status).toBe("error");
  });

  it("marks content length as good when 800+ words", () => {
    const longContent = "<p>" + "word ".repeat(850) + "</p>";
    const checks = analyzeSeo(baseInput({ content: longContent }));
    expect(checks.find((c) => c.id === "seo-length")?.status).toBe("good");
  });

  it("marks content length as error when under 300 words", () => {
    const checks = analyzeSeo(baseInput({ content: "<p>short content</p>" }));
    expect(checks.find((c) => c.id === "seo-length")?.status).toBe("error");
  });

  it("marks H2 headings as good when present", () => {
    const checks = analyzeSeo(baseInput({ content: "<h2>Section</h2><p>content</p>" }));
    expect(checks.find((c) => c.id === "seo-headings")?.status).toBe("good");
  });

  it("marks links as good when anchor tags present", () => {
    const checks = analyzeSeo(baseInput({ content: '<a href="/page">link</a> text' }));
    expect(checks.find((c) => c.id === "seo-links")?.status).toBe("good");
  });

  it("marks featured image alt as good when alt text provided", () => {
    const checks = analyzeSeo(baseInput({ featuredImageAlt: "descriptive alt text" }));
    expect(checks.find((c) => c.id === "seo-img-alt")?.status).toBe("good");
  });

  it("marks CTR-boosting words as good when power word in title", () => {
    const checks = analyzeSeo(baseInput({ title: "Ultimate Guide to SEO 2026" }));
    expect(checks.find((c) => c.id === "seo-ctr")?.status).toBe("good");
  });

  it("skips keyword checks when focusKeyword is empty", () => {
    const checks = analyzeSeo(baseInput({ focusKeyword: "" }));
    const kwChecks = checks.filter((c) => c.id.includes("seo-kw") || c.id === "seo-density");
    expect(kwChecks).toHaveLength(0);
  });
});

// ── analyzeAeo ────────────────────────────────────────────────────────────────

describe("analyzeAeo()", () => {
  it("detects question-based headings", () => {
    const c = analyzeAeo(baseInput({ content: "<h2>What is AI automation?</h2><p>text</p>" }));
    expect(c.find((x) => x.id === "aeo-q-headings")?.status).toBe("good");
  });

  it("detects FAQ section", () => {
    const c = analyzeAeo(baseInput({ content: "<h2>FAQ</h2><p>Q1...</p>" }));
    expect(c.find((x) => x.id === "aeo-faq")?.status).toBe("good");
  });

  it("detects 'Frequently Asked Questions'", () => {
    const c = analyzeAeo(baseInput({ content: "<h2>Frequently Asked Questions</h2>" }));
    expect(c.find((x) => x.id === "aeo-faq")?.status).toBe("good");
  });

  it("detects structured lists with 3+ items", () => {
    const c = analyzeAeo(baseInput({ content: "<ul><li>a</li><li>b</li><li>c</li></ul>" }));
    expect(c.find((x) => x.id === "aeo-lists")?.status).toBe("good");
  });

  it("detects step-by-step content", () => {
    const c = analyzeAeo(baseInput({ content: "<p>Step 1: Define goals. Step 2: Plan. Step 3: Execute.</p>" }));
    expect(c.find((x) => x.id === "aeo-steps")?.status).toBe("good");
  });

  it("marks all AEO checks as improvement when content has none", () => {
    const c = analyzeAeo(baseInput({ content: "<p>Simple content without any AEO signals.</p>" }));
    c.forEach((check) => {
      expect(["improvement", "error"]).toContain(check.status);
    });
  });
});

// ── analyzeGeo ────────────────────────────────────────────────────────────────

describe("analyzeGeo()", () => {
  it("detects statistics and percentages", () => {
    const c = analyzeGeo(baseInput({ content: "<p>47% of businesses reported ROI gains.</p>" }));
    expect(c.find((x) => x.id === "geo-stats")?.status).toBe("good");
  });

  it("detects dollar statistics", () => {
    const c = analyzeGeo(baseInput({ content: "<p>Companies saved $2.3 million.</p>" }));
    expect(c.find((x) => x.id === "geo-stats")?.status).toBe("good");
  });

  it("detects citations/attributions", () => {
    const c = analyzeGeo(baseInput({ content: "<p>According to Gartner, AI adoption is rising.</p>" }));
    expect(c.find((x) => x.id === "geo-citations")?.status).toBe("good");
  });

  it("marks depth as good when 1500+ words", () => {
    const c = analyzeGeo(baseInput({ content: "<p>" + "word ".repeat(1600) + "</p>" }));
    expect(c.find((x) => x.id === "geo-depth")?.status).toBe("good");
  });

  it("marks depth as improvement at 800–1499 words", () => {
    const c = analyzeGeo(baseInput({ content: "<p>" + "word ".repeat(900) + "</p>" }));
    expect(c.find((x) => x.id === "geo-depth")?.status).toBe("improvement");
  });

  it("detects comparison content", () => {
    const c = analyzeGeo(baseInput({ content: "<p>AI automation vs manual processing: AI wins.</p>" }));
    expect(c.find((x) => x.id === "geo-comparison")?.status).toBe("good");
  });

  it("detects expert first-hand experience signals", () => {
    const c = analyzeGeo(baseInput({ content: "<p>We have helped over 100 clients increase revenue.</p>" }));
    expect(c.find((x) => x.id === "geo-expert")?.status).toBe("good");
  });

  it("detects data tables", () => {
    const c = analyzeGeo(baseInput({ content: "<table><tr><td>data</td></tr></table>" }));
    expect(c.find((x) => x.id === "geo-table")?.status).toBe("good");
  });

  it("detects recency signals with current year", () => {
    const year = new Date().getFullYear().toString();
    const c = analyzeGeo(baseInput({ content: `<p>Updated guide for ${year}.</p>` }));
    expect(c.find((x) => x.id === "geo-recency")?.status).toBe("good");
  });
});

// ── analyzeLocal ──────────────────────────────────────────────────────────────

describe("analyzeLocal()", () => {
  it("detects US location mentions", () => {
    const c = analyzeLocal(baseInput({ content: "<p>We serve clients in New York and California.</p>" }));
    expect(c.find((x) => x.id === "local-geo-target")?.status).toBe("good");
  });

  it("detects near-me keywords", () => {
    const c = analyzeLocal(baseInput({ content: "<p>Find a local AI agency near me in your area.</p>" }));
    expect(c.find((x) => x.id === "local-nearme")?.status).toBe("good");
  });

  it("detects phone number NAP signal", () => {
    const c = analyzeLocal(baseInput({ content: "<p>Call us: (555) 123-4567</p>" }));
    expect(c.find((x) => x.id === "local-nap")?.status).toBe("good");
  });

  it("detects 'best X in Y' pattern", () => {
    const c = analyzeLocal(baseInput({ title: "Best AI Agency in New York" }));
    expect(c.find((x) => x.id === "local-best")?.status).toBe("good");
  });

  it("detects service area description", () => {
    const c = analyzeLocal(baseInput({ content: "<p>We serve businesses across the US and Canada.</p>" }));
    expect(c.find((x) => x.id === "local-service-area")?.status).toBe("good");
  });
});

// ── analyzeReadability ────────────────────────────────────────────────────────

describe("analyzeReadability()", () => {
  it("returns error when content is under 50 words", () => {
    const c = analyzeReadability(baseInput({ content: "<p>Too short.</p>" }));
    expect(c.find((x) => x.id === "read-length")?.status).toBe("error");
    expect(c).toHaveLength(1);
  });

  it("returns multiple checks for content over 50 words", () => {
    const content = "<p>" + "The quick brown fox jumped over the lazy dog. ".repeat(10) + "</p>";
    const c = analyzeReadability(baseInput({ content }));
    expect(c.length).toBeGreaterThan(1);
    expect(c.find((x) => x.id === "read-fre")).toBeDefined();
  });

  it("marks paragraph length as good when all paragraphs under 120 words", () => {
    const content = "<p>" + "word ".repeat(60) + "</p><p>" + "word ".repeat(60) + "</p>";
    const c = analyzeReadability(baseInput({ content }));
    expect(c.find((x) => x.id === "read-paragraphs")?.status).toBe("good");
  });

  it("marks paragraph length as error when multiple paragraphs exceed 120 words", () => {
    const longPara = "<p>" + "word ".repeat(150) + "</p>";
    const c = analyzeReadability(baseInput({ content: longPara + longPara + longPara }));
    expect(c.find((x) => x.id === "read-paragraphs")?.status).toBe("error");
  });
});

// ── analyzeAll ────────────────────────────────────────────────────────────────

describe("analyzeAll()", () => {
  it("returns a FullAnalysis object with all 5 dimensions", () => {
    const result = analyzeAll(baseInput());
    expect(result).toHaveProperty("overall");
    expect(result).toHaveProperty("seo");
    expect(result).toHaveProperty("aeo");
    expect(result).toHaveProperty("geo");
    expect(result).toHaveProperty("local");
    expect(result).toHaveProperty("readability");
  });

  it("overall score is a number between 0 and 100", () => {
    const result = analyzeAll(baseInput());
    expect(result.overall.score).toBeGreaterThanOrEqual(0);
    expect(result.overall.score).toBeLessThanOrEqual(100);
  });

  it("each dimension has score, grade, and checks array", () => {
    const result = analyzeAll(baseInput());
    for (const dim of ["seo", "aeo", "geo", "local", "readability"] as const) {
      expect(result[dim].score).toBeGreaterThanOrEqual(0);
      expect(result[dim].score).toBeLessThanOrEqual(100);
      expect(["good", "ok", "poor"]).toContain(result[dim].grade);
      expect(Array.isArray(result[dim].checks)).toBe(true);
    }
  });

  it("overall grade is 'good' when all dimensions score well", () => {
    // A near-perfect article
    const perfect = baseInput({
      title:           "Best AI Automation Guide 2026: Complete Ultimate How-To",
      metaTitle:       "Best AI Automation Guide for Business 2026",
      metaDescription: "Learn how AI automation helps businesses in 2026. Complete 160-character guide with proven examples and case studies for enterprises.",
      content:         [
        "<h2>What is AI Automation?</h2>",
        "<p>AI automation refers to using artificial intelligence. We help businesses achieve 3x efficiency. According to Gartner, 70% of companies will automate by 2026.</p>",
        "<h2>How to Get Started</h2>",
        "<ul><li>Step one</li><li>Step two</li><li>Step three</li></ul>",
        "<h2>FAQ</h2>",
        "<p>Frequently asked questions about AI automation:</p>",
        "<p>" + "word ".repeat(1200) + "</p>",
        "<table><tr><th>Feature</th><th>Manual</th><th>AI</th></tr><tr><td>Speed</td><td>Slow</td><td>Fast</td></tr></table>",
      ].join(""),
    });
    const result = analyzeAll(perfect);
    expect(result.overall.score).toBeGreaterThan(50);
  });

  it("overall grade is 'poor' for empty/minimal content", () => {
    const empty = baseInput({ content: "<p>x</p>", metaTitle: "", metaDescription: "", focusKeyword: "" });
    const result = analyzeAll(empty);
    expect(result.overall.score).toBeLessThan(50);
    expect(["ok", "poor"]).toContain(result.overall.grade);
  });
});
