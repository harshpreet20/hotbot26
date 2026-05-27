export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sb } from "@/lib/supabase";
import { sendPortalInvite } from "@/lib/resend";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";

export async function POST(req: NextRequest) {
  // Admin-only endpoint — requires a valid admin backdrop session token.
  // Previously used BACKDROP_ADMIN_SECRET (static env var), but the admin UI sends
  // the per-session Bearer token (sessionStorage.backdrop_secret). Using authorizeAny
  // here ensures the same auth path as every other admin API route.
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, name, clientId, invitedBy, role } = (await req.json()) as {
    email?: string;
    name?: string;
    clientId?: string;
    invitedBy?: string;
    role?: string;
  };

  // Validate role — only values the DB CHECK constraint accepts
  const VALID_ROLES = ["owner", "admin", "member", "viewer"] as const;
  type ClientRole = typeof VALID_ROLES[number];
  const clientRole: ClientRole = VALID_ROLES.includes(role as ClientRole)
    ? (role as ClientRole)
    : "member";

  if (!email || !clientId) {
    return NextResponse.json({ error: "email and clientId required" }, { status: 400 });
  }

  // Verify client exists
  const { data: client } = await sb()
    .from("clients")
    .select("id, name, client_id")
    .eq("client_id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Check if user already exists
  const { data: existing } = await sb()
    .from("client_users")
    .select("id, email, invite_accepted_at")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing?.invite_accepted_at) {
    return NextResponse.json({ ok: true, message: "User already active", skipped: true });
  }

  const token   = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "https://hotbotstudios.com";
  const setupLink = `${appUrl}/customers/setup?token=${token}`;

  if (existing) {
    // Resend invite — update token and refresh role in case admin changed it
    await sb()
      .from("client_users")
      .update({
        invite_token:     token,
        invite_expires_at: expires,
        invited_by:       invitedBy ?? null,
        role:             clientRole,
      })
      .eq("id", existing.id);
  } else {
    await sb().from("client_users").insert({
      email:             email.toLowerCase().trim(),
      name:              name ?? "",
      client_id:         clientId,
      role:              clientRole,
      invite_token:      token,
      invite_expires_at: expires,
      invited_by:        invitedBy ?? null,
      is_active:         true,
    });
  }

  // Enable portal on client record
  await sb()
    .from("clients")
    .update({ portal_enabled: true })
    .eq("client_id", clientId);

  await sendPortalInvite(email, name ?? email, client.name, setupLink);

  return NextResponse.json({ ok: true, setupLink });
}
