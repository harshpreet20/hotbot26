import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";
import {
  createPortalSession,
  getPortalSession,
  deletePortalSession,
  cachePortalSession,
  PortalUser,
} from "@/lib/portalAuth";

const COOKIE_NAME = "portal_session";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// GET — check current session
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await getPortalSession(token);
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, user });
}

// POST — customer login
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed } = await rateLimit(ip, "portal-login", { limit: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Portal requires database connection" },
      { status: 503 }
    );
  }

  const { data: userRow, error } = await sb()
    .from("client_users")
    .select(
      "id, client_id, email, name, role, password_hash, invite_accepted_at, is_active"
    )
    .eq("email", email.toLowerCase().trim())
    .eq("is_active", true)
    .single();

  if (error || !userRow) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  if (!userRow.password_hash) {
    return NextResponse.json(
      {
        error:
          "Please set up your password first. Check your email for the invite link.",
      },
      { status: 401 }
    );
  }

  if (!userRow.invite_accepted_at) {
    return NextResponse.json(
      {
        error:
          "Please set up your password first. Check your email for the invite link.",
      },
      { status: 401 }
    );
  }

  const passwordValid = await bcrypt.compare(password, userRow.password_hash);
  if (!passwordValid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Resolve clientRef from clients table
  const { data: clientRow } = await sb()
    .from("clients")
    .select("id, client_id")
    .eq("id", userRow.client_id)
    .single();

  const token = await createPortalSession(userRow.id);

  const portalUser: PortalUser = {
    id: userRow.id,
    clientId: userRow.client_id,
    clientRef: clientRow?.client_id ?? "",
    email: userRow.email,
    name: userRow.name,
    role: userRow.role,
  };

  // Keep in-memory fallback cache as well (no-op if Supabase is enabled but harmless)
  cachePortalSession(token, portalUser, Date.now() + MAX_AGE * 1000);

  const res = NextResponse.json({ success: true, user: portalUser });
  setSessionCookie(res, token);
  return res;
}

// DELETE — logout or account deletion
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const action = new URL(req.url).searchParams.get("action");
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (action === "delete-account") {
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await getPortalSession(token);
    if (!user) return NextResponse.json({ error: "Session invalid" }, { status: 401 });

    if (isSupabaseEnabled()) {
      await sb()
        .from("client_users")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", user.id);
    }

    await deletePortalSession(token);
    const res = NextResponse.json({ success: true, message: "Account scheduled for deletion in 30 days." });
    clearSessionCookie(res);
    return res;
  }

  if (token) {
    await deletePortalSession(token);
  }

  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
