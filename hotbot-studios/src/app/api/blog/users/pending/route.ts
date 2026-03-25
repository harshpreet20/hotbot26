import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { readAll, insert, updateById, newId } from "@/lib/store";
import { createUser } from "@/lib/adminStore";
import { authorizeRole, extractToken } from "@/lib/dashboardAuth";
import type { PendingUser, Role, UserRecord } from "@/types/dashboard";

const COOKIE_NAME = "backdrop_auth";

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    null
  );
}

// GET — list pending registrations (admin only)
export async function GET(req: NextRequest) {
  if (!await authorizeRole(getToken(req), "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pending = await readAll<PendingUser>("pending_users");
  return NextResponse.json({ pending: pending.filter((u) => u.status === "pending") });
}

// PATCH — approve or reject
export async function PATCH(req: NextRequest) {
  if (!await authorizeRole(getToken(req), "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { id?: string; action?: string; password?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { id, action, password } = body;
  if (!id || !action) return NextResponse.json({ error: "id and action are required." }, { status: 400 });

  const all     = await readAll<PendingUser>("pending_users");
  const pending = all.find((u) => u.id === id);
  if (!pending) return NextResponse.json({ error: "Pending user not found." }, { status: 404 });

  if (action === "reject") {
    await updateById<PendingUser>("pending_users", id, { status: "rejected" });
    return NextResponse.json({ success: true });
  }

  if (action === "approve") {
    const pwd = (password || "").trim();
    if (!pwd || pwd.length < 8) {
      return NextResponse.json(
        { error: "A password of at least 8 characters is required to activate the account." },
        { status: 400 }
      );
    }

    // Check for existing username conflict
    const { getAllUsers } = await import("@/lib/adminStore");
    const users = await getAllUsers();
    if (users.some((u) => u.username.toLowerCase() === pending.username.toLowerCase())) {
      return NextResponse.json(
        { error: "Username already exists. Change the username before approving." },
        { status: 409 }
      );
    }

    const newUser: UserRecord = {
      id:           `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      username:     pending.username,
      passwordHash: await bcrypt.hash(pwd, 12),
      role:         pending.requestedRole as Role,
      createdAt:    new Date().toISOString(),
    };

    await createUser(newUser);
    await updateById<PendingUser>("pending_users", id, { status: "approved" });

    const { passwordHash: _ph, ...publicUser } = newUser;
    return NextResponse.json({ success: true, user: publicUser });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
