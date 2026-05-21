export const dynamic = "force-dynamic";
/**
 * GET /api/customers/auth/admin-preview?client_id=XXX&token=BACKDROP_TOKEN
 *
 * Allows a backdrop admin (manager+) to impersonate a client portal user.
 * Verifies the backdrop token, looks up the portal user for the given client,
 * creates a portal session, and redirects to /customers/dashboard with the
 * portal session cookie set.
 */
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { authorizeRole } from "@/lib/dashboardAuth";
import { createPortalSession, buildPortalCookie } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token     = searchParams.get("token");
  const client_id = searchParams.get("client_id");

  // Must be manager+ in backdrop
  const session = await authorizeRole(token, "super_admin", "admin", "manager");
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  if (!client_id) {
    return new NextResponse("client_id is required", { status: 400 });
  }

  // Find the primary portal user for this client
  const { data: user } = await sb()
    .from("client_users")
    .select("email, name")
    .eq("client_id", client_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!user) {
    return new NextResponse(
      "No portal user found for this client. Send a portal invite first.",
      { status: 404 }
    );
  }

  const sessionToken = createPortalSession(user.email);
  const cookie       = buildPortalCookie(sessionToken);

  const redirectUrl = new URL("/customers/dashboard", req.nextUrl.origin);
  const response    = NextResponse.redirect(redirectUrl, { status: 302 });
  response.headers.set("Set-Cookie", cookie);
  return response;
}
