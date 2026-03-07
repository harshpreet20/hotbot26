import { NextRequest, NextResponse } from "next/server";
import { prepend, newId, readAll } from "@/lib/store";
import type { NewsletterSubscriber } from "@/types/dashboard";

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

    // Deduplicate by email
    const existing = readAll<NewsletterSubscriber>("newsletter");
    if (existing.some((s) => s.email.toLowerCase() === email.trim().toLowerCase())) {
      return NextResponse.json({ success: true, message: "You're already subscribed!" });
    }

    const subscriber: NewsletterSubscriber = {
      id:        newId(),
      name:      name?.trim() || "",
      email:     email.trim(),
      source:    "newsletter-signup",
      createdAt: new Date().toISOString(),
    };
    prepend<NewsletterSubscriber>("newsletter", subscriber);

    return NextResponse.json({ success: true, message: "You're subscribed! We'll be in touch." });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ success: true, message: "Thanks for subscribing!" });
  }
}
