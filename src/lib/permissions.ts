/**
 * RBAC Permission Engine
 *
 * Role hierarchy:  super_admin > admin > manager > sales/crm_operator/finance > editor > contributor > agent
 * Module access:   blog | crm | invoice | tickets | users | monitoring | team_chat
 * Actions:         read | write | publish | admin
 */
import type { Role, Permission, UserModulePermissions } from "@/types/dashboard";

// ── Role hierarchy (higher = more privileged) ─────────────────────────────────

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin:  100,
  admin:         80,
  manager:       60,
  sales:         40,
  crm_operator:  35,
  finance:       35,
  editor:        30,
  contributor:   20,
  agent:         10,
};

/** Returns true if actorRole outranks or equals targetRole in the hierarchy. */
export function roleOutranks(actorRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/** Returns true if actor can create/modify/delete a user with targetRole. */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  // super_admin can manage everyone
  if (actorRole === "super_admin") return true;
  // admin can manage everyone except super_admin and other admins
  if (actorRole === "admin") return targetRole !== "super_admin" && targetRole !== "admin";
  // No one else can manage users
  return false;
}

/** Returns true if actor can assign targetRole to another user. */
export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  return canManageRole(actorRole, targetRole);
}

// ── Default permissions per role ──────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  "blog:read", "blog:write", "blog:publish", "blog:admin",
  "crm:read", "crm:write", "crm:publish", "crm:admin",
  "invoice:read", "invoice:write", "invoice:publish", "invoice:admin",
  "tickets:read", "tickets:write", "tickets:publish", "tickets:admin",
  "users:read", "users:write", "users:publish", "users:admin",
  "monitoring:read", "monitoring:write", "monitoring:publish", "monitoring:admin",
  "team_chat:read", "team_chat:write", "team_chat:publish", "team_chat:admin",
];

export const ROLE_DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL_PERMISSIONS,

  admin: [
    "blog:read", "blog:write", "blog:publish", "blog:admin",
    "crm:read", "crm:write", "crm:admin",
    "invoice:read", "invoice:write", "invoice:admin",
    "tickets:read", "tickets:write", "tickets:admin",
    "users:read", "users:write",
    "monitoring:read",
    "team_chat:read", "team_chat:write",
  ],

  manager: [
    "crm:read", "crm:write",
    "invoice:read",
    "tickets:read",
    "users:read",
    "team_chat:read", "team_chat:write",
  ],

  sales: [
    "crm:read", "crm:write",
    "invoice:read",
    "tickets:read",
    "team_chat:read", "team_chat:write",
  ],

  crm_operator: [
    "crm:read", "crm:write",
    "tickets:read", "tickets:write",
    "team_chat:read",
  ],

  finance: [
    "invoice:read", "invoice:write", "invoice:admin",
    "crm:read",
    "team_chat:read",
  ],

  editor: [
    "blog:read", "blog:write", "blog:publish",
    "team_chat:read", "team_chat:write",
  ],

  contributor: [
    "blog:read", "blog:write",
    "team_chat:read",
  ],

  agent: [
    "tickets:read",
    "crm:read",
    "team_chat:read",
  ],
};

// ── Permission resolution ─────────────────────────────────────────────────────

/**
 * Returns the effective permissions for a user, merging role defaults
 * with any per-user grants/revokes stored in the database.
 */
export function getEffectivePermissions(
  role: Role,
  overrides?: Pick<UserModulePermissions, "grants" | "revokes"> | null,
): Set<Permission> {
  const base = new Set<Permission>(ROLE_DEFAULT_PERMISSIONS[role] ?? []);
  // super_admin overrides cannot be revoked
  if (role === "super_admin") return base;
  if (overrides) {
    for (const g of overrides.grants)  base.add(g);
    for (const r of overrides.revokes) base.delete(r);
  }
  return base;
}

/** Check if a role (optionally with DB overrides) has a specific permission. */
export function hasPermission(
  role: Role,
  permission: Permission,
  overrides?: Pick<UserModulePermissions, "grants" | "revokes"> | null,
): boolean {
  return getEffectivePermissions(role, overrides).has(permission);
}

/** Check if a role has any of the listed permissions. */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[],
  overrides?: Pick<UserModulePermissions, "grants" | "revokes"> | null,
): boolean {
  const effective = getEffectivePermissions(role, overrides);
  return permissions.some((p) => effective.has(p));
}
