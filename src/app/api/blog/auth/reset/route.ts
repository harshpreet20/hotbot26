/**
 * Password reset via Supabase Auth — sends a reset email to the given address.
 * Public endpoint (no auth required) — rate-limited to 3 attempts per 5 min per IP.
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const { allowed } = rateLimit(ip, "auth-reset", { limit: 3, windowMs: 5 * 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many reset attempts. Please wait 5 minutes." },
      { status: 429 },
    );
  }

  let body: { email?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const email = (body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { success: false, error: "Password reset not available. Contact your administrator." },
      { status: 503 },
    );
  }

  const baseUrl    = process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com";
  const redirectTo = `${baseUrl}/enter/backdrop/reset-password`;

  try {
    const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      log.warn("auth.reset", `Reset failed for "${email}" — ${error.message}`, { ip });
    } else {
      log.info("auth.reset", `Password reset email sent to "${email}"`, { ip });
    }
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error("auth.reset", `Password reset error for "${email}"`, { ip, details: { error: msg } });
    return NextResponse.json(
      { success: false, error: "Unable to process reset. Please try again." },
      { status: 503 },
    );
  }
}
