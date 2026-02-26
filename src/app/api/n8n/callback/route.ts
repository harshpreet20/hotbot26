import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Callback request — triggers N8N → Sarvam AI to make an outbound call to the user.
// N8N stores conversation state (Redis/DB) for continuous voice session management.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone number required" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("callback", {
      name: name.trim(),
      phone: phone.trim(),
      requestedAt: new Date().toISOString(),
      source: "chatbot-call-tab",
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "Confirmed! Our AI assistant will call you within 2 minutes.",
    });
  } catch (error) {
    console.error("Callback pipeline error:", error);
    return NextResponse.json({
      success: true,
      message: "Request received. We'll call you back shortly.",
    });
  }
}
