/**
 * Centralised auth helpers for all /api/dashboard/* and /api/blog/* routes.
 *
 * Two valid credential forms:
 *  1. Per-user session token  (issued by /api/blog/auth on login)
 *  2. Static publish secret   (env var / admin.json — for legacy & external tools)
 */
import { getSession } from "@/lib/sessions";
import { getPublishSecret } from "@/lib/adminStore";
import type { Role, SessionInfo } from "@/types/dashboard";

/** Any valid credential (session token or publish secret) */
export function isAuthorized(secret: string | null | undefined): boolean {
  if (!secret) return false;
  if (getSession(secret)) return true;
  const ps = getPublishSecret();
  return !!ps && secret === ps;
}

/**
 * Returns session info if token is a valid session with the required role.
 * Returns null if invalid, expired, or insufficient role.
 */
export function authorizeRole(
  token: string | null | undefined,
  ...allowed: Role[]
): SessionInfo | null {
  if (!token) return null;
  const session = getSession(token);
  if (!session) return null;
  if (!allowed.includes(session.role)) return null;
  return session;
}

/** Any authenticated user regardless of role */
export function authorizeAny(token: string | null | undefined): SessionInfo | null {
  return authorizeRole(token, "admin", "manager", "agent");
}

/**
 * Authorises access to inbound data (leads, contacts, newsletter, callbacks, overview).
 * Accepts admin/manager session tokens, OR the static publish secret.
 */
export function authorizeData(token: string | null | undefined): boolean {
  if (!token) return false;
  const session = getSession(token);
  if (session) return session.role === "admin" || session.role === "manager";
  // Publish secret fallback for external tools
  const ps = getPublishSecret();
  return !!ps && token === ps;
}
