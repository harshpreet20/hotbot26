/**
 * Extended unit tests - src/lib/sessions.ts
 * Session lifecycle: isolation, combinations, impersonation, revocation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the store so no disk I/O happens
vi.mock("@/lib/store", () => ({
  _fsRead:  vi.fn(),
  _fsWrite: vi.fn(),
}));

import { _fsRead, _fsWrite } from "@/lib/store";
import {
  createSession,
  getSession,
  deleteSession,
  createImpersonationSession,
  revokeAllSessions,
} from "@/lib/sessions";

const THIRTY_DAYS    = 30 * 24 * 60 * 60 * 1000;
const TWO_HOURS_MS   = 2 * 60 * 60 * 1000;

function futureIso(msFromNow: number) {
  return new Date(Date.now() + msFromNow).toISOString();
}

function makeRawSession(overrides: Partial<{
  token: string; user_id: string; username: string; role: string;
  expires_at: string; last_access_at: string;
  is_impersonating: boolean; original_user_id: string;
  original_username: string; original_role: string;
}> = {}) {
  return {
    token:          overrides.token          ?? "valid-token-abc",
    user_id:        overrides.user_id        ?? "user-1",
    username:       overrides.username       ?? "admin",
    role:           overrides.role           ?? "admin",
    created_at:     new Date().toISOString(),
    expires_at:     overrides.expires_at     ?? futureIso(THIRTY_DAYS),
    last_access_at: overrides.last_access_at ?? new Date().toISOString(),
    ...(overrides.is_impersonating !== undefined && { is_impersonating: overrides.is_impersonating }),
    ...(overrides.original_user_id  !== undefined && { original_user_id:  overrides.original_user_id }),
    ...(overrides.original_username !== undefined && { original_username: overrides.original_username }),
    ...(overrides.original_role     !== undefined && { original_role:     overrides.original_role }),
  };
}

beforeEach(() => {
  vi.mocked(_fsRead).mockReturnValue([]);
  vi.mocked(_fsWrite).mockReturnValue(undefined);
});

// ── createSession ─────────────────────────────────────────────────────────────

describe("createSession() – isolation and storage", () => {
  it("returns a string token", async () => {
    const token = await createSession("user-1", "alice", "admin");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("stores the session (calls _fsWrite with the session data)", async () => {
    const token = await createSession("user-42", "bob", "editor");
    expect(_fsWrite).toHaveBeenCalled();
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { token: string; user_id: string; role: string }[]];
    const stored = sessions.find((s) => s.token === token);
    expect(stored).toBeDefined();
    expect(stored!.user_id).toBe("user-42");
    expect(stored!.role).toBe("editor");
  });
});

// ── getSession ────────────────────────────────────────────────────────────────

describe("getSession() – lookup behaviour", () => {
  it("returns the stored SessionInfo for a known token", async () => {
    const raw = makeRawSession({ token: "tok-1", user_id: "uid-1", username: "charlie", role: "manager" });
    vi.mocked(_fsRead).mockReturnValue([raw]);
    const info = await getSession("tok-1");
    expect(info).not.toBeNull();
    expect(info!.userId).toBe("uid-1");
    expect(info!.username).toBe("charlie");
    expect(info!.role).toBe("manager");
  });

  it("returns null for an unknown token", async () => {
    vi.mocked(_fsRead).mockReturnValue([makeRawSession({ token: "real-token" })]);
    expect(await getSession("unknown-token")).toBeNull();
  });
});

// ── deleteSession ─────────────────────────────────────────────────────────────

describe("deleteSession() – removal", () => {
  it("removes the session so subsequent getSession returns null", async () => {
    const raw = makeRawSession({ token: "to-delete" });

    // First call: provide the session for deletion filtering
    vi.mocked(_fsRead).mockReturnValueOnce([raw]);
    await deleteSession("to-delete");

    // Second call: simulate store is now empty (session was removed)
    vi.mocked(_fsRead).mockReturnValueOnce([]);
    const result = await getSession("to-delete");
    expect(result).toBeNull();
  });

  it("does not throw when token is unknown", async () => {
    vi.mocked(_fsRead).mockReturnValue([makeRawSession({ token: "other" })]);
    await expect(deleteSession("nonexistent-token")).resolves.toBeUndefined();
  });
});

// ── createImpersonationSession ────────────────────────────────────────────────

describe("createImpersonationSession()", () => {
  it("stores session with isImpersonating=true and original user fields set correctly", async () => {
    const impersonator = { userId: "super-1", username: "superuser", role: "super_admin" as const };
    const target       = { userId: "editor-2", username: "editorguy", role: "editor" as const };

    await createImpersonationSession(impersonator, target);

    expect(_fsWrite).toHaveBeenCalled();
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [
      string,
      {
        token: string; is_impersonating: boolean;
        original_user_id: string; original_username: string; original_role: string;
        user_id: string; username: string; role: string;
      }[]
    ];
    const stored = sessions[sessions.length - 1];
    expect(stored.is_impersonating).toBe(true);
    expect(stored.original_user_id).toBe("super-1");
    expect(stored.original_username).toBe("superuser");
    expect(stored.original_role).toBe("super_admin");
    // The session runs as the target user
    expect(stored.user_id).toBe("editor-2");
    expect(stored.username).toBe("editorguy");
    expect(stored.role).toBe("editor");
  });

  it("impersonation session has TTL of approximately 2 hours", async () => {
    const impersonator = { userId: "super-1", username: "superuser", role: "super_admin" as const };
    const target       = { userId: "editor-2", username: "editorguy", role: "editor" as const };

    const before = Date.now();
    await createImpersonationSession(impersonator, target);
    const after = Date.now();

    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { expires_at: string }[]];
    const stored = sessions[sessions.length - 1];
    const expiresAt = new Date(stored.expires_at).getTime();

    // Should be ~2 hours from now (allow a 5-second window)
    expect(expiresAt).toBeGreaterThanOrEqual(before + TWO_HOURS_MS - 5000);
    expect(expiresAt).toBeLessThanOrEqual(after  + TWO_HOURS_MS + 5000);
    // Should NOT be 30 days (ensure it's distinctly shorter)
    expect(expiresAt).toBeLessThan(before + THIRTY_DAYS);
  });

  it("returns a string token", async () => {
    const token = await createImpersonationSession(
      { userId: "sa-1", username: "sa", role: "super_admin" },
      { userId: "ed-1", username: "ed", role: "editor" },
    );
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });
});

// ── revokeAllSessions ─────────────────────────────────────────────────────────

describe("revokeAllSessions()", () => {
  it("deletes all sessions for the specified user but not for others", async () => {
    const s1 = makeRawSession({ token: "tok-a", user_id: "user-target" });
    const s2 = makeRawSession({ token: "tok-b", user_id: "user-target" });
    const s3 = makeRawSession({ token: "tok-c", user_id: "user-other" });
    vi.mocked(_fsRead).mockReturnValue([s1, s2, s3]);

    await revokeAllSessions("user-target");

    expect(_fsWrite).toHaveBeenCalled();
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { token: string; user_id: string }[]];
    const tokens = sessions.map((s) => s.token);
    expect(tokens).not.toContain("tok-a");
    expect(tokens).not.toContain("tok-b");
    expect(tokens).toContain("tok-c");
  });

  it("leaves the store unchanged when the user has no sessions", async () => {
    const s1 = makeRawSession({ token: "tok-x", user_id: "someone-else" });
    vi.mocked(_fsRead).mockReturnValue([s1]);

    await revokeAllSessions("nobody");

    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { token: string }[]];
    expect(sessions.map((s) => s.token)).toContain("tok-x");
  });
});
