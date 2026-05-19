import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, updateById } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { Invoice } from "@/types/dashboard";

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_FROM_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  if (currency === "EUR") return "€";
  return currency + " ";
}

function fmtAmount(amount: number, currency: string): string {
  return `${currencySymbol(currency)}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function buildInvoiceHtml(inv: Invoice, logId?: string): string {
  const sym        = currencySymbol(inv.currency);
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
  const fromEmail  = process.env.GMAIL_FROM_EMAIL    ?? "billing@hotbotstudios.com";
  const fromName   = process.env.GMAIL_FROM_NAME     ?? "HotBot Studios";
  const pixelUrl   = logId ? `${siteUrl}/api/track/pixel?id=${logId}` : null;

  const lineItemsRows = inv.lineItems.map((li) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:14px;">${li.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:14px;text-align:center;">${li.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:14px;text-align:right;">${fmtAmount(li.unitPrice, inv.currency)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:14px;text-align:right;font-weight:600;">${fmtAmount(li.amount, inv.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${inv.invoiceNumber}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:36px 40px;border-radius:16px 16px 0 0;">
<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;"><tr>
<td><img src="${siteUrl}/logos/hotbot-logo.svg" width="120" height="30" alt="${fromName}" style="display:block;border:0;outline:none;text-decoration:none;" /></td>
</tr></table>
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td><p style="margin:0;color:#a5b4fc;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Invoice</p>
<h1 style="margin:6px 0 0;color:#ffffff;font-size:28px;font-weight:700;">${inv.invoiceNumber}</h1></td>
<td align="right"><div style="display:inline-block;background:rgba(255,255,255,0.12);padding:6px 16px;border-radius:100px;">
<span style="color:#c7d2fe;font-size:13px;font-weight:600;text-transform:capitalize;">${inv.status}</span></div>
<p style="margin:10px 0 0;color:#a5b4fc;font-size:20px;font-weight:700;">${fmtAmount(inv.total, inv.currency)}</p></td>
</tr></table></td></tr>
<tr><td style="background:#ffffff;padding:36px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr>
<td width="50%" style="vertical-align:top;padding-right:16px;">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1.5px;">From</p>
<p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${fromName}</p>
<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${fromEmail}</p></td>
<td width="50%" style="vertical-align:top;padding-left:16px;border-left:2px solid #f1f5f9;">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1.5px;">Billed To</p>
<p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${inv.clientName}</p>
${inv.clientCompany ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${inv.clientCompany}</p>` : ""}
<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${inv.clientEmail}</p>
${inv.clientPhone ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${inv.clientPhone}</p>` : ""}
${inv.clientAddress ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${inv.clientAddress}</p>` : ""}
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:32px;"><tr>
<td width="50%"><p style="margin:0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Issue Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#374151;">${fmtDate(inv.issuedDate)}</p></td>
<td width="50%"><p style="margin:0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Due Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${inv.status === "overdue" ? "#ef4444" : "#374151"};">${fmtDate(inv.dueDate)}</p></td>
</tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
<thead><tr style="background:#f9fafb;">
<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Description</th>
<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Qty</th>
<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Unit Price</th>
<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Amount</th>
</tr></thead><tbody>${lineItemsRows}</tbody></table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
<tr><td width="60%"></td><td width="40%"><table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Subtotal</td><td style="padding:5px 0;font-size:13px;color:#374151;text-align:right;">${fmtAmount(inv.subtotal, inv.currency)}</td></tr>
${inv.discount > 0 ? `<tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Discount</td><td style="padding:5px 0;font-size:13px;color:#ef4444;text-align:right;">- ${fmtAmount(inv.discount, inv.currency)}</td></tr>` : ""}
<tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">Tax (${inv.taxRate}%)</td><td style="padding:5px 0;font-size:13px;color:#374151;text-align:right;">${fmtAmount(inv.taxAmount, inv.currency)}</td></tr>
<tr><td colspan="2" style="padding:4px 0;"><div style="border-top:2px solid #e5e7eb;"></div></td></tr>
<tr><td style="padding:8px 0;font-size:16px;font-weight:700;color:#111827;">Total</td><td style="padding:8px 0;font-size:16px;font-weight:700;color:#6366f1;text-align:right;">${fmtAmount(inv.total, inv.currency)}</td></tr>
</table></td></tr></table>
${inv.terms ? `<div style="background:#eff6ff;border-left:3px solid #6366f1;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Payment Terms</p><p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${inv.terms}</p></div>` : ""}
${inv.notes ? `<div style="background:#f8fafc;border-radius:8px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Notes</p><p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">${inv.notes}</p></div>` : ""}
</td></tr>
<tr><td style="background:#1e1b4b;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0;color:#a5b4fc;font-size:13px;">Thank you for your business!</p>
<p style="margin:6px 0 0;"><a href="${siteUrl}" style="color:#818cf8;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>&nbsp;·&nbsp;<a href="mailto:${fromEmail}" style="color:#818cf8;text-decoration:none;">${fromEmail}</a></p>
</td></tr>
</table></td></tr></table>
${pixelUrl ? `<img src="${pixelUrl}" width="1" height="1" style="display:block;border:0;outline:none;text-decoration:none;" alt="" />` : ""}
</body></html>`;
}

function buildInvoiceText(inv: Invoice): string {
  const fromName = process.env.GMAIL_FROM_NAME ?? "HotBot Studios";
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
  return [
    `INVOICE ${inv.invoiceNumber}`,
    `Status: ${inv.status.toUpperCase()}`,
    "",
    `FROM: ${fromName}`,
    `TO: ${inv.clientName}${inv.clientCompany ? ` (${inv.clientCompany})` : ""} <${inv.clientEmail}>`,
    "",
    `Issued: ${fmtDate(inv.issuedDate)}   Due: ${fmtDate(inv.dueDate)}`,
    "",
    "─────────────────────────────",
    ...inv.lineItems.map((li) => `  ${li.description}  ×${li.quantity}  = ${fmtAmount(li.amount, inv.currency)}`),
    "─────────────────────────────",
    `Subtotal: ${fmtAmount(inv.subtotal, inv.currency)}`,
    inv.discount > 0 ? `Discount: - ${fmtAmount(inv.discount, inv.currency)}` : "",
    `Tax (${inv.taxRate}%): ${fmtAmount(inv.taxAmount, inv.currency)}`,
    `TOTAL: ${fmtAmount(inv.total, inv.currency)}`,
    "",
    inv.terms ? `Payment Terms: ${inv.terms}` : "",
    inv.notes  ? `Notes: ${inv.notes}` : "",
    "",
    `${fromName} - ${siteUrl}`,
  ].filter(Boolean).join("\n");
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "manager", "finance"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.GMAIL_FROM_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json(
      { error: "Email not configured. Set GMAIL_FROM_EMAIL and GMAIL_APP_PASSWORD." },
      { status: 503 }
    );
  }

  const { id, recipientEmail } = await req.json() as { id: string; recipientEmail?: string };
  if (!id) return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });

  const invoices = await readAll<Invoice>("invoices");
  const inv = invoices.find((i) => i.id === id);
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const toEmail   = recipientEmail?.trim() || inv.clientEmail;
  if (!toEmail) return NextResponse.json({ error: "No recipient email address" }, { status: 400 });

  const fromName  = process.env.GMAIL_FROM_NAME ?? "HotBot Studios";
  const fromEmail = process.env.GMAIL_FROM_EMAIL!;
  const subject   = `Invoice ${inv.invoiceNumber} from ${fromName} - ${inv.total.toLocaleString("en-IN", { style: "currency", currency: inv.currency, minimumFractionDigits: 2 })}`;

  // Pre-insert email log to get an id for the tracking pixel
  let logId: string | undefined;
  if (isSupabaseEnabled()) {
    const { data: logRow } = await sb().from("email_logs").insert({
      to_email:   toEmail,
      subject,
      email_type: "invoice",
      status:     "queued",
      metadata:   { invoiceNumber: inv.invoiceNumber, invoiceId: inv.id },
    }).select("id").single();
    logId = logRow?.id as string | undefined;
  }

  try {
    await createTransporter().sendMail({
      from:    `"${fromName}" <${fromEmail}>`,
      to:      toEmail,
      subject,
      text:    buildInvoiceText(inv),
      html:    buildInvoiceHtml(inv, logId),
    });
    if (logId && isSupabaseEnabled()) {
      await sb().from("email_logs").update({ status: "sent", sent_at: new Date().toISOString(), last_event: "sent" }).eq("id", logId);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Invoice Send] SMTP error:", msg);
    if (logId && isSupabaseEnabled()) {
      await sb().from("email_logs").update({ status: "failed", last_event: "failed", metadata: { error: msg } }).eq("id", logId);
    }
    return NextResponse.json({ error: `Failed to send email: ${msg}` }, { status: 500 });
  }

  // Auto-promote draft → sent
  if (inv.status === "draft") {
    await updateById<Invoice>("invoices", id, {
      status:        "sent",
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: session.username,
    });
  }

  return NextResponse.json({ ok: true, sentTo: toEmail, newStatus: inv.status === "draft" ? "sent" : inv.status });
}
