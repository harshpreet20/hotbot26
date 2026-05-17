import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { CallbackRequest, Lead } from "@/types/dashboard";

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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const limited = rateLimitResponse(ip, "callback", { limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json() as { name?: string; phone?: string; recaptchaToken?: string };
    const { name, phone, recaptchaToken } = body;

    const isHuman = await verifyRecaptcha(recaptchaToken || null);
    if (!isHuman) return NextResponse.json({ success: false, error: "Bot check failed. Please try again." }, { status: 403 });

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone number required" }, { status: 400 });
    }

    const callback: CallbackRequest = {
      id:        newId(),
      name:      name.trim(),
      phone:     phone.trim(),
      source:    "chatbot-call-tab",
      status:    "pending",
      createdAt: new Date().toISOString(),
    };

    await insert<CallbackRequest>("callbacks", callback);

    // Also create a CRM lead
    const lead: Lead = {
      id:          newId(),
      name:        name.trim(),
      email:       "",
      phone:       phone.trim(),
      company:     "",
      service:     "Callback Request",
      budget:      "",
      message:     "Requested a callback via chatbot.",
      formType:    "callback",
      source:      "chatbot-call-tab",
      ip,
      createdAt:   new Date().toISOString(),
      status:      "new",
    };
    await insert<Lead>("leads", lead).catch((err) =>
      console.error("[callback] lead insert failed:", err)
    );

    return NextResponse.json({ success: true, message: "Confirmed! We'll call you back shortly." });
  } catch (error) {
    console.error("[callback] error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
