import nodemailer from "nodemailer";
import type { NewsletterSubscriber } from "@/types/dashboard";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
const FROM_NAME  = process.env.GMAIL_FROM_NAME  ?? "HotBot Studios";
const FROM_EMAIL = process.env.GMAIL_FROM_EMAIL ?? "info@hotbotstudios.com";

function transporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: FROM_EMAIL, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

export function isNewsletterEmailConfigured(): boolean {
  return !!(process.env.GMAIL_FROM_EMAIL && process.env.GMAIL_APP_PASSWORD);
}

export function unsubToken(email: string): string {
  return Buffer.from(email.toLowerCase()).toString("base64url");
}

export function emailFromToken(token: string): string | null {
  try { return Buffer.from(token, "base64url").toString("utf-8"); }
  catch { return null; }
}

export function generateNewsletterHtml(
  subject: string,
  bodyHtml: string,
  subscriberName: string,
  subscriberEmail: string,
  logId?: string,
): string {
  const token      = unsubToken(subscriberEmail);
  const unsubUrl   = `${SITE_URL}/api/forms/newsletter/unsubscribe?token=${token}`;
  const pixelUrl   = logId ? `${SITE_URL}/api/track/pixel?id=${logId}` : null;
  const greeting   = subscriberName
    ? `Hi ${subscriberName.split(" ")[0]},`
    : "Hi there,";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:32px 40px;border-radius:16px 16px 0 0;">
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;"><tr>
            <td><img src="${SITE_URL}/logos/hotbot-logo.svg" width="120" height="30" alt="${FROM_NAME}" style="display:block;border:0;outline:none;text-decoration:none;" /></td>
          </tr></table>
          <p style="margin:0 0 4px;color:#a5b4fc;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Newsletter</p>
          <p style="margin:0;color:#818cf8;font-size:13px;">AI Automation &amp; Digital Marketing</p>
        </td></tr>
        <tr><td style="background:#1e1b4b;padding:16px 40px;border-bottom:1px solid #312e81;">
          <h2 style="margin:0;color:#e0e7ff;font-size:18px;font-weight:700;">${subject}</h2>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#111827;">${greeting}</p>
          <div style="font-size:14px;color:#374151;line-height:1.8;">
            ${bodyHtml}
          </div>
          <div style="margin-top:36px;text-align:center;">
            <a href="${SITE_URL}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
              Visit HotBot Studios →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 40px;border-radius:0 0 16px 16px;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-align:center;">
            <strong style="color:#6366f1;">${FROM_NAME}</strong> · AI Automation Agency<br>
            <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
          </p>
          <p style="margin:0;font-size:11px;color:#d1d5db;text-align:center;">
            You're receiving this because you subscribed at ${SITE_URL.replace(/^https?:\/\//, "")}.<br>
            <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  ${pixelUrl ? `<img src="${pixelUrl}" width="1" height="1" style="display:block;border:0;outline:none;text-decoration:none;" alt="" />` : ""}
</body>
</html>`;
}

export interface SendNewsletterResult {
  sent:   number;
  failed: number;
  errors: { email: string; error: string }[];
}

export async function sendNewsletter(
  subject: string,
  bodyHtml: string,
  subscribers: NewsletterSubscriber[],
): Promise<SendNewsletterResult> {
  const result: SendNewsletterResult = { sent: 0, failed: 0, errors: [] };
  if (!isNewsletterEmailConfigured() || !subscribers.length) return result;

  const t = transporter();
  for (const sub of subscribers) {
    // Pre-insert log row to get id for tracking pixel
    let logId: string | undefined;
    if (isSupabaseEnabled()) {
      const { data: logRow } = await sb().from("email_logs").insert({
        to_email:   sub.email,
        subject,
        email_type: "newsletter",
        status:     "queued",
        metadata:   { name: sub.name },
      }).select("id").single();
      logId = logRow?.id as string | undefined;
    }

    try {
      const unsubUrl  = `${SITE_URL}/api/forms/newsletter/unsubscribe?token=${unsubToken(sub.email)}`;
      const html      = generateNewsletterHtml(subject, bodyHtml, sub.name, sub.email, logId);
      await t.sendMail({
        from:    `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to:      sub.email,
        subject,
        text:    `${subject}\n\nVisit ${SITE_URL} for the full newsletter.\n\nUnsubscribe: ${unsubUrl}`,
        html,
      });
      if (logId && isSupabaseEnabled()) {
        await sb().from("email_logs").update({ status: "sent", sent_at: new Date().toISOString(), last_event: "sent" }).eq("id", logId);
      }
      result.sent++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (logId && isSupabaseEnabled()) {
        await sb().from("email_logs").update({ status: "failed", last_event: "failed", metadata: { error: errMsg } }).eq("id", logId);
      }
      result.failed++;
      result.errors.push({ email: sub.email, error: errMsg });
    }
  }

  return result;
}
