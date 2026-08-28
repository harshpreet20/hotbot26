import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import { sendNewsletter, isNewsletterEmailConfigured } from "@/lib/newsletterEmail";
import type { NewsletterSubscriber } from "@/types/dashboard";

export async function POST(req: NextRequest) {
  const session = await requireRole(req, "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isNewsletterEmailConfigured()) {
    return NextResponse.json(
      { error: "Email not configured. Set RESEND_API_KEY." },
      { status: 503 },
    );
  }

  let body: { subject?: string; bodyHtml?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { subject, bodyHtml } = body;
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!bodyHtml?.trim()) return NextResponse.json({ error: "Body is required." }, { status: 400 });

  const subscribers = await readAll<NewsletterSubscriber>("newsletter");
  if (!subscribers.length) {
    return NextResponse.json({ error: "No subscribers to send to." }, { status: 400 });
  }

  const result = await sendNewsletter(subject.trim(), bodyHtml.trim(), subscribers);

  return NextResponse.json({
    success: true,
    sent:    result.sent,
    failed:  result.failed,
    total:   subscribers.length,
    ...(result.errors.length > 0 ? { errors: result.errors } : {}),
  });
}
