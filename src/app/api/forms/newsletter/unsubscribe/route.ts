import { NextRequest, NextResponse } from "next/server";
import { readAll, removeById } from "@/lib/store";
import { emailFromToken } from "@/lib/newsletterEmail";
import type { NewsletterSubscriber } from "@/types/dashboard";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const email = emailFromToken(token);
  if (!email) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  const all = await readAll<NewsletterSubscriber>("newsletter");
  const sub = all.find((s) => s.email.toLowerCase() === email);
  if (sub) await removeById("newsletter", sub.id);

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Unsubscribed</title></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:40px;">
    <div style="font-size:48px;margin-bottom:16px;">✓</div>
    <h1 style="color:#e0e7ff;font-size:22px;font-weight:700;margin:0 0 8px;">You've been unsubscribed</h1>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      ${sub ? `${email} has been removed from our newsletter.` : "This email is not in our list."}
    </p>
    <a href="${SITE_URL}" style="display:inline-block;padding:10px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Back to HotBot Studios</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
