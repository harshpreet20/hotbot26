import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Voice callback request — triggers N8N → Sarvam AI outbound call.
// Routes to the VOICE pipeline.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; phone?: string };
    const { name, phone } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone number required" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("voice", {
      name:        name.trim(),
      phone:       phone.trim(),
      requestedAt: new Date().toISOString(),
      source:      "chatbot-call-tab",
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "Confirmed! Our AI assistant will call you within 2 minutes.",
    });
  } catch (error) {
    console.error("Voice pipeline error:", error);
    return NextResponse.json({ success: true, message: "Request received. We'll call you back shortly." });
  }
}
