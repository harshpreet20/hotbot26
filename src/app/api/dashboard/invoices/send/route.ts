import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import path from "path";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, updateById } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { Invoice } from "@/types/dashboard";

const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL  ?? "https://hotbotstudios.com";
const FROM_NAME  = process.env.RESEND_FROM_NAME       ?? "HotBot Studios";
const FROM_ADDR  = process.env.RESEND_FROM_EMAIL      ?? "noreply@hotbotstudios.com";

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

function buildInvoicePdf(inv: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const sym = currencySymbol(inv.currency);
    const fmt = (n: number) => `${sym}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Header band
    doc.rect(0, 0, doc.page.width, 100).fill("#1e1b4b");
    // Logo — use extracted PNG so PDFKit can embed it directly
    try {
      const logoPath = path.join(process.cwd(), "public", "logos", "hotbot-logo.png");
      doc.image(logoPath, 50, 22, { height: 36 });
    } catch {
      // Fallback to text if logo file missing
      doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text(FROM_NAME, 50, 28);
    }
    doc.fillColor("#a5b4fc").fontSize(10).font("Helvetica").text("INVOICE", 50, 62);
    doc.fillColor("#ffffff").fontSize(16).font("Helvetica-Bold").text(inv.invoiceNumber, 50, 75);
    const totalStr = fmt(inv.total);
    doc.fillColor("#c7d2fe").fontSize(13).font("Helvetica-Bold").text(totalStr, 0, 54, { align: "right" });
    doc.fillColor("#a5b4fc").fontSize(10).font("Helvetica").text(inv.status.toUpperCase(), 0, 72, { align: "right" });

    let y = 116;

    // From / To
    doc.fillColor("#6366f1").fontSize(8).font("Helvetica-Bold").text("FROM", 50, y);
    doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text(FROM_NAME, 50, y + 12);
    doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text(FROM_ADDR, 50, y + 26);

    doc.fillColor("#6366f1").fontSize(8).font("Helvetica-Bold").text("BILLED TO", 300, y);
    doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text(inv.clientName, 300, y + 12);
    if (inv.clientCompany) doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text(inv.clientCompany, 300, y + 26);
    doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text(inv.clientEmail, 300, y + (inv.clientCompany ? 38 : 26));

    y += 70;

    // Dates
    doc.rect(50, y, doc.page.width - 100, 28).fill("#f8fafc");
    doc.fillColor("#9ca3af").fontSize(8).font("Helvetica-Bold").text("ISSUE DATE", 60, y + 5);
    doc.fillColor("#374151").fontSize(10).font("Helvetica").text(fmtDate(inv.issuedDate), 60, y + 15);
    doc.fillColor("#9ca3af").fontSize(8).font("Helvetica-Bold").text("DUE DATE", 200, y + 5);
    const dueDateColor = inv.status === "overdue" ? "#ef4444" : "#374151";
    doc.fillColor(dueDateColor).fontSize(10).font("Helvetica").text(fmtDate(inv.dueDate), 200, y + 15);

    y += 44;

    // Line items table header
    doc.rect(50, y, doc.page.width - 100, 20).fill("#f9fafb");
    doc.fillColor("#9ca3af").fontSize(8).font("Helvetica-Bold");
    doc.text("DESCRIPTION", 60, y + 6);
    doc.text("QTY", 370, y + 6);
    doc.text("UNIT PRICE", 400, y + 6);
    doc.text("AMOUNT", 480, y + 6);

    y += 22;
    doc.strokeColor("#e5e7eb").lineWidth(0.5);

    for (const li of inv.lineItems) {
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
      doc.fillColor("#374151").fontSize(9).font("Helvetica");
      doc.text(li.description, 60, y + 4, { width: 300 });
      doc.text(String(li.quantity), 370, y + 4);
      doc.text(fmt(li.unitPrice), 398, y + 4);
      doc.fillColor("#374151").font("Helvetica-Bold").text(fmt(li.amount), 476, y + 4);
      y += 20;
    }

    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
    y += 12;

    // Totals
    const totalsX = 380;
    doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text("Subtotal", totalsX, y);
    doc.fillColor("#374151").text(fmt(inv.subtotal), 0, y, { align: "right" });
    y += 16;
    if (inv.discount > 0) {
      doc.fillColor("#6b7280").text("Discount", totalsX, y);
      doc.fillColor("#ef4444").text(`- ${fmt(inv.discount)}`, 0, y, { align: "right" });
      y += 16;
    }
    doc.fillColor("#6b7280").font("Helvetica").text(`Tax (${inv.taxRate}%)`, totalsX, y);
    doc.fillColor("#374151").text(fmt(inv.taxAmount), 0, y, { align: "right" });
    y += 10;
    doc.moveTo(totalsX, y).lineTo(doc.page.width - 50, y).strokeColor("#e5e7eb").stroke();
    y += 8;
    doc.fillColor("#111827").fontSize(12).font("Helvetica-Bold").text("TOTAL", totalsX, y);
    doc.fillColor("#6366f1").text(fmt(inv.total), 0, y, { align: "right" });
    y += 28;

    if (inv.terms) {
      doc.rect(50, y, doc.page.width - 100, 1).fill("#e5e7eb");
      y += 10;
      doc.fillColor("#6366f1").fontSize(8).font("Helvetica-Bold").text("PAYMENT TERMS", 50, y);
      y += 12;
      doc.fillColor("#374151").fontSize(9).font("Helvetica").text(inv.terms, 50, y, { width: doc.page.width - 100 });
      y += 24;
    }
    if (inv.notes) {
      doc.fillColor("#9ca3af").fontSize(8).font("Helvetica-Bold").text("NOTES", 50, y);
      y += 12;
      doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text(inv.notes, 50, y, { width: doc.page.width - 100 });
    }

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill("#1e1b4b");
    doc.fillColor("#a5b4fc").fontSize(9).font("Helvetica").text(
      `Thank you for your business! · ${SITE_URL.replace(/^https?:\/\//, "")} · ${FROM_ADDR}`,
      0, doc.page.height - 30, { align: "center" },
    );

    doc.end();
  });
}

