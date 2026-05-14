/**
 * Password reset via Firebase — sends a reset email to the given address.
 * Public endpoint (no auth required) — rate-limited to 3 attempts per 5 min per IP.
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { resolveLoginEmail } from "@/lib/firebase";
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

  const identifier = (body.email || "").trim();
  if (!identifier) {
    return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    log.error("auth.reset", `Password reset failed — NEXT_PUBLIC_FIREBASE_API_KEY not set`, { ip });
    return NextResponse.json(
      { success: false, error: "Firebase not configured. Contact your administrator." },
      { status: 503 },
    );
  }

  const email = resolveLoginEmail(identifier);

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ requestType: "PASSWORD_RESET", email }),
        signal:  AbortSignal.timeout(8_000),
      },
    );

    const data = await res.json() as { email?: string; error?: { message?: string } };

    if (!res.ok) {
      const raw = data.error?.message ?? "unknown";
      log.warn("auth.reset", `Password reset failed for "${email}" — ${raw}`, { ip, details: { raw } });

      // Firebase returns EMAIL_NOT_FOUND but we don't expose this to prevent enumeration
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    log.info("auth.reset", `Password reset email sent to "${email}"`, { ip });
    return NextResponse.json({
      success: true,
      message: "Password reset email sent. Check your inbox (and spam folder).",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error("auth.reset", `Password reset network error for "${email}"`, { ip, details: { error: msg } });
    return NextResponse.json(
      { success: false, error: "Unable to reach authentication server. Try again." },
      { status: 503 },
    );
  }
}
