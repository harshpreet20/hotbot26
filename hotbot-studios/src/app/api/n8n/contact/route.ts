import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    // n8n workflow handles:
    // 1. Google Sheets entry
    // 2. Email notification to team
    // 3. Telegram message
    // 4. AI Sensy WhatsApp template
    const data = await triggerN8n<Record<string, string>>("contact", {
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "Message received! We'll reply within 24 hours.",
    });
  } catch (error) {
    console.error("Contact pipeline error:", error);
    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. We'll be in touch shortly.",
    });
  }
}
