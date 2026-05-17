import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { getUserByUsername, getEnvFallbackUser, BOOTSTRAP_USER } from "@/lib/adminStore";
import { rateLimit } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
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

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
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

// ── Bootstrap: auto-promote first Supabase user to super_admin ───────────────
async function bootstrapSupabaseAdmin(userId: string, email: string): Promise<Role> {
  try {
    const { count } = await sb()
      .from("backdrop_users")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");
    if (!count || count === 0) {
      await sb().from("backdrop_users").upsert({
        id:         userId,
        email,
        username:   email.split("@")[0],
        role:       "super_admin",
        status:     "approved",
        updated_at: new Date().toISOString(),
      });
      log.info("auth.bootstrap", `First user bootstrapped as super_admin`, { details: { email } });
      return "super_admin";
    }
  } catch (err) {
    log.warn("auth.bootstrap", "Bootstrap check failed", {
      details: { error: err instanceof Error ? err.message : String(err), email },
    });
  }
  return "agent";
}

// ── POST - login ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const ua = req.headers.get("user-agent") ?? "unknown";

  const { allowed } = rateLimit(ip, "auth", { limit: 10, windowMs: 60_000 });
  if (!allowed) {
    log.warn("auth.rate_limit", `Rate limit hit from ${ip}`, { ip, details: { ua } });
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute." },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try { body = await req.json() as typeof body; }
  catch {
    log.warn("auth.bad_request", "Malformed request body", { ip, details: { ua } });
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  log.info("auth.attempt", `Login attempt for "${username}"`, {
    ip,
    username,
    details: {
      method:   isSupabaseEnabled() ? "supabase" : "bcrypt",
      ua,
      hasEmail: !!username,
    },
  });

  let userId: string;
  let resolvedUsername: string;
  let role: Role;

  if (isSupabaseEnabled()) {
    // ── Supabase Auth path ──────────────────────────────────────────────────
    const { data: authData, error: authError } = await sb().auth.signInWithPassword({
      email:    username,
      password,
    });

    if (authError || !authData?.user) {
      const errMsg = authError?.message ?? "invalid_credentials";
      log.error("auth.failure", `Login failed for "${username}" — ${errMsg}`, {
        ip, username,
        details: { method: "supabase", errorCode: errMsg, ua },
      });

      if (errMsg.toLowerCase().includes("not confirmed")) {
        return NextResponse.json(
          { success: false, error: "Please verify your email address before signing in." },
          { status: 401 },
        );
      }

      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const supabaseUser = authData.user;

    // Look up backdrop_users for role / status
    const { data: userRow } = await sb()
      .from("backdrop_users")
      .select("id, email, username, role, status")
      .eq("id", supabaseUser.id)
      .single();

    if (!userRow) {
      // Bootstrap: first ever user becomes super_admin
      role = await bootstrapSupabaseAdmin(supabaseUser.id, supabaseUser.email ?? username);
      if (role !== "super_admin") {
        log.error("auth.failure", `No backdrop_users record for "${username}"`, {
          ip, username, details: { uid: supabaseUser.id },
        });
        return NextResponse.json(
          { success: false, error: "Account not found in directory. Contact your administrator." },
          { status: 403 },
        );
      }
      userId           = supabaseUser.id;
      resolvedUsername = (supabaseUser.email ?? username).split("@")[0];
    } else {
      let status = userRow.status as string;

      // Auto-advance: if Supabase has confirmed their email, move past pending_email
      if (status === "pending_email") {
        const { data: authUser } = await sb().auth.admin.getUserById(supabaseUser.id);
        if (authUser?.user?.email_confirmed_at) {
          await sb().from("backdrop_users").update({
            status:     "pending_approval",
            updated_at: new Date().toISOString(),
          }).eq("id", supabaseUser.id);
          status = "pending_approval";
        }
      }

      const statusErrors: Record<string, { msg: string; code: number }> = {
        pending_email:    { msg: "Please verify your email address. Check your inbox for the verification link.", code: 401 },
        pending_approval: { msg: "Your account is awaiting administrator approval.", code: 403 },
        rejected:         { msg: "Your access request was declined. Contact your administrator.", code: 403 },
        suspended:        { msg: "Your account has been suspended. Contact your administrator.", code: 403 },
      };

      if (status !== "approved") {
        const info = statusErrors[status] ?? { msg: "Account access not granted.", code: 403 };
        log.warn("auth.blocked", `Login blocked for "${username}" — status: ${status}`, {
          ip, username, details: { status },
        });
        return NextResponse.json({ success: false, error: info.msg }, { status: info.code });
      }

      userId           = userRow.id as string;
      resolvedUsername = (userRow.username as string) || (userRow.email as string);
      role             = userRow.role as Role;
    }

  } else {
    // ── Legacy bcrypt path ──────────────────────────────────────────────────
    const { default: bcrypt } = await import("bcryptjs");
    const envUser = getEnvFallbackUser();
    let user = (envUser && envUser.username.toLowerCase() === username.toLowerCase())
      ? envUser
      : await getUserByUsername(username);

    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
      log.error("auth.failure", `Login failed for "${username}" — user not found (bcrypt)`, {
        ip, username,
        details: { method: "bcrypt", ua, errorCode: "USER_NOT_FOUND" },
      });
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
      log.error("auth.failure", `Login failed for "${username}" — wrong password (bcrypt)`, {
        ip, username,
        details: { method: "bcrypt", ua, errorCode: "INVALID_PASSWORD" },
      });
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
  } catch (err) {
    log.error("auth.session_error", `Session creation failed for "${resolvedUsername}"`, {
      ip,
      username: resolvedUsername,
      userId,
      details: { error: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json(
      { success: false, error: "Session could not be created — storage error." },
      { status: 500 },
    );
  }

  log.info("auth.success", `Login successful for "${resolvedUsername}" (${role})`, {
    ip,
    username: resolvedUsername,
    userId,
    details: { role, method: isSupabaseEnabled() ? "supabase" : "bcrypt", ua },
  });

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
  const ip    = getIp(req);
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const session = await getSession(token);
    if (session) {
      log.info("auth.logout", `Logout: "${session.username}"`, {
        ip,
        username: session.username,
        userId:   session.userId,
        details:  { role: session.role },
      });
    }
    await deleteSession(token);
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
