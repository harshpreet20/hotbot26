import { NextRequest, NextResponse } from "next/server";
import { insert, newId } from "@/lib/store";
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

    await insert<CallbackRequest>("callbacks", callback);
    return NextResponse.json({ success: true, message: "Confirmed! We'll call you back shortly." });
  } catch (error) {
    console.error("[callback] error:", error);
    return NextResponse.json({ success: true, message: "Request received. We'll call you back shortly." });
  }
}
