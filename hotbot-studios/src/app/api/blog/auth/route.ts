import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { rateLimit } from "@/lib/rateLimit";
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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const { allowed } = rateLimit(ip, "auth", { limit: 10, windowMs: 60_000 });
  if (!allowed) {
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
  // N8N success shape: { success: true, token, user: { id?, username?, role? }, expiresAt }
  // N8N failure shape: { success: false, error? }  (HTTP 401)
  let n8nData: {
    success: boolean;
    error?: string;
    token?: string;
    user?: { id?: string; username?: string; role?: string };
    expiresAt?: string;
  };
  try {
    const n8nRes = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!n8nRes.ok) {
      const errBody = await n8nRes.json().catch(() => ({})) as { error?: string };
      return NextResponse.json({ success: false, error: errBody.error || "Invalid username or password." }, { status: 401 });
    }
    n8nData = await n8nRes.json() as typeof n8nData;
  } catch {
    return NextResponse.json({ success: false, error: "Authentication service unavailable. Please try again." }, { status: 503 });
  }

  if (!n8nData.success) {
    return NextResponse.json({ success: false, error: n8nData.error || "Invalid username or password." }, { status: 401 });
  }

  const role           = (n8nData.user?.role     || "admin") as Role;
  const userId         =  n8nData.user?.id        || `n8n-${Date.now()}`;
  const authedUsername =  n8nData.user?.username  || username;

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
