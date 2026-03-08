import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { readAdminStore, writeAdminStore, isSetupNeeded, getEnvFallbackUser } from "@/lib/adminStore";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import type { AdminStore, UserRecord, Role } from "@/types/dashboard";

// ── Cookie ────────────────────────────────────────────────────────────────────
const COOKIE_NAME  = "backdrop_auth";
const COOKIE_MAX_S = 60 * 60 * 24 * 30;

function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_S,
  });
}

// ── Rate limiter (per-IP, 10 attempts / 60 s) ─────────────────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) { attempts.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (rec.count >= 10) return false;
  rec.count++;
  return true;
}

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

// ── GET — check if setup is needed; also validates an existing session ────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const session = getSession(token);
    if (session) {
      return NextResponse.json({
        needsSetup:    false,
        authenticated: true,
        token,
        role:          session.role,
        username:      session.username,
      });
    }
    // Cookie exists but session is gone (e.g. server restarted and wiped /tmp).
    // The user already had an account — show login form, not setup form.
    return NextResponse.json({ needsSetup: false, authenticated: false });
  }
  return NextResponse.json({ needsSetup: isSetupNeeded(), authenticated: false });
}

// ── POST — login or first-run setup ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  let body: { username?: string; password?: string; confirmPassword?: string; setup?: boolean };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
  }

  // ── First-run setup ────────────────────────────────────────────────────────
  if (body.setup === true) {
    if (!isSetupNeeded()) {
      return NextResponse.json({ success: false, error: "Admin account already exists. Log in normally." }, { status: 409 });
    }
    const confirm = (body.confirmPassword || "").trim();
    if (password !== confirm)      return NextResponse.json({ success: false, error: "Passwords do not match." }, { status: 400 });
    if (password.length < 8)       return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
    if (username.length < 3)       return NextResponse.json({ success: false, error: "Username must be at least 3 characters." }, { status: 400 });

    const passwordHash  = await bcrypt.hash(password, 12);
    const publishSecret = process.env.BLOG_PUBLISH_SECRET || crypto.randomBytes(32).toString("hex");
    const userId        = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const store: AdminStore = {
      publishSecret,
      users: [{ id: userId, username, passwordHash, role: "admin", createdAt: new Date().toISOString() }],
    };
    try { writeAdminStore(store); }
    catch { return NextResponse.json({ success: false, error: "Could not save credentials — file system error. Set BLOG_ADMIN_PASSWORD_HASH and BLOG_PUBLISH_SECRET env vars instead." }, { status: 500 }); }

    let sessionToken: string;
    try { sessionToken = createSession(userId, username, "admin"); }
    catch { return NextResponse.json({ success: false, error: "Account created but session could not be saved. Please log in." }, { status: 500 }); }

    const res = NextResponse.json({ success: true, token: sessionToken, role: "admin", username });
    setAuthCookie(res, sessionToken);
    return res;
  }

  // ── Normal login ───────────────────────────────────────────────────────────
  const store    = readAdminStore();
  const allUsers: UserRecord[] = store?.users ?? [];

  // Include env-var fallback user if no file-based users exist
  if (allUsers.length === 0) {
    const envUser = getEnvFallbackUser();
    if (envUser) allUsers.push(envUser);
  }

  if (allUsers.length === 0) {
    return NextResponse.json({ success: false, error: "No admin account found. Complete first-time setup.", needsSetup: true }, { status: 409 });
  }

  const matchedUser = allUsers.find((u) => safeEqual(u.username, username));
  const passwordOk  = matchedUser ? await bcrypt.compare(password, matchedUser.passwordHash) : false;

  if (matchedUser && passwordOk) {
    let sessionToken: string;
    try { sessionToken = createSession(matchedUser.id, matchedUser.username, matchedUser.role); }
    catch { return NextResponse.json({ success: false, error: "Session could not be created — storage error." }, { status: 500 }); }
    const res = NextResponse.json({ success: true, token: sessionToken, role: matchedUser.role, username: matchedUser.username });
    setAuthCookie(res, sessionToken);
    return res;
  }

  return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
}

// ── DELETE — logout ───────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) deleteSession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
