import { NextRequest, NextResponse } from "next/server";
import { prepend, newId } from "@/lib/store";
import type { Contact } from "@/types/dashboard";

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

    const contact: Contact = {
      id:        newId(),
      name:      name.trim(),
      email:     email.trim(),
      phone:     phone   || "",
      subject:   subject || "",
      message:   message || "",
      source:    "contact-page",
      createdAt: new Date().toISOString(),
    };
    prepend<Contact>("contacts", contact);

    // Forward to N8N Contact pipeline workflow
    const n8nUrl = process.env.N8N_WEBHOOK_CONTACT || "https://hotbotst.app.n8n.cloud/webhook/hotbotstudios-contact";
    fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    }).catch((err) => console.error("N8N forward error (contact):", err));

    return NextResponse.json({ success: true, message: "Message received! We'll reply within 24 hours." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: true, message: "Thanks for reaching out! We'll reply shortly." });
  }
}
