import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("chat", {
      message: message.trim(),
      history: (history || []).slice(-10),
      mode: "chat",
    });

    return NextResponse.json({
      message:
        data?.message ||
        data?.response ||
        data?.text ||
        data?.output ||
        "Thanks! Our team will follow up shortly.",
    });
  } catch (error) {
    console.error("Chat pipeline error:", error);
    return NextResponse.json({
      message:
        "I've forwarded your message. Our team will connect via WhatsApp or Telegram shortly.",
    });
  }
}
