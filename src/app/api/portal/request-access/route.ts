import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sb, isSupabaseEnabled } from '@/lib/supabase';
import { Resend } from 'resend';

const FROM_NAME = process.env.RESEND_FROM_NAME ?? 'HotBot Studios';
const FROM_ADDR = process.env.RESEND_FROM_EMAIL ?? 'noreply@hotbotstudios.com';
const FROM = `${FROM_NAME} <${FROM_ADDR}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hotbotstudios.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hotbotstudios.com';

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function buildMagicLinkEmail(email: string, token: string): string {
  const magicLink = `${APP_URL}/portal/access?token=${token}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Invoice Portal Access</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;">
    <tr><td align="center" style="padding:40px 16px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#2e1065 100%);padding:28px 36px;border-radius:16px 16px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <img src="${SITE_URL}/logos/brand-logo.png" width="160" height="40" alt="${FROM_NAME}" style="display:block;border:0;outline:none;text-decoration:none;" />
              </td>
              <td style="padding-left:12px;">
                <p style="margin:2px 0 0;color:#a5b4fc;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">Invoice Portal Access</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px 36px 28px;border-radius:0 0 16px 16px;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;">Hi there,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
            You requested access to your invoice portal at <strong>${FROM_NAME}</strong>. Click the button below to securely access your invoices.
          </p>
          <div style="background:#eff6ff;border-left:4px solid #6366f1;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Security notice</p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">This link is valid for <strong>24 hours</strong> and can only be used once. If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div style="margin-bottom:28px;text-align:left;">
            <a href="${magicLink}" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.2px;">Access My Invoices</a>
          </div>
          <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">Or copy this link into your browser:</p>
          <p style="margin:0 0 24px;font-size:12px;color:#6366f1;word-break:break-all;">${magicLink}</p>
          <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">Accessing for: <strong>${email}</strong></p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} ${FROM_NAME} &nbsp;&middot;&nbsp;
              <a href="${SITE_URL}" style="color:#6366f1;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
            </p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { email?: string };
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!isSupabaseEnabled()) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Check if any invoices exist for this email
    const { data: invoiceRows, error: invoiceErr } = await sb()
      .from('invoices')
      .select('id')
      .eq('client_email', email)
      .limit(1);

    if (invoiceErr) {
      console.error('[portal/request-access] invoice lookup error:', invoiceErr);
      return NextResponse.json({ error: 'Service error' }, { status: 500 });
    }

    if (!invoiceRows || invoiceRows.length === 0) {
      return NextResponse.json({ error: 'No invoices found for this email' }, { status: 404 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Insert token
    const { error: insertErr } = await sb()
      .from('customer_portal_tokens')
      .insert({ email, token, expires_at: expiresAt });

    if (insertErr) {
      console.error('[portal/request-access] token insert error:', insertErr);
      return NextResponse.json({ error: 'Service error' }, { status: 500 });
    }

    // Send magic link email
    const resend = client();
    if (resend) {
      const html = buildMagicLinkEmail(email, token);
      const text = `Hi,\n\nClick the link below to access your invoice portal at ${FROM_NAME}. This link is valid for 24 hours.\n\n${APP_URL}/portal/access?token=${token}\n\nIf you didn't request this, ignore this email.\n\n${FROM_NAME}`;
      try {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Your HotBot Studios Invoice Portal Access',
          html,
          text,
        });
      } catch (emailErr) {
        console.error('[portal/request-access] email send error:', emailErr);
        // Don't fail the request — token is still valid
      }
    } else {
      console.warn('[portal/request-access] RESEND_API_KEY not set, email skipped');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[portal/request-access] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
