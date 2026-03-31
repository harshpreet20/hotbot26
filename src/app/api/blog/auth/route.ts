import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { getUserByUsername, getEnvFallbackUser } from "@/lib/adminStore";
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

// ── POST — login (direct Supabase / file auth, no N8N dependency) ─────────────
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

  // Env-var credentials take priority — allows recovery when Supabase has wrong/unknown hash.
  // If BLOG_ADMIN_PASSWORD_HASH (+ optional BLOG_ADMIN_USERNAME) are set in Vercel env and
  // the username matches, skip all other stores and use those credentials directly.
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

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
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
