/**
 * Centralised async auth helpers for all API routes.
 *
 * Two valid credential forms:
 *  1. Per-user session token  (issued by /api/blog/auth on login)
 *  2. Static publish secret   (env var — for legacy & external tools / N8N)
 *
 * Tokens are accepted via:
 *  - Authorization: Bearer <token>
 *  - Cookie: backdrop_auth
 *  - Query param ?secret=  (legacy / N8N fallback)
 */
import { NextRequest } from "next/server";
import { getSession } from "@/lib/sessions";
import { getPublishSecret } from "@/lib/adminStore";
import type { Role, SessionInfo } from "@/types/dashboard";

/** Extract token from a Next.js request. */
export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("backdrop_auth")?.value;
  if (cookie) return cookie;
  return req.nextUrl.searchParams.get("secret");
}

/**
 * Returns session info if token is valid and has one of the allowed roles.
 * Returns null if invalid, expired, or insufficient role.
 */
export async function authorizeRole(
  token: string | null | undefined,
  ...allowed: Role[]
): Promise<SessionInfo | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session) return null;
  if (!allowed.includes(session.role)) return null;
  return session;
}

/** Any authenticated user regardless of role. */
export async function authorizeAny(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(
    token,
    "admin", "manager", "sales", "crm_operator", "finance",
    "editor", "contributor", "agent"
  );
}

/**
 * Authorises access to inbound CRM data (leads, contacts, callbacks, overview).
 * Accepts session tokens for data-access roles, OR the static publish secret.
 */
export async function authorizeData(
  token: string | null | undefined
): Promise<boolean> {
  if (!token) return false;
  const session = await getSession(token);
  if (session) {
    return ["admin", "manager", "sales", "crm_operator", "finance"].includes(session.role);
  }
  const ps = getPublishSecret();
  return !!ps && token === ps;
}

/** Any valid credential (session token or publish secret). */
export async function isAuthorized(
  secret: string | null | undefined
): Promise<boolean> {
  if (!secret) return false;
  if (await getSession(secret)) return true;
  const ps = getPublishSecret();
  return !!ps && secret === ps;
}

/** Admin and editor roles — blog publish/delete access. */
export async function authorizeBlogPublish(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session) return null;
  if (session.role === "admin" || session.role === "editor") return session;
  const ps = getPublishSecret();
  if (ps && token === ps) return { userId: "publish-secret", username: "publish-secret", role: "admin" };
  return null;
}

/** Admin, editor, contributor — blog draft access. */
export async function authorizeBlogDraft(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(token, "admin", "editor", "contributor");
}

/** Admin (full) or manager (read-only) — user list access. */
export async function authorizeUserRead(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(token, "admin", "manager");
}
