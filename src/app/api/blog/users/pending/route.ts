import { NextRequest, NextResponse } from "next/server";
import { readAll, updateById } from "@/lib/store";
import { isFirebaseEnabled, fbAuth } from "@/lib/firebase";
import { authorizeRole } from "@/lib/dashboardAuth";
import type { PendingUser, Role } from "@/types/dashboard";

const COOKIE_NAME = "backdrop_auth";

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    null
  );
}

// GET - list pending registrations (admin only)
export async function GET(req: NextRequest) {
  if (!await authorizeRole(getToken(req), "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const pending = await readAll<PendingUser>("pending_users");
  return NextResponse.json({ pending: pending.filter((u) => u.status === "pending") });
}

// PATCH - approve or reject
export async function PATCH(req: NextRequest) {
  if (!await authorizeRole(getToken(req), "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { id?: string; action?: string; role?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { id, action } = body;
  if (!id || !action) return NextResponse.json({ error: "id and action are required." }, { status: 400 });

  const all     = await readAll<PendingUser>("pending_users");
  const pending = all.find((u) => u.id === id);
  if (!pending) return NextResponse.json({ error: "Pending user not found." }, { status: 404 });

  if (action === "reject") {
    await updateById<PendingUser>("pending_users", id, { status: "rejected" });
    return NextResponse.json({ success: true });
  }

  if (action === "approve") {
    // Admin may override the requested role
    const role = ((body.role as Role) || pending.requestedRole) as Role;

    if (!isFirebaseEnabled()) {
      return NextResponse.json(
        { error: "Firebase not configured. Set FIREBASE_* env vars to enable user approval." },
        { status: 503 },
      );
    }

    try {
      // Create Firebase user - password is empty so they must use the reset link to set one
      const { randomBytes } = await import("crypto");
      const fbUser = await fbAuth().createUser({
        email:         pending.email,
        displayName:   pending.name,
        password:      randomBytes(16).toString("hex"), // temp, user resets via link
        emailVerified: true,
      });
      await fbAuth().setCustomUserClaims(fbUser.uid, { role });

      // Generate password setup link so user can set their own password
      let resetLink: string | null = null;
      try {
        resetLink = await fbAuth().generatePasswordResetLink(pending.email);
      } catch {
        // Non-fatal: link can be resent later from Firebase console
      }

      await updateById<PendingUser>("pending_users", id, { status: "approved" });

      return NextResponse.json({
        success:   true,
        message:   `Account created for ${pending.email}. Password setup link sent.`,
        resetLink: resetLink ?? "Could not generate - send from Firebase Console",
        user:      { id: fbUser.uid, name: pending.name, email: pending.email, role },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // Firebase "email already exists" error
      if (msg.includes("already exists")) {
        return NextResponse.json({ error: "A Firebase account with this email already exists." }, { status: 409 });
      }
      console.error("[pending] Firebase createUser error:", err);
      return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
