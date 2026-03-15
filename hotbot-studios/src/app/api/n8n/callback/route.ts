import { NextRequest, NextResponse } from "next/server";
import { prepend, newId } from "@/lib/store";
import type { CallbackRequest } from "@/types/dashboard";

export async function POST(req: NextRequest) {
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
    prepend<CallbackRequest>("callbacks", callback);

    // Forward to N8N
    const n8nUrl = process.env.N8N_WEBHOOK_URL || "https://hotbotst.app.n8n.cloud/webhook/wa-incoming";
    fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "callback-request", ...callback }),
    }).catch((err) => console.error("N8N forward error (callback):", err));

    return NextResponse.json({ success: true, message: "Confirmed! We'll call you back shortly." });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ success: true, message: "Request received. We'll call you back shortly." });
  }
}
