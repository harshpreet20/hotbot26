import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Unified lead capture endpoint.
// All forms (get-started, strategy-call, consultation, contact) POST here.
// n8n handles: → Google Sheets (primary store) → Telegram notification → AI Sensy WhatsApp follow-up
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, service, budget, message, formType, page } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

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
