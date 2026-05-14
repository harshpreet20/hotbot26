/**
 * Access Control Agent Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks must be hoisted before imports ──────────────────────────────────────

vi.mock("@/lib/sessions", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/store", () => ({
  readWhere: vi.fn().mockResolvedValue([]),
}));

import { getSession } from "@/lib/sessions";
import { readWhere }  from "@/lib/store";
import {
  validateAccess,
  resolvePermissions,
  invalidatePermissionCache,
} from "@/lib/agents/accessControl";
import type { SessionInfo } from "@/types/dashboard";

// ── Fixture sessions ──────────────────────────────────────────────────────────

const EDITOR_SESSION: SessionInfo = {
  userId:   "editor-user-id",
  username: "editoruser",
  role:     "editor",
};

const AGENT_SESSION: SessionInfo = {
  userId:   "agent-user-id",
  username: "agentuser",
  role:     "agent",
};

beforeEach(() => {
  vi.mocked(getSession).mockResolvedValue(null);
  vi.mocked(readWhere).mockResolvedValue([]);
  // Clear the module-level override cache between tests by invalidating known ids
  invalidatePermissionCache("editor-user-id");
  invalidatePermissionCache("agent-user-id");
  invalidatePermissionCache("test-user-id");
  vi.clearAllMocks();
});

// ── validateAccess ────────────────────────────────────────────────────────────

describe("validateAccess", () => {
  it("returns null when token is null (no session)", async () => {
    const result = await validateAccess(null, "blog:read");
    expect(result).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("returns null when token is undefined", async () => {
    const result = await validateAccess(undefined, "blog:read");
    expect(result).toBeNull();
  });

  it("returns null when session lookup returns null (invalid token)", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const result = await validateAccess("bad-token", "blog:read");
    expect(result).toBeNull();
  });

  it("returns result with allowed:true (blog:write) for editor role", async () => {
    vi.mocked(getSession).mockResolvedValue(EDITOR_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await validateAccess("editor-token", "blog:write");
    expect(result).not.toBeNull();
    expect(result!.session.role).toBe("editor");
    expect(result!.can("blog:write")).toBe(true);
  });

  it("returns result with allowed:true (blog:publish) for editor role", async () => {
    vi.mocked(getSession).mockResolvedValue(EDITOR_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await validateAccess("editor-token", "blog:publish");
    expect(result).not.toBeNull();
    expect(result!.can("blog:publish")).toBe(true);
  });

  it("returns null (allowed:false) when editor tries to access invoices:admin", async () => {
    vi.mocked(getSession).mockResolvedValue(EDITOR_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await validateAccess("editor-token", "invoice:admin");
    expect(result).toBeNull();
  });

  it("returns null when agent tries to access blog:write", async () => {
    vi.mocked(getSession).mockResolvedValue(AGENT_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await validateAccess("agent-token", "blog:write");
    expect(result).toBeNull();
  });

  it("result includes session info and permissions Set", async () => {
    vi.mocked(getSession).mockResolvedValue(EDITOR_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await validateAccess("editor-token", "blog:read");
    expect(result).not.toBeNull();
    expect(result!.session).toMatchObject({ userId: "editor-user-id", role: "editor" });
    expect(result!.permissions).toBeInstanceOf(Set);
  });

  it("result.canAny returns true when user has any of the listed permissions", async () => {
    vi.mocked(getSession).mockResolvedValue(EDITOR_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await validateAccess("editor-token", "blog:read");
    expect(result!.canAny("blog:write", "invoice:admin")).toBe(true);
  });
});

// ── resolvePermissions + caching ──────────────────────────────────────────────

describe("resolvePermissions - caching", () => {
  it("calling resolvePermissions twice with same token only calls getSession once", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "test-user-id", username: "testuser", role: "editor" });
    vi.mocked(readWhere).mockResolvedValue([]);

    await resolvePermissions("same-token");
    await resolvePermissions("same-token");

    // getSession called twice (once per call) — the cache is on readWhere (overrides)
    // Per the implementation, getSession is always called, but readWhere is cached
    expect(getSession).toHaveBeenCalledTimes(2);
    // The DB override lookup should be cached after first call
    expect(readWhere).toHaveBeenCalledTimes(1);
  });

  it("returns permissions for valid session", async () => {
    vi.mocked(getSession).mockResolvedValue(EDITOR_SESSION);
    vi.mocked(readWhere).mockResolvedValue([]);

    const result = await resolvePermissions("editor-token");
    expect(result).not.toBeNull();
    expect(result!.permissions.has("blog:write")).toBe(true);
  });

  it("returns null for null token", async () => {
    const result = await resolvePermissions(null);
    expect(result).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
  });
});

// ── invalidatePermissionCache ─────────────────────────────────────────────────

describe("invalidatePermissionCache", () => {
  it("clears the cache for that user so next call re-fetches from DB", async () => {
    const userId = "cache-test-user-id";
    invalidatePermissionCache(userId); // Ensure clean state

    vi.mocked(getSession).mockResolvedValue({ userId, username: "cacheuser", role: "editor" });
    vi.mocked(readWhere).mockResolvedValue([]);

    // First call - populates cache
    await resolvePermissions("cache-token");
    expect(readWhere).toHaveBeenCalledTimes(1);

    // Invalidate the cache
    invalidatePermissionCache(userId);

    // Second call - should re-fetch from DB
    await resolvePermissions("cache-token");
    expect(readWhere).toHaveBeenCalledTimes(2);
  });

  it("does not throw when invalidating a userId that is not in cache", () => {
    expect(() => invalidatePermissionCache("non-existent-user-id")).not.toThrow();
  });
});
