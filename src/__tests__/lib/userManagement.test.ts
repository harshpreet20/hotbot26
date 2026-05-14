/**
 * User Management Hierarchy Validator Tests
 */
import { describe, it, expect } from "vitest";
import {
  validateCreate,
  validateRoleChange,
  validateDelete,
} from "@/lib/agents/userManagement";
import type { Role, SessionInfo, UserRecord } from "@/types/dashboard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSession(role: Role, id = `${role}-id`): SessionInfo {
  return { userId: id, username: role, role };
}

function makeUser(role: Role, id = `${role}-user-id`): UserRecord {
  return { id, username: `${role}user`, passwordHash: "$2b$12$hash", role, createdAt: "2026-01-01T00:00:00Z" };
}

const SUPER_ADMIN = makeSession("super_admin", "super-id");
const ADMIN       = makeSession("admin", "admin-id");
const MANAGER     = makeSession("manager", "manager-id");

const SUPER_ADMIN_USER = makeUser("super_admin", "super-user-id");
const ADMIN_USER       = makeUser("admin", "admin-user-id");
const EDITOR_USER      = makeUser("editor", "editor-user-id");

// ── validateCreate ────────────────────────────────────────────────────────────

describe("validateCreate", () => {
  it("super_admin can create a user with role admin", () => {
    expect(validateCreate(SUPER_ADMIN, "admin")).toBeNull();
  });

  it("super_admin can create a user with role super_admin", () => {
    expect(validateCreate(SUPER_ADMIN, "super_admin")).toBeNull();
  });

  it("super_admin can create a user with role editor", () => {
    expect(validateCreate(SUPER_ADMIN, "editor")).toBeNull();
  });

  it("admin cannot create a user with role admin", () => {
    const err = validateCreate(ADMIN, "admin");
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });

  it("admin cannot create a user with role super_admin", () => {
    const err = validateCreate(ADMIN, "super_admin");
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });

  it("admin can create a user with role editor", () => {
    expect(validateCreate(ADMIN, "editor")).toBeNull();
  });

  it("admin can create a user with role manager", () => {
    expect(validateCreate(ADMIN, "manager")).toBeNull();
  });

  it("admin can create a user with role contributor", () => {
    expect(validateCreate(ADMIN, "contributor")).toBeNull();
  });

  it("admin can create a user with role agent", () => {
    expect(validateCreate(ADMIN, "agent")).toBeNull();
  });

  it("manager cannot create any users (returns error for editor)", () => {
    const err = validateCreate(MANAGER, "editor");
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });

  it("manager cannot create any users (returns error for agent)", () => {
    const err = validateCreate(MANAGER, "agent");
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });
});

// ── validateRoleChange ────────────────────────────────────────────────────────

describe("validateRoleChange", () => {
  it("super_admin can change admin user's role to manager", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    expect(validateRoleChange(SUPER_ADMIN, ADMIN_USER, "manager", users)).toBeNull();
  });

  it("super_admin can change editor user's role to manager", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    expect(validateRoleChange(SUPER_ADMIN, EDITOR_USER, "manager", users)).toBeNull();
  });

  it("admin cannot change another admin's role (FORBIDDEN)", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    const err = validateRoleChange(ADMIN, ADMIN_USER, "manager", users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });

  it("admin can change editor user's role to manager", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    expect(validateRoleChange(ADMIN, EDITOR_USER, "manager", users)).toBeNull();
  });

  it("admin cannot assign admin role to editor", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    const err = validateRoleChange(ADMIN, EDITOR_USER, "admin", users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });

  it("returns LAST_SUPER_ADMIN error when trying to demote the only super_admin", () => {
    // Only one super_admin in the system
    const users = [SUPER_ADMIN_USER, ADMIN_USER];
    const err = validateRoleChange(SUPER_ADMIN, SUPER_ADMIN_USER, "admin", users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("LAST_SUPER_ADMIN");
  });

  it("allows demoting a super_admin when multiple super_admins exist", () => {
    const secondSuperAdmin = makeUser("super_admin", "super-2-id");
    const users = [SUPER_ADMIN_USER, secondSuperAdmin, ADMIN_USER];
    expect(validateRoleChange(SUPER_ADMIN, SUPER_ADMIN_USER, "admin", users)).toBeNull();
  });

  it("returns LAST_ADMIN error when trying to demote the only admin (no super_admin in users)", () => {
    // The code checks admins = users with role "admin" or "super_admin" — so the system
    // protects when there is only 1 such user total. Here we have exactly 1 admin and
    // no super_admin listed, triggering the protection.
    const users = [ADMIN_USER];
    const err = validateRoleChange(SUPER_ADMIN, ADMIN_USER, "manager", users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("LAST_ADMIN");
  });

  it("allows demoting admin when multiple admins exist", () => {
    const secondAdmin = makeUser("admin", "admin-2-id");
    const users = [SUPER_ADMIN_USER, ADMIN_USER, secondAdmin, EDITOR_USER];
    expect(validateRoleChange(SUPER_ADMIN, ADMIN_USER, "manager", users)).toBeNull();
  });

  it("manager cannot change any role", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    const err = validateRoleChange(MANAGER, EDITOR_USER, "contributor", users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });
});

// ── validateDelete ────────────────────────────────────────────────────────────

describe("validateDelete", () => {
  it("super_admin can delete editor user", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    expect(validateDelete(SUPER_ADMIN, EDITOR_USER, users)).toBeNull();
  });

  it("super_admin can delete admin user when multiple admins exist", () => {
    const secondAdmin = makeUser("admin", "admin-2-id");
    const users = [SUPER_ADMIN_USER, ADMIN_USER, secondAdmin, EDITOR_USER];
    expect(validateDelete(SUPER_ADMIN, ADMIN_USER, users)).toBeNull();
  });

  it("admin cannot delete another admin (FORBIDDEN)", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    const err = validateDelete(ADMIN, ADMIN_USER, users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });

  it("admin can delete editor user", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    expect(validateDelete(ADMIN, EDITOR_USER, users)).toBeNull();
  });

  it("deleting the last super_admin returns LAST_SUPER_ADMIN error", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    const err = validateDelete(SUPER_ADMIN, SUPER_ADMIN_USER, users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("LAST_SUPER_ADMIN");
  });

  it("super_admin can delete one of multiple super_admins", () => {
    const secondSuperAdmin = makeUser("super_admin", "super-2-id");
    const users = [SUPER_ADMIN_USER, secondSuperAdmin, ADMIN_USER, EDITOR_USER];
    expect(validateDelete(SUPER_ADMIN, SUPER_ADMIN_USER, users)).toBeNull();
  });

  it("returns LAST_ADMIN error when deleting the only admin (no super_admin in users list)", () => {
    // The code checks admins = users with role "admin" or "super_admin" — only 1 such
    // user means deletion is blocked.
    const users = [ADMIN_USER];
    const err = validateDelete(SUPER_ADMIN, ADMIN_USER, users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("LAST_ADMIN");
  });

  it("manager cannot delete any user", () => {
    const users = [SUPER_ADMIN_USER, ADMIN_USER, EDITOR_USER];
    const err = validateDelete(MANAGER, EDITOR_USER, users);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("FORBIDDEN");
  });
});
