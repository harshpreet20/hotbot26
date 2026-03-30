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
  it("returns true for a valid session token", async () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    expect(await isAuthorized("valid-token")).toBe(true);
  });

  it("returns true for a matching publish secret", async () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("my-secret");
    expect(await isAuthorized("my-secret")).toBe(true);
  });

  it("returns false for an invalid session token and wrong secret", async () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("correct-secret");
    expect(await isAuthorized("wrong-secret")).toBe(false);
  });

  it("returns false for null token", async () => {
    expect(await isAuthorized(null)).toBe(false);
  });

  it("returns false for undefined token", async () => {
    expect(await isAuthorized(undefined)).toBe(false);
  });

  it("returns false for empty string", async () => {
    expect(await isAuthorized("")).toBe(false);
  });
});

// ── authorizeRole ─────────────────────────────────────────────────────────────

describe("authorizeRole()", () => {
  it("returns session info when role matches", async () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    const result = await authorizeRole("token", "admin");
    expect(result).toEqual(adminSession());
  });

  it("returns session info when role is in list of allowed roles", async () => {
    vi.mocked(getSession).mockReturnValue(managerSession());
    const result = await authorizeRole("token", "admin", "manager");
    expect(result).toEqual(managerSession());
  });

  it("returns null when role is NOT in allowed list", async () => {
    vi.mocked(getSession).mockReturnValue(agentSession());
    const result = await authorizeRole("token", "admin", "manager");
    expect(result).toBeNull();
  });

  it("returns null for invalid token", async () => {
    vi.mocked(getSession).mockReturnValue(null);
    expect(await authorizeRole("bad-token", "admin")).toBeNull();
  });

  it("returns null for null token", async () => {
    expect(await authorizeRole(null, "admin")).toBeNull();
  });
});

// ── authorizeAny ──────────────────────────────────────────────────────────────

describe("authorizeAny()", () => {
  it("returns session for admin", async () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    expect(await authorizeAny("t")).toEqual(adminSession());
  });

  it("returns session for manager", async () => {
    vi.mocked(getSession).mockReturnValue(managerSession());
    expect(await authorizeAny("t")).toEqual(managerSession());
  });

  it("returns session for agent", async () => {
    vi.mocked(getSession).mockReturnValue(agentSession());
    expect(await authorizeAny("t")).toEqual(agentSession());
  });

  it("returns null for invalid token", async () => {
    vi.mocked(getSession).mockReturnValue(null);
    expect(await authorizeAny("bad")).toBeNull();
  });
});

// ── authorizeData ─────────────────────────────────────────────────────────────

describe("authorizeData()", () => {
  it("returns true for admin session", async () => {
    vi.mocked(getSession).mockReturnValue(adminSession());
    expect(await authorizeData("token")).toBe(true);
  });

  it("returns true for manager session", async () => {
    vi.mocked(getSession).mockReturnValue(managerSession());
    expect(await authorizeData("token")).toBe(true);
  });

  it("returns false for agent session (not authorized for data routes)", async () => {
    vi.mocked(getSession).mockReturnValue(agentSession());
    expect(await authorizeData("token")).toBe(false);
  });

  it("returns true for matching publish secret (N8N / legacy)", async () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("pub-secret");
    expect(await authorizeData("pub-secret")).toBe(true);
  });

  it("returns false for wrong publish secret", async () => {
    vi.mocked(getSession).mockReturnValue(null);
    vi.mocked(getPublishSecret).mockReturnValue("real-secret");
    expect(await authorizeData("wrong-secret")).toBe(false);
  });

  it("returns false for null token", async () => {
    expect(await authorizeData(null)).toBe(false);
  });
});
