/**
 * Centralised auth helpers for all /api/dashboard/* and /api/blog/* routes.
 *
 * Two valid credential forms:
 *  1. Per-user session token  (issued by /api/blog/auth on login)
 *  2. Static publish secret   (env var / admin.json — for legacy & external tools)
 *
 * Tokens are accepted via:
 *  - Authorization: Bearer <token>  (preferred — never logged in server logs)
 *  - Cookie: backdrop_auth           (set on login for middleware + SSR routes)
 *  - Query param ?secret=            (legacy fallback; kept for N8N compatibility)
 */
import { NextRequest } from "next/server";
import { getSession } from "@/lib/sessions";
import { getPublishSecret } from "@/lib/adminStore";
import type { Role, SessionInfo } from "@/types/dashboard";

/** Extract token from a Next.js request — prefers Authorization header over cookie over query param. */
export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("backdrop_auth")?.value;
  if (cookie) return cookie;
  return req.nextUrl.searchParams.get("secret"); // legacy / N8N fallback
}

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
  return authorizeRole(token, "admin", "manager", "sales", "crm_operator", "finance", "editor", "contributor", "agent");
}

/**
 * Authorises access to inbound data (leads, contacts, newsletter, callbacks, overview).
 * Accepts admin/manager/sales/crm_operator/finance session tokens, OR the static publish secret.
 */
export function authorizeData(token: string | null | undefined): boolean {
  if (!token) return false;
  const session = getSession(token);
  if (session) return ["admin", "manager", "sales", "crm_operator", "finance"].includes(session.role);
  const ps = getPublishSecret();
  return !!ps && token === ps;
}

/**
 * Authorises full blog management (create, edit, publish, delete).
 * Admin and editor roles only.
 */
export function authorizeBlogPublish(token: string | null | undefined): SessionInfo | null {
  if (!token) return null;
  const session = getSession(token);
  if (!session) return null;
  if (session.role === "admin" || session.role === "editor") return session;
  // Also accept static publish secret as admin-equivalent
  const ps = getPublishSecret();
  if (ps && token === ps) return { userId: "publish-secret", username: "publish-secret", role: "admin" };
  return null;
}

/**
 * Authorises blog draft creation/editing (no publish).
 * Admin, editor, and contributor roles.
 */
export function authorizeBlogDraft(token: string | null | undefined): SessionInfo | null {
  return authorizeRole(token, "admin", "editor", "contributor");
}

/**
 * Returns true if the session can READ the user list (admin full control, manager read-only).
 */
export function authorizeUserRead(token: string | null | undefined): SessionInfo | null {
  return authorizeRole(token, "admin", "manager");
}
