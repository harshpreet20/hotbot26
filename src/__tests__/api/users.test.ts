/**
 * Integration tests - user management
 *
 * GET/POST/PATCH/DELETE /api/blog/users  - list, create, update role, delete
 * POST                  /api/blog/users/register - self-registration (pending approval)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 }),
  rateLimitResponse: vi.fn().mockResolvedValue(null),
}));

const { mockSignUp, mockFromFn } = vi.hoisted(() => {
  const mockSignUp = vi.fn().mockResolvedValue({
    data: { user: { id: "new-uid", email: "contrib@example.com", email_confirmed_at: null, session: null, identities: [{ id: "id-1" }] }, session: null },
    error: null,
  });
  const mockFromFn = vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) });
  return { mockSignUp, mockFromFn };
});

vi.mock("@/lib/supabase", () => ({
  isSupabaseEnabled: vi.fn().mockReturnValue(true),
  sb: vi.fn().mockReturnValue({
    auth: { signUp: mockSignUp },
    from: mockFromFn,
  }),
}));

vi.mock("@/lib/dashboardAuth", () => ({
  extractToken:      vi.fn(),
  authorizeRole:     vi.fn(),
  authorizeAdmin:    vi.fn(),
  authorizeUserRead: vi.fn(),
}));

// monitoring agent logs to store - just let insert no-op from store mock below
vi.mock("@/lib/agents/monitoring", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/adminStore", () => ({
  getAllUsers:     vi.fn(),
  createUser:     vi.fn().mockResolvedValue({ id: "new-uid", username: "neweditor", passwordHash: "", role: "editor", createdAt: "2026-01-03T00:00:00Z" }),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  deleteUser:     vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/sessions", () => ({
  revokeAllSessions: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("$2b$12$hashedpassword"),
    compare: vi.fn().mockResolvedValue(false),
  },
}));

// register route uses store.insert
vi.mock("@/lib/store", () => ({
  insert: vi.fn().mockResolvedValue(undefined),
  newId:  vi.fn().mockReturnValue("new-user-id"),
}));

import { authorizeRole, authorizeAdmin, authorizeUserRead } from "@/lib/dashboardAuth";
import { getAllUsers, createUser, updateUserRole, deleteUser } from "@/lib/adminStore";
import { revokeAllSessions } from "@/lib/sessions";
import { GET, POST, PATCH, DELETE } from "@/app/api/blog/users/route";
import { POST as register } from "@/app/api/blog/users/register/route";
import { insert } from "@/lib/store";

const SUPER_ADMIN_SESSION = { userId: "super-id",   username: "superadmin", role: "super_admin" as const };
const ADMIN_SESSION       = { userId: "admin-id",   username: "admin",      role: "admin"       as const };
const MANAGER_SESSION     = { userId: "manager-id", username: "manager",    role: "manager"     as const };

const ADMIN_USER  = { id: "admin-id",   username: "admin",   passwordHash: "$2b$12$x", role: "admin"   as const, createdAt: "2026-01-01T00:00:00Z" };
const EDITOR_USER = { id: "editor-id",  username: "editor",  passwordHash: "$2b$12$y", role: "editor"  as const, createdAt: "2026-01-02T00:00:00Z" };

function makeReq(method: string, url: string, body?: unknown, bearer?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" };
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.mocked(authorizeRole).mockResolvedValue(ADMIN_SESSION);
  vi.mocked(authorizeAdmin).mockResolvedValue(ADMIN_SESSION);
  vi.mocked(authorizeUserRead).mockResolvedValue(ADMIN_SESSION);
  vi.mocked(getAllUsers).mockResolvedValue([ADMIN_USER, EDITOR_USER]);
  vi.mocked(createUser).mockClear();
  vi.mocked(updateUserRole).mockClear();
  vi.mocked(deleteUser).mockClear();
  vi.mocked(revokeAllSessions).mockClear();
  vi.mocked(insert).mockClear();
});

// ── GET - list users ──────────────────────────────────────────────────────────

describe("GET /api/blog/users", () => {
  it("returns 403 when unauthenticated", async () => {
    vi.mocked(authorizeUserRead).mockResolvedValue(null);
    const res = await GET(makeReq("GET", "http://localhost/api/blog/users"));
    expect(res.status).toBe(403);
  });

  it("returns user list for admin", async () => {
    const res  = await GET(makeReq("GET", "http://localhost/api/blog/users", undefined, "tok"));
    const body = await res.json() as { users: { username: string; passwordHash?: string }[]; readonly: boolean };
    expect(res.status).toBe(200);
    expect(body.users).toHaveLength(2);
    expect(body.readonly).toBe(false);
    // Password hash must never be returned
    expect(body.users[0].passwordHash).toBeUndefined();
  });

  it("returns readonly:true for manager", async () => {
    vi.mocked(authorizeUserRead).mockResolvedValue(MANAGER_SESSION);
    const res  = await GET(makeReq("GET", "http://localhost/api/blog/users", undefined, "tok"));
    const body = await res.json() as { readonly: boolean };
    expect(body.readonly).toBe(true);
  });

  it("strips passwordHash from every user record", async () => {
    const res  = await GET(makeReq("GET", "http://localhost/api/blog/users", undefined, "tok"));
    const body = await res.json() as { users: Record<string, unknown>[] };
    for (const u of body.users) {
      expect(u.passwordHash).toBeUndefined();
    }
  });
});

// ── POST - create user ────────────────────────────────────────────────────────

describe("POST /api/blog/users - create", () => {
  it("returns 403 when not admin", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(null);
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newuser", password: "password123", role: "editor",
    }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when username is too short (< 3 chars)", async () => {
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "ab", password: "password123", role: "editor",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/username/i);
  });

  it("returns 400 when password is too short (< 8 chars)", async () => {
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newuser", password: "short", role: "editor",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/password/i);
  });

  it("returns 400 for invalid role", async () => {
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newuser", password: "password123", role: "superadmin",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/role/i);
  });

  it("returns 409 when username already exists", async () => {
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "admin",  // already exists in getAllUsers mock
      password: "password123",
      role:     "editor",
    }));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/already exists/i);
  });

  it("returns 409 for case-insensitive duplicate username", async () => {
    const res = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "ADMIN",  // same as "admin", case-insensitive
      password: "password123",
      role:     "editor",
    }));
    expect(res.status).toBe(409);
  });

  it("creates user and returns 201 with public user data", async () => {
    const res  = await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "neweditor", password: "securepass", role: "editor",
    }));
    const body = await res.json() as { success: boolean; user: { username: string; role: string; passwordHash?: string } };
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.user.username).toBe("neweditor");
    expect(body.user.role).toBe("editor");
    expect(body.user.passwordHash).toBeUndefined();
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      username: "neweditor",
      role:     "editor",
    }));
  });

  it("defaults role to agent when not provided", async () => {
    await POST(makeReq("POST", "http://localhost/api/blog/users", {
      username: "newagent", password: "securepass1",
    }));
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ role: "agent" }));
  });
});

// ── PATCH - update role ───────────────────────────────────────────────────────

describe("PATCH /api/blog/users - update role", () => {
  it("returns 403 when not admin", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(null);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id: "editor-id", role: "manager",
    }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when id is missing", async () => {
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", { role: "manager" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role", async () => {
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id: "editor-id", role: "superuser",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found", async () => {
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id: "no-such-id", role: "manager",
    }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when demoting the only admin", async () => {
    // Requires super_admin to manage another admin
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([ADMIN_USER]);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id:   "admin-id",
      role: "manager",
    }));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/only admin/i);
  });

  it("allows demoting admin when multiple admins exist", async () => {
    // Requires super_admin to manage another admin
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([
      ADMIN_USER,
      { ...ADMIN_USER, id: "admin-2", username: "admin2" },
    ]);
    const res = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id:   "admin-id",
      role: "manager",
    }));
    expect(res.status).toBe(200);
    expect(updateUserRole).toHaveBeenCalledWith("admin-id", "manager");
    expect(revokeAllSessions).toHaveBeenCalledWith("admin-id");
  });

  it("revokes sessions on role update so new role takes effect immediately", async () => {
    await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id: "editor-id", role: "manager",
    }));
    expect(revokeAllSessions).toHaveBeenCalledWith("editor-id");
  });

  it("returns updated user without passwordHash", async () => {
    const res  = await PATCH(makeReq("PATCH", "http://localhost/api/blog/users", {
      id: "editor-id", role: "manager",
    }));
    const body = await res.json() as { user: Record<string, unknown> };
    expect(body.user.role).toBe("manager");
    expect(body.user.passwordHash).toBeUndefined();
  });
});

// ── DELETE - remove user ──────────────────────────────────────────────────────

describe("DELETE /api/blog/users", () => {
  it("returns 403 when not admin", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(null);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=editor-id"));
    expect(res.status).toBe(403);
  });

  it("returns 400 when id is missing", async () => {
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users"));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown user id", async () => {
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=no-such-id"));
    expect(res.status).toBe(404);
  });

  it("returns 409 when deleting the only admin", async () => {
    // Requires super_admin to delete another admin
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([ADMIN_USER]);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=admin-id"));
    expect(res.status).toBe(409);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/only admin/i);
  });

  it("deletes user and revokes sessions", async () => {
    const res  = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=editor-id"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith("editor-id");
    expect(revokeAllSessions).toHaveBeenCalledWith("editor-id");
  });

  it("allows deleting a second admin when multiple admins exist", async () => {
    // Requires super_admin to delete another admin
    vi.mocked(authorizeAdmin).mockResolvedValue(SUPER_ADMIN_SESSION);
    vi.mocked(getAllUsers).mockResolvedValue([
      ADMIN_USER,
      { ...ADMIN_USER, id: "admin-2", username: "admin2" },
    ]);
    const res = await DELETE(makeReq("DELETE", "http://localhost/api/blog/users?id=admin-2"));
    expect(res.status).toBe(200);
    expect(deleteUser).toHaveBeenCalledWith("admin-2");
  });
});

// ── Registration - self-service via Supabase ─────────────────────────────────

describe("POST /api/blog/users/register", () => {
  beforeEach(() => {
    mockSignUp.mockClear();
    mockFromFn.mockClear();
    mockFromFn.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) });
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "new-uid", email: "contrib@example.com", email_confirmed_at: null, session: null, identities: [{ id: "id-1" }] },
        session: null,
      },
      error: null,
    });
  });

  it("returns 400 when name is missing", async () => {
    const res = await register(makeReq("POST", "http://localhost/api/blog/users/register", {
      email: "ab@example.com", password: "password123", requestedRole: "contributor",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await register(makeReq("POST", "http://localhost/api/blog/users/register", {
      name: "Valid User", email: "not-an-email", password: "password123", requestedRole: "contributor",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/email/i);
  });

  it("returns 400 when requestedRole is admin (not allowed for self-registration)", async () => {
    const res = await register(makeReq("POST", "http://localhost/api/blog/users/register", {
      name: "Hacker", email: "h@example.com", password: "password123", requestedRole: "admin",
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toMatch(/role/i);
  });

  it("submits registration and returns success message", async () => {
    const req = new NextRequest("http://localhost/api/blog/users/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body:    JSON.stringify({ name: "New Contrib", email: "contrib@example.com", password: "password123", requestedRole: "contributor" }),
    });
    const res  = await register(req);
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
      email:    "contrib@example.com",
      password: "password123",
    }));
  });

  it("defaults requestedRole to contributor when not provided", async () => {
    const req = new NextRequest("http://localhost/api/blog/users/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
      body:    JSON.stringify({ name: "Auto Contrib", email: "auto@example.com", password: "password123" }),
    });
    const res = await register(req);
    expect(res.status).toBe(200);
    expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ data: expect.objectContaining({ requestedRole: "contributor" }) }),
    }));
  });
});
