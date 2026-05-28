/**
 * PATCH /api/dashboard/clients/[id]/status
 * Suspend, terminate, or reactivate a client account.
 * Requires super_admin or admin role.
 * Sends an email notification and logs to crm_updates.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { readAll, updateById, insert, newId } from "@/lib/store";
import { sb } from "@/lib/supabase";
import { Resend } from "resend";
import type { Client, CRMUpdate } from "@/types/dashboard";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
const FROM_NAME = process.env.RESEND_FROM_NAME     ?? "HotBot Studios";
const FROM_ADDR = process.env.RESEND_FROM_EMAIL    ?? "noreply@hotbotstudios.com";
const FROM      = `${FROM_NAME} <${FROM_ADDR}>`;

function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;">
    <tr><td align="center" style="padding:40px 16px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#2e1065 100%);padding:28px 36px;border-radius:16px 16px 0 0;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${FROM_NAME}</p>
          <p style="margin:2px 0 0;color:#a5b4fc;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">${title}</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px 36px 28px;border-radius:0 0 16px 16px;">
          ${body}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${FROM_NAME} &nbsp;·&nbsp;
              <a href="${SITE_URL}" style="color:#6366f1;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
            </p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendAccountStatusEmail(
  to: string,
  clientName: string,
  action: "suspend" | "terminate",
  reason?: string,
): Promise<void> {
  const resend = resendClient();
  if (!resend || !to) return;

  const isSuspend = action === "suspend";
  const title     = isSuspend ? "Account Suspended" : "Account Terminated";
  const subject   = isSuspend
    ? `${FROM_NAME}: Your account has been placed on hold`
    : `${FROM_NAME}: Your account has been terminated`;

  const reasonHtml = reason
    ? `<div style="background:#fff7ed;border-left:3px solid #f59e0b;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#f59e0b;text-transform:uppercase;">Reason</p>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${reason}</p>
       </div>`
    : "";

  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;">Dear ${clientName},</p>
    ${isSuspend
      ? `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
           We are writing to inform you that your account with <strong>${FROM_NAME}</strong> has been temporarily
           <strong style="color:#f59e0b;">placed on hold</strong> due to an outstanding invoice.
         </p>
         ${reasonHtml}
         <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
           To reinstate your account, please settle the outstanding balance at your earliest convenience.
           Once payment is confirmed, your account will be reactivated promptly.
         </p>
         <a href="${SITE_URL}/contact" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Contact Us to Resolve</a>`
      : `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
           We are writing to inform you that your account with <strong>${FROM_NAME}</strong> has been
           <strong style="color:#ef4444;">terminated</strong>.
         </p>
         ${reasonHtml}
         <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
           If you believe this has been done in error or would like to discuss this further, please contact us immediately.
         </p>
         <a href="${SITE_URL}/contact" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Contact Us</a>`
    }
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html: wrap(title, body), text: `Dear ${clientName},\n\n${isSuspend ? "Your account has been placed on hold." : "Your account has been terminated."}\n\n${reason ? `Reason: ${reason}\n\n` : ""}Contact us: ${SITE_URL}/contact\n\n${FROM_NAME}` });
  } catch (err) {
    console.error("[client-status] email error:", err instanceof Error ? err.message : err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized or insufficient permissions" }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: "Client id required" }, { status: 400 });

  const body = await req.json() as {
    action?: "suspend" | "terminate" | "reactivate";
    reason?: string;
  };

  const { action, reason } = body;
  if (!action || !["suspend", "terminate", "reactivate"].includes(action)) {
    return NextResponse.json({ error: "action must be one of: suspend, terminate, reactivate" }, { status: 400 });
  }

  // Fetch client
  const clients = await readAll<Client & { accountStatus?: string }>("clients");
  const client  = clients.find((c) => c.id === id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const now = new Date().toISOString();

  // Build update payload
  type AccountStatus = "active" | "suspended" | "terminated";
  let newAccountStatus: AccountStatus;
  let suspendedAt: string | null = null;
  let suspensionReason: string | null = null;

  if (action === "suspend") {
    newAccountStatus = "suspended";
    suspendedAt      = now;
    suspensionReason = reason ?? null;
  } else if (action === "terminate") {
    newAccountStatus = "terminated";
    suspendedAt      = now;
    suspensionReason = reason ?? null;
  } else {
    newAccountStatus = "active";
    suspendedAt      = null;
    suspensionReason = null;
  }

  // Update via Supabase directly (account_status / suspended_at / suspension_reason are
  // new columns not yet in the TypeScript type, so we call sb() directly).
  try {
    const { error } = await sb()
      .from("clients")
      .update({
        account_status:    newAccountStatus,
        suspended_at:      suspendedAt,
        suspension_reason: suspensionReason,
        updated_at:        now,
      })
      .eq("id", id);

    if (error) {
      console.error("[client-status] db update error:", error.message);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  } catch (err) {
    console.error("[client-status] unexpected error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to update client status" }, { status: 500 });
  }

  // Log to crm_updates
  const crmEntry: CRMUpdate = {
    id:        newId(),
    leadId:    id, // reusing leadId field to link to client id
    type:      "account_status_change" as CRMUpdate["type"],
    content:   `Account status changed to "${newAccountStatus}" by ${session.username}${reason ? `. Reason: ${reason}` : ""}.`,
    createdAt: now,
    createdBy: session.username,
    metadata:  {
      entityType:       "client",
      clientId:         client.clientId,
      previousStatus:   String(client.accountStatus ?? "active"),
      newStatus:        newAccountStatus,
      ...(reason ? { reason } : {}),
    },
  };
  try {
    await insert<CRMUpdate>("crm_updates", crmEntry);
  } catch (err) {
    console.error("[client-status] crm_updates insert error:", err instanceof Error ? err.message : err);
  }

  // Send email notification (fire-and-forget for suspend/terminate)
  if ((action === "suspend" || action === "terminate") && client.email) {
    sendAccountStatusEmail(client.email, client.name, action, reason).catch(console.error);
  }

  return NextResponse.json({
    success:       true,
    clientId:      client.clientId,
    accountStatus: newAccountStatus,
  });
}
