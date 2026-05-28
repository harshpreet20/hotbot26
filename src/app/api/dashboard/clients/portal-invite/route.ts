import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";

// POST — create and send a portal invite for a client
export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = extractToken(req);
  const session = await authorizeRole(token, "admin", "manager", "super_admin");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }

  let body: { clientId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { clientId } = body;
  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  // Fetch client record
  const { data: client, error: clientError } = await sb()
    .from("clients")
    .select("id, client_id, name, email, company, status")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (!client.email) {
    return NextResponse.json(
      { error: "This client does not have an email address" },
      { status: 400 }
    );
  }

  // Check for existing client_users record
  const { data: existingUser } = await sb()
    .from("client_users")
    .select("id, invite_accepted_at")
    .eq("email", client.email)
    .single();

  if (existingUser?.invite_accepted_at) {
    return NextResponse.json(
      { error: "This client has already set up their portal access" },
      { status: 400 }
    );
  }

  const inviteToken = crypto.randomBytes(32).toString("hex");
  const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  if (existingUser) {
    // Update existing record
    const { error: updateError } = await sb()
      .from("client_users")
      .update({
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        invited_by: session.username,
        updated_at: now,
      })
      .eq("id", existingUser.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update invite" },
        { status: 500 }
      );
    }
  } else {
    // Insert new record
    const { error: insertError } = await sb()
      .from("client_users")
      .insert({
        client_id: client.id,
        email: client.email,
        name: client.name ?? client.company ?? "",
        role: "client",
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        invited_by: session.username,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create portal user" },
        { status: 500 }
      );
    }
  }

  // Mark invite sent on client record
  await sb()
    .from("clients")
    .update({ portal_invite_sent_at: now })
    .eq("id", client.id);

  // Send invite email
  const inviteLink = `${SITE_URL}/portal/setup-password?token=${inviteToken}`;
  const clientName = client.name ?? client.company ?? "there";

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@hotbotstudios.com",
      to: client.email,
      subject: "HotBot Studios: You've been invited to the Client Portal",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Client Portal Invite</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                HotBot Studios
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
                Welcome to the Client Portal
              </h2>
              <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.6;">
                Hi ${clientName},
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
                You've been invited to access the HotBot Studios Client Portal, where you can
                view your project tickets, invoices, and more.
              </p>
              <p style="margin:0 0 32px;color:#475569;font-size:16px;line-height:1.6;">
                Click the button below to set up your password and access your portal.
                This link will expire in <strong>48 hours</strong>.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background-color:#2563eb;">
                    <a href="${inviteLink}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:6px;">
                      Set Up Portal Access
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${inviteLink}" style="color:#2563eb;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} HotBot Studios. All rights reserved.
              </p>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  }

  return NextResponse.json({ success: true, email: client.email });
}
