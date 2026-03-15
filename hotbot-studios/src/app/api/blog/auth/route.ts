import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import type { Role } from "@/types/dashboard";

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

// ── GET — validates an existing session ──────────────────────────────────────
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
  }
  return NextResponse.json({ needsSetup: false, authenticated: false });
}

// ── POST — login via N8N ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  let body: { username?: string; password?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
  }

  // ── Authenticate via N8N Blog Auth workflow ──────────────────────────────────
  const n8nUrl = process.env.N8N_WEBHOOK_BLOG_AUTH_URL || "https://hotbotst.app.n8n.cloud/webhook/hotbotstudios-blog-auth";
  let n8nData: { success: boolean; role?: string; userId?: string; username?: string; error?: string };
  try {
    const n8nRes = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!n8nRes.ok) {
      return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
    }
    n8nData = await n8nRes.json() as typeof n8nData;
  } catch {
    return NextResponse.json({ success: false, error: "Authentication service unavailable. Please try again." }, { status: 503 });
  }

  if (!n8nData.success) {
    return NextResponse.json({ success: false, error: n8nData.error || "Invalid username or password." }, { status: 401 });
  }

  const role             = (n8nData.role     || "admin") as Role;
  const userId           = n8nData.userId    || `n8n-${Date.now()}`;
  const authedUsername   = n8nData.username  || username;

  let sessionToken: string;
  try { sessionToken = createSession(userId, authedUsername, role); }
  catch { return NextResponse.json({ success: false, error: "Session could not be created — storage error." }, { status: 500 }); }

  const res = NextResponse.json({ success: true, token: sessionToken, role, username: authedUsername });
  setAuthCookie(res, sessionToken);
  return res;
}

// ── DELETE — logout ───────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) deleteSession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
