/**
 * Integration tests - POST/DELETE /api/blog/auth/impersonate
 *
 * Covers: access control (non-super_admin → 403), missing targetUserId (400),
 *         non-existent target user (404), targeting another super_admin (403),
 *         successful impersonation, and ending impersonation (DELETE).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/store", () => ({
  insert:   vi.fn().mockResolvedValue(undefined),
  readAll:  vi.fn().mockResolvedValue([]),
  _fsRead:  vi.fn().mockReturnValue([]),
  _fsWrite: vi.fn(),
}));

vi.mock("@/lib/sessions", () => ({
  createSession:             vi.fn().mockResolvedValue("restored-token-789"),
  getSession:                vi.fn().mockResolvedValue(null),
  deleteSession:             vi.fn().mockResolvedValue(undefined),
  createImpersonationSession: vi.fn().mockResolvedValue("impersonation-token-456"),
}));

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken:        vi.fn().mockReturnValue("token"),
  authorizeSuperAdmin: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/adminStore", () => ({
  getAllUsers:       vi.fn().mockResolvedValue([]),
  getUserByUsername: vi.fn().mockResolvedValue(null),
}));

// Silence audit logging
vi.mock("@/lib/agents/monitoring", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

import {
  createSession,
  getSession,
  deleteSession,
  createImpersonationSession,
} from "@/lib/sessions";
import { authorizeSuperAdmin } from "@/lib/dashboardAuth";
import { getAllUsers } from "@/lib/adminStore";
import { POST, DELETE } from "@/app/api/blog/auth/impersonate/route";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SUPER_ADMIN_SESSION = {
  userId:   "sa-1",
  username: "superuser",
  role:     "super_admin" as const,
};

const EDITOR_USER = {
  id:           "editor-1",
  username:     "editorguy",
  role:         "editor" as const,
  passwordHash: "irrelevant",
  createdAt:    new Date().toISOString(),
};

const SUPER_ADMIN_USER = {
  id:           "sa-2",
  username:     "another_super",
  role:         "super_admin" as const,
  passwordHash: "irrelevant",
  createdAt:    new Date().toISOString(),
};

function postReq(body: unknown, cookie = "super-cookie") {
  return new NextRequest("http://localhost/api/blog/auth/impersonate", {
    method:  "POST",
    headers: {
      "Content-Type":   "application/json",
      Cookie:           `backdrop_auth=${cookie}`,
      "x-forwarded-for": "1.2.3.4",
    },
    body: JSON.stringify(body),
  });
}

function deleteReq(cookie = "imp-cookie") {
  return new NextRequest("http://localhost/api/blog/auth/impersonate", {
    method:  "DELETE",
    headers: {
      Cookie:           `backdrop_auth=${cookie}`,
      "x-forwarded-for": "1.2.3.4",
    },
  });
}

beforeEach(() => {
  vi.mocked(authorizeSuperAdmin).mockResolvedValue(null);
  vi.mocked(getAllUsers).mockResolvedValue([]);
  vi.mocked(getSession).mockResolvedValue(null);
  vi.mocked(createSession).mockResolvedValue("restored-token-789");
  vi.mocked(deleteSession).mockResolvedValue(undefined);
  vi.mocked(createImpersonationSession).mockResolvedValue("impersonation-token-456");
});

// ── POST – access control ─────────────────────────────────────────────────────

describe("POST /api/blog/auth/impersonate – access control", () => {
  it("returns 403 when caller is not a super_admin", async () => {
    vi.mocked(authorizeSuperAdmin).mockResolvedValue(null); // not authorised
    const res = await POST(postReq({ targetUserId: "editor-1" }));
    expect(res.status).toBe(403);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeDefined();
  });

  it("returns 400 when targetUserId is missing", async () => {
    vi.mocked(authorizeSuperAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    // body has no targetUserId
    const res  = await POST(postReq({}));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeDefined();
  });

  it("returns 404 when targetUserId does not match any user", async () => {
    vi.mocked(authorizeSuperAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([EDITOR_USER]);
    const res  = await POST(postReq({ targetUserId: "nonexistent-id" }));
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeDefined();
  });

  it("returns 400 when targeting another super_admin (not allowed)", async () => {
    vi.mocked(authorizeSuperAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([SUPER_ADMIN_USER]);
    const res  = await POST(postReq({ targetUserId: SUPER_ADMIN_USER.id }));
    // The route returns 400 for this case (not 403)
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeDefined();
  });
});

// ── POST – successful impersonation ──────────────────────────────────────────

describe("POST /api/blog/auth/impersonate – success", () => {
  it("creates impersonation session and returns { token, impersonating: username }", async () => {
    vi.mocked(authorizeSuperAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([EDITOR_USER]);

    const res  = await POST(postReq({ targetUserId: EDITOR_USER.id }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.token).toBe("impersonation-token-456");
    expect(body.impersonating).toBe(EDITOR_USER.username);
    expect(createImpersonationSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: SUPER_ADMIN_SESSION.userId }),
      expect.objectContaining({ userId: EDITOR_USER.id, username: EDITOR_USER.username }),
    );
  });

  it("sets a backdrop_auth cookie with the impersonation token", async () => {
    vi.mocked(authorizeSuperAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([EDITOR_USER]);

    const res = await POST(postReq({ targetUserId: EDITOR_USER.id }));
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("backdrop_auth=");
    expect(cookie).toContain("impersonation-token-456");
  });
});

// ── DELETE – end impersonation ────────────────────────────────────────────────

describe("DELETE /api/blog/auth/impersonate – end impersonation", () => {
  it("ends impersonation: deletes session, creates fresh original session, clears impersonation flag", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId:          "editor-uid",
      username:        "editorguy",
      role:            "editor" as const,
      isImpersonating: true,
      originalUserId:  "sa-1",
      originalUsername: "superuser",
      originalRole:    "super_admin" as const,
    });

    const res  = await DELETE(deleteReq("imp-cookie"));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // The impersonation session is removed
    expect(deleteSession).toHaveBeenCalledWith("imp-cookie");
    // A fresh session is created for the original user
    expect(createSession).toHaveBeenCalledWith("sa-1", "superuser", "super_admin");
    // Response contains the restored session token
    expect(body.token).toBe("restored-token-789");
    // The restored session belongs to the original user
    expect(body.username).toBe("superuser");
    expect(body.role).toBe("super_admin");
  });

  it("returns 401 when no token is provided", async () => {
    const req = new NextRequest("http://localhost/api/blog/auth/impersonate", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when token does not match any session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await DELETE(deleteReq("unknown-token"));
    expect(res.status).toBe(401);
  });
});
