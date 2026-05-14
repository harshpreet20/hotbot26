/**
 * Integration tests — POST /api/content/intelligence
 *
 * Tests: auth guard, input validation, successful analysis,
 *        content length limits, field truncation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken: vi.fn(),
  authorizeAny:  vi.fn(),
}));
vi.mock("@/lib/seo-analyzer", () => ({
  analyzeAll: vi.fn(),
}));
vi.mock("@/lib/content-intelligence", () => ({
  computeLocalIntelligence: vi.fn(),
}));

import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { analyzeAll } from "@/lib/seo-analyzer";
import { computeLocalIntelligence } from "@/lib/content-intelligence";
import { POST } from "@/app/api/content/intelligence/route";

const MOCK_SESSION = { userId: "uid-1", username: "admin", role: "admin" as const };

const MOCK_ANALYSIS = {
  seo:         { score: 80, grade: "good" as const, checks: [] },
  aeo:         { score: 70, grade: "ok"   as const, checks: [] },
  geo:         { score: 65, grade: "ok"   as const, checks: [] },
  local:       { score: 50, grade: "poor" as const, checks: [] },
  readability: { score: 75, grade: "good" as const, checks: [] },
};

const MOCK_RESULT = {
  total_score:                      72,
  quality_assessment:               "Well-optimised 800-word article scoring 72/100.",
  strengths:                        ["Good meta title"],
  weaknesses:                       ["No FAQ section"],
  content_improvement_suggestions:  ["Add more internal links"],
  context_expansion_suggestions:    ["Add FAQ section"],
  authority_boost_recommendations:  ["Add statistics"],
  structure_upgrade_suggestions:    ["Add H2 subheadings"],
};

function postReq(body: unknown, bearer?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
  return new NextRequest("http://localhost/api/content/intelligence", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(extractToken).mockReturnValue("test-token");
  vi.mocked(authorizeAny).mockReturnValue(MOCK_SESSION);
  vi.mocked(analyzeAll).mockReturnValue(MOCK_ANALYSIS);
  vi.mocked(computeLocalIntelligence).mockReturnValue(MOCK_RESULT);
});

// ── Auth guard ────────────────────────────────────────────────────────────────

describe("POST /api/content/intelligence — auth", () => {
  it("returns 401 when no token is provided", async () => {
    vi.mocked(extractToken).mockReturnValue(null);
    vi.mocked(authorizeAny).mockReturnValue(null);
    const res = await POST(postReq({ content: "<p>Hello world</p>" }));
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("returns 401 when token is invalid", async () => {
    vi.mocked(authorizeAny).mockReturnValue(null);
    const res = await POST(postReq({ content: "<p>Hello world</p>" }, "bad-token"));
    expect(res.status).toBe(401);
  });

  it("allows any authenticated role (admin/manager/agent)", async () => {
    for (const role of ["admin", "manager", "agent"] as const) {
      vi.mocked(authorizeAny).mockReturnValue({ userId: "u", username: "u", role });
      const res = await POST(postReq({ content: "<p>Hello world</p>" }, "tok"));
      expect(res.status).toBe(200);
    }
  });
});

// ── Input validation ──────────────────────────────────────────────────────────

describe("POST /api/content/intelligence — input validation", () => {
  it("returns 400 when content is missing", async () => {
    const res = await POST(postReq({ title: "Test" }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/content/i);
  });

  it("returns 400 when content is an empty string", async () => {
    const res = await POST(postReq({ content: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when content is whitespace only", async () => {
    const res = await POST(postReq({ content: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when content exceeds 60,000 characters", async () => {
    const res = await POST(postReq({ content: "x".repeat(60_001) }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/exceeds/i);
  });

  it("accepts content exactly at the 60,000-character limit", async () => {
    const res = await POST(postReq({ content: "x".repeat(60_000) }));
    expect(res.status).toBe(200);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost/api/content/intelligence", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer tok" },
      body:    "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ── Successful analysis ───────────────────────────────────────────────────────

describe("POST /api/content/intelligence — successful analysis", () => {
  it("returns 200 with full intelligence result", async () => {
    const res  = await POST(postReq({ content: "<p>Valid content here</p>" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.total_score).toBe(72);
    expect(body.quality_assessment).toContain("72/100");
    expect(Array.isArray(body.strengths)).toBe(true);
    expect(Array.isArray(body.weaknesses)).toBe(true);
  });

  it("calls analyzeAll and computeLocalIntelligence exactly once", async () => {
    await POST(postReq({ content: "<p>content</p>", title: "Test" }));
    expect(analyzeAll).toHaveBeenCalledTimes(1);
    expect(computeLocalIntelligence).toHaveBeenCalledTimes(1);
  });

  it("passes optional fields to the analyzer", async () => {
    const input = {
      content:         "<p>content</p>",
      title:           "My Post",
      slug:            "my-post",
      metaTitle:       "My Post | SEO",
      metaDescription: "Description here",
      focusKeyword:    "seo",
      featuredImageAlt:"image alt",
      excerpt:         "A short excerpt",
    };
    await POST(postReq(input));
    const [calledInput] = vi.mocked(analyzeAll).mock.calls[0];
    expect(calledInput.title).toBe("My Post");
    expect(calledInput.focusKeyword).toBe("seo");
  });

  it("returns 500 when analyzeAll throws", async () => {
    vi.mocked(analyzeAll).mockImplementation(() => { throw new Error("parse error"); });
    const res = await POST(postReq({ content: "<p>content</p>" }));
    expect(res.status).toBe(500);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/failed/i);
  });
});

// ── Field truncation ──────────────────────────────────────────────────────────

describe("POST /api/content/intelligence — field truncation", () => {
  it("truncates title to 300 chars", async () => {
    const longTitle = "T".repeat(500);
    await POST(postReq({ content: "<p>c</p>", title: longTitle }));
    const [calledInput] = vi.mocked(analyzeAll).mock.calls[0];
    expect(calledInput.title.length).toBe(300);
  });

  it("truncates metaDescription to 320 chars", async () => {
    const longMeta = "M".repeat(400);
    await POST(postReq({ content: "<p>c</p>", metaDescription: longMeta }));
    const [calledInput] = vi.mocked(analyzeAll).mock.calls[0];
    expect(calledInput.metaDescription.length).toBe(320);
  });
});
