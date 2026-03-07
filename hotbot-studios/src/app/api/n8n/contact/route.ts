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

    return NextResponse.json({ success: true, message: "Message received! We'll reply within 24 hours." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: true, message: "Thanks for reaching out! We'll reply shortly." });
  }
}
