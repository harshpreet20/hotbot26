import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createSession, getSession, deleteSession } from "@/lib/sessions";
import { getUserByUsername, getEnvFallbackUser, createUser, isSetupNeeded } from "@/lib/adminStore";
import { rateLimit } from "@/lib/rateLimit";
import type { Role, UserRecord } from "@/types/dashboard";

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
  const needsSetup = await isSetupNeeded();
  return NextResponse.json({ needsSetup, authenticated: false });
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

  let body: {
    username?: string;
    password?: string;
    setup?: boolean;
    confirmPassword?: string;
  };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  // ── First-run setup ───────────────────────────────────────────────────────
  if (body.setup) {
    const needsSetup = await isSetupNeeded();
    if (!needsSetup) {
      return NextResponse.json(
        { success: false, error: "Setup already completed." },
        { status: 409 }
      );
    }

    const setupUsername = (body.username || "").trim();
    const setupPassword = (body.password || "").trim();
    const confirmPassword = (body.confirmPassword || "").trim();

    if (!setupUsername || setupUsername.length < 3) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (!setupPassword || setupPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (setupPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(setupPassword, 12);
    const newUser: UserRecord = {
      id:           `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      username:     setupUsername,
      passwordHash,
      role:         "admin",
      createdAt:    new Date().toISOString(),
    };
    await createUser(newUser);

    let sessionToken: string;
    try {
      sessionToken = await createSession(newUser.id, newUser.username, newUser.role as Role);
    } catch {
      return NextResponse.json(
        { success: false, error: "Session could not be created — storage error." },
        { status: 500 }
      );
    }

    const setupRes = NextResponse.json({
      success:  true,
      token:    sessionToken,
      role:     newUser.role,
      username: newUser.username,
    });
    setAuthCookie(setupRes, sessionToken);
    return setupRes;
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const username = (body.username || "").trim();
  const password = (body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Username and password are required." },
      { status: 400 }
    );
  }

  // Look up user from Supabase or filesystem, with env-var fallback
  let user = await getUserByUsername(username);
  if (!user) user = getEnvFallbackUser();
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
