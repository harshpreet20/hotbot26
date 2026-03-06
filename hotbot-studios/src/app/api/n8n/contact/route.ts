import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

// Contact page form — routes to the unified FORMS pipeline with type:"contact"
// Previously this route was MISSING (contact/page.tsx called it but got 404s).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("forms", {
      type:    "contact",
      name:    name.trim(),
      email:   email.trim(),
      phone:   phone   || "",
      subject: subject || "",
      message: message || "",
      source:  "contact-page",
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "Message received! We'll reply within 24 hours.",
    });
  } catch (error) {
    console.error("Forms (contact) pipeline error:", error);
    return NextResponse.json({ success: true, message: "Thanks for reaching out! We'll reply shortly." });
  }
}
