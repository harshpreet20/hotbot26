/**
 * Email notifications for the ticketing system.
 * Uses the same Google Workspace SMTP config as invoice emails.
 */
import nodemailer from "nodemailer";
import type { Ticket, TicketComment } from "@/types/dashboard";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
const FROM_NAME  = process.env.GMAIL_FROM_NAME  ?? "HotBot Studios";
const FROM_EMAIL = process.env.GMAIL_FROM_EMAIL ?? "support@hotbotstudios.com";

function transporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: FROM_EMAIL, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

function isConfigured() {
  return !!(process.env.GMAIL_FROM_EMAIL && process.env.GMAIL_APP_PASSWORD);
}

// ── Shared HTML wrapper ───────────────────────────────────────────────────────
function wrapHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:28px 36px;border-radius:16px 16px 0 0;">
          <p style="margin:0;color:#a5b4fc;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Support Ticket</p>
          <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${FROM_NAME}</h1>
        </td></tr>
        <tr><td style="background:#ffffff;padding:32px 36px;border-radius:0 0 16px 16px;">
          ${bodyHtml}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              <a href="${SITE_URL}/tickets" style="color:#6366f1;text-decoration:none;">View your ticket</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
            </p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── 1. Confirmation email sent to requester on ticket creation ────────────────
export async function sendTicketConfirmation(ticket: Ticket): Promise<void> {
  if (!isConfigured()) return;
  const viewUrl = `${SITE_URL}/tickets?id=${ticket.id}`;

  const html = wrapHtml(`Ticket ${ticket.ticketNumber} Received`, `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111827;">Hi ${ticket.requesterName},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      We&apos;ve received your support request. Our team will get back to you as soon as possible.
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:5px 0;font-size:12px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;" width="40%">Ticket #</td>
          <td style="padding:5px 0;font-size:14px;color:#111827;font-weight:600;">${ticket.ticketNumber}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:12px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Subject</td>
          <td style="padding:5px 0;font-size:14px;color:#374151;">${ticket.title}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:12px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Category</td>
          <td style="padding:5px 0;font-size:14px;color:#374151;text-transform:capitalize;">${ticket.category}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:12px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Priority</td>
          <td style="padding:5px 0;font-size:14px;color:#374151;text-transform:capitalize;">${ticket.priority}</td>
        </tr>
      </table>
    </div>
    ${ticket.description ? `<div style="background:#eff6ff;border-left:3px solid #6366f1;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${ticket.description}</p>
    </div>` : ""}
    <a href="${viewUrl}" style="display:inline-block;padding:11px 24px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
      View Ticket Status
    </a>
  `);

  await transporter().sendMail({
    from: `"${FROM_NAME} Support" <${FROM_EMAIL}>`,
    to: ticket.requesterEmail,
    subject: `[${ticket.ticketNumber}] We received your request — ${ticket.title}`,
    text: `Hi ${ticket.requesterName},\n\nWe received your support request:\n\nTicket: ${ticket.ticketNumber}\nSubject: ${ticket.title}\nCategory: ${ticket.category}\n\nView your ticket: ${viewUrl}\n\n${FROM_NAME} Support`,
    html,
  });
}

// ── 2. Staff reply notification ───────────────────────────────────────────────
export async function sendStaffReplyNotification(ticket: Ticket, comment: TicketComment): Promise<void> {
  if (!isConfigured()) return;
  const viewUrl = `${SITE_URL}/tickets?id=${ticket.id}`;

  const html = wrapHtml(`New Reply on ${ticket.ticketNumber}`, `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111827;">Hi ${ticket.requesterName},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Our support team has replied to your ticket <strong>${ticket.ticketNumber}</strong>.
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Reply from ${FROM_NAME}</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${comment.text}</p>
    </div>
    <a href="${viewUrl}" style="display:inline-block;padding:11px 24px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
      View Full Conversation
    </a>
  `);

  await transporter().sendMail({
    from: `"${FROM_NAME} Support" <${FROM_EMAIL}>`,
    to: ticket.requesterEmail,
    subject: `[${ticket.ticketNumber}] New reply from our team`,
    text: `Hi ${ticket.requesterName},\n\nOur team replied to ticket ${ticket.ticketNumber}:\n\n${comment.text}\n\nView ticket: ${viewUrl}\n\n${FROM_NAME} Support`,
    html,
  });
}

// ── 3. Status update notification ────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  open:        "Open",
  in_progress: "In Progress",
  waiting:     "Waiting for your response",
  resolved:    "Resolved",
  closed:      "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  open:        "#3b82f6",
  in_progress: "#f59e0b",
  waiting:     "#8b5cf6",
  resolved:    "#22c55e",
  closed:      "#6b7280",
};

export async function sendStatusUpdateNotification(ticket: Ticket, newStatus: string): Promise<void> {
  if (!isConfigured()) return;
  const viewUrl  = `${SITE_URL}/tickets?id=${ticket.id}`;
  const label    = STATUS_LABELS[newStatus]  ?? newStatus;
  const color    = STATUS_COLORS[newStatus]  ?? "#6366f1";
  const isResolved = newStatus === "resolved" || newStatus === "closed";

  const html = wrapHtml(`Ticket ${ticket.ticketNumber} Status Updated`, `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111827;">Hi ${ticket.requesterName},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      The status of your ticket <strong>${ticket.ticketNumber}</strong> has been updated.
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">New Status</p>
      <span style="display:inline-block;padding:4px 14px;border-radius:100px;background:${color}18;color:${color};font-size:13px;font-weight:700;">${label}</span>
    </div>
    ${isResolved ? `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      If your issue has been resolved, no further action is needed. If you still need help, please reply to this email or open a new ticket.
    </p>` : ""}
    <a href="${viewUrl}" style="display:inline-block;padding:11px 24px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
      View Ticket
    </a>
  `);

  await transporter().sendMail({
    from: `"${FROM_NAME} Support" <${FROM_EMAIL}>`,
    to: ticket.requesterEmail,
    subject: `[${ticket.ticketNumber}] Status updated: ${label}`,
    text: `Hi ${ticket.requesterName},\n\nYour ticket ${ticket.ticketNumber} status has been updated to: ${label}\n\nView ticket: ${viewUrl}\n\n${FROM_NAME} Support`,
    html,
  });
}
