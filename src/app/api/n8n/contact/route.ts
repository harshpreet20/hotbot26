import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";
import { upsertAndLog } from "@/lib/crm";

// Contact page form — routes through the same unified leads webhook as all other forms.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; email?: string; phone?: string; subject?: string; message?: string };
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Persist to Supabase (non-blocking)
    upsertAndLog(
      { name: name.trim(), email: email.trim(), phone, source: "contact-page" },
      { type: "form", summary: `Contact: ${subject || "enquiry"}`, details: { subject, message } }
    ).catch(() => {});

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
