/**
 * Impersonation - super_admin only.
 *
 * POST   /api/blog/auth/impersonate  { targetUserId }  – start impersonation
 * DELETE /api/blog/auth/impersonate                    – end impersonation (restore original session)
 */
import { NextRequest, NextResponse } from "next/server";
import { authorizeSuperAdmin } from "@/lib/dashboardAuth";
import { createImpersonationSession, deleteSession, createSession } from "@/lib/sessions";
import { getAllUsers } from "@/lib/adminStore";
import { logAction } from "@/lib/agents/monitoring";
import type { Role } from "@/types/dashboard";

const COOKIE_NAME  = "backdrop_auth";
const COOKIE_MAX_S = 60 * 60 * 2; // 2-hour impersonation window

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    null
  );
}

function setAuthCookie(res: NextResponse, token: string, maxAge = COOKIE_MAX_S) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge,
  });
}

// POST - start impersonation
export async function POST(req: NextRequest) {
  const token   = getToken(req);
  const session = await authorizeSuperAdmin(token);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Cannot impersonate while already impersonating
  if (session.isImpersonating) {
    return NextResponse.json({ error: "End the current impersonation session first." }, { status: 400 });
  }

  let body: { targetUserId?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { targetUserId } = body;
  if (!targetUserId) return NextResponse.json({ error: "targetUserId required." }, { status: 400 });

  const users  = await getAllUsers();
  const target = users.find((u) => u.id === targetUserId);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.role === "super_admin") {
    return NextResponse.json({ error: "Cannot impersonate another super admin." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const impersonationToken = await createImpersonationSession(
    { userId: session.userId, username: session.username, role: session.role as Role },
    { userId: target.id, username: target.username, role: target.role as Role },
  );

  await logAction({
    session,
    action:       "impersonate.start",
    resourceType: "user",
    resourceId:   target.id,
    details:      { targetUsername: target.username, targetRole: target.role },
    ip,
  });

  const res = NextResponse.json({
    success:         true,
    impersonating:   target.username,
    token:           impersonationToken,
    role:            target.role,
    username:        target.username,
    isImpersonating: true,
  });
  setAuthCookie(res, impersonationToken);
  return res;
}

// DELETE - end impersonation and restore original session
export async function DELETE(req: NextRequest) {
  const token   = getToken(req);
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Must be an active impersonation session
  const { getSession } = await import("@/lib/sessions");
  const session = await getSession(token);
  if (!session) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  if (!session.isImpersonating || !session.originalUserId) {
    return NextResponse.json({ error: "Not in an impersonation session." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await logAction({
    session,
    action:       "impersonate.end",
    resourceType: "user",
    resourceId:   session.userId,
    details:      { restoredTo: session.originalUsername },
    ip,
  });

  // Delete impersonation session
  await deleteSession(token);

  // Create a fresh original session
  const restoredToken = await createSession(
    session.originalUserId,
    session.originalUsername!,
    session.originalRole!,
  );

  const res = NextResponse.json({
    success:  true,
    token:    restoredToken,
    role:     session.originalRole,
    username: session.originalUsername,
  });
  setAuthCookie(res, restoredToken, 60 * 60 * 24 * 30);
  return res;
}
