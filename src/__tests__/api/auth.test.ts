/**
 * Integration tests - POST /api/blog/auth (login + logout)
 *
 * Tests: login success/failure, rate limiting,
 *        cookie management, session creation,
 *        password/username validation, env-var fallback user
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// In-memory rate limiter mock (avoids disk I/O in tests)
vi.mock("@/lib/rateLimit", () => {
  const callCounts: Record<string, number> = {};
  return {
    rateLimit: vi.fn().mockImplementation((identifier: string, bucket: string, options: { limit?: number } = {}) => {
      const key = `${bucket}:${identifier}`;
      callCounts[key] = (callCounts[key] ?? 0) + 1;
      const limit = options?.limit ?? 30;
      const allowed = callCounts[key] <= limit;
      return { allowed, remaining: Math.max(0, limit - callCounts[key]), resetAt: Date.now() + 60000 };
    }),
  };
});

// Mock all external dependencies
vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("$2b$12$mockedHash"),
    compare: vi.fn(),
  },
}));
vi.mock("@/lib/sessions", () => ({
  createSession: vi.fn().mockResolvedValue("new-session-token-abc"),
  getSession:    vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/adminStore", () => ({
  getUserByUsername:  vi.fn(),
  getEnvFallbackUser: vi.fn().mockReturnValue(null),
  isSetupNeeded:      vi.fn().mockResolvedValue(false),
  getPublishSecret:   vi.fn().mockReturnValue(null),
  BOOTSTRAP_USER: {
    id:           "bootstrap",
    username:     "admin",
    passwordHash: "$2b$12$nMk6oS00R.r9/qLpZbClSODAXxibghu4SBa7fv.QqVFUUJqay6Qiu",
    role:         "admin" as const,
    createdAt:    "",
  },
}));

import bcrypt from "bcryptjs";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { getUserByUsername, getEnvFallbackUser } from "@/lib/adminStore";
import { GET, POST, DELETE } from "@/app/api/blog/auth/route";

const ADMIN_USER = {
  id:           "uid-1",
  username:     "admin",
  passwordHash: "$2b$12$correctHash",
  role:         "admin" as const,
  createdAt:    new Date().toISOString(),
};

function postReq(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/blog/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body:    JSON.stringify(body),
  });
}

function getReq(cookie?: string) {
  return new NextRequest("http://localhost/api/blog/auth", {
    headers: cookie ? { Cookie: `backdrop_auth=${cookie}` } : {},
  });
}

function deleteReq(cookie?: string) {
  return new NextRequest("http://localhost/api/blog/auth", {
    method:  "DELETE",
    headers: cookie ? { Cookie: `backdrop_auth=${cookie}` } : {},
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.mocked(getUserByUsername).mockResolvedValue(ADMIN_USER);
  vi.mocked(getSession).mockResolvedValue(null);
  vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
  vi.mocked(getEnvFallbackUser).mockReturnValue(null);
});

// ── GET - session validation ──────────────────────────────────────────────────

describe("GET /api/blog/auth", () => {
  it("returns authenticated:true when cookie has a valid session", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "uid-1", username: "admin", role: "admin" });
    const res  = await GET(getReq("valid-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.authenticated).toBe(true);
    expect(body.token).toBe("valid-token");
    expect(body.username).toBe("admin");
    expect(body.role).toBe("admin");
    expect(body.needsSetup).toBe(false);
  });

  it("returns authenticated:false when cookie exists but session is gone (cold-start scenario)", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res  = await GET(getReq("stale-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.authenticated).toBe(false);
    expect(body.needsSetup).toBe(false);
  });

  it("returns authenticated:false when no cookie present", async () => {
    const res  = await GET(getReq());
    const body = await res.json() as Record<string, unknown>;
    expect(body.authenticated).toBe(false);
    expect(body.needsSetup).toBe(false);
  });
});

// ── POST - login ──────────────────────────────────────────────────────────────

describe("POST /api/blog/auth - login", () => {
  it("returns 200 + token on successful login", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(getUserByUsername).mockResolvedValue(ADMIN_USER);
    const res  = await POST(postReq({ username: "admin", password: "correct-pass" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.token).toBe("new-session-token-abc");
    expect(body.role).toBe("admin");
    expect(body.username).toBe("admin");
  });

  it("sets backdrop_auth HttpOnly cookie on successful login", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const res = await POST(postReq({ username: "admin", password: "correct-pass" }));
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("backdrop_auth=");
    expect(setCookie).toContain("HttpOnly");
  });

  it("returns 401 for wrong password", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const res  = await POST(postReq({ username: "admin", password: "wrong" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.token).toBeUndefined();
  });

  it("returns 401 for unknown username", async () => {
    vi.mocked(getUserByUsername).mockResolvedValue(null);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const res  = await POST(postReq({ username: "nobody", password: "anypass" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns 400 when username is missing", async () => {
    const res  = await POST(postReq({ password: "pass" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 400 when password is missing", async () => {
    const res  = await POST(postReq({ username: "admin" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not JSON", async () => {
    const req = new NextRequest("http://localhost/api/blog/auth", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body:    "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("uses env-var fallback user when getUserByUsername returns null", async () => {
    vi.mocked(getUserByUsername).mockResolvedValue(null);
    vi.mocked(getEnvFallbackUser).mockReturnValue({
      id: "env-user", username: "admin", passwordHash: "$2b$12$envhash", role: "admin", createdAt: "",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const res  = await POST(postReq({ username: "admin", password: "envpass" }));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 429 after exceeding rate limit (10 attempts per IP)", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const ip = "9.9.9.9";
    // Exhaust the rate limit (10 attempts)
    for (let i = 0; i < 10; i++) {
      await POST(postReq({ username: "admin", password: "wrong" }, ip));
    }
    const res  = await POST(postReq({ username: "admin", password: "wrong" }, ip));
    expect(res.status).toBe(429);
  });
});

// ── DELETE - logout ───────────────────────────────────────────────────────────

describe("DELETE /api/blog/auth", () => {
  it("deletes session and clears cookie on logout", async () => {
    const res = await DELETE(deleteReq("active-token"));
    expect(deleteSession).toHaveBeenCalledWith("active-token");
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("backdrop_auth=");
    expect(setCookie).toContain("Max-Age=0");
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it("succeeds even when no cookie is present (idempotent logout)", async () => {
    const res  = await DELETE(deleteReq());
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteSession).not.toHaveBeenCalled();
  });
});
