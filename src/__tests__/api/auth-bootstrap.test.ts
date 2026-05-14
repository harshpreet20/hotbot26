/**
 * Tests for the bootstrap logic in POST /api/blog/auth
 *
 * Covers: auto-promotion of first Firebase user to super_admin,
 *         skipping promotion when super_admin already exists,
 *         and skipping listUsers entirely for non-agent roles.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Rate limiter: allow all requests
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 60000 }),
}));

vi.mock("@/lib/sessions", () => ({
  createSession: vi.fn().mockResolvedValue("bootstrap-session-token"),
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

vi.mock("@/lib/firebase", () => ({
  isFirebaseEnabled: vi.fn().mockReturnValue(true),
  verifyFirebasePassword: vi.fn(),
  fbAuth: vi.fn().mockReturnValue({
    listUsers: vi.fn().mockResolvedValue({ users: [] }),
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined),
  }),
}));

import { isFirebaseEnabled, verifyFirebasePassword, fbAuth } from "@/lib/firebase";
import { POST } from "@/app/api/blog/auth/route";

function postReq(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/blog/auth", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body:    JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(isFirebaseEnabled).mockReturnValue(true);

  // Reset the fbAuth mock to a fresh instance each test
  const freshListUsers = vi.fn().mockResolvedValue({ users: [] });
  const freshSetClaims = vi.fn().mockResolvedValue(undefined);
  vi.mocked(fbAuth).mockReturnValue({
    listUsers: freshListUsers,
    setCustomUserClaims: freshSetClaims,
  } as ReturnType<typeof fbAuth>);
});

// ── Bootstrap tests ───────────────────────────────────────────────────────────

describe("Bootstrap: first Firebase login auto-promotion", () => {
  it("first login with no super_admin: calls listUsers, finds none, calls setCustomUserClaims, logs in as super_admin", async () => {
    // User authenticates with role "agent" — triggers bootstrap
    vi.mocked(verifyFirebasePassword).mockResolvedValue({
      uid:   "uid-first",
      email: "first@example.com",
      role:  "agent",
    });

    // fbAuth().listUsers returns no users with super_admin claim
    const authInstance = fbAuth();
    vi.mocked(authInstance.listUsers).mockResolvedValue({ users: [] } as Awaited<ReturnType<typeof authInstance.listUsers>>);

    const res  = await POST(postReq({ username: "first@example.com", password: "password123" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // Should be promoted to super_admin
    expect(body.role).toBe("super_admin");
    expect(body.username).toBe("first@example.com");

    // listUsers must have been called
    expect(authInstance.listUsers).toHaveBeenCalledWith(1000);
    // setCustomUserClaims must have been called with super_admin role
    expect(authInstance.setCustomUserClaims).toHaveBeenCalledWith("uid-first", { role: "super_admin" });
  });

  it("first login when super_admin already exists: calls listUsers, finds one, does NOT call setCustomUserClaims, logs in as agent", async () => {
    // User authenticates with role "agent" — triggers bootstrap check
    vi.mocked(verifyFirebasePassword).mockResolvedValue({
      uid:   "uid-second",
      email: "second@example.com",
      role:  "agent",
    });

    // fbAuth().listUsers returns a user who already has super_admin
    const authInstance = fbAuth();
    vi.mocked(authInstance.listUsers).mockResolvedValue({
      users: [
        {
          uid: "uid-existing-admin",
          customClaims: { role: "super_admin" },
        },
      ],
    } as Awaited<ReturnType<typeof authInstance.listUsers>>);

    const res  = await POST(postReq({ username: "second@example.com", password: "password123" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // Should remain as agent since super_admin already exists
    expect(body.role).toBe("agent");
    expect(body.username).toBe("second@example.com");

    // listUsers must have been called
    expect(authInstance.listUsers).toHaveBeenCalledWith(1000);
    // setCustomUserClaims must NOT have been called
    expect(authInstance.setCustomUserClaims).not.toHaveBeenCalled();
  });

  it("bootstrap skipped when user already has non-agent role (e.g. 'manager'): listUsers never called", async () => {
    // User authenticates with a non-agent role — bootstrap should be skipped
    vi.mocked(verifyFirebasePassword).mockResolvedValue({
      uid:   "uid-manager",
      email: "manager@example.com",
      role:  "manager" as "agent", // cast to satisfy type; real value is "manager"
    });

    const authInstance = fbAuth();

    const res  = await POST(postReq({ username: "manager@example.com", password: "password123" }));
    const body = await res.json() as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // Role should pass through unchanged
    expect(body.role).toBe("manager");
    expect(body.username).toBe("manager@example.com");

    // listUsers must NOT have been called at all
    expect(authInstance.listUsers).not.toHaveBeenCalled();
    // setCustomUserClaims must NOT have been called
    expect(authInstance.setCustomUserClaims).not.toHaveBeenCalled();
  });
});
