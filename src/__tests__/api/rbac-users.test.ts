/**
 * RBAC user management API — isolation + combination tests
 *
 * Tests: role-based access to GET/POST/DELETE /api/blog/users
 * and the permissions endpoint GET /api/blog/users/permissions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken:      vi.fn().mockReturnValue("token"),
  authorizeAdmin:    vi.fn().mockResolvedValue({ userId: "admin-id", username: "admin", role: "admin" }),
  authorizeUserRead: vi.fn().mockResolvedValue({ userId: "admin-id", username: "admin", role: "admin" }),
  authorizeRole:     vi.fn().mockResolvedValue({ userId: "admin-id", username: "admin", role: "admin" }),
}));

vi.mock("@/lib/agents/monitoring", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/adminStore", () => ({
  getAllUsers:     vi.fn().mockResolvedValue([]),
  createUser:     vi.fn().mockResolvedValue({ id: "new-uid", username: "newuser", role: "editor", createdAt: "" }),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  deleteUser:     vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/sessions", () => ({
  revokeAllSessions: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/agents/userManagement", () => ({
  validateCreate:    vi.fn().mockReturnValue(null),
  validateRoleChange: vi.fn().mockReturnValue(null),
  validateDelete:    vi.fn().mockReturnValue(null),
  assignableRoles:   vi.fn().mockReturnValue([]),
}));

vi.mock("@/lib/store", () => ({
  readAll:    vi.fn().mockResolvedValue([]),
  readWhere:  vi.fn().mockResolvedValue([]),
  insert:     vi.fn().mockResolvedValue(undefined),
  updateById: vi.fn().mockResolvedValue(undefined),
  removeById: vi.fn().mockResolvedValue(undefined),
  newId:      vi.fn().mockReturnValue("test-id"),
}));

vi.mock("@/lib/agents/accessControl", () => ({
  resolvePermissions:       vi.fn().mockResolvedValue(null),
  invalidatePermissionCache: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("$2b$12$hashedpassword"),
    compare: vi.fn().mockResolvedValue(false),
  },
}));

import { authorizeAdmin, authorizeUserRead } from "@/lib/dashboardAuth";
import { getAllUsers, createUser, deleteUser } from "@/lib/adminStore";
import { validateCreate, validateDelete } from "@/lib/agents/userManagement";
import { resolvePermissions } from "@/lib/agents/accessControl";
import { GET, POST, DELETE } from "@/app/api/blog/users/route";
import { GET as permissionsGET } from "@/app/api/blog/users/permissions/route";

// ── Fixture data ──────────────────────────────────────────────────────────────

const SUPER_ADMIN_SESSION = { userId: "super-id",   username: "superadmin", role: "super_admin" as const };
const ADMIN_SESSION       = { userId: "admin-id",   username: "admin",      role: "admin"       as const };
const MANAGER_SESSION     = { userId: "manager-id", username: "manager",    role: "manager"     as const };

const ADMIN_USER  = { id: "admin-id",   username: "admin",   passwordHash: "$2b$12$x", role: "admin"   as const, createdAt: "2026-01-01T00:00:00Z" };
const EDITOR_USER = { id: "editor-id",  username: "editor",  passwordHash: "$2b$12$y", role: "editor"  as const, createdAt: "2026-01-02T00:00:00Z" };

function makeReq(method: string, url: string, body?: unknown, bearer?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-forwarded-for": "1.2.3.4",
  };
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
  vi.mocked(authorizeUserRead).mockResolvedValue(ADMIN_SESSION);
  vi.mocked(getAllUsers).mockResolvedValue([ADMIN_USER, EDITOR_USER]);
  vi.mocked(validateCreate).mockReturnValue(null);
  vi.mocked(validateDelete).mockReturnValue(null);
  vi.mocked(createUser).mockResolvedValue({ id: "new-uid", username: "newuser", role: "editor", createdAt: "" });
});

// ── GET /api/blog/users ───────────────────────────────────────────────────────

describe("GET /api/blog/users", () => {
  it("super_admin can list all users", async () => {
    vi.mocked(authorizeUserRead).mockResolvedValue(SUPER_ADMIN_SESSION);
    const res  = await GET(makeReq("GET", "http://localhost/api/blog/users", undefined, "tok"));
    const body = await res.json() as { users: unknown[]; readonly: boolean };
    expect(res.status).toBe(200);
    expect(body.users).toHaveLength(2);
  });

  it("admin can list all users", async () => {
    vi.mocked(authorizeUserRead).mockResolvedValue(ADMIN_SESSION);
    const res  = await GET(makeReq("GET", "http://localhost/api/blog/users", undefined, "tok"));
    const body = await res.json() as { users: unknown[]; readonly: boolean };
    expect(res.status).toBe(200);
    expect(body.users).toHaveLength(2);
    expect(body.readonly).toBe(false);
  });

  it("manager can list users via authorizeUserRead (readonly flag set)", async () => {
    vi.mocked(authorizeUserRead).mockResolvedValue(MANAGER_SESSION);
    const res  = await GET(makeReq("GET", "http://localhost/api/blog/users", undefined, "tok"));
    const body = await res.json() as { users: unknown[]; readonly: boolean };
    expect(res.status).toBe(200);
    expect(body.readonly).toBe(true);
  });

  it("agent cannot list users (403)", async () => {
    vi.mocked(authorizeUserRead).mockResolvedValue(null);
    const res = await GET(makeReq("GET", "http://localhost/api/blog/users"));
    expect(res.status).toBe(403);
  });
});

// ── POST /api/blog/users ──────────────────────────────────────────────────────

describe("POST /api/blog/users - role-based create", () => {
  it("super_admin can create admin user", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(validateCreate).mockReturnValue(null);
    vi.mocked(createUser).mockResolvedValue({ id: "new-admin-id", username: "newadmin", role: "admin", createdAt: "" });
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newadmin", password: "securepass", role: "admin",
    }, "tok"));
    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean; user: { role: string } };
    expect(body.success).toBe(true);
  });

  it("admin cannot create admin user (returns 403)", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
    vi.mocked(validateCreate).mockReturnValue({
      code:    "FORBIDDEN",
      message: "Your role (admin) cannot create users with role \"admin\".",
    });
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newadmin2", password: "securepass", role: "admin",
    }, "tok"));
    expect(res.status).toBe(403);
  });

  it("admin can create editor user", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
    vi.mocked(validateCreate).mockReturnValue(null);
    vi.mocked(createUser).mockResolvedValue({ id: "new-editor-id", username: "neweditor", role: "editor", createdAt: "" });
    vi.mocked(getAllUsers).mockResolvedValueOnce([ADMIN_USER, EDITOR_USER]); // initial users
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "neweditor", password: "securepass", role: "editor",
    }, "tok"));
    expect(res.status).toBe(201);
    const body = await res.json() as { user: { role: string } };
    expect(body.user.role).toBe("editor");
  });

  it("unauthenticated request to create user returns 403", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(null);
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newuser", password: "securepass", role: "editor",
    }));
    expect(res.status).toBe(403);
  });
});

// ── DELETE /api/blog/users ────────────────────────────────────────────────────

describe("DELETE /api/blog/users - role-based delete", () => {
  it("super_admin can delete admin user", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(validateDelete).mockReturnValue(null);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=admin-id"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it("admin cannot delete another admin (403)", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
    vi.mocked(validateDelete).mockReturnValue({
      code:    "FORBIDDEN",
      message: "You cannot delete a user with role \"admin\".",
    });
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=admin-id"));
    expect(res.status).toBe(403);
  });

  it("admin can delete editor user", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
    vi.mocked(validateDelete).mockReturnValue(null);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=editor-id"));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });
});

// ── COMBINATION tests ─────────────────────────────────────────────────────────

describe("COMBINATION: create then role change blocked", () => {
  it("create user as super_admin, then admin cannot change the new user if they become admin-level", async () => {
    // Step 1: super_admin creates a new admin user
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(validateCreate).mockReturnValue(null);
    vi.mocked(createUser).mockResolvedValue({ id: "promoted-id", username: "promoted", role: "admin", createdAt: "" });
    const createRes = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "promoted", password: "securepass", role: "admin",
    }, "tok"));
    expect(createRes.status).toBe(201);

    // Step 2: admin actor tries to change that same user's role — blocked because target is admin
    const { PATCH } = await import("@/app/api/blog/users/route");
    vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
    // validateRoleChange would return FORBIDDEN because admin can't manage admin
    const { validateRoleChange } = await import("@/lib/agents/userManagement");
    vi.mocked(validateRoleChange).mockReturnValue({
      code:    "FORBIDDEN",
      message: "You cannot manage a user with role \"admin\".",
    });

    // Set up getAllUsers to return the newly promoted admin
    const promotedAdmin = { id: "promoted-id", username: "promoted", passwordHash: "$2b$12$z", role: "admin" as const, createdAt: "" };
    vi.mocked(getAllUsers).mockResolvedValue([ADMIN_USER, promotedAdmin, EDITOR_USER]);

    const patchRes = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id: "promoted-id", role: "manager",
    }, "tok"));
    expect(patchRes.status).toBe(403);
  });
});

// ── GET /api/blog/users/permissions ──────────────────────────────────────────

describe("GET /api/blog/users/permissions - module overrides", () => {
  it("returns { overrides: null } for user with no overrides", async () => {
    const { readWhere } = await import("@/lib/store");
    vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const res  = await permissionsGET(
      makeReq("GET", "http://localhost/api/blog/users/permissions?userId=some-user-id", undefined, "tok"),
    );
    const body = await res.json() as { overrides: unknown };
    expect(res.status).toBe(200);
    expect(body.overrides).toBeNull();
  });

  it("returns 403 when unauthenticated and userId is provided", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(null);
    // Also make resolvePermissions return null so "me" fallback also fails
    vi.mocked(resolvePermissions).mockResolvedValue(null);

    const res = await permissionsGET(
      makeReq("GET", "http://localhost/api/blog/users/permissions?userId=some-user-id"),
    );
    expect(res.status).toBe(403);
  });

  it("returns own effective permissions when me=1 is passed", async () => {
    vi.mocked(resolvePermissions).mockResolvedValue({
      session:     ADMIN_SESSION,
      permissions: new Set(["blog:read", "blog:write"]),
      can:         (p) => ["blog:read", "blog:write"].includes(p),
      canAny:      (...ps) => ps.some((p) => ["blog:read", "blog:write"].includes(p)),
    });

    const res  = await permissionsGET(
      makeReq("GET", "http://localhost/api/blog/users/permissions?me=1", undefined, "tok"),
    );
    const body = await res.json() as { userId: string; role: string; permissions: string[] };
    expect(res.status).toBe(200);
    expect(body.userId).toBe("admin-id");
    expect(body.permissions).toContain("blog:read");
  });
});
