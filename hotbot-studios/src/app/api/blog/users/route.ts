import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { readAdminStore, writeAdminStore } from "@/lib/adminStore";
import { authorizeRole } from "@/lib/dashboardAuth";
import type { Role, UserRecord } from "@/types/dashboard";

const COOKIE_NAME = "backdrop_auth";

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

// GET — list all users (admin only)
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!authorizeRole(token, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = readAdminStore();
  return NextResponse.json({ users: (store?.users ?? []).map(publicUser) });
}

// POST — create new user (admin only)
export async function POST(req: NextRequest) {
  const token = getToken(req);
  const session = authorizeRole(token, "admin");
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  if (!["admin", "manager", "agent"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const store = readAdminStore();
  if (!store) return NextResponse.json({ error: "Store not initialised." }, { status: 500 });

  if (store.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser: UserRecord = {
    id:           `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    username,
    passwordHash,
    role,
    createdAt:    new Date().toISOString(),
  };

  store.users.push(newUser);
  writeAdminStore(store);

  return NextResponse.json({ success: true, user: publicUser(newUser) }, { status: 201 });
}

// DELETE — remove user by id (admin only, cannot delete self)
export async function DELETE(req: NextRequest) {
  const token = getToken(req);
  const session = authorizeRole(token, "admin");
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "User id required." }, { status: 400 });

  const store = readAdminStore();
  if (!store) return NextResponse.json({ error: "Store not initialised." }, { status: 500 });

  const target = store.users.find((u) => u.id === id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Prevent deleting the last admin
  const admins = store.users.filter((u) => u.role === "admin");
  if (target.role === "admin" && admins.length <= 1) {
    return NextResponse.json({ error: "Cannot delete the only admin account." }, { status: 409 });
  }

  store.users = store.users.filter((u) => u.id !== id);
  writeAdminStore(store);

  return NextResponse.json({ success: true });
}
