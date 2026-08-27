/**
 * Completes a Supabase password-reset flow.
 * Accepts the access_token from the reset-link URL hash, validates it,
 * updates the user's password, then creates a Backdrop session so the
 * user lands directly in the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { createSession } from "@/lib/sessions";
import { rateLimit } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = await rateLimit(ip, "set-password", { limit: 5, windowMs: 15 * 60_000 });
  if (!allowed) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Auth not available." }, { status: 503 });
  }

  let body: { accessToken?: string; newPassword?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { accessToken, newPassword } = body;
  if (!accessToken) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // Validate the recovery access token by asking Supabase who it belongs to
  const { data: userData, error: getUserError } = await sb().auth.getUser(accessToken);
  if (getUserError || !userData?.user) {
    log.warn("auth.set-password", `Invalid recovery token from ${ip}`);
    return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 401 });
  }

  const user = userData.user;

  // Update the password via admin API
  const { error: updateError } = await sb().auth.admin.updateUserById(user.id, { password: newPassword });
  if (updateError) {
    log.error("auth.set-password", `Password update failed for ${user.email}`, { ip, details: { error: updateError.message } });
    return NextResponse.json({ error: "Failed to update password. Please try again." }, { status: 500 });
  }

  // Look up backdrop_users for role/username
  const { data: userRow } = await sb()
    .from("backdrop_users")
    .select("id, username, role, status")
    .eq("id", user.id)
    .single();

  if (!userRow || userRow.status !== "approved") {
    log.info("auth.set-password", `Password updated for unapproved user ${user.email} — no session created`);
    return NextResponse.json({
      success: true,
      message: "Password updated. Your account is pending administrator approval.",
    });
  }

  // Create a Backdrop session so they land in the dashboard
  const sessionToken = await createSession(user.id, userRow.username as string, userRow.role as Role);
  log.info("auth.set-password", `Password reset complete for "${userRow.username}"`, { ip });

  const res = NextResponse.json({
    success:  true,
    token:    sessionToken,
    role:     userRow.role,
    username: userRow.username,
  });
  setAuthCookie(res, sessionToken);
  return res;
}
