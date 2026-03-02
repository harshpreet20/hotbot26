import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Newsletter signup — routes through the unified leads webhook.
// source: "newsletter-signup" lets n8n label the row in Google Sheets correctly.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("leads", {
      name: name?.trim() || "",
      email: email.trim(),
      phone: "",
      company: "",
      service: "",
      budget: "",
      message: "",
      formType: "newsletter",
      source: "newsletter-signup",
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
