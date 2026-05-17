import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Contact } from "@/types/dashboard";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN = 0.4;

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true;
  if (!token) return false;
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
  const limited = rateLimitResponse(ip, "contact", { limit: 5, windowMs: 5 * 60_000 });
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

    const contact: Contact = {
      id:        newId(),
      name:      name.trim(),
      email:     email.trim(),
      phone:     phone   || "",
      subject:   subject || "",
      message:   message || "",
      source:    "contact-page",
      createdAt: new Date().toISOString(),
    };
    await insert<Contact>("contacts", contact);
    return NextResponse.json({ success: true, message: "Message received! We'll reply within 24 hours." });
  } catch (error) {
    console.error("[contact form] error:", error);
    return NextResponse.json({ success: true, message: "Thanks for reaching out! We'll reply shortly." });
  }
}
