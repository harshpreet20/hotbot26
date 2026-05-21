/**
 * POST /api/dashboard/invoices/remind
 * Body: { invoice_id, channel: 'email'|'whatsapp', custom_message? }
 *
 * Sends a payment reminder for an invoice via email (Resend) or WhatsApp Business API.
 * Checks if a reminder was already sent in the last 24h to prevent spam.
 *
 * Env vars required:
 *   RESEND_API_KEY                  — for email channel
 *   WHATSAPP_PHONE_NUMBER_ID        — for whatsapp channel (TODO: set in env)
 *   WHATSAPP_TOKEN                  — for whatsapp channel (TODO: set in env)
 *   NEXT_PUBLIC_SITE_URL            — base URL for payment links
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { Invoice } from "@/types/dashboard";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? "https://hotbotstudios.com";
const FROM_NAME = process.env.RESEND_FROM_NAME       ?? "HotBot Studios";
const FROM_ADDR = process.env.RESEND_FROM_EMAIL      ?? "noreply@hotbotstudios.com";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  if (currency === "EUR") return "€";
  return `${currency} `;
}

function fmtAmount(amount: number, currency: string): string {
  const sym = currencySymbol(currency);
  return `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

async function checkRecentReminder(invoiceId: string, channel: string): Promise<boolean> {
  if (!isSupabaseEnabled()) return false;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await sb()
    .from("invoice_reminders")
    .select("id")
    .eq("invoice_id", invoiceId)
    .eq("channel", channel)
    .eq("status", "sent")
    .gte("sent_at", since)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function logReminder(invoiceId: string, channel: string, messageId: string, sentBy: string) {
  if (!isSupabaseEnabled()) return;
  await sb().from("invoice_reminders").insert({
    invoice_id: invoiceId,
    channel,
    status:     "sent",
    message_id: messageId,
    sent_at:    new Date().toISOString(),
    sent_by:    sentBy,
  });
}

function buildReminderHtml(inv: Invoice, customMessage?: string): string {
  const payUrl = `${SITE_URL}/invoice/${inv.id}`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Payment Reminder</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:32px 40px;border-radius:16px 16px 0 0;">
<p style="margin:0 0 16px;"><img src="${SITE_URL}/logos/brand-logo.png" width="140" height="35" alt="${FROM_NAME}" style="display:block;border:0;" /></p>
<p style="margin:0;color:#a5b4fc;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Payment Reminder</p>
<h1 style="margin:6px 0 0;color:#ffffff;font-size:24px;font-weight:700;">${inv.invoiceNumber}</h1>
<p style="margin:8px 0 0;color:#c7d2fe;font-size:20px;font-weight:700;">${fmtAmount(inv.total, inv.currency)} Due</p>
</td></tr>

<tr><td style="background:#ffffff;padding:36px 40px;border-radius:0 0 16px 16px;">
<p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;">Hi ${inv.clientName},</p>
<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
${customMessage ?? `This is a friendly reminder that payment for invoice <strong>${inv.invoiceNumber}</strong> is due. Please arrange payment at your earliest convenience to avoid any service disruptions.`}
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:6px 0;margin-bottom:24px;">
<tr><td style="padding:8px 20px;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:38%;">Invoice</td>
    <td style="padding:8px 20px 8px 0;font-size:14px;color:#374151;">${inv.invoiceNumber}</td></tr>
<tr><td style="padding:8px 20px;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Amount Due</td>
    <td style="padding:8px 20px 8px 0;font-size:14px;color:#374151;font-weight:700;">${fmtAmount(inv.total, inv.currency)}</td></tr>
<tr><td style="padding:8px 20px;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Due Date</td>
    <td style="padding:8px 20px 8px 0;font-size:14px;color:#ef4444;font-weight:600;">${fmtDate(inv.dueDate)}</td></tr>
${inv.terms ? `<tr><td style="padding:8px 20px;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Payment Terms</td>
    <td style="padding:8px 20px 8px 0;font-size:14px;color:#374151;">${inv.terms}</td></tr>` : ""}
</table>

<div style="text-align:center;margin-bottom:28px;">
<a href="${payUrl}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">View &amp; Pay Invoice</a>
</div>

<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;">Bank Transfer Details:</p>
<div style="background:#eff6ff;border-left:3px solid #6366f1;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
<p style="margin:0;font-size:13px;color:#374151;line-height:1.8;">
Please transfer to our account and include the invoice number as reference.<br/>
Contact us at <a href="mailto:${FROM_ADDR}" style="color:#6366f1;">${FROM_ADDR}</a> if you need assistance.
</p>
</div>

<p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">If you have already made payment, please disregard this reminder.</p>
</td></tr>

<tr><td style="background:#1e1b4b;padding:20px 40px;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0;color:#a5b4fc;font-size:12px;">
${FROM_NAME} &nbsp;·&nbsp;
<a href="${SITE_URL}" style="color:#818cf8;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    invoice_id: string;
    channel: "email" | "whatsapp";
    custom_message?: string;
  };

  const { invoice_id, channel, custom_message } = body;

  if (!invoice_id) return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
  if (!channel || !["email", "whatsapp"].includes(channel)) {
    return NextResponse.json({ error: "channel must be 'email' or 'whatsapp'" }, { status: 400 });
  }

  // Fetch invoice
  const invoices = await readAll<Invoice>("invoices");
  const inv = invoices.find((i) => i.id === invoice_id);
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // Check recent reminder (last 24h)
  const alreadySent = await checkRecentReminder(invoice_id, channel);
  if (alreadySent) {
    return NextResponse.json({ error: "A reminder was already sent in the last 24 hours" }, { status: 429 });
  }

  if (channel === "email") {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email not configured. Set RESEND_API_KEY." }, { status: 503 });
    }

    const subject = `Payment Reminder: ${inv.invoiceNumber} — ${fmtAmount(inv.total, inv.currency)} Due ${fmtDate(inv.dueDate)}`;
    const html    = buildReminderHtml(inv, custom_message);
    const text    = `Hi ${inv.clientName},\n\nThis is a payment reminder for invoice ${inv.invoiceNumber} — ${fmtAmount(inv.total, inv.currency)} due ${fmtDate(inv.dueDate)}.\n\nView and pay: ${SITE_URL}/invoice/${inv.id}\n\nThank you,\n${FROM_NAME}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from:    `${FROM_NAME} <${FROM_ADDR}>`,
      to:      inv.clientEmail,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[remind] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email reminder" }, { status: 500 });
    }

    await logReminder(invoice_id, "email", data?.id ?? "unknown", session.username);
    return NextResponse.json({ ok: true, channel: "email", sentTo: inv.clientEmail });
  }

  // WhatsApp channel
  // TODO: Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TOKEN in env
  const phone = inv.clientPhone;
  if (!phone) return NextResponse.json({ error: "No phone number on invoice" }, { status: 400 });

  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const waToken   = process.env.WHATSAPP_TOKEN;

  if (!waPhoneId || !waToken) {
    return NextResponse.json(
      { error: "WhatsApp not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TOKEN." },
      { status: 503 },
    );
  }

  const waBody = custom_message
    ?? `Hi ${inv.clientName}, this is a reminder that Invoice ${inv.invoiceNumber} for ${fmtAmount(inv.total, inv.currency)} is due on ${fmtDate(inv.dueDate)}. Pay here: ${SITE_URL}/invoice/${inv.id}`;

  const waRes = await fetch(
    `https://graph.facebook.com/v18.0/${waPhoneId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${waToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to:                phone,
        type:              "text",
        text:              { body: waBody },
      }),
    },
  );

  if (!waRes.ok) {
    const errText = await waRes.text();
    console.error("[remind] WhatsApp API error:", errText);
    return NextResponse.json({ error: "Failed to send WhatsApp reminder" }, { status: 500 });
  }

  const waData = await waRes.json() as { messages?: { id: string }[] };
  const msgId  = waData.messages?.[0]?.id ?? "unknown";

  await logReminder(invoice_id, "whatsapp", msgId, session.username);
  return NextResponse.json({ ok: true, channel: "whatsapp", sentTo: phone });
}
