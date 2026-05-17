import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import {
  isFirebaseEnabled,
  verifyFirebasePassword,
  fbAuth,
} from "@/lib/firebase";
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

// ── Bootstrap: auto-promote first Firebase user to super_admin ───────────────
async function bootstrapSuperAdmin(uid: string, email: string): Promise<Role> {
  try {
    const list = await fbAuth().listUsers(1000);
    const hasSuperAdmin = list.users.some(
      (u) => (u.customClaims as Record<string, unknown> | null)?.role === "super_admin",
    );
    if (!hasSuperAdmin) {
      await fbAuth().setCustomUserClaims(uid, { role: "super_admin" });
      log.info("auth.bootstrap", `First user promoted to super_admin`, { details: { email } });
      return "super_admin";
    }
  } catch (err) {
    log.warn("auth.bootstrap", "Bootstrap check failed (non-fatal)", {
      details: { error: err instanceof Error ? err.message : String(err), email },
    });
  }
  return "agent";
}

// ── Human-readable error messages for each Firebase failure code ──────────────
function firebaseErrorMessage(code: string): string {
  switch (code) {
    case "NO_API_KEY":
      return "Firebase API key is not configured on this server. Contact your administrator.";
    case "API_KEY_INVALID":
      return "Firebase API key is invalid or belongs to a different project. Contact your administrator.";
    case "USER_NOT_FOUND":
    case "INVALID_CREDENTIALS":
      return "Invalid email or password.";
    case "USER_DISABLED":
      return "This account has been disabled. Contact your administrator.";
    case "TOO_MANY_ATTEMPTS":
      return "Account temporarily locked due to too many failed attempts. Please wait a few minutes or reset your password in Firebase Console.";
    case "TIMEOUT":
      return "Authentication server timed out. Please try again.";
    case "NETWORK_ERROR":
      return "Unable to reach authentication server. Please check your connection and try again.";
    case "FIREBASE_ADMIN_ERROR":
      return "Firebase Admin SDK error. Check server logs.";
    default:
      return "Invalid email or password.";
  }
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

  // Mask password in logs — only log whether it was provided
  log.info("auth.attempt", `Login attempt for "${username}"`, {
    ip,
    username,
    details: {
      method:   isFirebaseEnabled() ? "firebase" : "bcrypt",
      ua,
      hasEmail: !!username,
    },
  });

  let userId: string;
  let resolvedUsername: string;
  let role: Role;

  if (isFirebaseEnabled()) {
    const result = await verifyFirebasePassword(username, password);

    if (!result.ok) {
      const message = firebaseErrorMessage(result.code);
      const status  = result.code === "TOO_MANY_ATTEMPTS" ? 429
                    : result.code === "USER_DISABLED"      ? 403
                    : 401;

      log.error("auth.failure", `Login failed for "${username}" — ${result.code}`, {
        ip,
        username,
        details: {
          errorCode: result.code,
          rawError:  result.raw ?? null,
          method:    "firebase",
          ua,
          hint:      getHint(result.code),
        },
      });

      return NextResponse.json({ success: false, error: message }, { status });
    }

    userId           = result.uid;
    resolvedUsername = result.email;
    role             = result.role;

    // Auto-promote: first Firebase user with no role becomes super_admin
    if (role === "agent") {
      role = await bootstrapSuperAdmin(result.uid, result.email);
    }
  } else {
    // Legacy bcrypt path
    const { default: bcrypt } = await import("bcryptjs");
    const envUser = getEnvFallbackUser();
    let user = (envUser && envUser.username.toLowerCase() === username.toLowerCase())
      ? envUser
      : await getUserByUsername(username);

    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
      log.error("auth.failure", `Login failed for "${username}" — user not found (bcrypt)`, {
        ip,
        username,
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
        ip,
        username,
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
    details: { role, method: isFirebaseEnabled() ? "firebase" : "bcrypt", ua },
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

// ── Diagnostic hints for failure codes ───────────────────────────────────────
function getHint(code: string): string {
  switch (code) {
    case "NO_API_KEY":
      return "Add NEXT_PUBLIC_FIREBASE_API_KEY to Vercel environment variables and redeploy.";
    case "API_KEY_INVALID":
      return "The API key in Vercel does not match the Firebase project. Get the correct Web API Key from Firebase Console → Project Settings → General.";
    case "USER_NOT_FOUND":
      return "No Firebase account with this email in this project. Create the user in Firebase Console → Authentication → Users.";
    case "INVALID_CREDENTIALS":
      return "Wrong password. Reset it in Firebase Console → Authentication → Users → click user → Reset Password.";
    case "USER_DISABLED":
      return "Account is disabled. Re-enable it in Firebase Console → Authentication → Users.";
    case "TOO_MANY_ATTEMPTS":
      return "Account locked by Firebase. Wait ~1 hour or go to Firebase Console → Authentication → Users → click user → Reset Password.";
    case "FIREBASE_ADMIN_ERROR":
      return "Admin SDK credentials may be wrong. Verify FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL in Vercel match the correct Firebase project.";
    default:
      return "Check Vercel Function logs for the full error trace.";
  }
}
