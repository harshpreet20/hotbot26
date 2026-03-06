import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Newsletter signup — routes to the unified FORMS pipeline with type:"newsletter"
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; name?: string };
    const { email, name } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("forms", {
      type:   "newsletter",
      name:   name?.trim() || "",
      email:  email.trim(),
      source: "newsletter-signup",
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "You're subscribed! Check your inbox for a welcome email.",
    });
  } catch (error) {
    console.error("Forms (newsletter) pipeline error:", error);
    return NextResponse.json({ success: true, message: "Thanks for subscribing!" });
  }
}
