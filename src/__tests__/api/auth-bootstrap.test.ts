/**
 * Tests for POST /api/blog/auth - bcrypt auth path
 *
 * Covers: successful login, unknown user, wrong password, rate limiting,
 *         and missing credentials.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 60000 }),
}));

vi.mock("@/lib/sessions", () => ({
  createSession: vi.fn().mockResolvedValue("session-token-abc"),
  getSession:    vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseEnabled: vi.fn().mockReturnValue(false),
  sb:                vi.fn(),
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

vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("$2b$12$mockedHash"),
    compare: vi.fn().mockResolvedValue(false),
  },
}));

import bcrypt from "bcryptjs";
import { getUserByUsername } from "@/lib/adminStore";
import { createSession } from "@/lib/sessions";
import { rateLimit } from "@/lib/rateLimit";
import { POST } from "@/app/api/blog/auth/route";

const MOCK_USER = {
  id:           "user-1",
  username:     "alice",
  passwordHash: "$2b$12$hashedpassword",
  role:         "admin" as const,
  createdAt:    "2026-01-01T00:00:00Z",
};

function postReq(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/blog/auth", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body:    JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(rateLimit).mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 60000 });
  vi.mocked(getUserByUsername).mockResolvedValue(MOCK_USER);
  vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  vi.mocked(createSession).mockResolvedValue("session-token-abc");
});

// ── Auth tests ────────────────────────────────────────────────────────────────

describe("POST /api/blog/auth - bcrypt login", () => {
  it("returns 200 with token and role on valid credentials", async () => {
    const res  = await POST(postReq({ username: "alice", password: "correct" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.token).toBe("session-token-abc");
    expect(body.role).toBe("admin");
    expect(body.username).toBe("alice");
    expect(createSession).toHaveBeenCalledWith("user-1", "alice", "admin");
  });

  it("returns 401 when username is not found", async () => {
    vi.mocked(getUserByUsername).mockResolvedValue(null);
    const res  = await POST(postReq({ username: "unknown", password: "pass" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns 401 when password is wrong", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const res  = await POST(postReq({ username: "alice", password: "wrong" }));
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
    const res  = await POST(postReq({ username: "alice" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(rateLimit).mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60000 });
    const res  = await POST(postReq({ username: "alice", password: "pass" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
  });
});
