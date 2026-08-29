/**
 * Unit tests - src/lib/sessions.ts
 * Session token creation, lookup, deletion, and expiry pruning
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the store so no disk I/O happens
vi.mock("@/lib/fsStore", () => ({
  _fsRead:  vi.fn(),
  _fsWrite: vi.fn(),
}));

import { _fsRead, _fsWrite } from "@/lib/fsStore";
import { createSession, getSession, deleteSession } from "@/lib/sessions";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function futureIso(msFromNow: number) {
  return new Date(Date.now() + msFromNow).toISOString();
}
function pastIso(msAgo: number) {
  return new Date(Date.now() - msAgo).toISOString();
}

function makeSession(overrides: Partial<{
  token: string; user_id: string; username: string; role: string;
  expires_at: string; last_access_at: string;
}> = {}) {
  return {
    token:          overrides.token          ?? "valid-token-abc",
    user_id:        overrides.user_id        ?? "user-1",
    username:       overrides.username       ?? "admin",
    role:           overrides.role           ?? "admin",
    created_at:     new Date().toISOString(),
    expires_at:     overrides.expires_at     ?? futureIso(THIRTY_DAYS),
    last_access_at: overrides.last_access_at ?? new Date().toISOString(),
  };
}

beforeEach(() => {
  vi.mocked(_fsRead).mockReturnValue([]);
  vi.mocked(_fsWrite).mockReturnValue(undefined);
});

// ── createSession ─────────────────────────────────────────────────────────────

describe("createSession()", () => {
  it("returns an 80-character hex token", async () => {
    vi.mocked(_fsRead).mockReturnValue([]);
    const token = await createSession("user-1", "admin", "admin");
    expect(token).toMatch(/^[0-9a-f]{80}$/);
  });

  it("writes the new session to the store", async () => {
    vi.mocked(_fsRead).mockReturnValue([]);
    const token = await createSession("user-1", "admin", "admin");
    expect(_fsWrite).toHaveBeenCalledOnce();
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, unknown[]];
    const last = sessions[sessions.length - 1] as { token: string; role: string };
    expect(last.token).toBe(token);
    expect(last.role).toBe("admin");
  });

  it("prunes expired sessions before writing", async () => {
    const expired = makeSession({ token: "expired", expires_at: pastIso(1000) });
    const active  = makeSession({ token: "active",  expires_at: futureIso(THIRTY_DAYS) });
    vi.mocked(_fsRead).mockReturnValue([expired, active]);
    await createSession("u2", "manager", "manager");
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, unknown[]];
    const tokens = (sessions as { token: string }[]).map((s) => s.token);
    expect(tokens).not.toContain("expired");
    expect(tokens).toContain("active");
  });

  it("sets expires_at ~30 days from now", async () => {
    vi.mocked(_fsRead).mockReturnValue([]);
    await createSession("u1", "admin", "admin");
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, unknown[]];
    const session = (sessions as { expires_at: string }[]).slice(-1)[0];
    const diff = new Date(session.expires_at).getTime() - Date.now();
    expect(diff).toBeGreaterThan(THIRTY_DAYS - 5000);
    expect(diff).toBeLessThanOrEqual(THIRTY_DAYS + 5000);
  });

  it("generates unique tokens for concurrent sessions", async () => {
    vi.mocked(_fsRead).mockReturnValue([]);
    const tokens = new Set(
      await Promise.all(Array.from({ length: 20 }, () => createSession("u1", "admin", "admin")))
    );
    expect(tokens.size).toBe(20);
  });
});

// ── getSession ────────────────────────────────────────────────────────────────

describe("getSession()", () => {
  it("returns SessionInfo for a valid, non-expired token", async () => {
    const s = makeSession({ token: "good-token", user_id: "uid-1", username: "alice", role: "manager" });
    vi.mocked(_fsRead).mockReturnValue([s]);
    const result = await getSession("good-token");
    expect(result).toEqual({ userId: "uid-1", username: "alice", role: "manager" });
  });

  it("returns null for an unknown token", async () => {
    vi.mocked(_fsRead).mockReturnValue([makeSession({ token: "other" })]);
    expect(await getSession("unknown-token")).toBeNull();
  });

  it("returns null for an expired session", async () => {
    const expired = makeSession({ token: "old", expires_at: pastIso(1000) });
    vi.mocked(_fsRead).mockReturnValue([expired]);
    expect(await getSession("old")).toBeNull();
  });

  it("returns null for empty string token", async () => {
    vi.mocked(_fsRead).mockReturnValue([makeSession()]);
    expect(await getSession("")).toBeNull();
  });

  it("returns null when store is empty", async () => {
    vi.mocked(_fsRead).mockReturnValue([]);
    expect(await getSession("any-token")).toBeNull();
  });

  it("only returns active sessions when mixed with expired ones", async () => {
    const expired = makeSession({ token: "exp", expires_at: pastIso(1) });
    const active  = makeSession({ token: "act", username: "bob" });
    vi.mocked(_fsRead).mockReturnValue([expired, active]);
    expect(await getSession("exp")).toBeNull();
    const r = await getSession("act");
    expect(r?.username).toBe("bob");
  });
});

// ── deleteSession ─────────────────────────────────────────────────────────────

describe("deleteSession()", () => {
  it("removes the matching session from the store", async () => {
    const s1 = makeSession({ token: "keep-me" });
    const s2 = makeSession({ token: "delete-me" });
    vi.mocked(_fsRead).mockReturnValue([s1, s2]);
    await deleteSession("delete-me");
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { token: string }[]];
    const tokens = sessions.map((s) => s.token);
    expect(tokens).toContain("keep-me");
    expect(tokens).not.toContain("delete-me");
  });

  it("is a no-op when token does not exist", async () => {
    const s = makeSession({ token: "the-only-one" });
    vi.mocked(_fsRead).mockReturnValue([s]);
    await deleteSession("nonexistent");
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { token: string }[]];
    expect(sessions).toHaveLength(1);
  });

  it("also prunes expired sessions when deleting", async () => {
    const expired = makeSession({ token: "exp", expires_at: pastIso(1) });
    const active  = makeSession({ token: "act" });
    vi.mocked(_fsRead).mockReturnValue([expired, active]);
    await deleteSession("act");
    const [, sessions] = vi.mocked(_fsWrite).mock.calls[0] as [string, { token: string }[]];
    expect(sessions.map((s: { token: string }) => s.token)).toEqual([]);
  });
});
