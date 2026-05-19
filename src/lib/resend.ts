/**
 * Central Resend email library for HotBot Studios.
 * All transactional emails go through here.
 *
 * Requires: RESEND_API_KEY env var.
 * Optional: RESEND_FROM_EMAIL (defaults to noreply@hotbotstudios.com)
 *           RESEND_FROM_NAME  (defaults to HotBot Studios)
 *
 * Every send is logged to the email_logs Supabase table (when Supabase is
 * configured). Delivery/open/bounce events are updated via the Resend webhook
 * at /api/webhooks/resend.
 */
import { Resend } from "resend";
import type { Ticket, TicketComment } from "@/types/dashboard";
import { isSupabaseEnabled, sb } from "@/lib/supabase";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
const FROM_NAME = process.env.RESEND_FROM_NAME  ?? "HotBot Studios";
const FROM_ADDR = process.env.RESEND_FROM_EMAIL ?? "noreply@hotbotstudios.com";
const FROM      = `${FROM_NAME} <${FROM_ADDR}>`;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function isResendEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// ── Branded HTML wrapper ──────────────────────────────────────────────────────

function wrap(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&#x200C;&#x200B;&#x200D;&#xFEFF;</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;">
    <tr><td align="center" style="padding:40px 16px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#2e1065 100%);padding:28px 36px;border-radius:16px 16px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td width="44">
                <img src="${SITE_URL}/logos/hotbot-logo.svg" width="120" height="30" alt="${FROM_NAME}" style="display:block;border:0;outline:none;text-decoration:none;" />
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">${FROM_NAME}</p>
                <p style="margin:2px 0 0;color:#a5b4fc;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">${title}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 36px 28px;border-radius:0 0 16px 16px;">
          ${body}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} ${FROM_NAME} &nbsp;·&nbsp;
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

function btn(label: string, href: string, color = "#6366f1"): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:${color};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.2px;">${label}</a>`;
}

function infoBox(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;border-radius:10px;padding:6px 0;margin-bottom:24px;">
    ${rows.map(([label, value]) => `<tr>
      <td style="padding:8px 20px;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:38%;">${label}</td>
      <td style="padding:8px 20px 8px 0;font-size:14px;color:#374151;">${value}</td>
    </tr>`).join("")}
  </table>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;">Hi ${name},</p>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">${text}</p>`;
}

function quoteBox(label: string, text: string): string {
  return `<div style="background:#eff6ff;border-left:3px solid #6366f1;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">${label}</p>
    <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap;">${text}</p>
  </div>`;
}

async function send(
  to: string,
  subject: string,
  html: string,
  text: string,
  emailType = "transactional",
): Promise<void> {
  const resend = client();
  if (!resend) { console.warn("[resend] RESEND_API_KEY not set, email skipped"); return; }

  // Pre-insert a log row so we have a record even if the API call fails
  let logId: string | null = null;
  if (isSupabaseEnabled()) {
    try {
      const { data: row } = await sb()
        .from("email_logs")
        .insert({ to_email: to, subject, email_type: emailType, status: "queued" })
        .select("id")
        .single();
      logId = row?.id ?? null;
    } catch { /* non-fatal */ }
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html, text });
    if (error) {
      console.error("[resend] delivery error:", JSON.stringify(error));
      if (logId && isSupabaseEnabled()) {
        await sb().from("email_logs").update({ status: "failed", last_event: "api_error", metadata: { error } }).eq("id", logId);
      }
    } else {
      console.log("[resend] sent:", data?.id, "to:", to, "subject:", subject);
      if (logId && isSupabaseEnabled()) {
        await sb().from("email_logs").update({
          resend_id: data?.id ?? null,
          status:    "sent",
          sent_at:   new Date().toISOString(),
          last_event: "sent",
        }).eq("id", logId);
      }
    }
  } catch (err) {
    console.error("[resend] send error:", err instanceof Error ? err.message : err);
    if (logId && isSupabaseEnabled()) {
      await sb().from("email_logs").update({ status: "failed", last_event: "exception" }).eq("id", logId);
    }
  }
}

// ── 1. Registration confirmation ──────────────────────────────────────────────

export async function sendRegistrationConfirmation(opts: {
  name: string;
  email: string;
  role: string;
  needsVerification: boolean;
}): Promise<void> {
  const { name, email, role, needsVerification } = opts;
  const html = wrap("Account Request Received", `Welcome to ${FROM_NAME}, ${name}!`, `
    ${greeting(name)}
    ${para(`Thanks for requesting access to the <strong>${FROM_NAME}</strong> dashboard. Here's what happens next:`)}
    ${needsVerification
      ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">Step 1: Verify your email</p>
          <p style="margin:6px 0 0;font-size:13px;color:#78350f;line-height:1.6;">Check your inbox for a verification link from Supabase. Click it to confirm your email address before you can log in.</p>
        </div>`
      : ""}
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">${needsVerification ? "Step 2" : "Next"}: Admin approval</p>
      <p style="margin:6px 0 0;font-size:13px;color:#14532d;line-height:1.6;">An administrator will review and approve your access request. You'll be able to sign in once approved. This usually takes a few hours.</p>
    </div>
    ${infoBox([["Requested role", role], ["Email", email]])}
    ${btn("Go to Login", `${SITE_URL}/enter/backdrop`)}
  `);
  await send(email, `Welcome to ${FROM_NAME}: Your Account Is Pending Approval`, html,
    `Hi ${name},\n\nThanks for registering at ${FROM_NAME}.\n${needsVerification ? "Please verify your email first, then " : ""}an administrator will review and approve your access.\n\nLogin: ${SITE_URL}/enter/backdrop`,
    "registration",
  );
}

