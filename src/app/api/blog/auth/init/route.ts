/**
 * One-time admin initialisation endpoint.
 *
 * Sets Firebase custom claims { role: "admin" } on a given user.
 * Protected by SETUP_SECRET env var - requests without it are rejected.
 *
 * Usage (run once to bootstrap the first admin):
 *   GET /api/blog/auth/init?secret=YOUR_SETUP_SECRET&uid=FIREBASE_UID
 *
 * After the first admin is set up, you can manage all other users
 * through the dashboard (/enter/backdrop/dashboard/users).
 */
import { NextRequest, NextResponse } from "next/server";
import { isFirebaseEnabled, fbAuth } from "@/lib/firebase";

export async function GET(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "SETUP_SECRET env var not set. Add it in Vercel and redeploy." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const incoming = searchParams.get("secret");
  const uid      = searchParams.get("uid");
  const role     = searchParams.get("role") || "admin";

  if (incoming !== secret) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 403 });
  }
  if (!uid) {
    return NextResponse.json(
      { error: "Missing uid param. Get it from Firebase Console → Authentication → Users → User UID column." },
      { status: 400 },
    );
  }
  if (!isFirebaseEnabled()) {
    return NextResponse.json(
      { error: "Firebase not configured. Set FIREBASE_* env vars first." },
      { status: 503 },
    );
  }

  const validRoles = ["super_admin", "admin", "manager", "sales", "crm_operator", "finance", "editor", "contributor", "agent"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
  }

  // Diagnostic: surface Firebase config state (no secrets exposed)
  const diagProjectId = process.env.FIREBASE_PROJECT_ID ?? "(not set)";
  const diagHasKey    = !!(process.env.FIREBASE_PRIVATE_KEY);
  const diagHasEmail  = !!(process.env.FIREBASE_CLIENT_EMAIL);

  try {
    await fbAuth().setCustomUserClaims(uid, { role });
    const user = await fbAuth().getUser(uid);
    return NextResponse.json({
      success: true,
      message: `Role "${role}" set on ${user.email}. You can now log in at /enter/backdrop.`,
      uid,
      email: user.email,
      role,
    });
  } catch (err) {
    const msg  = err instanceof Error ? err.message : String(err);
    const code = (err as Record<string, unknown>)?.code ?? "unknown";
    console.error("[auth/init]", err);
    return NextResponse.json({
      error:   "Firebase Admin SDK error",
      code,
      detail:  msg,
      diag: {
        projectId:      diagProjectId,
        hasPrivateKey:  diagHasKey,
        hasClientEmail: diagHasEmail,
        uid,
      },
    }, { status: 500 });
  }
}
