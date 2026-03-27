import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { getUsers, createUser } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 50;

  const result = await getUsers(page, limit);
  return NextResponse.json({ ...result, page, limit });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { username, email, password, role, displayName } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const validRoles = ["admin", "super_admin"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({
      username,
      email: email || null,
      password_hash: passwordHash,
      role: role || "admin",
      display_name: displayName || username,
    });

    await logActivity({
      userId: session.user.id,
      action: "user_created",
      details: { targetUsername: username, role: role || "admin" },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
    }
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
