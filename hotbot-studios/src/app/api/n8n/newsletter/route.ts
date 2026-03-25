import { NextRequest, NextResponse } from "next/server";
import { prepend, newId, readAll } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { NewsletterSubscriber } from "@/types/dashboard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limited = rateLimitResponse(ip, "newsletter", { limit: 3, windowMs: 10 * 60_000 });
  if (limited) return limited;

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
