import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { createPortalSession, cachePortalSession, PortalUser } from "@/lib/portalAuth";

const COOKIE_NAME = "portal_session";
const MAX_AGE = 2 * 60 * 60; // 2-hour impersonation session

// GET — exchange impersonation token for a portal session
export async function GET(req: NextRequest): Promise<NextResponse> {
  const t = new URL(req.url).searchParams.get("t");
  if (!t) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  // Validate the token via the impersonation API (same process)
  const tokenRes = await fetch(
    `${new URL(req.url).origin}/api/dashboard/clients/portal-impersonate?t=${encodeURIComponent(t)}`,
    { method: "GET" }
  );

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/portal/login?error=expired", req.url));
  }

  const { clientEmail } = await tokenRes.json() as { clientEmail: string };

  if (!isSupabaseEnabled()) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  // Look up the client_user
  const { data: userRow } = await sb()
    .from("client_users")
    .select("id, client_id, email, name, role")
    .eq("email", clientEmail)
    .eq("is_active", true)
    .single();

  if (!userRow) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  const { data: clientRow } = await sb()
    .from("clients")
    .select("id, client_id")
    .eq("id", userRow.client_id)
    .single();

  const sessionToken = await createPortalSession(userRow.id as string);
  const portalUser: PortalUser = {
    id:        userRow.id as string,
    clientId:  userRow.client_id as string,
    clientRef: (clientRow?.client_id as string) ?? "",
    email:     userRow.email as string,
    name:      userRow.name as string,
    role:      (userRow.role as string) ?? "client",
  };
  cachePortalSession(sessionToken, portalUser, Date.now() + MAX_AGE * 1000);

  const res = NextResponse.redirect(new URL("/portal/dashboard", req.url));
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
