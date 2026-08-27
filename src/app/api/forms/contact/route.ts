import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import { sendContactConfirmation } from "@/lib/resend";
import { fireJourneyEvent } from "@/lib/journey";
import type { Contact, Lead } from "@/types/dashboard";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN = 0.4;

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true;
  if (!token) return true; // Client has no site key configured — allow through
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
  });
  const d = await res.json() as { success: boolean; score: number };
  return d.success && d.score >= RECAPTCHA_MIN;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limited = await rateLimitResponse(ip, "contact", { limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json() as Record<string, string>;
    const { name, email, phone, subject, message, recaptchaToken } = body;

    const isHuman = await verifyRecaptcha(recaptchaToken || null);
    if (!isHuman) return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 403 });

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const contact: Contact = {
      id:        newId(),
      name:      name.trim(),
      email:     email.trim(),
      phone:     phone   || "",
      subject:   subject || "",
      message:   message || "",
      source:    "contact-page",
      createdAt: now,
    };
    await insert<Contact>("contacts", contact);

    // Also create a CRM lead so the sales team sees it
    const lead: Lead = {
      id:          newId(),
      name:        name.trim(),
      email:       email.trim(),
      phone:       phone || "",
      company:     "",
      service:     subject || "General Inquiry",
      budget:      "",
      message:     message || "",
      formType:    "contact",
      source:      "contact-page",
      ip,
      createdAt:   now,
      status:      "new",
      lastUpdatedAt: now,
      lastUpdatedBy: "system",
    };
    await insert<Lead>("leads", lead).catch((err) =>
      console.error("[contact] lead insert failed:", err)
    );

    sendContactConfirmation({ name: name.trim(), email: email.trim(), subject: subject || "General Enquiry", message: message || "" }).catch((err) => console.error("[email]", err instanceof Error ? err.message : err));

    const sessionId = req.headers.get("x-site-sid");

    fireJourneyEvent({
      sessionId: sessionId ?? null,
      email: lead.email,
      stage: "lead",
      leadId: lead.id,
      source: "contact-page",
      page: req.headers.get("referer") ?? null,
      metadata: { formType: "contact", subject },
    }).catch((err) => console.error("[email]", err instanceof Error ? err.message : err));

    // Fire-and-forget analytics event
    if (sessionId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";
      fetch(`${siteUrl}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "event", sessionId, eventName: "contact_form_submit", page: "/contact", properties: { subject } }),
      }).catch((err) => console.error("[email]", err instanceof Error ? err.message : err));
    }

    return NextResponse.json({ success: true, message: "Message received! We'll reply within 24 hours." });
  } catch (error) {
    console.error("[contact form] error:", error);
    return NextResponse.json({ success: true, message: "Thanks for reaching out! We'll reply shortly." });
  }
}
