/**
 * User Management Agent - Role hierarchy enforcement for user CRUD.
 *
 * Rules:
 *  - super_admin can manage everyone
 *  - admin can manage all roles except super_admin and other admins
 *  - No one below admin can manage users
 *  - Cannot demote/delete the last super_admin or last admin
 */
import { canManageRole, canAssignRole, ROLE_HIERARCHY } from "@/lib/permissions";
import type { Role, SessionInfo, UserRecord } from "@/types/dashboard";

export interface HierarchyError {
  code: "FORBIDDEN" | "LAST_ADMIN" | "LAST_SUPER_ADMIN" | "CANNOT_SELF_DEMOTE";
  message: string;
}

/** Validate that actor can create a user with the given role. */
export function validateCreate(
  actor: SessionInfo,
  targetRole: Role,
): HierarchyError | null {
  if (!canAssignRole(actor.role as Role, targetRole)) {
    return {
      code: "FORBIDDEN",
      message: `Your role (${actor.role}) cannot create users with role "${targetRole}".`,
    };
  }
  return null;
}

/** Validate that actor can change targetUser's role to newRole. */
export function validateRoleChange(
  actor: SessionInfo,
  targetUser: UserRecord,
  newRole: Role,
  allUsers: UserRecord[],
): HierarchyError | null {
  // Cannot manage users at or above actor's level (unless super_admin)
  if (!canManageRole(actor.role as Role, targetUser.role as Role)) {
    return {
      code: "FORBIDDEN",
      message: `You cannot manage a user with role "${targetUser.role}".`,
    };
  }
  // Cannot assign a role higher than or equal to actor's own role
  if (!canAssignRole(actor.role as Role, newRole)) {
    return {
      code: "FORBIDDEN",
      message: `You cannot assign role "${newRole}".`,
    };
  }
  // Protect last super_admin
  if (targetUser.role === "super_admin" && newRole !== "super_admin") {
    const superAdmins = allUsers.filter((u) => u.role === "super_admin");
    if (superAdmins.length <= 1) {
      return { code: "LAST_SUPER_ADMIN", message: "Cannot demote the only super admin." };
    }
  }
  // Protect last admin
  if (targetUser.role === "admin" && newRole !== "admin" && newRole !== "super_admin") {
    const admins = allUsers.filter((u) => u.role === "admin" || u.role === "super_admin");
    if (admins.length <= 1) {
      return { code: "LAST_ADMIN", message: "Cannot demote the only admin account." };
    }
  }
  return null;
}

/** Validate that actor can delete targetUser. */
export function validateDelete(
  actor: SessionInfo,
  targetUser: UserRecord,
  allUsers: UserRecord[],
): HierarchyError | null {
  if (!canManageRole(actor.role as Role, targetUser.role as Role)) {
    return {
      code: "FORBIDDEN",
      message: `You cannot delete a user with role "${targetUser.role}".`,
    };
  }
  // Protect last super_admin
  if (targetUser.role === "super_admin") {
    const superAdmins = allUsers.filter((u) => u.role === "super_admin");
    if (superAdmins.length <= 1) {
      return { code: "LAST_SUPER_ADMIN", message: "Cannot delete the only super admin." };
    }
  }
  // Protect last admin-or-above
  if (targetUser.role === "admin") {
    const admins = allUsers.filter((u) => u.role === "admin" || u.role === "super_admin");
    if (admins.length <= 1) {
      return { code: "LAST_ADMIN", message: "Cannot delete the only admin account." };
    }
  }
  return null;
}

/** Roles that any given actor is allowed to create/assign. */
export function assignableRoles(actorRole: Role): Role[] {
  return (Object.keys(ROLE_HIERARCHY) as Role[]).filter(
    (r) => canAssignRole(actorRole, r),
  );
}
