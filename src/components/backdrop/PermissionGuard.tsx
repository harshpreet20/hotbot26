"use client";
/**
 * PermissionGuard - Client-side permission gate.
 *
 * Reads effective permissions from sessionStorage (set by the login flow
 * via /api/blog/users/permissions?me=1) and hides children when the user
 * lacks the required permission.
 *
 * Usage:
 *   <PermissionGuard require="invoice:read">
 *     <InvoiceModule />
 *   </PermissionGuard>
 *
 *   <PermissionGuard requireAny={["crm:read", "crm:write"]} fallback={<p>No access</p>}>
 *     <CRMModule />
 *   </PermissionGuard>
 */
import { useEffect, useState, ReactNode } from "react";
import type { Permission, Role } from "@/types/dashboard";
import { ROLE_DEFAULT_PERMISSIONS } from "@/lib/permissions";

function getSessionPermissions(): Set<Permission> | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("backdrop_permissions");
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw) as Permission[];
    return new Set(arr);
  } catch {
    return null;
  }
}

function getRoleFromStorage(): Role | null {
  if (typeof window === "undefined") return null;
  return (sessionStorage.getItem("backdrop_role") as Role) ?? null;
}

function resolvePermissions(): Set<Permission> {
  const stored = getSessionPermissions();
  if (stored) return stored;
  // Fallback: derive from role
  const role = getRoleFromStorage();
  if (role) return new Set(ROLE_DEFAULT_PERMISSIONS[role] ?? []);
  return new Set();
}

interface PermissionGuardProps {
  children: ReactNode;
  /** Require this exact permission. */
  require?: Permission;
  /** Require at least one of these permissions. */
  requireAny?: Permission[];
  /** Require all of these permissions. */
  requireAll?: Permission[];
  /** Shown when access is denied (default: nothing rendered). */
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  require: single,
  requireAny,
  requireAll,
  fallback = null,
}: PermissionGuardProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const perms = resolvePermissions();
    if (single) {
      setAllowed(perms.has(single));
    } else if (requireAny) {
      setAllowed(requireAny.some((p) => perms.has(p)));
    } else if (requireAll) {
      setAllowed(requireAll.every((p) => perms.has(p)));
    } else {
      setAllowed(true);
    }
  }, [single, requireAny, requireAll]);

  if (allowed === null) return null; // loading
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

/** Hook: check a permission client-side. Returns null while hydrating. */
export function usePermission(permission: Permission): boolean | null {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    setAllowed(resolvePermissions().has(permission));
  }, [permission]);
  return allowed;
}

/** Hook: returns all effective permissions for the current session. */
export function usePermissions(): Set<Permission> | null {
  const [perms, setPerms] = useState<Set<Permission> | null>(null);
  useEffect(() => {
    setPerms(resolvePermissions());
  }, []);
  return perms;
}
