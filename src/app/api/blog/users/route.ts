import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getAllUsers, createUser, updateUserRole, deleteUser } from "@/lib/adminStore";
import { revokeAllSessions } from "@/lib/sessions";
import { authorizeRole, authorizeUserRead, extractToken } from "@/lib/dashboardAuth";
import type { Role, UserRecord } from "@/types/dashboard";

const COOKIE_NAME  = "backdrop_auth";
const VALID_ROLES: Role[] = ["admin", "manager", "sales", "crm_operator", "finance", "editor", "contributor", "agent"];

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    new URL(req.url).searchParams.get("secret") ||
    null
  );
}

function publicUser(u: UserRecord) {
  return { id: u.id, username: u.username, role: u.role, createdAt: u.createdAt };
}

// GET — list all users (admin full, manager read-only)
export async function GET(req: NextRequest) {
  const session = await authorizeUserRead(getToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await getAllUsers();
  return NextResponse.json({ users: users.map(publicUser), readonly: session.role === "manager" });
}

// POST — create new user (admin only)
export async function POST(req: NextRequest) {
  const session = await authorizeRole(getToken(req), "admin");
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

  const existing = await getAllUsers();
  if (existing.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  const newUser: UserRecord = {
    id:           `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    username,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    createdAt:    new Date().toISOString(),
  };

  await createUser(newUser);
  return NextResponse.json({ success: true, user: publicUser(newUser) }, { status: 201 });
}

// PATCH — update role (admin only)
export async function PATCH(req: NextRequest) {
  const session = await authorizeRole(getToken(req), "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: string; role?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { id, role } = body;
  if (!id) return NextResponse.json({ error: "User id required." }, { status: 400 });
  if (!role || !VALID_ROLES.includes(role as Role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const users  = await getAllUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Prevent removing last admin
  if (target.role === "admin" && role !== "admin") {
    const admins = users.filter((u) => u.role === "admin");
    if (admins.length <= 1) {
      return NextResponse.json({ error: "Cannot demote the only admin account." }, { status: 409 });
    }
  }

  await updateUserRole(id, role as Role);
  // Revoke existing sessions so the new role takes effect immediately
  await revokeAllSessions(id);

  return NextResponse.json({ success: true, user: publicUser({ ...target, role: role as Role }) });
}

// DELETE — remove user (admin only, cannot delete self)
export async function DELETE(req: NextRequest) {
  const session = await authorizeRole(getToken(req), "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "User id required." }, { status: 400 });

  const users  = await getAllUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Prevent deleting last admin
  const admins = users.filter((u) => u.role === "admin");
  if (target.role === "admin" && admins.length <= 1) {
    return NextResponse.json({ error: "Cannot delete the only admin account." }, { status: 409 });
  }

  await deleteUser(id);
  await revokeAllSessions(id);
  return NextResponse.json({ success: true });
}
