import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";
import { saveLeadToSupabase } from "@/lib/saveLeadToSupabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Save subscriber to Supabase
    saveLeadToSupabase(
      {
        first_name: name?.trim() || "Subscriber",
        email: email.trim(),
        source: "newsletter",
        status: "lead",
        tags: ["newsletter"],
      },
      {
        type: "form",
        subject: "Newsletter signup",
      }
    );

    // n8n workflow handles:
    // 1. Brevo/Mailchimp: Add subscriber
    // 2. Send welcome email
    // 3. Telegram notification
    const data = await triggerN8n<Record<string, string>>("newsletter", {
      email: email.trim(),
      name: name?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "You're subscribed! Check your inbox for a welcome email.",
    });
  } catch (error) {
    console.error("Newsletter pipeline error:", error);
    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing!",
    });
  }
}