// ── 2. Password reset acknowledgment ─────────────────────────────────────────

export async function sendPasswordResetAcknowledgment(email: string): Promise<void> {
  const html = wrap("Password Reset", "A password reset link has been sent.", `
    ${greeting("there")}
    ${para(`A password reset link has been sent to <strong>${email}</strong>. Click it within the next hour to set a new password.`)}
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.6;">
        <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't change unless you click the link and set a new one.
      </p>
    </div>
    ${btn("Go to Login", `${SITE_URL}/enter/backdrop`)}
  `);
  await send(email, `${FROM_NAME}: Password Reset Requested`, html,
    `A password reset link has been sent to ${email}. If you didn't request this, ignore this email.\n\nLogin: ${SITE_URL}/enter/backdrop`,
    "password_reset",
  );
}

// ── 3. Contact form confirmation ──────────────────────────────────────────────

export async function sendContactConfirmation(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { name, email, subject, message } = opts;
  const html = wrap("Message Received", `Thanks for reaching out, ${name}!`, `
    ${greeting(name)}
    ${para(`We've received your message and will get back to you within <strong>24 hours</strong>. Here's a copy of what you sent:`)}
    ${infoBox([["Subject", subject || "General Enquiry"]])}
    ${message ? quoteBox("Your Message", message) : ""}
    ${para(`In the meantime, feel free to reach us on WhatsApp for a faster response.`)}
    ${btn("Chat on WhatsApp", `${SITE_URL}/api/wa?text=${encodeURIComponent("Hi, I just sent a message via your website.")}`, "#22c55e")}
  `);
  await send(email, `${FROM_NAME}: We Received Your Message`, html,
    `Hi ${name},\n\nThanks for your message. We'll reply within 24 hours.\n\nYour subject: ${subject}\nYour message: ${message}\n\n${FROM_NAME}`,
    "contact_confirmation",
  );
}

// ── 4. Lead / enquiry confirmation ────────────────────────────────────────────

