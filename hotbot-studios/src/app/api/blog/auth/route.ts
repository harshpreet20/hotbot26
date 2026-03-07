import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const ADMIN_USERNAME     = process.env.BLOG_ADMIN_USERNAME      || "admin";
const ADMIN_PASSWORD_HASH = process.env.BLOG_ADMIN_PASSWORD_HASH || "";
const BLOG_SECRET        = process.env.BLOG_PUBLISH_SECRET      || "";

const COOKIE_NAME  = "backdrop_auth";
const COOKIE_MAX_S = 60 * 60 * 24 * 30; // 30 days

// ── in-memory rate limiter (per-IP, resets every 60s) ───────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count++;
  return true;
}

// constant-time username comparison to prevent timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let _d = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) _d += (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_S,
  });
}

// ── POST /api/blog/auth  (login) ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json() as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();

  if (!username || !password) {
    return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
  }

  if (!ADMIN_PASSWORD_HASH || !BLOG_SECRET) {
    console.error("[blog/auth] BLOG_ADMIN_PASSWORD_HASH or BLOG_PUBLISH_SECRET is not set.");
    return NextResponse.json({ success: false, error: "Server misconfiguration." }, { status: 500 });
  }

  // Validate username (constant-time) then bcrypt-verify password
  const usernameOk = safeEqual(username, ADMIN_USERNAME);
  const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (usernameOk && passwordOk) {
    const res = NextResponse.json({ success: true, token: BLOG_SECRET });
    setAuthCookie(res, BLOG_SECRET);
    return res;
  }

  return NextResponse.json(
    { success: false, error: "Invalid username or password." },
    { status: 401 },
  );
}

// ── DELETE /api/blog/auth  (logout) ──────────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
