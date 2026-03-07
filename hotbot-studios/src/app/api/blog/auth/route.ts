import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── Credentials file (NOT in public/ — never HTTP-accessible) ────────────────
const CREDS_FILE = path.join(process.cwd(), "data", "admin.json");

interface AdminCreds {
  username: string;
  passwordHash: string;
  publishSecret: string;
  createdAt: string;
}

function readCreds(): AdminCreds | null {
  try {
    const raw = fs.readFileSync(CREDS_FILE, "utf-8");
    return JSON.parse(raw) as AdminCreds;
  } catch {
    return null;
  }
}

function writeCreds(creds: AdminCreds): void {
  const dir = path.dirname(CREDS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2), { encoding: "utf-8", mode: 0o600 });
}

// ── Resolve active credentials (file takes precedence over env vars) ─────────
function getActiveCreds(): AdminCreds | null {
  const fileCreds = readCreds();
  if (fileCreds) return fileCreds;

  // Fall back to env vars (legacy / manual configuration)
  const passwordHash = process.env.BLOG_ADMIN_PASSWORD_HASH || "";
  const publishSecret = process.env.BLOG_PUBLISH_SECRET || "";
  if (passwordHash && publishSecret) {
    return {
      username: process.env.BLOG_ADMIN_USERNAME || "admin",
      passwordHash,
      publishSecret,
      createdAt: "",
    };
  }

  return null; // no credentials at all → setup required
}

function isSetupNeeded(): boolean {
  return getActiveCreds() === null;
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
const COOKIE_NAME  = "backdrop_auth";
const COOKIE_MAX_S = 60 * 60 * 24 * 30; // 30 days

function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_S,
  });
}

// ── In-memory rate limiter (per-IP, resets every 60 s) ───────────────────────
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

// Constant-time string comparison to prevent timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // still run a loop to keep timing consistent
    let _d = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) _d += (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── GET /api/blog/auth  — check whether first-run setup is needed ─────────────
export async function GET() {
  return NextResponse.json({ needsSetup: isSetupNeeded() });
}

// ── POST /api/blog/auth  — login OR first-run setup ──────────────────────────
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

  let body: { username?: string; password?: string; confirmPassword?: string; setup?: boolean };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const username = (body.username || "").trim();
  const password = (body.password || "").trim();

  if (!username || !password) {
    return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
  }

  // ── First-run setup ──────────────────────────────────────────────────────
  if (body.setup === true) {
    if (!isSetupNeeded()) {
      return NextResponse.json(
        { success: false, error: "Admin account already exists. Please log in normally." },
        { status: 409 },
      );
    }

    const confirmPassword = (body.confirmPassword || "").trim();
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ success: false, error: "Username must be at least 3 characters." }, { status: 400 });
    }

    const passwordHash  = await bcrypt.hash(password, 12);
    // Reuse env-var secret if already configured, otherwise generate one
    const publishSecret =
      process.env.BLOG_PUBLISH_SECRET ||
      crypto.randomBytes(32).toString("hex");

    const creds: AdminCreds = {
      username,
      passwordHash,
      publishSecret,
      createdAt: new Date().toISOString(),
    };
    writeCreds(creds);

    const res = NextResponse.json({ success: true, token: publishSecret });
    setAuthCookie(res, publishSecret);
    return res;
  }

  // ── Normal login ─────────────────────────────────────────────────────────
  const creds = getActiveCreds();
  if (!creds) {
    // Credentials not configured and setup flag not sent
    return NextResponse.json(
      { success: false, error: "No admin account found. Please complete first-time setup.", needsSetup: true },
      { status: 409 },
    );
  }

  const usernameOk = safeEqual(username, creds.username);
  const passwordOk = await bcrypt.compare(password, creds.passwordHash);

  if (usernameOk && passwordOk) {
    const res = NextResponse.json({ success: true, token: creds.publishSecret });
    setAuthCookie(res, creds.publishSecret);
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