export async function sendLeadConfirmation(opts: {
  name: string;
  email: string;
  service: string;
  message: string;
  formType: string;
}): Promise<void> {
  const { name, email, service, message, formType } = opts;
  const subjectLine = service ? `Your ${service} enquiry` : "Your enquiry";
  const html = wrap("Enquiry Received", `Thanks for your interest, ${name}!`, `
    ${greeting(name)}
    ${para(`Thanks for getting in touch! We've received your enquiry about <strong>${service || "our services"}</strong> and will send you a personalised response within <strong>24 hours</strong>.`)}
    ${infoBox([
      ...(service ? [["Service", service] as [string, string]] : []),
      ...(formType && formType !== "get-started" ? [["Enquiry type", formType.replace(/-/g, " ")] as [string, string]] : []),
    ])}
    ${message ? quoteBox("Your message", message) : ""}
    ${para(`Want a faster response? Our team is available on WhatsApp.`)}
    ${btn("Chat on WhatsApp", `${SITE_URL}/api/wa?text=${encodeURIComponent(`Hi, I just enquired about ${service || "your services"}.`)}`, "#22c55e")}
  `);
  await send(email, `${FROM_NAME}: ${subjectLine}`, html,
    `Hi ${name},\n\nThanks for your interest in ${service || "our services"}. We'll reply within 24 hours.\n\n${FROM_NAME}`,
    "lead_confirmation",
  );
}

// ── 5. Newsletter welcome ─────────────────────────────────────────────────────

