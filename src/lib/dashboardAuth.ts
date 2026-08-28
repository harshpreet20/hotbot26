/**
 * Centralised async auth helpers for all API routes.
 *
 * Two valid credential forms:
 *  1. Per-user session token  (issued by /api/blog/auth on login)
 *  2. Static publish secret   (env var - for legacy & external tools / N8N)
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

/**
 * Resolves a SessionInfo from a request, preferring the Auth.js JWT session
 * over the legacy cookie/bearer token path.  API routes can call this instead
 * of `authorizeAny(extractToken(req))` to transparently support both auth styles.
 */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionInfo | null> {
  // Auth.js JWT session — primary path when AUTH_SECRET is configured.
  // Skipped entirely when the env var is absent so legacy deployments are unaffected.
  if (process.env.AUTH_SECRET) {
    try {
      const { auth } = await import("@/auth");
      const jwtSession = await auth();
      if (jwtSession?.user?.id) {
        return {
          userId:   jwtSession.user.id,
          username: jwtSession.user.username ?? jwtSession.user.email ?? "",
          role:     (jwtSession.user.role as Role) ?? "agent",
        };
      }
    } catch { /* AUTH_SECRET set but auth() failed — fall through */ }
  }

  // Legacy path: bearer token / backdrop_auth cookie / ?secret query param
  return authorizeAny(extractToken(req));
}

/** Extract token from a Next.js request. */
export function extractToken(req: NextRequest): string | null {
  // Bearer token only if non-empty — an empty Bearer ("Bearer ") falls through to cookie
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const bearer = auth.slice(7).trim();
    if (bearer) return bearer;
  }
  // httpOnly cookie is the primary persistent credential
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
    "super_admin", "admin", "manager", "sales", "crm_operator", "finance",
    "editor", "contributor", "agent"
  );
}

/** Super admin only. */
export async function authorizeSuperAdmin(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(token, "super_admin");
}

/** Admin or super_admin (use for all formerly admin-only routes). */
export async function authorizeAdmin(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(token, "super_admin", "admin");
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
    return ["super_admin", "admin", "manager", "sales", "crm_operator", "finance"].includes(session.role);
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

/** Admin/super_admin and editor roles - blog publish/delete access. */
export async function authorizeBlogPublish(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  if (!token) return null;
  const session = await getSession(token);
  if (!session) return null;
  if (["super_admin", "admin", "editor"].includes(session.role)) return session;
  const ps = getPublishSecret();
  if (ps && token === ps) return { userId: "publish-secret", username: "publish-secret", role: "admin" };
  return null;
}

/** Admin/super_admin, editor, contributor - blog draft access. */
export async function authorizeBlogDraft(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(token, "super_admin", "admin", "editor", "contributor");
}

/** Admin/super_admin (full) or manager (read-only) - user list access. */
export async function authorizeUserRead(
  token: string | null | undefined
): Promise<SessionInfo | null> {
  return authorizeRole(token, "super_admin", "admin", "manager");
}
