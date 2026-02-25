import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, service, budget, message, formType } =
      body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    // n8n workflow handles:
    // 1. Store lead in Google Sheets / Airtable / CRM
    // 2. Send notification to Telegram/Slack
    // 3. Send auto-reply email via SMTP
    // 4. Route to AI Sensy for WhatsApp follow-up
    // 5. Create task in project management tool
    const data = await triggerN8n<Record<string, string>>("form", {
      lead: { name, email, phone, company, service, budget, message },
      formType: formType || "get-started",
      page: body.page || "unknown",
    });

    return NextResponse.json({
      success: true,
      leadId: data?.leadId || data?.id || null,
      message: data?.message || "We'll be in touch within 24 hours!",
    });
  } catch (error) {
    console.error("Form pipeline error:", error);
    return NextResponse.json({
      success: true, // Still show success to user
      message: "Thank you! We'll be in touch shortly.",
    });
  }
}