export async function sendNewsletterWelcome(opts: {
  name: string;
  email: string;
  unsubUrl: string;
}): Promise<void> {
  const { name, email, unsubUrl } = opts;
  const html = wrap("Welcome to the Newsletter", `You're in, ${name || "there"}!`, `
    ${greeting(name || "there")}
    ${para(`You're now subscribed to the <strong>${FROM_NAME}</strong> newsletter. Expect insights on AI automation, digital marketing, and growth strategies. No fluff, just value.`)}
    <div style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1e1b4b;">What to expect:</p>
      <ul style="margin:0;padding:0 0 0 20px;font-size:13px;color:#374151;line-height:2;">
        <li>AI &amp; automation case studies</li>
        <li>SEO &amp; marketing tips</li>
        <li>Product updates and announcements</li>
        <li>Early access to new tools</li>
      </ul>
    </div>
    ${btn("Visit Our Blog", `${SITE_URL}/blog`)}
    <p style="margin:24px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
      Not you? <a href="${unsubUrl}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `);
  await send(email, `Welcome to ${FROM_NAME}: You Are Subscribed`, html,
    `Hi ${name || "there"},\n\nYou're now subscribed to the ${FROM_NAME} newsletter.\n\nUnsubscribe: ${unsubUrl}\n\n${FROM_NAME}`,
    "newsletter_welcome",
  );
}

// ── 6. Callback request confirmation ─────────────────────────────────────────

export async function sendCallbackConfirmation(opts: {
  name: string;
  phone: string;
  email?: string;
}): Promise<void> {
  if (!opts.email) return;
  const html = wrap("Callback Requested", "We'll call you shortly!", `
    ${greeting(opts.name)}
    ${para(`We've received your callback request. Our AI voice agent (powered by Sarvam) will call <strong>${opts.phone}</strong> within <strong>2 minutes</strong>. Please make sure you're available.`)}
    ${infoBox([["Your number", opts.phone], ["Expected call", "Within 2 minutes"]])}
    ${para(`Calls come from <strong>+91 97000 01534</strong>. If we miss you, we'll try again or you can request another callback.`)}
    ${btn("Request Another Callback", `${SITE_URL}/#contact`, "#8b5cf6")}
  `);
  await send(opts.email, `${FROM_NAME}: Callback Confirmed`, html,
    `Hi ${opts.name},\n\nWe'll call ${opts.phone} within 2 minutes. Calls come from +91 97000 01534.\n\n${FROM_NAME}`,
    "callback_confirmation",
  );
}

// ── 7. Chat transcript ────────────────────────────────────────────────────────

export async function sendChatTranscript(opts: {
  name: string;
  email: string;
  messages: { role: "user" | "bot"; text: string }[];
}): Promise<void> {
  const { name, email, messages } = opts;
  const msgHtml = messages.map((m) => `
    <tr>
      <td style="padding:8px 0;">
        <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:${m.role === "user" ? "#6366f1" : "#64748b"};text-transform:uppercase;letter-spacing:1px;">
          ${m.role === "user" ? name : FROM_NAME + " AI"}
        </p>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${m.text}</p>
      </td>
    </tr>
  `).join('<tr><td style="padding:2px 0;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>');

  const html = wrap("Your Chat Transcript", `Your conversation with ${FROM_NAME} AI`, `
    ${greeting(name)}
    ${para(`Here's a transcript of your conversation with <strong>${FROM_NAME} AI</strong>. A member of our team will follow up with you shortly.`)}
    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${msgHtml}</table>
    </div>
    ${para(`Our team has been notified and will reach out within a few hours.`)}
    ${btn("Chat Again", `${SITE_URL}`)}
  `);

  const text = messages.map((m) => `${m.role === "user" ? name : FROM_NAME + " AI"}: ${m.text}`).join("\n\n");
  await send(email, `${FROM_NAME}: Your Chat Transcript`, html,
    `Hi ${name},\n\nHere's your chat transcript:\n\n${text}\n\n${FROM_NAME}`,
    "chat_transcript",
  );
}

// ── 8. Ticket confirmation ────────────────────────────────────────────────────

export async function sendTicketConfirmation(ticket: Ticket): Promise<void> {
  const viewUrl = `${SITE_URL}/tickets?id=${ticket.id}`;
  const html = wrap(`Ticket ${ticket.ticketNumber} Received`, `We got your ticket, ${ticket.requesterName}!`, `
    ${greeting(ticket.requesterName)}
    ${para(`We've received your support request. Our team will get back to you as soon as possible.`)}
    ${infoBox([
      ["Ticket #", `<strong>${ticket.ticketNumber}</strong>`],
      ["Subject", ticket.title],
      ["Category", ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)],
      ["Priority", ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)],
      ["Status", "Open"],
    ])}
    ${ticket.description ? quoteBox("Your description", ticket.description) : ""}
    ${btn("View Ticket Status", viewUrl)}
    ${para(`Bookmark the link above to check your ticket status at any time.`)}
  `);
  await send(
    ticket.requesterEmail,
    `[${ticket.ticketNumber}] We received your support request`,
    html,
    `Hi ${ticket.requesterName},\n\nTicket ${ticket.ticketNumber}: ${ticket.title}\nCategory: ${ticket.category} | Priority: ${ticket.priority}\n\nView: ${viewUrl}\n\n${FROM_NAME}`,
    "ticket_confirmation",
  );
}

// ── 9. Staff reply notification ───────────────────────────────────────────────

export async function sendStaffReplyNotification(ticket: Ticket, comment: TicketComment): Promise<void> {
  const viewUrl = `${SITE_URL}/tickets?id=${ticket.id}`;
  const html = wrap(`New Reply on ${ticket.ticketNumber}`, "Our team responded to your ticket.", `
    ${greeting(ticket.requesterName)}
    ${para(`Our support team has replied to your ticket <strong>${ticket.ticketNumber}: ${ticket.title}</strong>.`)}
    ${quoteBox(`Reply from ${FROM_NAME}`, comment.text)}
    ${btn("View Full Conversation", viewUrl)}
    ${para(`You can reply directly from the ticket page above.`)}
  `);
  await send(
    ticket.requesterEmail,
    `[${ticket.ticketNumber}] New reply from our team`,
    html,
    `Hi ${ticket.requesterName},\n\nNew reply on ticket ${ticket.ticketNumber}:\n\n${comment.text}\n\nView: ${viewUrl}\n\n${FROM_NAME}`,
    "ticket_reply",
  );
}

// ── 10. Ticket status update ──────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",                    color: "#3b82f6", bg: "#eff6ff" },
  in_progress: { label: "In Progress",             color: "#f59e0b", bg: "#fffbeb" },
  waiting:     { label: "Waiting for your response", color: "#8b5cf6", bg: "#f5f3ff" },
  resolved:    { label: "Resolved",                color: "#22c55e", bg: "#f0fdf4" },
  closed:      { label: "Closed",                  color: "#6b7280", bg: "#f9fafb" },
};

export async function sendStatusUpdateNotification(ticket: Ticket, newStatus: string): Promise<void> {
  const viewUrl = `${SITE_URL}/tickets?id=${ticket.id}`;
  const meta = STATUS_META[newStatus] ?? { label: newStatus, color: "#6366f1", bg: "#eff6ff" };
  const isResolved = newStatus === "resolved" || newStatus === "closed";
  const html = wrap(`Ticket ${ticket.ticketNumber} Updated`, `Status changed to ${meta.label}`, `
    ${greeting(ticket.requesterName)}
    ${para(`The status of your ticket <strong>${ticket.ticketNumber}: ${ticket.title}</strong> has been updated.`)}
    <div style="background:${meta.bg};border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">New Status</p>
      <span style="display:inline-block;padding:5px 16px;border-radius:100px;background:${meta.color}22;color:${meta.color};font-size:13px;font-weight:700;">${meta.label}</span>
    </div>
    ${isResolved ? para(`If your issue has been fully resolved, no further action is needed. If you still need help, reply to this email or open a new ticket.`) : ""}
    ${btn("View Ticket", viewUrl)}
  `);
  await send(
    ticket.requesterEmail,
    `[${ticket.ticketNumber}] Status updated: ${meta.label}`,
    html,
    `Hi ${ticket.requesterName},\n\nTicket ${ticket.ticketNumber} status updated to: ${meta.label}\n\nView: ${viewUrl}\n\n${FROM_NAME}`,
    "ticket_status_update",
  );
}

// ── 11. User account approved ─────────────────────────────────────────────────

export async function sendUserApprovedEmail(opts: {
  email: string;
  username: string;
  resetLink: string;
}): Promise<void> {
  const { email, username, resetLink } = opts;
  const html = wrap("Account Approved", `Your access has been approved, ${username}!`, `
    ${greeting(username)}
    ${para(`Great news! Your access request to the <strong>${FROM_NAME}</strong> dashboard has been <strong style="color:#22c55e;">approved</strong>.`)}
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">Next step: Set your password</p>
      <p style="margin:6px 0 0;font-size:13px;color:#14532d;line-height:1.6;">Click the button below to set your password and activate your account. This link expires in 24 hours.</p>
    </div>
    ${btn("Set My Password", resetLink, "#22c55e")}
    ${para(`After setting your password, you can log in at any time from the link below.`)}
    ${btn("Go to Dashboard Login", `${SITE_URL}/enter/backdrop`, "#6366f1")}
  `);
  await send(email, `${FROM_NAME}: Your Account Has Been Approved`, html,
    `Hi ${username},\n\nYour access has been approved! Set your password here: ${resetLink}\n\nAfter that, log in at: ${SITE_URL}/enter/backdrop\n\n${FROM_NAME}`,
    "user_approved",
  );
}

// ── 12. User account rejected ─────────────────────────────────────────────────

export async function sendUserRejectedEmail(opts: {
  email: string;
  username: string;
}): Promise<void> {
  const { email, username } = opts;
  const html = wrap("Access Request Update", `Regarding your access request`, `
    ${greeting(username)}
    ${para(`Thank you for your interest in joining the <strong>${FROM_NAME}</strong> team dashboard. Unfortunately, your access request has not been approved at this time.`)}
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">Request not approved</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7f1d1d;line-height:1.6;">If you believe this is a mistake or have questions, please reach out to your team administrator directly.</p>
    </div>
    ${btn("Contact Us", `${SITE_URL}/contact`, "#6366f1")}
  `);
  await send(email, `${FROM_NAME}: Access Request Update`, html,
    `Hi ${username},\n\nYour access request to the ${FROM_NAME} dashboard was not approved. If you believe this is a mistake, contact your administrator.\n\n${FROM_NAME}`,
    "user_rejected",
  );
}

// ── 13. Feature update broadcast ─────────────────────────────────────────────

export async function sendFeatureBroadcast(opts: {
  segment: string;
  changes: string[];
  pushedBy: string;
  recipients: string[];
  version?: string;
}): Promise<void> {
  const { segment, changes, pushedBy, recipients, version } = opts;
  if (!recipients.length) return;
  const changeList = changes
    .map((c) => `<li style="margin-bottom:6px;font-size:14px;color:#374151;line-height:1.6;">${c}</li>`)
    .join("");
  const html = wrap(`Feature Update: ${segment}`, `New updates to the ${segment} module`, `
    ${greeting("Team")}
    ${para(`A new feature update has been shipped to the <strong>${segment}</strong> module${version ? ` (v${version})` : ""}.`)}
    <div style="background:#eff6ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">What was added / changed</p>
      <ul style="margin:0;padding-left:20px;">${changeList}</ul>
    </div>
    ${infoBox([
      ["Module", segment],
      ["Pushed by", pushedBy],
      ...(version ? [["Version", version] as [string, string]] : []),
      ["Time", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })],
    ])}
    ${btn("Open Dashboard", `${SITE_URL}/enter/backdrop/dashboard`)}
    ${para(`Log in to the dashboard to see the latest changes in action.`)}
  `);
  const text = `Hi Team,\n\n${segment} module update${version ? ` (v${version})` : ""}:\n\n${changes.map((c) => `• ${c}`).join("\n")}\n\nPushed by: ${pushedBy}\n\nDashboard: ${SITE_URL}/enter/backdrop/dashboard\n\n${FROM_NAME}`;
  for (const recipient of recipients) {
    await send(recipient, `[Feature Update] ${segment}${version ? ` v${version}` : ""}: ${changes[0] ?? "see details"}`, html, text, "feature_broadcast");
  }
}

// ── 14. Task assigned notification ───────────────────────────────────────────

export async function sendTaskAssignedEmail(opts: {
  assigneeEmail: string;
  assigneeName: string;
  taskTitle: string;
  taskDescription?: string;
  priority: string;
  dueDate?: string;
  assignedBy: string;
  linkedEntityType?: string;
  linkedEntityLabel?: string;
}): Promise<void> {
  const { assigneeEmail, assigneeName, taskTitle, taskDescription, priority, dueDate, assignedBy, linkedEntityType, linkedEntityLabel } = opts;
  const dashUrl = `${SITE_URL}/enter/backdrop/dashboard/tasks`;
  const priorityColors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e", urgent: "#dc2626" };
  const priorityColor = priorityColors[priority] ?? "#6366f1";

  const html = wrap("Task Assigned to You", `New task: ${taskTitle}`, `
    ${greeting(assigneeName)}
    ${para(`You have been assigned a new task by <strong>${assignedBy}</strong>.`)}
    <div style="background:#eff6ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1e1b4b;">${taskTitle}</p>
      ${taskDescription ? `<p style="margin:6px 0 0;font-size:13px;color:#374151;line-height:1.6;">${taskDescription}</p>` : ""}
    </div>
    ${infoBox([
      ["Priority", `<span style="color:${priorityColor};font-weight:700;text-transform:capitalize;">${priority}</span>`],
      ...(dueDate ? [["Due Date", new Date(dueDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })] as [string, string]] : []),
      ...(linkedEntityType && linkedEntityLabel ? [[linkedEntityType.charAt(0).toUpperCase() + linkedEntityType.slice(1), linkedEntityLabel] as [string, string]] : []),
      ["Assigned by", assignedBy],
    ])}
    ${btn("View Task in Dashboard", dashUrl)}
  `);

  await send(
    assigneeEmail,
    `[Task] ${taskTitle}`,
    html,
    `Hi ${assigneeName},\n\nYou have a new task assigned by ${assignedBy}:\n\n${taskTitle}${taskDescription ? `\n${taskDescription}` : ""}\n\nPriority: ${priority}${dueDate ? `\nDue: ${dueDate}` : ""}\n\nView: ${dashUrl}\n\n${FROM_NAME}`,
    "task_assigned",
  );
}
