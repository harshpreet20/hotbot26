/**
 * Unit tests — src/lib/sessions.ts
 * Session token creation, lookup, deletion, and expiry pruning
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the store so no disk I/O happens
vi.mock("@/lib/store", () => ({
  readAll: vi.fn(),
  writeAll: vi.fn(),
}));

import { readAll, writeAll } from "@/lib/store";
import { createSession, getSession, deleteSession } from "@/lib/sessions";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function futureIso(msFromNow: number) {
  return new Date(Date.now() + msFromNow).toISOString();
}
function pastIso(msAgo: number) {
  return new Date(Date.now() - msAgo).toISOString();
}

function makeSession(overrides: Partial<{
  token: string; userId: string; username: string; role: string; expiresAt: string;
}> = {}) {
  return {
    token:     overrides.token     ?? "valid-token-abc",
    userId:    overrides.userId    ?? "user-1",
    username:  overrides.username  ?? "admin",
    role:      overrides.role      ?? "admin",
    createdAt: new Date().toISOString(),
    expiresAt: overrides.expiresAt ?? futureIso(THIRTY_DAYS),
  };
}

beforeEach(() => {
  vi.mocked(readAll).mockReturnValue([]);
  vi.mocked(writeAll).mockReturnValue(undefined);
});

// ── createSession ─────────────────────────────────────────────────────────────

describe("createSession()", () => {
  it("returns an 80-character hex token", () => {
    vi.mocked(readAll).mockReturnValue([]);
    const token = createSession("user-1", "admin", "admin");
    expect(token).toMatch(/^[0-9a-f]{80}$/);
  });

  it("writes the new session to the store", () => {
    vi.mocked(readAll).mockReturnValue([]);
    const token = createSession("user-1", "admin", "admin");
    expect(writeAll).toHaveBeenCalledOnce();
    const [, sessions] = vi.mocked(writeAll).mock.calls[0] as [string, unknown[]];
    const last = sessions[sessions.length - 1] as { token: string; role: string };
    expect(last.token).toBe(token);
    expect(last.role).toBe("admin");
  });

  it("prunes expired sessions before writing", () => {
    const expired = makeSession({ token: "expired", expiresAt: pastIso(1000) });
    const active  = makeSession({ token: "active",  expiresAt: futureIso(THIRTY_DAYS) });
    vi.mocked(readAll).mockReturnValue([expired, active]);
    createSession("u2", "manager", "manager");
    const [, sessions] = vi.mocked(writeAll).mock.calls[0] as [string, unknown[]];
    const tokens = (sessions as { token: string }[]).map((s) => s.token);
    expect(tokens).not.toContain("expired");
    expect(tokens).toContain("active");
  });

  it("sets expiresAt ~30 days from now", () => {
    vi.mocked(readAll).mockReturnValue([]);
    createSession("u1", "admin", "admin");
    const [, sessions] = vi.mocked(writeAll).mock.calls[0] as [string, unknown[]];
    const session = (sessions as { expiresAt: string }[]).slice(-1)[0];
    const diff = new Date(session.expiresAt).getTime() - Date.now();
    expect(diff).toBeGreaterThan(THIRTY_DAYS - 5000);
    expect(diff).toBeLessThanOrEqual(THIRTY_DAYS + 5000);
  });

  it("generates unique tokens for concurrent sessions", () => {
    vi.mocked(readAll).mockReturnValue([]);
    const tokens = new Set(
      Array.from({ length: 20 }, () => createSession("u1", "admin", "admin"))
    );
    expect(tokens.size).toBe(20);
  });
});

// ── getSession ────────────────────────────────────────────────────────────────

describe("getSession()", () => {
  it("returns SessionInfo for a valid, non-expired token", () => {
    const s = makeSession({ token: "good-token", userId: "uid-1", username: "alice", role: "manager" });
    vi.mocked(readAll).mockReturnValue([s]);
    const result = getSession("good-token");
    expect(result).toEqual({ userId: "uid-1", username: "alice", role: "manager" });
  });

  it("returns null for an unknown token", () => {
    vi.mocked(readAll).mockReturnValue([makeSession({ token: "other" })]);
    expect(getSession("unknown-token")).toBeNull();
  });

  it("returns null for an expired session", () => {
    const expired = makeSession({ token: "old", expiresAt: pastIso(1000) });
    vi.mocked(readAll).mockReturnValue([expired]);
    expect(getSession("old")).toBeNull();
  });

  it("returns null for empty string token", () => {
    vi.mocked(readAll).mockReturnValue([makeSession()]);
    expect(getSession("")).toBeNull();
  });

  it("returns null when store is empty", () => {
    vi.mocked(readAll).mockReturnValue([]);
    expect(getSession("any-token")).toBeNull();
  });

  it("only returns active sessions when mixed with expired ones", () => {
    const expired = makeSession({ token: "exp", expiresAt: pastIso(1) });
    const active  = makeSession({ token: "act", username: "bob" });
    vi.mocked(readAll).mockReturnValue([expired, active]);
    expect(getSession("exp")).toBeNull();
    const r = getSession("act");
    expect(r?.username).toBe("bob");
  });
});

// ── deleteSession ─────────────────────────────────────────────────────────────

describe("deleteSession()", () => {
  it("removes the matching session from the store", () => {
    const s1 = makeSession({ token: "keep-me" });
    const s2 = makeSession({ token: "delete-me" });
    vi.mocked(readAll).mockReturnValue([s1, s2]);
    deleteSession("delete-me");
    const [, sessions] = vi.mocked(writeAll).mock.calls[0] as [string, { token: string }[]];
    const tokens = sessions.map((s) => s.token);
    expect(tokens).toContain("keep-me");
    expect(tokens).not.toContain("delete-me");
  });

  it("is a no-op when token does not exist", () => {
    const s = makeSession({ token: "the-only-one" });
    vi.mocked(readAll).mockReturnValue([s]);
    deleteSession("nonexistent");
    const [, sessions] = vi.mocked(writeAll).mock.calls[0] as [string, { token: string }[]];
    expect(sessions).toHaveLength(1);
  });

  it("also prunes expired sessions when deleting", () => {
    const expired = makeSession({ token: "exp", expiresAt: pastIso(1) });
    const active  = makeSession({ token: "act" });
    vi.mocked(readAll).mockReturnValue([expired, active]);
    deleteSession("act");
    const [, sessions] = vi.mocked(writeAll).mock.calls[0] as [string, { token: string }[]];
    expect(sessions.map((s: { token: string }) => s.token)).toEqual([]);
  });
});
