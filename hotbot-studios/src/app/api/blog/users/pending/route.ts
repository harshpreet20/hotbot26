import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { readAll, writeAll, newId } from "@/lib/store";
import { readAdminStore, writeAdminStore } from "@/lib/adminStore";
import { authorizeRole } from "@/lib/dashboardAuth";
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
  const token = getToken(req);
  if (!authorizeRole(token, "admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pending = readAll<PendingUser>("pending_users").filter((u) => u.status === "pending");
  return NextResponse.json({ pending });
}

// PATCH — approve or reject a pending registration
// Body: { id, action: "approve" | "reject", password? }
export async function PATCH(req: NextRequest) {
  const token = getToken(req);
  if (!authorizeRole(token, "admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: string; action?: string; password?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { id, action, password } = body;
  if (!id || !action) return NextResponse.json({ error: "id and action are required." }, { status: 400 });

  const all = readAll<PendingUser>("pending_users");
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "Pending user not found." }, { status: 404 });

  const pending = all[idx];

  if (action === "reject") {
    all[idx] = { ...pending, status: "rejected" };
    writeAll("pending_users", all);
    return NextResponse.json({ success: true });
  }

  if (action === "approve") {
    const pwd = (password || "").trim();
    if (!pwd || pwd.length < 8)
      return NextResponse.json({ error: "A password of at least 8 characters is required to activate the account." }, { status: 400 });

    const store = readAdminStore();
    if (!store) return NextResponse.json({ error: "Admin store not initialised." }, { status: 500 });

    // Check for duplicate username
    if (store.users.some((u) => u.username.toLowerCase() === pending.username.toLowerCase()))
      return NextResponse.json({ error: "Username already exists. Change the username before approving." }, { status: 409 });

    const passwordHash = await bcrypt.hash(pwd, 12);
    const newUser: UserRecord = {
      id:           `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      username:     pending.username,
      passwordHash,
      role:         pending.requestedRole as Role,
      createdAt:    new Date().toISOString(),
    };

    store.users.push(newUser);
    writeAdminStore(store);

    all[idx] = { ...pending, status: "approved" };
    writeAll("pending_users", all);

    const { passwordHash: _ph, ...publicUser } = newUser;
    return NextResponse.json({ success: true, user: publicUser });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
