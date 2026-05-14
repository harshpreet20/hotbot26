/**
 * Permission engine unit tests
 */
import { describe, it, expect } from "vitest";
import {
  canManageRole,
  getEffectivePermissions,
  ROLE_HIERARCHY,
} from "@/lib/permissions";
import type { Role } from "@/types/dashboard";

const ALL_ROLES = Object.keys(ROLE_HIERARCHY) as Role[];

// ── canManageRole ─────────────────────────────────────────────────────────────

describe("canManageRole", () => {
  it("super_admin can manage ALL roles including super_admin and admin", () => {
    for (const role of ALL_ROLES) {
      expect(canManageRole("super_admin", role)).toBe(true);
    }
  });

  it("admin cannot manage super_admin", () => {
    expect(canManageRole("admin", "super_admin")).toBe(false);
  });

  it("admin cannot manage another admin", () => {
    expect(canManageRole("admin", "admin")).toBe(false);
  });

  it("admin can manage manager", () => {
    expect(canManageRole("admin", "manager")).toBe(true);
  });

  it("admin can manage editor", () => {
    expect(canManageRole("admin", "editor")).toBe(true);
  });

  it("admin can manage contributor", () => {
    expect(canManageRole("admin", "contributor")).toBe(true);
  });

  it("admin can manage agent", () => {
    expect(canManageRole("admin", "agent")).toBe(true);
  });

  it("manager cannot manage ANY role", () => {
    for (const role of ALL_ROLES) {
      expect(canManageRole("manager", role)).toBe(false);
    }
  });

  it("editor cannot manage any role", () => {
    for (const role of ALL_ROLES) {
      expect(canManageRole("editor", role)).toBe(false);
    }
  });

  it("agent cannot manage any role", () => {
    for (const role of ALL_ROLES) {
      expect(canManageRole("agent", role)).toBe(false);
    }
  });
});

// ── getEffectivePermissions ───────────────────────────────────────────────────

describe("getEffectivePermissions", () => {
  it("admin has known capabilities: users:read, users:write, blog:admin, monitoring:read", () => {
    const perms = getEffectivePermissions("admin");
    expect(perms.has("users:read")).toBe(true);
    expect(perms.has("users:write")).toBe(true);
    expect(perms.has("blog:admin")).toBe(true);
    expect(perms.has("monitoring:read")).toBe(true);
  });

  it("editor has blog:write", () => {
    const perms = getEffectivePermissions("editor");
    expect(perms.has("blog:write")).toBe(true);
  });

  it("editor has blog:publish", () => {
    const perms = getEffectivePermissions("editor");
    expect(perms.has("blog:publish")).toBe(true);
  });

  it("editor has blog:read", () => {
    const perms = getEffectivePermissions("editor");
    expect(perms.has("blog:read")).toBe(true);
  });

  it("grants adds extra permissions beyond role defaults", () => {
    const perms = getEffectivePermissions("editor", {
      grants:  ["crm:read"],
      revokes: [],
    });
    expect(perms.has("crm:read")).toBe(true);
    // still has default editor perms
    expect(perms.has("blog:write")).toBe(true);
  });

  it("revokes removes permissions from role defaults", () => {
    const perms = getEffectivePermissions("editor", {
      grants:  [],
      revokes: ["blog:write"],
    });
    expect(perms.has("blog:write")).toBe(false);
    // other defaults still present
    expect(perms.has("blog:read")).toBe(true);
  });

  it("revoke wins when same permission appears in both grants and revokes", () => {
    const perms = getEffectivePermissions("editor", {
      grants:  ["crm:admin"],
      revokes: ["crm:admin"],
    });
    // grant first, then revoke — revoke wins because it runs after
    expect(perms.has("crm:admin")).toBe(false);
  });

  it("super_admin cannot have permissions revoked", () => {
    const perms = getEffectivePermissions("super_admin", {
      grants:  [],
      revokes: ["blog:read"],
    });
    // super_admin overrides are ignored — still has everything
    expect(perms.has("blog:read")).toBe(true);
  });

  it("returns a Set instance", () => {
    const perms = getEffectivePermissions("agent");
    expect(perms).toBeInstanceOf(Set);
  });

  it("agent default permissions include tickets:read and crm:read", () => {
    const perms = getEffectivePermissions("agent");
    expect(perms.has("tickets:read")).toBe(true);
    expect(perms.has("crm:read")).toBe(true);
  });
});
