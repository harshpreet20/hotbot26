/**
 * Unit tests — src/lib/dashboardAuth.ts
 * Token extraction, authorization helpers, role-based access control
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/sessions", () => ({
  getSession: vi.fn(),
}));
vi.mock("@/lib/adminStore", () => ({
  getPublishSecret: vi.fn(),
}));

import { getSession } from "@/lib/sessions";
import { getPublishSecret } from "@/lib/adminStore";
import {
  extractToken,
  isAuthorized,
  authorizeRole,
  authorizeAny,
  authorizeData,
} from "@/lib/dashboardAuth";

function makeReq(opts: { auth?: string; cookie?: string; query?: string } = {}) {
  const url = `http://localhost/api/test${opts.query ? `?secret=${opts.query}` : ""}`;
  return new NextRequest(url, {
    headers: {
      ...(opts.auth   ? { Authorization: opts.auth }               : {}),
      ...(opts.cookie ? { Cookie: `backdrop_auth=${opts.cookie}` } : {}),
    },
  });
}

function adminSession() {
  return { userId: "u1", username: "admin", role: "admin" as const };
}
function managerSession() {
  return { userId: "u2", username: "mgr", role: "manager" as const };
}
function agentSession() {
  return { userId: "u3", username: "agt", role: "agent" as const };
}

beforeEach(() => {
  vi.mocked(getSession).mockReturnValue(null);
  vi.mocked(getPublishSecret).mockReturnValue(null);
});

// ── extractToken ──────────────────────────────────────────────────────────────

describe("extractToken()", () => {
  it("extracts Bearer token from Authorization header", () => {
    const req = makeReq({ auth: "Bearer my-session-token" });
    expect(extractToken(req)).toBe("my-session-token");
  });

  it("extracts token from backdrop_auth cookie when no Authorization header", () => {
    const req = makeReq({ cookie: "cookie-token-123" });
    expect(extractToken(req)).toBe("cookie-token-123");
  });

  it("extracts token from ?secret= query param as legacy fallback", () => {
    const req = makeReq({ query: "query-secret-xyz" });
    expect(extractToken(req)).toBe("query-secret-xyz");
  });

  it("prefers Authorization header over cookie", () => {
    const req = makeReq({ auth: "Bearer header-token", cookie: "cookie-token" });
    expect(extractToken(req)).toBe("header-token");
  });

  it("prefers cookie over query param", () => {
    const req = makeReq({ cookie: "cookie-token", query: "query-token" });
    expect(extractToken(req)).toBe("cookie-token");
  });

  it("returns null when no token is provided", () => {
    const req = makeReq();
    expect(extractToken(req)).toBeNull();
  });

  it("returns null for malformed Authorization (no Bearer prefix)", () => {
    const req = makeReq({ auth: "Token not-bearer-format" });
    expect(extractToken(req)).toBeNull();
  });
});

// ── isAuthorized ──────────────────────────────────────────────────────────────

describe("isAuthorized()", () => {
  it("returns true for a valid session token", () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    expect(isAuthorized("valid-token")).toBe(true);
  });

  it("returns true for a matching publish secret", () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("my-secret");
    expect(isAuthorized("my-secret")).toBe(true);
  });

  it("returns false for an invalid session token and wrong secret", () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("correct-secret");
    expect(isAuthorized("wrong-secret")).toBe(false);
  });

  it("returns false for null token", () => {
    expect(isAuthorized(null)).toBe(false);
  });

  it("returns false for undefined token", () => {
    expect(isAuthorized(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAuthorized("")).toBe(false);
  });
});

// ── authorizeRole ─────────────────────────────────────────────────────────────

describe("authorizeRole()", () => {
  it("returns session info when role matches", () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    const result = authorizeRole("token", "admin");
    expect(result).toEqual(adminSession());
  });

  it("returns session info when role is in list of allowed roles", () => {
    vi.mocked(getSession).mockReturnValue(managerSession());
    const result = authorizeRole("token", "admin", "manager");
    expect(result).toEqual(managerSession());
  });

  it("returns null when role is NOT in allowed list", () => {
    vi.mocked(getSession).mockReturnValue(agentSession());
    const result = authorizeRole("token", "admin", "manager");
    expect(result).toBeNull();
  });

  it("returns null for invalid token", () => {
    vi.mocked(getSession).mockReturnValue(null);
    expect(authorizeRole("bad-token", "admin")).toBeNull();
  });

  it("returns null for null token", () => {
    expect(authorizeRole(null, "admin")).toBeNull();
  });
});

// ── authorizeAny ──────────────────────────────────────────────────────────────

describe("authorizeAny()", () => {
  it("returns session for admin", () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    expect(authorizeAny("t")).toEqual(adminSession());
  });

  it("returns session for manager", () => {
    vi.mocked(getSession).mockReturnValue(managerSession());
    expect(authorizeAny("t")).toEqual(managerSession());
  });

  it("returns session for agent", () => {
    vi.mocked(getSession).mockReturnValue(agentSession());
    expect(authorizeAny("t")).toEqual(agentSession());
  });

  it("returns null for invalid token", () => {
    vi.mocked(getSession).mockReturnValue(null);
    expect(authorizeAny("bad")).toBeNull();
  });
});

// ── authorizeData ─────────────────────────────────────────────────────────────

describe("authorizeData()", () => {
  it("returns true for admin session", () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    expect(authorizeData("token")).toBe(true);
  });

  it("returns true for manager session", () => {
    vi.mocked(getSession).mockReturnValue(managerSession());
    expect(authorizeData("token")).toBe(true);
  });

  it("returns false for agent session (not authorized for data routes)", () => {
    vi.mocked(getSession).mockReturnValue(agentSession());
    expect(authorizeData("token")).toBe(false);
  });

  it("returns true for matching publish secret (N8N / legacy)", () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("pub-secret");
    expect(authorizeData("pub-secret")).toBe(true);
  });

  it("returns false for wrong publish secret", () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("real-secret");
    expect(authorizeData("wrong-secret")).toBe(false);
  });

  it("returns false for null token", () => {
    expect(authorizeData(null)).toBe(false);
  });
});
