import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
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

// ── GET — validate existing session ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const session = await getSession(token);
    if (session) {
      return NextResponse.json({
        needsSetup:    false,
        authenticated: true,
        token,
        role:          session.role,
        username:      session.username,
      });
    }
  }
  return NextResponse.json({ needsSetup: false, authenticated: false });
}

// ── POST — login via N8N REST (primary) with direct-DB fallback ───────────────
//
// Primary path: forward credentials to the N8N blog-auth webhook, which calls
// /api/blog/auth/validate to check against the existing database (Supabase /
// filesystem).  N8N returns { valid, userId, username, role }; this route then
// creates the session in the existing database so all sub-accounts share the
// same session store.
//
// Fallback path: if N8N_WEBHOOK_BLOG_AUTH_URL is not set or N8N is unreachable,
// validate credentials directly against the existing database (same logic as
// /api/blog/auth/validate) so the super admin and all sub-accounts can still log in.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const { allowed } = rateLimit(ip, "auth", { limit: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Username and password are required." },
      { status: 400 }
    );
  }

  // ── Primary: N8N REST auth (validates against existing DB via /validate) ──
  const n8nAuthUrl = process.env.N8N_WEBHOOK_BLOG_AUTH_URL;
  if (n8nAuthUrl) {
    try {
      const n8nRes = await fetch(n8nAuthUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
        signal:  AbortSignal.timeout(8_000),
      });

      if (n8nRes.ok) {
        type N8NAuthResult = { valid?: boolean; userId?: string; username?: string; role?: Role };
        const n8nData = await n8nRes.json() as N8NAuthResult;

        if (n8nData.valid && n8nData.userId && n8nData.username && n8nData.role) {
          // N8N confirmed credentials via the existing database — create session locally.
          let sessionToken: string;
          try {
            sessionToken = await createSession(n8nData.userId, n8nData.username, n8nData.role);
          } catch {
            return NextResponse.json(
              { success: false, error: "Session could not be created — storage error." },
              { status: 500 }
            );
          }
          const res = NextResponse.json({
            success:  true,
            token:    sessionToken,
            role:     n8nData.role,
            username: n8nData.username,
          });
          setAuthCookie(res, sessionToken);
          return res;
        }

        if (n8nData.valid === false) {
          return NextResponse.json(
            { success: false, error: "Invalid username or password." },
            { status: 401 }
          );
        }
      }
      // N8N returned a non-OK status or unexpected body — fall through to direct auth.
    } catch (err) {
      console.warn("[auth] N8N unavailable, falling back to direct DB auth:", err);
      // Fall through to direct auth below.
    }
  }

  // ── Fallback: direct database auth (same resolution order as /validate) ────
  // Env-var credentials take priority — allows recovery when Supabase has wrong/unknown hash.
  const envUser = getEnvFallbackUser();
  let user = (envUser && envUser.username.toLowerCase() === username.toLowerCase())
    ? envUser
    : await getUserByUsername(username);
  if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
    return NextResponse.json(
      { success: false, error: "Invalid username or password." },
      { status: 401 }
    );
  }

  let passwordOk = await bcrypt.compare(password, user.passwordHash);
  // Last-resort recovery: if the primary user's hash doesn't match (e.g. Supabase has
  // a stale/unknown hash), try the bootstrap credential so admin/Hotbotstudios always works.
  if (!passwordOk && user.username.toLowerCase() === BOOTSTRAP_USER.username.toLowerCase()) {
    passwordOk = await bcrypt.compare(password, BOOTSTRAP_USER.passwordHash);
    if (passwordOk) user = BOOTSTRAP_USER;
  }
  if (!passwordOk) {
    return NextResponse.json(
      { success: false, error: "Invalid username or password." },
      { status: 401 }
    );
  }

  let sessionToken: string;
  try {
    sessionToken = await createSession(user.id, user.username, user.role as Role);
  } catch {
    return NextResponse.json(
      { success: false, error: "Session could not be created — storage error." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({
    success:  true,
    token:    sessionToken,
    role:     user.role,
    username: user.username,
  });
  setAuthCookie(res, sessionToken);
  return res;
}

// ── DELETE — logout ───────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) await deleteSession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
