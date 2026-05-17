import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { CallbackRequest } from "@/types/dashboard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const limited = rateLimitResponse(ip, "callback", { limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json() as { name?: string; phone?: string };
    const { name, phone } = body;

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
    return NextResponse.json({ success: true, message: "Confirmed! We'll call you back shortly." });
  } catch (error) {
    console.error("[callback] error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
