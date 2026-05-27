export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { createPortalSession, buildPortalCookie } from "@/lib/portal-session";
import { rateLimit } from "@/lib/rateLimit";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function GET(req: NextRequest) {
  // Rate-limit token verification to prevent brute-force guessing of magic-link tokens
  const { allowed } = rateLimit(getIp(req), "portal-verify", { limit: 20, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.redirect(new URL("/customers?error=rate_limited", req.url));
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/customers?error=invalid_token", req.url));
  }

  // Atomically consume the token: UPDATE WHERE invite_token = $token AND not expired.
  // This closes the TOCTOU race where two concurrent requests could both pass a
  // SELECT check before either UPDATE fires — only one UPDATE can win the WHERE clause.
  const { data: user, error: consumeError } = await sb()
    .from("client_users")
    .update({
      invite_token:       null,
      invite_expires_at:  null,
      invite_accepted_at: new Date().toISOString(),
    })
    .eq("invite_token", token)
    .gt("invite_expires_at", new Date().toISOString())
    .eq("is_active", true)
    .select("id, email, name, role, client_id")
    .single();

  if (consumeError || !user) {
    // Token not found, already used, expired, or account inactive
    return NextResponse.redirect(new URL("/customers?error=invalid_token", req.url));
  }

  const sessionToken = createPortalSession(user.email);
  const cookie = buildPortalCookie(sessionToken);

  const res = NextResponse.redirect(new URL("/customers/dashboard", req.url));
  res.headers.set("Set-Cookie", cookie);
  return res;
}
