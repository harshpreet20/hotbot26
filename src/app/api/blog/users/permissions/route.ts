/**
 * Module-level permission overrides per user.
 *
 * GET  /api/blog/users/permissions?userId=X  – get overrides (admin+)
 * PUT  /api/blog/users/permissions           – set overrides (admin+)
 * GET  /api/blog/users/permissions/me        – caller's own effective perms
 */
import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/dashboardAuth";
import { readWhere, insert, updateById } from "@/lib/store";
import { resolvePermissions, invalidatePermissionCache } from "@/lib/agents/accessControl";
import { ROLE_DEFAULT_PERMISSIONS } from "@/lib/permissions";
import { logAction } from "@/lib/agents/monitoring";
import type { Permission, UserModulePermissions } from "@/types/dashboard";

const ALL_PERMISSIONS: Permission[] = [
  "blog:read", "blog:write", "blog:publish", "blog:admin",
  "crm:read", "crm:write", "crm:publish", "crm:admin",
  "invoice:read", "invoice:write", "invoice:publish", "invoice:admin",
  "tickets:read", "tickets:write", "tickets:publish", "tickets:admin",
  "users:read", "users:write", "users:publish", "users:admin",
  "monitoring:read", "monitoring:write", "monitoring:publish", "monitoring:admin",
  "team_chat:read", "team_chat:write", "team_chat:publish", "team_chat:admin",
];

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get("backdrop_auth")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    null
  );
}

// GET /api/blog/users/permissions?userId=X  → return overrides + effective set
export async function GET(req: NextRequest) {
  const token = getToken(req);
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");

  // "me" query: return own effective permissions (any authenticated user)
  if (searchParams.get("me") === "1" || !targetUserId) {
    const result = await resolvePermissions(token);
    if (!result) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({
      userId:      result.session.userId,
      role:        result.session.role,
      permissions: Array.from(result.permissions),
      defaults:    ROLE_DEFAULT_PERMISSIONS[result.session.role] ?? [],
    });
  }

  // Admin: get another user's overrides
  const session = await authorizeAdmin(token);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await readWhere<UserModulePermissions>("user_permissions", "user_id", targetUserId);
  return NextResponse.json({ overrides: rows[0] ?? null });
}

// PUT /api/blog/users/permissions  → set grants/revokes for a user (admin+)
export async function PUT(req: NextRequest) {
  const token = getToken(req);
  const session = await authorizeAdmin(token);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { userId?: string; grants?: string[]; revokes?: string[] };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { userId, grants = [], revokes = [] } = body;
  if (!userId) return NextResponse.json({ error: "userId required." }, { status: 400 });

  // Validate permission strings
  const invalid = [...grants, ...revokes].filter((p) => !ALL_PERMISSIONS.includes(p as Permission));
  if (invalid.length) {
    return NextResponse.json({ error: `Invalid permissions: ${invalid.join(", ")}` }, { status: 400 });
  }

  const rows = await readWhere<UserModulePermissions>("user_permissions", "user_id", userId);
  const now = new Date().toISOString();

  if (rows[0]) {
    await updateById<UserModulePermissions>("user_permissions", rows[0].id, {
      grants:    grants as Permission[],
      revokes:   revokes as Permission[],
      updatedAt: now,
      updatedBy: session.username,
    });
  } else {
    await insert<UserModulePermissions>("user_permissions", {
      id:        `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      grants:    grants as Permission[],
      revokes:   revokes as Permission[],
      updatedAt: now,
      updatedBy: session.username,
    });
  }

  invalidatePermissionCache(userId);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await logAction({
    session,
    action:       "user.permissions_updated",
    resourceType: "user",
    resourceId:   userId,
    details:      { grants, revokes },
    ip,
  });

  return NextResponse.json({ success: true });
}
