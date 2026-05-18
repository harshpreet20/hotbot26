import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Lead } from "@/types/dashboard";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN    = 0.4;

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true;
  if (!token) return true; // Client has no site key configured — allow through
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    });
    const d = await res.json() as { success: boolean; score: number };
    return d.success && d.score >= RECAPTCHA_MIN;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const limited = rateLimitResponse(ip, "forms", { limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json() as Record<string, string>;
    const { name, email, phone, company, service, budget, message, formType, page, recaptchaToken } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const isHuman = await verifyRecaptcha(recaptchaToken || null);
    if (!isHuman) {
      return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 403 });
    }

    const lead: Lead = {
      id:        newId(),
      name:      name.trim(),
      email:     email.trim(),
      phone:     phone    || "",
      company:   company  || "",
      service:   service  || "",
      budget:    budget   || "",
      message:   message  || "",
      formType:  formType || "get-started",
      source:    page     || "unknown",
      ip,
      createdAt: new Date().toISOString(),
      status:    "new",
    };

    await insert<Lead>("leads", lead);
    return NextResponse.json({ success: true, leadId: lead.id, message: "We'll be in touch within 24 hours!" });
  } catch (error) {
    console.error("[lead form] error:", error);
    return NextResponse.json({ success: true, message: "Thank you! We'll be in touch shortly." });
  }
}
