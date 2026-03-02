import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = 0.4; // 0.0 = bot, 1.0 = human

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true; // Skip if not configured
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    });
    const data = await res.json() as { success: boolean; score: number; action: string };
    return data.success && data.score >= RECAPTCHA_MIN_SCORE;
  } catch {
    return true; // Fail open — don't block legitimate users on reCAPTCHA outage
  }
}

// Unified lead capture endpoint.
// All forms (get-started, strategy-call, consultation, contact) POST here.
// n8n handles: → Google Sheets (primary store) → Telegram notification → AI Sensy WhatsApp follow-up
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, service, budget, message, formType, page, recaptchaToken } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Basic email format check server-side
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // reCAPTCHA verification
    const isHuman = await verifyRecaptcha(recaptchaToken || null);
    if (!isHuman) {
      return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 403 });
    }

    // Capture client IP for lead tracing (works behind proxies / Vercel Edge)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const data = await triggerN8n<Record<string, string>>("leads", {
      name,
      email,
      phone: phone || "",
      company: company || "",
      service: service || "",
      budget: budget || "",
      message: message || "",
      formType: formType || "get-started",
      source: page || "unknown",
      ip,
    });

    return NextResponse.json({
      success: true,
      leadId: data?.leadId || data?.id || null,
      message: data?.message || "We'll be in touch within 24 hours!",
    });
  } catch (error) {
    console.error("Form pipeline error:", error);
    return NextResponse.json({ success: true, message: "Thank you! We'll be in touch shortly." });
  }
}
