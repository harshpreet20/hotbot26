/**
 * Integration tests — POST /api/blog/auth (login + setup + logout)
 *
 * Tests: login success/failure, first-run setup, rate limiting,
 *        cookie management, session creation, setup guard,
 *        password/username validation, env-var fallback user
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock all external dependencies
vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("$2b$12$mockedHash"),
    compare: vi.fn(),
  },
}));
vi.mock("@/lib/sessions", () => ({
  createSession: vi.fn().mockReturnValue("new-session-token-abc"),
  getSession:    vi.fn(),
  deleteSession: vi.fn(),
}));
vi.mock("@/lib/adminStore", () => ({
  getUserByUsername:  vi.fn(),
  createUser:         vi.fn(),
  isSetupNeeded:      vi.fn(),
  getPublishSecret:   vi.fn(),
  getEnvFallbackUser: vi.fn().mockReturnValue(null),
}));

import bcrypt from "bcryptjs";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { getUserByUsername, createUser, isSetupNeeded, getEnvFallbackUser } from "@/lib/adminStore";
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
  vi.mocked(isSetupNeeded).mockResolvedValue(false);
  vi.mocked(getUserByUsername).mockResolvedValue(ADMIN_USER);
  vi.mocked(createUser).mockResolvedValue(undefined);
  vi.mocked(getSession).mockReturnValue(null);
  vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
  vi.mocked(getEnvFallbackUser).mockReturnValue(null);
});

// ── GET — session validation ──────────────────────────────────────────────────

describe("GET /api/blog/auth", () => {
  it("returns authenticated:true when cookie has a valid session", async () => {
    vi.mocked(getSession).mockReturnValue({ userId: "uid-1", username: "admin", role: "admin" });
    const res  = await GET(getReq("valid-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.authenticated).toBe(true);
    expect(body.token).toBe("valid-token");
    expect(body.username).toBe("admin");
    expect(body.role).toBe("admin");
    expect(body.needsSetup).toBe(false);
  });

  it("returns authenticated:false and needsSetup:false when cookie exists but session is gone (cold-start scenario)", async () => {
    vi.mocked(getSession).mockReturnValue(null); // session wiped
    const res  = await GET(getReq("stale-token"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.authenticated).toBe(false);
    expect(body.needsSetup).toBe(false); // must NOT show setup form
  });

  it("returns needsSetup:true when no cookie and setup is needed", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(true);
    const res  = await GET(getReq());
    const body = await res.json() as Record<string, unknown>;
    expect(body.authenticated).toBe(false);
    expect(body.needsSetup).toBe(true);
  });

  it("returns needsSetup:false when no cookie and setup is complete", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(false);
    const res  = await GET(getReq());
    const body = await res.json() as Record<string, unknown>;
    expect(body.needsSetup).toBe(false);
    expect(body.authenticated).toBe(false);
  });
});

// ── POST — login ──────────────────────────────────────────────────────────────

describe("POST /api/blog/auth — login", () => {
  it("returns 200 + token on successful login", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(isSetupNeeded).mockResolvedValue(false);
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
    vi.mocked(getEnvFallbackUser).mockReturnValue(null);
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

  it("uses env-var fallback user when no DB-based users exist", async () => {
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

// ── POST — first-run setup ────────────────────────────────────────────────────

describe("POST /api/blog/auth — first-run setup", () => {
  it("creates admin account on valid setup request", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(true);
    vi.mocked(createUser).mockResolvedValue(undefined);
    const res  = await POST(postReq({ setup: true, username: "admin", password: "strongpass1", confirmPassword: "strongpass1" }, "10.0.0.1"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.token).toBe("new-session-token-abc");
    expect(createUser).toHaveBeenCalled();
  });

  it("returns 409 when setup is attempted but account already exists", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(false);
    const res  = await POST(postReq({ setup: true, username: "admin", password: "pass12345", confirmPassword: "pass12345" }, "10.0.0.2"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it("returns 400 when passwords do not match", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(true);
    const res  = await POST(postReq({ setup: true, username: "admin", password: "pass12345", confirmPassword: "different" }, "10.0.0.3"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/match/i);
  });

  it("returns 400 when password is under 8 characters", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(true);
    const res  = await POST(postReq({ setup: true, username: "admin", password: "short", confirmPassword: "short" }, "10.0.0.4"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is under 3 characters", async () => {
    vi.mocked(isSetupNeeded).mockResolvedValue(true);
    const res  = await POST(postReq({ setup: true, username: "ab", password: "validpassword", confirmPassword: "validpassword" }, "10.0.0.5"));
    expect(res.status).toBe(400);
  });
});

// ── DELETE — logout ───────────────────────────────────────────────────────────

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