function buildInvoiceHtml(inv: Invoice, logId?: string): string {
  const pixelUrl = logId ? `${SITE_URL}/api/track/pixel?id=${logId}` : null;

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
<td><img src="${SITE_URL}/logos/hotbot-logo.svg" width="120" height="30" alt="${FROM_NAME}" style="display:block;border:0;outline:none;text-decoration:none;" /></td>
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
<p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${FROM_NAME}</p>
<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${FROM_ADDR}</p></td>
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
<p style="margin:6px 0 0;"><a href="${SITE_URL}" style="color:#818cf8;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>&nbsp;·&nbsp;<a href="mailto:${FROM_ADDR}" style="color:#818cf8;text-decoration:none;">${FROM_ADDR}</a></p>
</td></tr>
</table></td></tr></table>
${pixelUrl ? `<img src="${pixelUrl}" width="1" height="1" style="display:block;border:0;outline:none;text-decoration:none;" alt="" />` : ""}
</body></html>`;
}

function buildInvoiceText(inv: Invoice): string {
  return [
    `INVOICE ${inv.invoiceNumber}`,
    `Status: ${inv.status.toUpperCase()}`,
    "",
    `FROM: ${FROM_NAME}`,
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
    `${FROM_NAME} - ${SITE_URL}`,
  ].filter(Boolean).join("\n");
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "manager", "finance"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email not configured. Set RESEND_API_KEY." },
      { status: 503 }
    );
  }

  const { id, recipientEmail } = await req.json() as { id: string; recipientEmail?: string };
  if (!id) return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });

  const invoices = await readAll<Invoice>("invoices");
  const inv = invoices.find((i) => i.id === id);
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const toEmail = recipientEmail?.trim() || inv.clientEmail;
  if (!toEmail) return NextResponse.json({ error: "No recipient email address" }, { status: 400 });

  const subject = `Invoice ${inv.invoiceNumber} from ${FROM_NAME} - ${inv.total.toLocaleString("en-IN", { style: "currency", currency: inv.currency, minimumFractionDigits: 2 })}`;

  // Pre-insert email log to get an id for the tracking pixel
  let logId: string | undefined;
  if (isSupabaseEnabled()) {
    const { data: logRow } = await sb().from("email_logs").insert({
      to_email:    toEmail,
      subject,
      email_type:  "invoice",
      status:      "queued",
      metadata:    { invoiceNumber: inv.invoiceNumber, invoiceId: inv.id },
      entity_type: "invoice",
      entity_id:   inv.id,
    }).select("id").single();
    logId = logRow?.id as string | undefined;
  }

  // Generate PDF attachment — fail loudly so we know if bundling broke pdfkit
  let pdfBuffer: Buffer | undefined;
  try {
    pdfBuffer = await buildInvoicePdf(inv);
    console.log(`[Invoice Send] PDF generated, ${pdfBuffer.length} bytes`);
  } catch (pdfErr) {
    console.error("[Invoice Send] PDF generation failed:", pdfErr instanceof Error ? pdfErr.stack : pdfErr);
  }

  // Instrument invoice HTML with internal click + open trackers
  function wrapInvoiceLinks(html: string, id: string): string {
    return html.replace(/(<a\s[^>]*href=")([^"]+)(")/gi, (match, pre, href, post) => {
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.includes("/api/track/")) return match;
      const tracked = `${SITE_URL}/api/track/click?id=${id}&url=${encodeURIComponent(href)}`;
      return `${pre}${tracked}${post}`;
    });
  }

  let finalHtml = buildInvoiceHtml(inv, logId);
  if (logId) finalHtml = wrapInvoiceLinks(finalHtml, logId);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from:    `${FROM_NAME} <${FROM_ADDR}>`,
    to:      toEmail,
    subject,
    text:    buildInvoiceText(inv),
    html:    finalHtml,
    ...(pdfBuffer ? {
      attachments: [{
        filename: `${inv.invoiceNumber}.pdf`,
        content:  pdfBuffer.toString("base64"),
      }],
    } : {}),
  });

  if (error) {
    console.error("[Invoice Send] Resend error:", JSON.stringify(error));
    if (logId && isSupabaseEnabled()) {
      await sb().from("email_logs").update({ status: "failed", last_event: "api_error", metadata: { error } }).eq("id", logId);
    }
    return NextResponse.json({ error: `Failed to send email: ${JSON.stringify(error)}` }, { status: 500 });
  }

  if (logId && isSupabaseEnabled()) {
    await sb().from("email_logs").update({
      resend_id:  data?.id ?? null,
      status:     "sent",
      sent_at:    new Date().toISOString(),
      last_event: "sent",
    }).eq("id", logId);
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
