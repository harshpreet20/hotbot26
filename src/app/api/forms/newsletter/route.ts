import { NextRequest, NextResponse } from "next/server";
import { insert, readAll, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { NewsletterSubscriber, Lead } from "@/types/dashboard";

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
  const limited = rateLimitResponse(ip, "newsletter", { limit: 1, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json() as { email?: string; name?: string; whatsapp?: string; whatsappOptIn?: boolean; recaptchaToken?: string };
    const { email, name, whatsapp, whatsappOptIn, recaptchaToken } = body;

    const isHuman = await verifyRecaptcha(recaptchaToken || null);
    if (!isHuman) return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 403 });

    if (!email?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const existing = await readAll<NewsletterSubscriber>("newsletter");
    if (existing.some((s) => s.email.toLowerCase() === email.trim().toLowerCase())) {
      return NextResponse.json({ success: true, message: "You're already subscribed!" });
    }

    const now = new Date().toISOString();
    const cleanWhatsapp = whatsappOptIn ? (whatsapp?.trim() || "") : "";

    const resolvedSource = (body as { source?: string }).source?.trim() || "newsletter-signup";
    const subscriber: NewsletterSubscriber = {
      id:            newId(),
      name:          name?.trim() || "",
      email:         email.trim(),
      whatsapp:      cleanWhatsapp,
      whatsappOptIn: whatsappOptIn ?? false,
      source:        resolvedSource,
      createdAt:     now,
    };
    await insert<NewsletterSubscriber>("newsletter", subscriber);

    // Also insert as a CRM lead so sales team can follow up
    const lead: Lead = {
      id:          newId(),
      name:        name?.trim() || email.trim().split("@")[0],
      email:       email.trim(),
      phone:       cleanWhatsapp,
      company:     "",
      service:     "Newsletter Subscriber",
      budget:      "",
      message:     whatsappOptIn && cleanWhatsapp
        ? `Newsletter opt-in. WhatsApp: ${cleanWhatsapp}`
        : "Newsletter opt-in.",
      formType:    "newsletter",
      source:      resolvedSource,
      ip,
      createdAt:   now,
      status:      "new",
      tags:        whatsappOptIn ? ["newsletter", "whatsapp-opted-in"] : ["newsletter"],
      lastUpdatedAt: now,
      lastUpdatedBy: "system",
    };
    // Lead insert is best-effort — don't block the newsletter subscription
    await insert<Lead>("leads", lead).catch((err) =>
      console.error("[newsletter] lead insert failed:", err)
    );

    return NextResponse.json({ success: true, message: "You're subscribed! We'll be in touch." });
  } catch (error) {
    console.error("[newsletter] error:", error);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
