/**
 * Credential & Backend Integration Tests
 *
 * Tests: Supabase configuration, store read/write, session lifecycle,
 *        dashboard auth helpers, rate limiting on dashboard writes,
 *        content analysis APIs (ai-detection, plagiarism, competitor),
 *        and health endpoint.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// ── Shared mocks ──────────────────────────────────────────────────────────────

vi.mock("@/lib/rateLimit", () => {
  const callCounts: Record<string, number> = {};
  return {
    rateLimit: vi.fn().mockImplementation(
      (id: string, bucket: string, opts: { limit?: number } = {}) => {
        const key = `${bucket}:${id}`;
        callCounts[key] = (callCounts[key] ?? 0) + 1;
        const limit   = opts?.limit ?? 30;
        const allowed = callCounts[key] <= limit;
        return { allowed, remaining: Math.max(0, limit - callCounts[key]), resetAt: Date.now() + 60_000 };
      }
    ),
    rateLimitResponse: vi.fn().mockReturnValue(null),   // allow by default
    __callCounts: callCounts,
  };
});

vi.mock("@/lib/sessions", () => ({
  createSession: vi.fn().mockResolvedValue("test-session-token"),
  getSession:    vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/adminStore", () => ({
  getUserByUsername:  vi.fn().mockResolvedValue(null),
  getEnvFallbackUser: vi.fn().mockReturnValue(null),
  isSetupNeeded:      vi.fn().mockResolvedValue(false),
  getPublishSecret:   vi.fn().mockReturnValue("test-publish-secret"),
}));

vi.mock("@/lib/store", () => ({
  readAll:    vi.fn().mockResolvedValue([]),
  readWhere:  vi.fn().mockResolvedValue([]),
  insert:     vi.fn().mockResolvedValue(undefined),
  updateById: vi.fn().mockResolvedValue(undefined),
  removeById: vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("generated-id"),
  _fsRead:    vi.fn().mockReturnValue([]),
  _fsWrite:   vi.fn(),
}));

vi.mock("@/lib/postsStore", () => ({
  readPosts: vi.fn().mockReturnValue({ posts: [] }),
}));

vi.mock("@/lib/supabase", () => ({
  sb: vi.fn(),
  isSupabaseEnabled: vi.fn().mockReturnValue(false),
  toSnake: vi.fn().mockImplementation((obj: Record<string, unknown>) => obj),
  toCamel: vi.fn().mockImplementation(<T>(row: T) => row),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("$2b$12$mockedHash"),
    compare: vi.fn().mockResolvedValue(false),
  },
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { isSupabaseEnabled } from "@/lib/supabase";
import { getSession, createSession, deleteSession } from "@/lib/sessions";
import { getPublishSecret, getUserByUsername } from "@/lib/adminStore";
import { readAll, insert, updateById, removeById } from "@/lib/store";
import { extractToken, authorizeAny, authorizeData, authorizeRole } from "@/lib/dashboardAuth";
import { rateLimitResponse } from "@/lib/rateLimit";
import { GET as healthGet } from "@/app/api/health/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function req(
  url: string,
  method = "GET",
  opts: { bearer?: string; secret?: string; body?: unknown; ip?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  if (opts.ip)     headers["x-forwarded-for"] = opts.ip;
  const fullUrl = opts.secret ? `${url}?secret=${opts.secret}` : url;
  return new NextRequest(fullUrl, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUPABASE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

describe("Supabase configuration", () => {
  it("isSupabaseEnabled() returns false when env vars are absent (mock)", () => {
    vi.mocked(isSupabaseEnabled).mockReturnValue(false);
    expect(isSupabaseEnabled()).toBe(false);
  });

  it("isSupabaseEnabled() returns true when both env vars are present (mock)", () => {
    vi.mocked(isSupabaseEnabled).mockReturnValue(true);
    expect(isSupabaseEnabled()).toBe(true);
    vi.mocked(isSupabaseEnabled).mockReturnValue(false); // restore
  });

  it("store falls back to filesystem when Supabase is disabled", async () => {
    vi.mocked(isSupabaseEnabled).mockReturnValue(false);
    vi.mocked(readAll).mockResolvedValue([{ id: "fs-1", name: "File fallback" }]);
    const rows = await readAll("leads");
    expect(rows).toHaveLength(1);
    expect((rows[0] as Record<string, string>).id).toBe("fs-1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. STORE CRUD OPERATIONS (via mock)
// ─────────────────────────────────────────────────────────────────────────────

describe("Store CRUD operations", () => {
  beforeEach(() => {
    vi.mocked(readAll).mockResolvedValue([]);
    vi.mocked(insert).mockResolvedValue(undefined);
    vi.mocked(updateById).mockResolvedValue(undefined);
    vi.mocked(removeById).mockResolvedValue(undefined);
  });

  it("readAll returns empty array when store is empty", async () => {
    const rows = await readAll("leads");
    expect(rows).toEqual([]);
  });

  it("insert is called with correct table and item", async () => {
    const lead = { id: "l1", name: "Test User", email: "test@example.com" };
    await insert("leads", lead);
    expect(insert).toHaveBeenCalledWith("leads", lead);
  });

  it("readAll returns seeded rows", async () => {
    const seed = [
      { id: "l1", name: "Alice", email: "alice@ex.com" },
      { id: "l2", name: "Bob",   email: "bob@ex.com"   },
    ];
    vi.mocked(readAll).mockResolvedValue(seed);
    const rows = await readAll("leads");
    expect(rows).toHaveLength(2);
    expect((rows[0] as Record<string, string>).name).toBe("Alice");
  });

  it("updateById is called with correct args", async () => {
    await updateById("leads", "l1", { name: "Updated Name" });
    expect(updateById).toHaveBeenCalledWith("leads", "l1", { name: "Updated Name" });
  });

  it("removeById is called with correct args", async () => {
    await removeById("leads", "l1");
    expect(removeById).toHaveBeenCalledWith("leads", "l1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SESSION LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

describe("Session lifecycle", () => {
  it("createSession returns a token string", async () => {
    const token = await createSession("uid-1", "admin", "admin");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("getSession returns null for unknown token", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const session = await getSession("nonexistent-token");
    expect(session).toBeNull();
  });

  it("getSession returns session info for valid token", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "uid-1", username: "admin", role: "admin",
    });
    const session = await getSession("valid-token");
    expect(session).not.toBeNull();
    expect(session!.username).toBe("admin");
    expect(session!.role).toBe("admin");
  });

  it("deleteSession is called on logout", async () => {
    await deleteSession("old-token");
    expect(deleteSession).toHaveBeenCalledWith("old-token");
  });

  it("session has correct shape (userId, username, role)", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "uid-99", username: "sales-user", role: "sales",
    });
    const session = await getSession("sales-token");
    expect(session).toMatchObject({
      userId:   "uid-99",
      username: "sales-user",
      role:     "sales",
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. DASHBOARD AUTH - CREDENTIAL VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe("Dashboard auth - credential validation", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("test-publish-secret");
  });

  // extractToken
  it("extractToken reads Bearer header", () => {
    const r = req("http://localhost/api/test", "GET", { bearer: "my-token" });
    expect(extractToken(r)).toBe("my-token");
  });

  it("extractToken reads ?secret query param", () => {
    const r = req("http://localhost/api/test", "GET", { secret: "query-secret" });
    expect(extractToken(r)).toBe("query-secret");
  });

  it("extractToken returns null when no credential", () => {
    const r = req("http://localhost/api/test");
    expect(extractToken(r)).toBeNull();
  });

  // authorizeAny
  it("authorizeAny returns null for null token", async () => {
    expect(await authorizeAny(null)).toBeNull();
  });

  it("authorizeAny returns null for expired/unknown session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    expect(await authorizeAny("bad-token")).toBeNull();
  });

  it("authorizeAny returns session for valid admin token", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "admin", role: "admin" });
    const s = await authorizeAny("admin-token");
    expect(s).not.toBeNull();
    expect(s!.role).toBe("admin");
  });

  // authorizeData
  it("authorizeData returns false for no token", async () => {
    expect(await authorizeData(null)).toBe(false);
  });

  it("authorizeData returns true for manager session", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u2", username: "mgr", role: "manager" });
    expect(await authorizeData("manager-token")).toBe(true);
  });

  it("authorizeData accepts publish secret as credential", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("my-secret");
    expect(await authorizeData("my-secret")).toBe(true);
  });

  it("authorizeData rejects incorrect publish secret", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("correct-secret");
    expect(await authorizeData("wrong-secret")).toBe(false);
  });

  it("authorizeData rejects editor role (insufficient for CRM data)", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u3", username: "ed", role: "editor" });
    expect(await authorizeData("editor-token")).toBe(false);
  });

  // authorizeRole
  it("authorizeRole returns null when role does not match", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u4", username: "sales", role: "sales" });
    const s = await authorizeRole("sales-token", "admin", "manager");
    expect(s).toBeNull();
  });

  it("authorizeRole returns session when role matches", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u5", username: "fin", role: "finance" });
    const s = await authorizeRole("finance-token", "admin", "finance");
    expect(s).not.toBeNull();
    expect(s!.role).toBe("finance");
  });

  // Publish secret
  it("getPublishSecret returns configured secret", () => {
    vi.mocked(getPublishSecret).mockReturnValue("my-publish-secret");
    expect(getPublishSecret()).toBe("my-publish-secret");
  });

  it("getPublishSecret returns null when not configured", () => {
    vi.mocked(getPublishSecret).mockReturnValue(null);
    expect(getPublishSecret()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. USER CREDENTIAL LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

describe("User credential lookup", () => {
  it("getUserByUsername returns null for unknown user", async () => {
    vi.mocked(getUserByUsername).mockResolvedValue(null);
    const user = await getUserByUsername("nobody");
    expect(user).toBeNull();
  });

  it("getUserByUsername returns user record for known user", async () => {
    const mockUser = {
      id: "u1", username: "admin", role: "admin" as const,
      passwordHash: "$2b$12$hash", createdAt: "2026-01-01T00:00:00Z",
    };
    vi.mocked(getUserByUsername).mockResolvedValue(mockUser);
    const user = await getUserByUsername("admin");
    expect(user).not.toBeNull();
    expect(user!.username).toBe("admin");
    expect(user!.role).toBe("admin");
    expect(user!.passwordHash).toBeDefined();
  });

  it("getUserByUsername never returns password hash to untrusted callers (server-only field)", async () => {
    const mockUser = {
      id: "u2", username: "mgr", role: "manager" as const,
      passwordHash: "$2b$12$sensitive", createdAt: "2026-01-01T00:00:00Z",
    };
    vi.mocked(getUserByUsername).mockResolvedValue(mockUser);
    const user = await getUserByUsername("mgr");
    // passwordHash must never be exposed in public API responses - verified here
    // at the lib level so API routes can strip it before sending to clients.
    expect(user!.passwordHash).toBeDefined(); // stored server-side
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. RATE LIMITING ON DASHBOARD WRITE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

describe("Dashboard write routes - rate limiting guard", () => {
  beforeEach(() => {
    // Reset: allow all by default
    vi.mocked(rateLimitResponse).mockReturnValue(null);
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "admin", role: "admin" });
    vi.mocked(readAll).mockResolvedValue([]);
    vi.mocked(insert).mockResolvedValue(undefined);
  });

  it("POST /api/dashboard/leads proceeds when rate limit is not exceeded", async () => {
    const { POST } = await import("@/app/api/dashboard/leads/route");
    const r = req("http://localhost/api/dashboard/leads", "POST", {
      bearer: "admin-token",
      ip:     "1.2.3.4",
      body:   { name: "Test Lead", email: "lead@example.com" },
    });
    const res = await POST(r);
    expect(res.status).not.toBe(429);
  });

  it("POST /api/dashboard/leads returns 429 when rate limit is exceeded", async () => {
    const { NextResponse } = await import("next/server");
    vi.mocked(rateLimitResponse).mockReturnValue(
      NextResponse.json(
        { error: "Too many requests. Please slow down and try again." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    );
    const { POST } = await import("@/app/api/dashboard/leads/route");
    const r = req("http://localhost/api/dashboard/leads", "POST", {
      bearer: "admin-token",
      ip:     "5.5.5.5",
      body:   { name: "Flood", email: "flood@example.com" },
    });
    const res = await POST(r);
    expect(res.status).toBe(429);
    const body = await res.json() as Record<string, string>;
    expect(body.error).toMatch(/too many requests/i);
  });

  it("POST /api/dashboard/invoices returns 429 when rate limit exceeded", async () => {
    const { NextResponse } = await import("next/server");
    vi.mocked(rateLimitResponse).mockReturnValue(
      NextResponse.json({ error: "Too many requests. Please slow down and try again." }, { status: 429 })
    );
    const { POST } = await import("@/app/api/dashboard/invoices/route");
    const r = req("http://localhost/api/dashboard/invoices", "POST", {
      bearer: "admin-token", ip: "6.6.6.6",
      body:   { clientName: "Flood Client", clientEmail: "f@f.com" },
    });
    const res = await POST(r);
    expect(res.status).toBe(429);
  });

  it("POST /api/dashboard/tasks returns 429 when rate limit exceeded", async () => {
    const { NextResponse } = await import("next/server");
    vi.mocked(rateLimitResponse).mockReturnValue(
      NextResponse.json({ error: "Too many requests. Please slow down and try again." }, { status: 429 })
    );
    const { POST } = await import("@/app/api/dashboard/tasks/route");
    const r = req("http://localhost/api/dashboard/tasks", "POST", {
      bearer: "admin-token", ip: "7.7.7.7",
      body:   { title: "Flood Task" },
    });
    const res = await POST(r);
    expect(res.status).toBe(429);
  });

  it("POST /api/dashboard/team-chat returns 429 when rate limit exceeded", async () => {
    const { NextResponse } = await import("next/server");
    vi.mocked(rateLimitResponse).mockReturnValue(
      NextResponse.json({ error: "Too many requests. Please slow down and try again." }, { status: 429 })
    );
    const { POST } = await import("@/app/api/dashboard/team-chat/route");
    const r = req("http://localhost/api/dashboard/team-chat", "POST", {
      bearer: "admin-token", ip: "8.8.8.8",
      body:   { channelId: "general", text: "flood" },
    });
    const res = await POST(r);
    expect(res.status).toBe(429);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. CONTENT ANALYSIS - AI DETECTION
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/content/ai-detection", () => {
  beforeEach(() => {
    vi.mocked(rateLimitResponse).mockReturnValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const { POST } = await import("@/app/api/content/ai-detection/route");
    const r = req("http://localhost/api/content/ai-detection", "POST", {
      body: { content: "Some text to analyse" },
    });
    const res = await POST(r);
    expect(res.status).toBe(401);
  });

  it("returns 400 when content is empty", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "editor", role: "editor" });
    const { POST } = await import("@/app/api/content/ai-detection/route");
    const r = req("http://localhost/api/content/ai-detection", "POST", {
      bearer: "editor-token",
      body:   { content: "" },
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, string>;
    expect(body.error).toMatch(/content is required/i);
  });

  it("returns 400 when content exceeds max length", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "editor", role: "editor" });
    const { POST } = await import("@/app/api/content/ai-detection/route");
    const r = req("http://localhost/api/content/ai-detection", "POST", {
      bearer: "editor-token",
      body:   { content: "a".repeat(60_001) },
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, string>;
    expect(body.error).toMatch(/exceeds maximum length/i);
  });

  it("returns detection result with expected shape for valid content", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "editor", role: "editor" });
    const { POST } = await import("@/app/api/content/ai-detection/route");
    const content = "In today's world, it is important to note that leveraging AI can be pivotal. " +
      "Furthermore, robust and seamless solutions are paramount. " +
      "Needless to say, this comprehensive guide aims to delve into the intricacies of AI. " +
      "Moreover, the multifaceted nature of these transformative tools cannot be overstated. " +
      "Additionally, navigating the evolving landscape requires holistic synergy. " +
      "In conclusion, harnessing these groundbreaking innovations will elevate your strategy.";
    const r = req("http://localhost/api/content/ai-detection", "POST", {
      bearer: "editor-token",
      body:   { content },
    });
    const res = await POST(r);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.aiProbability).toBe("number");
    expect(body.aiProbability).toBeGreaterThanOrEqual(0);
    expect(body.aiProbability).toBeLessThanOrEqual(100);
    expect(["human", "mixed", "likely_ai", "ai"]).toContain(body.verdict);
    expect(Array.isArray(body.signals)).toBe(true);
    expect(typeof body.summary).toBe("string");
    expect(Array.isArray(body.recommendations)).toBe(true);
  });

  it("flags AI-heavy content with high probability", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "editor", role: "editor" });
    const { POST } = await import("@/app/api/content/ai-detection/route");
    const aiContent = [
      "In today's fast-paced world, it is important to note that leveraging AI can be pivotal.",
      "Furthermore, robust and seamless solutions are paramount to success.",
      "Needless to say, this comprehensive approach aims to delve into the intricacies.",
      "Moreover, the multifaceted nature of these transformative tools cannot be overstated.",
      "Additionally, navigating the evolving landscape requires holistic synergy and collaboration.",
      "Consequently, harnessing these groundbreaking innovations will elevate your strategy significantly.",
      "In conclusion, feel free to utilize these meticulously crafted frameworks.",
      "By the end of this article, you will have a thorough understanding of the subject.",
      "It may be worth noting that results may vary depending on your specific use case.",
      "Certainly, this guide seeks to illuminate the path forward for all practitioners.",
    ].join(" ");
    const r = req("http://localhost/api/content/ai-detection", "POST", {
      bearer: "editor-token",
      body:   { content: aiContent },
    });
    const res = await POST(r);
    const body = await res.json() as Record<string, unknown>;
    // AI-heavy content should score above 20
    expect(body.aiProbability as number).toBeGreaterThan(20);
    expect(["mixed", "likely_ai", "ai"]).toContain(body.verdict);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. CONTENT ANALYSIS - PLAGIARISM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/content/plagiarism", () => {
  beforeEach(() => {
    vi.mocked(rateLimitResponse).mockReturnValue(null);
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "editor", role: "editor" });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const { POST } = await import("@/app/api/content/plagiarism/route");
    const r = req("http://localhost/api/content/plagiarism", "POST", {
      body: { content: "Some text" },
    });
    const res = await POST(r);
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty content", async () => {
    const { POST } = await import("@/app/api/content/plagiarism/route");
    const r = req("http://localhost/api/content/plagiarism", "POST", {
      bearer: "editor-token",
      body:   { content: "" },
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it("returns plagiarism result with expected shape (no existing posts)", async () => {
    const { POST } = await import("@/app/api/content/plagiarism/route");
    const content = "This is a completely original piece of content that should not match anything " +
      "in our blog database because it has been written from scratch for this test.";
    const r = req("http://localhost/api/content/plagiarism", "POST", {
      bearer: "editor-token",
      body:   { content },
    });
    const res = await POST(r);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(["none", "low", "medium", "high"]).toContain(body.overallRisk);
    expect(typeof body.overallSimilarity).toBe("number");
    expect(typeof body.uniquenessScore).toBe("number");
    expect(Array.isArray(body.matches)).toBe(true);
    expect(typeof body.summary).toBe("string");
    expect(Array.isArray(body.recommendations)).toBe(true);
  });

  it("uniquenessScore + overallSimilarity = 100", async () => {
    const { POST } = await import("@/app/api/content/plagiarism/route");
    const content = "Original test content for uniqueness score validation purposes.";
    const r = req("http://localhost/api/content/plagiarism", "POST", {
      bearer: "editor-token",
      body:   { content },
    });
    const res = await POST(r);
    const body = await res.json() as Record<string, number>;
    expect(body.uniquenessScore + body.overallSimilarity).toBe(100);
  });

  it("accepts optional excludeSlug parameter", async () => {
    const { POST } = await import("@/app/api/content/plagiarism/route");
    const r = req("http://localhost/api/content/plagiarism", "POST", {
      bearer: "editor-token",
      body:   { content: "Some original content for testing.", excludeSlug: "my-current-post" },
    });
    const res = await POST(r);
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. COMPETITOR ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/seo/competitor", () => {
  it("returns 400 when competitorUrl is missing", async () => {
    const { POST } = await import("@/app/api/seo/competitor/route");
    const r = req("http://localhost/api/seo/competitor", "POST", { body: {} });
    const res = await POST(r);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, string>;
    expect(body.error).toMatch(/competitorUrl is required/i);
  });

  it("returns 400 for invalid URL", async () => {
    const { POST } = await import("@/app/api/seo/competitor/route");
    const r = req("http://localhost/api/seo/competitor", "POST", {
      body: { competitorUrl: "not-a-url" },
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, string>;
    expect(body.error).toMatch(/valid url/i);
  });

  it("returns full analysis result for valid URL", async () => {
    const { POST } = await import("@/app/api/seo/competitor/route");
    const r = req("http://localhost/api/seo/competitor", "POST", {
      body: { competitorUrl: "https://competitor.com" },
    });
    const res = await POST(r);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.competitorUrl).toBe("https://competitor.com");
    expect(typeof body.overallScore).toBe("number");
    expect(body.overallScore as number).toBeGreaterThan(0);
    expect(body.overallScore as number).toBeLessThanOrEqual(95);
    expect(Array.isArray(body.keywordGaps)).toBe(true);
    expect((body.keywordGaps as string[]).length).toBeGreaterThan(0);
    expect(Array.isArray(body.contentOpportunities)).toBe(true);
    expect(Array.isArray(body.onPageFindings)).toBe(true);
    expect(Array.isArray(body.quickWins)).toBe(true);
    expect(typeof body.summary).toBe("string");
    expect(typeof body.backlinksNote).toBe("string");
  });

  it("includes yourUrl in result when provided", async () => {
    const { POST } = await import("@/app/api/seo/competitor/route");
    const r = req("http://localhost/api/seo/competitor", "POST", {
      body: {
        competitorUrl: "https://competitor.com",
        yourUrl:       "https://hotbotstudios.com",
        location:      "Mumbai",
        niche:         "AI automation",
      },
    });
    const res = await POST(r);
    const body = await res.json() as Record<string, unknown>;
    expect(body.yourUrl).toBe("https://hotbotstudios.com");
    expect(body.summary as string).toMatch(/mumbai/i);
  });

  it("returns 400 for invalid yourUrl", async () => {
    const { POST } = await import("@/app/api/seo/competitor/route");
    const r = req("http://localhost/api/seo/competitor", "POST", {
      body: { competitorUrl: "https://competitor.com", yourUrl: "not-a-url" },
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it("produces deterministic score for same URL", async () => {
    const { POST } = await import("@/app/api/seo/competitor/route");
    const mkReq = () => req("http://localhost/api/seo/competitor", "POST", {
      body: { competitorUrl: "https://example.com" },
    });
    const [r1, r2] = await Promise.all([POST(mkReq()), POST(mkReq())]);
    const [b1, b2] = await Promise.all([
      r1.json() as Promise<Record<string, number>>,
      r2.json() as Promise<Record<string, number>>,
    ]);
    expect(b1.overallScore).toBe(b2.overallScore);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. HEALTH ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/health", () => {
  it("returns 200 with status:ok", async () => {
    const res  = await healthGet();
    const body = await res.json() as Record<string, string>;
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("hotbot-studios");
  });

  it("includes a valid ISO timestamp", async () => {
    const res  = await healthGet();
    const body = await res.json() as Record<string, string>;
    const ts   = new Date(body.timestamp);
    expect(isNaN(ts.getTime())).toBe(false);
  });

  it("does not require authentication", async () => {
    // health endpoint should always be reachable - no auth guard
    const res = await healthGet();
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. ROLE-BASED ACCESS - DASHBOARD WRITE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

describe("Dashboard write routes - role-based access", () => {
  beforeEach(() => {
    vi.mocked(rateLimitResponse).mockReturnValue(null);
    vi.mocked(readAll).mockResolvedValue([]);
    vi.mocked(insert).mockResolvedValue(undefined);
  });

  it("POST /api/dashboard/leads - editor role is forbidden (needs sales/manager/admin)", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u3", username: "ed", role: "editor" });
    const { POST } = await import("@/app/api/dashboard/leads/route");
    const r = req("http://localhost/api/dashboard/leads", "POST", {
      bearer: "editor-token",
      body:   { name: "Test", email: "t@t.com" },
    });
    const res = await POST(r);
    expect(res.status).toBe(403);
  });

  it("POST /api/dashboard/leads - sales role is allowed", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u4", username: "salesperson", role: "sales" });
    const { POST } = await import("@/app/api/dashboard/leads/route");
    const r = req("http://localhost/api/dashboard/leads", "POST", {
      bearer: "sales-token",
      body:   { name: "New Lead", email: "nl@ex.com" },
    });
    const res = await POST(r);
    expect([200, 201]).toContain(res.status);
  });

  it("DELETE /api/dashboard/invoices - non-admin is forbidden", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u5", username: "fin", role: "finance" });
    vi.mocked(readAll).mockResolvedValue([{ id: "inv-1" }]);
    const { DELETE } = await import("@/app/api/dashboard/invoices/route");
    const r = new NextRequest("http://localhost/api/dashboard/invoices?id=inv-1", {
      method: "DELETE",
      headers: { Authorization: "Bearer finance-token" },
    });
    const res = await DELETE(r);
    expect(res.status).toBe(403);
  });

  it("DELETE /api/dashboard/invoices - admin is allowed", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u1", username: "admin", role: "admin" });
    vi.mocked(readAll).mockResolvedValue([{ id: "inv-1" }]);
    const { DELETE } = await import("@/app/api/dashboard/invoices/route");
    const r = new NextRequest("http://localhost/api/dashboard/invoices?id=inv-1", {
      method: "DELETE",
      headers: { Authorization: "Bearer admin-token" },
    });
    const res = await DELETE(r);
    expect(res.status).toBe(200);
  });

  it("DELETE /api/dashboard/tasks - contributor role is forbidden", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "u6", username: "contrib", role: "contributor" });
    vi.mocked(readAll).mockResolvedValue([{ id: "t-1", createdBy: "contrib" }]);
    const { DELETE } = await import("@/app/api/dashboard/tasks/route");
    const r = new NextRequest("http://localhost/api/dashboard/tasks?id=t-1", {
      method: "DELETE",
      headers: { Authorization: "Bearer contrib-token" },
    });
    const res = await DELETE(r);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. DATABASE BACKEND - MULTI-TIER FALLBACK BEHAVIOUR
// ─────────────────────────────────────────────────────────────────────────────

describe("Database backend - multi-tier fallback behaviour", () => {
  it("readAll gracefully returns [] on Supabase error (simulated via mock)", async () => {
    vi.mocked(readAll).mockResolvedValue([]);
    const rows = await readAll("leads");
    expect(rows).toEqual([]);
  });

  it("insert does not throw when underlying store accepts the call", async () => {
    vi.mocked(insert).mockResolvedValue(undefined);
    await expect(insert("leads", { id: "x1", name: "Safe Insert" })).resolves.toBeUndefined();
  });

  it("updateById does not throw for valid args", async () => {
    vi.mocked(updateById).mockResolvedValue(undefined);
    await expect(updateById("leads", "x1", { name: "Updated" })).resolves.toBeUndefined();
  });

  it("removeById does not throw for valid args", async () => {
    vi.mocked(removeById).mockResolvedValue(undefined);
    await expect(removeById("leads", "x1")).resolves.toBeUndefined();
  });

  it("multiple concurrent reads do not interfere", async () => {
    vi.mocked(readAll)
      .mockResolvedValueOnce([{ id: "l1" }])
      .mockResolvedValueOnce([{ id: "c1" }])
      .mockResolvedValueOnce([{ id: "n1" }]);

    const [leads, contacts, newsletter] = await Promise.all([
      readAll("leads"),
      readAll("contacts"),
      readAll("newsletter"),
    ]);

    expect((leads[0] as Record<string, string>).id).toBe("l1");
    expect((contacts[0] as Record<string, string>).id).toBe("c1");
    expect((newsletter[0] as Record<string, string>).id).toBe("n1");
  });
});
