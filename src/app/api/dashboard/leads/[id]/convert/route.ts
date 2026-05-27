import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";
import { newId } from "@/lib/store";
import { fireJourneyEvent } from "@/lib/journey";
import { sendClientWelcomeEmail } from "@/lib/resend";
import { sendPortalInvite } from "@/lib/resend";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeRole(
    extractToken(req),
    "super_admin", "admin", "manager", "sales"
  );
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // 1. Fetch lead
  const { data: lead, error: leadError } = await sb()
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // 2. Check if already converted
  if (lead.journey_stage === "client") {
    return NextResponse.json({ error: "Already converted" }, { status: 409 });
  }

  // 3. Create client record
  const clientId = newId(); // UUID — clients.id

  // Generate a unique HBS-XXXXX code for clients.client_id (required NOT NULL UNIQUE).
  // Uses crypto.randomBytes for cryptographic randomness — 3 bytes = 16M combinations
  // in hex uppercase = HBS-XXXXXX (6 hex chars, 16^6 ≈ 16.7M space), far safer than
  // Math.random() (birthday collision at ~780 with Math.random's 5-char base36).
  // On the rare UNIQUE constraint collision the caller gets a clear 500 and can retry.
  const hbsCode = "HBS-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const { error: clientError } = await sb()
    .from("clients")
    .insert({
      id:         clientId,
      client_id:  hbsCode,
      name:       lead.name,
      email:      lead.email,
      phone:      lead.phone,
      company:    lead.company,
      status:     "active",
      notes:      `Converted from lead on ${new Date().toISOString()}. Service: ${lead.service}. Budget: ${lead.budget}`,
      lead_id:    lead.id,
      created_at: new Date().toISOString(),
    });

  if (clientError) {
    console.error("[convert] client insert error:", clientError.message);
    return NextResponse.json({ error: "Failed to create client record" }, { status: 500 });
  }

  // 3b. Create client_users entry so the converted client can log into the portal.
  // Without this row, /api/customers/me returns 404 and the magic-link flow fails
  // (no client_users row → nothing to send a link to). The row is created inactive
  // pending the invite — the admin must click "Invite to Portal" to send the link
  // and update is_active. Alternatively, convert fires the invite automatically.
  const inviteToken   = crypto.randomBytes(32).toString("hex");
  const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? "https://hotbotstudios.com";
  const setupLink     = `${appUrl}/customers/setup?token=${inviteToken}`;

  const { error: cuError } = await sb().from("client_users").insert({
    email:             lead.email.toLowerCase().trim(),
    name:              lead.name,
    client_id:         hbsCode,
    role:              "owner",          // primary contact — full portal access
    invite_token:      inviteToken,
    invite_expires_at: inviteExpires,
    invited_by:        session.username,
    is_active:         true,
  });

  if (cuError && !cuError.message.includes("duplicate")) {
    // Non-fatal: log but continue — admin can re-invite via client detail page
    console.error("[convert] client_users insert error:", cuError.message);
  }

  // 4. Update lead
  const { error: updateError } = await sb()
    .from("leads")
    .update({ journey_stage: "client", status: "converted" })
    .eq("id", id);

  if (updateError) {
    console.error("[convert] lead update error:", updateError.message);
  }

  // 5. Send client welcome email + portal invite (fire-and-forget)
  sendClientWelcomeEmail({
    name:        lead.name,
    email:       lead.email,
    company:     lead.company ?? undefined,
    service:     lead.service ?? undefined,
    convertedBy: session.username,
    clientId,
    leadId:      lead.id,
  }).catch(() => {});

  // Send portal setup link so the client can activate their portal access
  // immediately after conversion without waiting for a manual invite from admin.
  sendPortalInvite(
    lead.email,
    lead.name,
    lead.company ?? lead.name,
    setupLink,
  ).catch(() => {});

  // 6. Fire journey event (fire-and-forget)
  fireJourneyEvent({
    sessionId: lead.session_id ?? null,
    email: lead.email,
    stage: "client",
    leadId: lead.id,
    clientId,
    source: lead.source ?? null,
    metadata: { converted_by: session.username },
  }).catch(() => {});

  return NextResponse.json({ success: true, clientId });
}
