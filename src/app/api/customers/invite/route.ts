export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sb } from "@/lib/supabase";
import { sendPortalInvite } from "@/lib/resend";

const BACKDROP_SECRET = process.env.BACKDROP_ADMIN_SECRET ?? process.env.NEXT_PUBLIC_BACKDROP_SECRET ?? "";

export async function POST(req: NextRequest) {
  // Admin-only endpoint — protected by backdrop secret
  const auth = req.headers.get("authorization") ?? "";
  if (!BACKDROP_SECRET || auth !== `Bearer ${BACKDROP_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, clientId, invitedBy } = (await req.json()) as {
    email?: string;
    name?: string;
    clientId?: string;
    invitedBy?: string;
  };

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
    // Resend invite
    await sb()
      .from("client_users")
      .update({ invite_token: token, invite_expires_at: expires, invited_by: invitedBy ?? null })
      .eq("id", existing.id);
  } else {
    await sb().from("client_users").insert({
      email:           email.toLowerCase().trim(),
      name:            name ?? "",
      client_id:       clientId,
      role:            "member",
      invite_token:    token,
      invite_expires_at: expires,
      invited_by:      invitedBy ?? null,
      is_active:       true,
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
