/**
 * Super-admin direct authentication endpoint.
 * Identical auth logic to /api/blog/auth but with a stricter rate limit.
 * Optionally gated by SUPER_ADMIN_PAGE_SECRET env var (checked via x-superadmin-secret header).
 */
import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { getUserByUsername, getEnvFallbackUser, BOOTSTRAP_USER } from "@/lib/adminStore";
import { rateLimit } from "@/lib/rateLimit";
import type { Role } from "@/types/dashboard";

const COOKIE_NAME  = "backdrop_auth";
const COOKIE_MAX_S = 60 * 60 * 24 * 30;

function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   COOKIE_MAX_S,
  });
}

function checkPageSecret(req: NextRequest): boolean {
  const pageSecret = process.env.SUPER_ADMIN_PAGE_SECRET;
  if (!pageSecret) return true;
  return req.headers.get("x-superadmin-secret") === pageSecret;
}

// ── GET - validate existing session ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const session = await getSession(token);
    if (session) {
      return NextResponse.json({
        needsSetup:      false,
        authenticated:   true,
        token,
        role:            session.role,
        username:        session.username,
        isImpersonating: session.isImpersonating,
      });
    }
  }
  return NextResponse.json({ needsSetup: false, authenticated: false });
}

// ── POST - direct login ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!checkPageSecret(req)) {
    return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const { allowed } = await rateLimit(ip, "auth-superadmin", { limit: 5, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute." },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  let userId: string;
  let resolvedUsername: string;
  let role: Role;

  if (isSupabaseEnabled()) {
    const { data: authData, error: authError } = await sb().auth.signInWithPassword({
      email: username, password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const { data: userRow } = await sb()
      .from("backdrop_users")
      .select("id, email, username, role, status")
      .eq("id", authData.user.id)
      .single();

    if (!userRow || userRow.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Account not approved or not found." },
        { status: 403 },
      );
    }

    // This endpoint is restricted to admin and super_admin only
    const adminRoles: Role[] = ["super_admin", "admin"];
    if (!adminRoles.includes(userRow.role as Role)) {
      return NextResponse.json(
        { success: false, error: "Admin or super-admin access required." },
        { status: 403 },
      );
    }

    userId           = userRow.id as string;
    resolvedUsername = (userRow.username as string) || (userRow.email as string);
    role             = userRow.role as Role;
  } else {
    const { default: bcrypt } = await import("bcryptjs");
    const envUser = getEnvFallbackUser();
    let user = (envUser && envUser.username.toLowerCase() === username.toLowerCase())
      ? envUser
      : await getUserByUsername(username);
    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 },
      );
    }

    let passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk && user.username.toLowerCase() === BOOTSTRAP_USER.username.toLowerCase()) {
      passwordOk = await bcrypt.compare(password, BOOTSTRAP_USER.passwordHash);
      if (passwordOk) user = BOOTSTRAP_USER;
    }
    if (!passwordOk) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 },
      );
    }

    userId           = user.id;
    resolvedUsername = user.username;
    role             = user.role as Role;
  }

  let sessionToken: string;
  try {
    sessionToken = await createSession(userId, resolvedUsername, role);
  } catch {
    return NextResponse.json(
      { success: false, error: "Session could not be created — storage error." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({
    success:  true,
    token:    sessionToken,
    role,
    username: resolvedUsername,
  });
  setAuthCookie(res, sessionToken);
  return res;
}

// ── DELETE - logout ───────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) await deleteSession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
