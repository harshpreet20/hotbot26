import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, createUser, updateUserRole, updateUserProfile, deleteUser } from "@/lib/adminStore";
import { revokeAllSessions } from "@/lib/sessions";
import { authorizeAdmin, authorizeUserRead } from "@/lib/dashboardAuth";
import { validateCreate, validateRoleChange, validateDelete, assignableRoles } from "@/lib/agents/userManagement";
import { logAction } from "@/lib/agents/monitoring";
import type { Role, UserRecord } from "@/types/dashboard";

const COOKIE_NAME = "backdrop_auth";

// All roles that can be assigned via the API (super_admin only via /api/blog/auth/init)
const VALID_ROLES: Role[] = ["admin", "manager", "sales", "crm_operator", "finance", "editor", "contributor", "agent"];

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    new URL(req.url).searchParams.get("secret") ||
    null
  );
}

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function publicUser(u: UserRecord) {
  return { id: u.id, username: u.username, role: u.role, createdAt: u.createdAt };
}

// GET - list all users (admin/super_admin full, manager read-only)
export async function GET(req: NextRequest) {
  const session = await authorizeUserRead(getToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await getAllUsers();
  return NextResponse.json({
    users:    users.map(publicUser),
    readonly: session.role === "manager",
  });
}

// POST - create new user (admin/super_admin with hierarchy enforcement)
export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(getToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { username?: string; password?: string; role?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  const role     = (body.role || "agent") as Role;

  if (!username || username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // Hierarchy check
  const hierarchyErr = validateCreate(session, role);
  if (hierarchyErr) {
    return NextResponse.json({ error: hierarchyErr.message }, { status: 403 });
  }

  const existing = await getAllUsers();
  if (existing.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  try {
    const newUser = await createUser({ username, password, role });
    await logAction({
      session,
      action:       "user.create",
      resourceType: "user",
      resourceId:   newUser.id,
      details:      { username, role },
      ip:           getIp(req),
    });
    return NextResponse.json({ success: true, user: publicUser(newUser) }, { status: 201 });
  } catch (err) {
    console.error("[users] createUser error:", err);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}

// PATCH - update role or profile (admin/super_admin)
export async function PATCH(req: NextRequest) {
  const session = await authorizeAdmin(getToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: string; role?: string; username?: string; email?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { id } = body;
  if (!id) return NextResponse.json({ error: "User id required." }, { status: 400 });

  const users  = await getAllUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Profile update (username / email)
  if (body.username !== undefined || body.email !== undefined) {
    const username = body.username?.trim();
    const email    = body.email?.trim().toLowerCase();
    if (username && username.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    await updateUserProfile(id, { username, email });
    await logAction({
      session,
      action:       "user.profile_update",
      resourceType: "user",
      resourceId:   id,
      details:      { username, email, target: target.username },
      ip:           getIp(req),
    });
    return NextResponse.json({ success: true, user: publicUser({ ...target, username: username || target.username }) });
  }

  // Role update
  const { role } = body;
  if (!role || !([...VALID_ROLES, "super_admin"] as string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const hierarchyErr = validateRoleChange(session, target, role as Role, users);
  if (hierarchyErr) {
    return NextResponse.json(
      { error: hierarchyErr.message },
      { status: hierarchyErr.code === "FORBIDDEN" ? 403 : 409 },
    );
  }

  await updateUserRole(id, role as Role);
  await revokeAllSessions(id);

  await logAction({
    session,
    action:       "role.change",
    resourceType: "user",
    resourceId:   id,
    details:      { from: target.role, to: role, username: target.username },
    ip:           getIp(req),
  });

  return NextResponse.json({ success: true, user: publicUser({ ...target, role: role as Role }) });
}

// DELETE - remove user (admin/super_admin with hierarchy enforcement)
export async function DELETE(req: NextRequest) {
  const session = await authorizeAdmin(getToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "User id required." }, { status: 400 });

  const users  = await getAllUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const hierarchyErr = validateDelete(session, target, users);
  if (hierarchyErr) {
    return NextResponse.json(
      { error: hierarchyErr.message },
      { status: hierarchyErr.code === "FORBIDDEN" ? 403 : 409 },
    );
  }

  await deleteUser(id);
  await revokeAllSessions(id);

  await logAction({
    session,
    action:       "user.delete",
    resourceType: "user",
    resourceId:   id,
    details:      { username: target.username, role: target.role },
    ip:           getIp(req),
  });

  return NextResponse.json({ success: true });
}
