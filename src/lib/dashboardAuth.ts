// AUTH TEMPORARILY DISABLED — restore by reverting this file
import { NextRequest } from "next/server";
import type { Role, SessionInfo } from "@/types/dashboard";

const BYPASS_SESSION: SessionInfo = { userId: "bypass", username: "Admin", role: "super_admin" };

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("backdrop_auth")?.value;
  if (cookie) return cookie;
  return req.nextUrl.searchParams.get("secret");
}

export async function authorizeRole(_token: string | null | undefined, ..._allowed: Role[]): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}

export async function authorizeAny(_token: string | null | undefined): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}

export async function authorizeSuperAdmin(_token: string | null | undefined): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}

export async function authorizeAdmin(_token: string | null | undefined): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}

export async function authorizeData(_token: string | null | undefined): Promise<boolean> {
  return true;
}

export async function isAuthorized(_secret: string | null | undefined): Promise<boolean> {
  return true;
}

export async function authorizeBlogPublish(_token: string | null | undefined): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}

export async function authorizeBlogDraft(_token: string | null | undefined): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}

export async function authorizeUserRead(_token: string | null | undefined): Promise<SessionInfo | null> {
  return BYPASS_SESSION;
}
