import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
import { sendRegistrationConfirmation } from "@/lib/resend";
import type { Role } from "@/types/dashboard";

const VALID_ROLES: Role[] = ["manager", "sales", "crm_operator", "finance", "editor", "contributor", "agent"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

  const { allowed } = rateLimit(ip, "register", { limit: 3, windowMs: 3_600_000 });
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { success: false, error: "Registration is not available. Contact your administrator." },
      { status: 503 },
    );
  }

  let body: { name?: string; email?: string; password?: string; requestedRole?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 }); }

  const name          = (body.name || "").trim();
  const email         = (body.email || "").trim().toLowerCase();
  const password      = (body.password || "").trim();
  const requestedRole = (body.requestedRole || "contributor") as Role;

  if (!name || name.length < 2)
    return NextResponse.json({ success: false, error: "Full name is required." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
  if (!password || password.length < 8)
    return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
  if (!VALID_ROLES.includes(requestedRole))
    return NextResponse.json({ success: false, error: "Invalid role requested." }, { status: 400 });

  const baseUrl       = process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com";
  const emailRedirect = `${baseUrl}/enter/backdrop?verified=1`;

  // Create Supabase Auth user — sends email verification automatically
  const { data: authData, error: authError } = await sb().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: emailRedirect,
      data: { name, requestedRole },
    },
  });

  if (authError) {
    const msg = authError.message ?? "";
    log.warn("register.error", `signUp failed for "${email}"`, { ip, details: { error: msg } });
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
      return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Registration failed. Please try again." }, { status: 500 });
  }

  if (!authData.user) {
    return NextResponse.json({ success: false, error: "Registration failed. Please try again." }, { status: 500 });
  }

  // Supabase returns an empty identities array for already-registered emails (prevents enumeration)
  if (authData.user.identities && authData.user.identities.length === 0) {
    return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
  }

  // Email auto-confirmed (project has email confirm disabled) → go straight to pending_approval
  const emailConfirmed = !!authData.user.email_confirmed_at || !!authData.session;
  const status = emailConfirmed ? "pending_approval" : "pending_email";

  const { error: dbError } = await sb().from("backdrop_users").insert({
    id:         authData.user.id,
    email,
    username:   name,
    role:       requestedRole,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (dbError) {
    // Clean up orphaned auth user on DB failure
    await sb().auth.admin.deleteUser(authData.user.id).catch(() => {});
    if (dbError.code === "23505") {
      return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
    }
    log.error("register.db_error", `backdrop_users insert failed for "${email}"`, { ip, details: { error: dbError.message } });
    return NextResponse.json({ success: false, error: "Registration failed. Please try again." }, { status: 500 });
  }

  log.info("register.success", `New registration: "${email}" (${requestedRole})`, { ip, details: { status } });

  sendRegistrationConfirmation({ name, email, role: requestedRole, needsVerification: !emailConfirmed }).catch(() => {});

  if (emailConfirmed) {
    return NextResponse.json({
      success: true,
      message: "Account created! Your request is pending administrator approval. You'll be able to sign in once approved.",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Account created! Check your email for a verification link. After verifying, an administrator will review your access request.",
  });
}
