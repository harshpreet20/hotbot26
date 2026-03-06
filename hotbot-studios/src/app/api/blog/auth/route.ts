import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME    = process.env.BLOG_ADMIN_USERNAME    || "admin";
const ADMIN_PASSWORD    = process.env.BLOG_ADMIN_PASSWORD    || "";
const BLOG_SECRET       = process.env.BLOG_PUBLISH_SECRET    || "hotbot-blog-secret-2026";
const N8N_BASE          = process.env.N8N_BASE_URL            || "";
const N8N_AUTH_ENDPOINT = process.env.N8N_WEBHOOK_BLOG_AUTH  || "";

const COOKIE_NAME   = "backdrop_auth";
const COOKIE_MAX_S  = 60 * 60 * 24 * 30; // 30 days

// ── simple in-memory rate limiter (per-IP, resets every 60s) ────────────────
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

// constant-time string compare to prevent timing attacks
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

  // ── Option A: proxy to N8N (if fully configured) ───────────────────────────
  if (N8N_BASE && N8N_AUTH_ENDPOINT) {
    try {
      const url = N8N_BASE.replace(/\/$/, "") + "/" + N8N_AUTH_ENDPOINT.replace(/^\//, "");
      const n8nRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(8000),
      });
      if (n8nRes.ok) {
        const data = await n8nRes.json() as { success?: boolean; token?: string; error?: string };
        if (data.success && data.token) {
          const res = NextResponse.json({ success: true, token: data.token });
          setAuthCookie(res, data.token);
          return res;
        }
        return NextResponse.json(
          { success: false, error: data.error || "Invalid credentials." },
          { status: 401 },
        );
      }
    } catch {
      // N8N unreachable → fall through to local validation
      console.warn("[blog/auth] N8N unreachable — falling back to local validation");
    }
  }

  // ── Option B: validate locally against env vars ─────────────────────────────
  if (safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD)) {
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
