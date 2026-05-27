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

  const { data: user } = await sb()
    .from("client_users")
    .select("id, email, name, role, client_id, invite_expires_at, is_active")
    .eq("invite_token", token)
    .single();

  if (!user) {
    return NextResponse.redirect(new URL("/customers?error=invalid_token", req.url));
  }

  if (!user.is_active) {
    return NextResponse.redirect(new URL("/customers?error=inactive", req.url));
  }

  if (user.invite_expires_at && new Date(user.invite_expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/customers?error=expired", req.url));
  }

  await sb()
    .from("client_users")
    .update({
      invite_token:       null,
      invite_expires_at:  null,
      invite_accepted_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  const sessionToken = createPortalSession(user.email);
  const cookie = buildPortalCookie(sessionToken);

  const res = NextResponse.redirect(new URL("/customers/dashboard", req.url));
  res.headers.set("Set-Cookie", cookie);
  return res;
}
