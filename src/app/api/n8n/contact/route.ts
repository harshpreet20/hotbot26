import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";
import { saveLeadToSupabase } from "@/lib/saveLeadToSupabase";

// Contact page form — routes through the same unified leads webhook as all other forms.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Save to Supabase
    const nameParts = name.trim().split(/\s+/);
    saveLeadToSupabase(
      {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(" ") || null,
        email: email.trim(),
        phone: phone || null,
        source: "contact",
        status: "lead",
        notes: subject || null,
      },
      {
        type: "form",
        subject: `Contact: ${subject || "General inquiry"}`,
        body: message || null,
      }
    );

    const data = await triggerN8n<Record<string, string>>("leads", {
      name,
      email,
      phone: phone || "",
      company: "",
      service: subject || "",
      budget: "",
      message: message || "",
      formType: "contact",
      source: "contact-page",
    });

    return NextResponse.json({
      success: true,
      message: data?.message || "Message received! We'll reply within 24 hours.",
    });
  } catch (error) {
    console.error("Contact pipeline error:", error);
    return NextResponse.json({ success: true, message: "Thank you for reaching out. We'll be in touch shortly." });
  }
}
