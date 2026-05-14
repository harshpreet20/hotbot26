/**
 * Access Control Agent - Central permission validation for all API routes.
 *
 * Resolves: token → session → role defaults + DB overrides → effective permissions.
 * Provides a single `validateAccess()` entry point for all route handlers.
 */
import { getSession } from "@/lib/sessions";
import { readWhere } from "@/lib/store";
import { getEffectivePermissions, hasPermission, hasAnyPermission } from "@/lib/permissions";
import type { Permission, SessionInfo, UserModulePermissions } from "@/types/dashboard";

// Cache overrides in-memory per request (simple map, not LRU)
const overrideCache = new Map<string, { data: UserModulePermissions | null; ts: number }>();
const CACHE_TTL = 30_000; // 30 s

async function fetchOverrides(userId: string): Promise<UserModulePermissions | null> {
  const cached = overrideCache.get(userId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const rows = await readWhere<UserModulePermissions>("user_permissions", "user_id", userId);
  const data = rows[0] ?? null;
  overrideCache.set(userId, { data, ts: Date.now() });
  return data;
}

/** Invalidate cached overrides for a user (call after updating permissions). */
export function invalidatePermissionCache(userId: string): void {
  overrideCache.delete(userId);
}

export interface AccessResult {
  session: SessionInfo;
  permissions: Set<Permission>;
  /** Check a single permission against the effective set. */
  can: (p: Permission) => boolean;
  /** Check if any of the listed permissions are granted. */
  canAny: (...ps: Permission[]) => boolean;
}

/**
 * Validates a request token and checks that the user has the required permission.
 * Returns null on auth failure or insufficient permission.
 */
export async function validateAccess(
  token: string | null | undefined,
  requiredPermission: Permission,
): Promise<AccessResult | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session) return null;

  const overrides = await fetchOverrides(session.userId);
  if (!hasPermission(session.role, requiredPermission, overrides)) return null;

  const perms = getEffectivePermissions(session.role, overrides);
  return {
    session,
    permissions: perms,
    can:    (p) => perms.has(p),
    canAny: (...ps) => ps.some((p) => perms.has(p)),
  };
}

/**
 * Validates token and checks that the user has ANY of the listed permissions.
 * Returns null on auth failure or if none of the permissions are granted.
 */
export async function validateAnyAccess(
  token: string | null | undefined,
  ...requiredPermissions: Permission[]
): Promise<AccessResult | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session) return null;

  const overrides = await fetchOverrides(session.userId);
  if (!hasAnyPermission(session.role, requiredPermissions, overrides)) return null;

  const perms = getEffectivePermissions(session.role, overrides);
  return {
    session,
    permissions: perms,
    can:    (p) => perms.has(p),
    canAny: (...ps) => ps.some((p) => perms.has(p)),
  };
}

/**
 * Returns the full permission set for a token without requiring any specific permission.
 * Returns null if the token is invalid.
 */
export async function resolvePermissions(
  token: string | null | undefined,
): Promise<AccessResult | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session) return null;

  const overrides = await fetchOverrides(session.userId);
  const perms = getEffectivePermissions(session.role, overrides);
  return {
    session,
    permissions: perms,
    can:    (p) => perms.has(p),
    canAny: (...ps) => ps.some((p) => perms.has(p)),
  };
}
