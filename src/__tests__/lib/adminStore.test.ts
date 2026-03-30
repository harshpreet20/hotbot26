/**
 * Unit tests — src/lib/adminStore.ts
 * Admin credential storage, setup detection, env-var fallback, legacy migration
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

vi.mock("fs");

// Force fresh import of adminStore for each test group
async function getAdminStore() {
  vi.resetModules();
  return import("@/lib/adminStore");
}

function adminStoreJson(overrides = {}) {
  return JSON.stringify({
    publishSecret: "pub-secret-abc",
    users: [{
      id:           "user-1",
      username:     "admin",
      passwordHash: "$2b$12$hashedpassword",
      role:         "admin",
      createdAt:    new Date().toISOString(),
    }],
    ...overrides,
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  // Remove any env vars set in previous tests
  delete process.env.BLOG_ADMIN_PASSWORD_HASH;
  delete process.env.BLOG_PUBLISH_SECRET;
  delete process.env.BLOG_ADMIN_USERNAME;
});

// ── readAdminStore ────────────────────────────────────────────────────────────

describe("readAdminStore()", () => {
  it("returns parsed admin store from valid file", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(adminStoreJson());
    const { readAdminStore } = await getAdminStore();
    const result = readAdminStore();
    expect(result).not.toBeNull();
    expect(result!.users).toHaveLength(1);
    expect(result!.users[0].username).toBe("admin");
    expect(result!.publishSecret).toBe("pub-secret-abc");
  });

  it("returns null when file does not exist", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("ENOENT"); });
    const { readAdminStore } = await getAdminStore();
    expect(readAdminStore()).toBeNull();
  });

  it("returns null when JSON is malformed", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue("not-json{{");
    const { readAdminStore } = await getAdminStore();
    expect(readAdminStore()).toBeNull();
  });

  it("migrates legacy single-admin format to multi-user format", async () => {
    const legacy = JSON.stringify({
      username:     "oldadmin",
      passwordHash: "$2b$12$legacyhash",
      publishSecret: "legacy-secret",
      createdAt:    new Date().toISOString(),
    });
    vi.mocked(fs.readFileSync).mockReturnValue(legacy);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const { readAdminStore } = await getAdminStore();
    const result = readAdminStore();
    expect(result).not.toBeNull();
    expect(result!.users).toHaveLength(1);
    expect(result!.users[0].username).toBe("oldadmin");
    expect(result!.users[0].role).toBe("admin");
    expect(result!.publishSecret).toBe("legacy-secret");
    // Should persist the migrated format
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("generates random publishSecret during legacy migration if missing", async () => {
    const legacy = JSON.stringify({
      username:     "admin",
      passwordHash: "$2b$12$hash",
      publishSecret: "",
      createdAt:    new Date().toISOString(),
    });
    vi.mocked(fs.readFileSync).mockReturnValue(legacy);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const { readAdminStore } = await getAdminStore();
    const result = readAdminStore();
    expect(result!.publishSecret).toBeTruthy();
    expect(result!.publishSecret.length).toBeGreaterThan(10);
  });
});

// ── writeAdminStore ───────────────────────────────────────────────────────────

describe("writeAdminStore()", () => {
  it("writes store to file with restricted permissions", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const { writeAdminStore } = await getAdminStore();
    writeAdminStore({ publishSecret: "s", users: [] });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(".json"),
      expect.stringContaining('"publishSecret"'),
      expect.objectContaining({ mode: 0o600 }),
    );
  });

  it("creates directory if it does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const { writeAdminStore } = await getAdminStore();
    writeAdminStore({ publishSecret: "s", users: [] });
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});

// ── isSetupNeeded ─────────────────────────────────────────────────────────────

describe("isSetupNeeded()", () => {
  it("returns false when admin file has users", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(adminStoreJson());
    const { isSetupNeeded } = await getAdminStore();
    expect(await isSetupNeeded()).toBe(false);
  });

  it("returns true when admin file is missing and no env vars set", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("ENOENT"); });
    const { isSetupNeeded } = await getAdminStore();
    expect(await isSetupNeeded()).toBe(true);
  });

  it("returns false when admin file is missing BUT env vars are set", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("ENOENT"); });
    process.env.BLOG_ADMIN_PASSWORD_HASH = "$2b$12$hashvalue";
    process.env.BLOG_PUBLISH_SECRET      = "my-publish-secret";
    const { isSetupNeeded } = await getAdminStore();
    expect(await isSetupNeeded()).toBe(false);
  });

  it("returns true when admin file exists but has no users", async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ publishSecret: "s", users: [] })
    );
    const { isSetupNeeded } = await getAdminStore();
    expect(await isSetupNeeded()).toBe(true);
  });

  it("requires BOTH env vars to be set (not just one)", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("ENOENT"); });
    process.env.BLOG_ADMIN_PASSWORD_HASH = "$2b$12$hashvalue";
    // BLOG_PUBLISH_SECRET not set
    const { isSetupNeeded } = await getAdminStore();
    expect(await isSetupNeeded()).toBe(true);
  });
});

// ── getPublishSecret ──────────────────────────────────────────────────────────

describe("getPublishSecret()", () => {
  it("returns publishSecret from env var", async () => {
    process.env.BLOG_PUBLISH_SECRET = "pub-secret-abc";
    const { getPublishSecret } = await getAdminStore();
    expect(getPublishSecret()).toBe("pub-secret-abc");
  });

  it("returns env var secret", async () => {
    process.env.BLOG_PUBLISH_SECRET = "env-secret-xyz";
    const { getPublishSecret } = await getAdminStore();
    expect(getPublishSecret()).toBe("env-secret-xyz");
  });

  it("returns null when no secret is available anywhere", async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error("ENOENT"); });
    const { getPublishSecret } = await getAdminStore();
    expect(getPublishSecret()).toBeNull();
  });
});

// ── getEnvFallbackUser ────────────────────────────────────────────────────────

describe("getEnvFallbackUser()", () => {
  it("returns fallback user when both env vars are set", async () => {
    process.env.BLOG_ADMIN_PASSWORD_HASH = "$2b$12$somehashedvalue";
    process.env.BLOG_PUBLISH_SECRET      = "my-secret";
    process.env.BLOG_ADMIN_USERNAME      = "superadmin";
    const { getEnvFallbackUser } = await getAdminStore();
    const user = getEnvFallbackUser();
    expect(user).not.toBeNull();
    expect(user!.username).toBe("superadmin");
    expect(user!.role).toBe("admin");
    expect(user!.passwordHash).toBe("$2b$12$somehashedvalue");
    expect(user!.id).toBe("env-user");
  });

  it("defaults username to 'admin' when BLOG_ADMIN_USERNAME not set", async () => {
    process.env.BLOG_ADMIN_PASSWORD_HASH = "$2b$12$hash";
    process.env.BLOG_PUBLISH_SECRET      = "secret";
    const { getEnvFallbackUser } = await getAdminStore();
    const user = getEnvFallbackUser();
    expect(user!.username).toBe("admin");
  });

  it("returns null when BLOG_ADMIN_PASSWORD_HASH is missing", async () => {
    process.env.BLOG_PUBLISH_SECRET = "secret";
    const { getEnvFallbackUser } = await getAdminStore();
    expect(getEnvFallbackUser()).toBeNull();
  });

  it("returns null when BLOG_PUBLISH_SECRET is missing", async () => {
    process.env.BLOG_ADMIN_PASSWORD_HASH = "$2b$12$hash";
    const { getEnvFallbackUser } = await getAdminStore();
    expect(getEnvFallbackUser()).toBeNull();
  });

  it("returns null when neither env var is set", async () => {
    const { getEnvFallbackUser } = await getAdminStore();
    expect(getEnvFallbackUser()).toBeNull();
  });
});
