/**
 * Resend webhook receiver — updates email_logs on delivery events.
 *
 * Configure in Resend dashboard → Webhooks → add endpoint:
 *   https://yourdomain.com/api/webhooks/resend
 * Events to subscribe: email.sent, email.delivered, email.opened,
 *   email.clicked, email.bounced, email.complained, email.delivery_delayed
 *
 * Set RESEND_WEBHOOK_SECRET to the signing secret from Resend dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

type ResendEvent = {
  type: string;
  data: {
    email_id: string;
    created_at?: string;
    [key: string]: unknown;
  };
};

function eventToStatusUpdate(type: string): Record<string, unknown> | null {
  const now = new Date().toISOString();
  switch (type) {
    case "email.sent":
      return { status: "sent", sent_at: now, last_event: "sent" };
    case "email.delivered":
      return { status: "delivered", delivered_at: now, last_event: "delivered" };
    case "email.opened":
      return { status: "opened", opened_at: now, last_event: "opened" };
    case "email.clicked":
      return { status: "clicked", clicked_at: now, last_event: "clicked" };
    case "email.bounced":
      return { status: "bounced", bounced_at: now, last_event: "bounced" };
    case "email.complained":
      return { status: "complained", complained_at: now, last_event: "complained" };
    case "email.delivery_delayed":
      return { status: "delayed", last_event: "delivery_delayed" };
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  // Verify signature when secret is configured
  if (secret) {
    const svixId        = req.headers.get("svix-id") ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
    const svixSignature = req.headers.get("svix-signature") ?? "";

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers." }, { status: 400 });
    }

    const rawBody = await req.text();
    try {
      const wh = new Webhook(secret);
      wh.verify(rawBody, { "svix-id": svixId, "svix-timestamp": svixTimestamp, "svix-signature": svixSignature });
    } catch {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as ResendEvent;
    await handleEvent(event);
  } else {
    // No secret configured — accept but log a warning
    console.warn("[resend-webhook] RESEND_WEBHOOK_SECRET not set; skipping signature verification");
    const event = await req.json() as ResendEvent;
    await handleEvent(event);
  }

  return NextResponse.json({ ok: true });
}

async function handleEvent(event: ResendEvent) {
  const resendId = event.data?.email_id;
  if (!resendId) return;

  const update = eventToStatusUpdate(event.type);
  if (!update) {
    console.log("[resend-webhook] unhandled event type:", event.type);
    return;
  }

  console.log("[resend-webhook]", event.type, resendId);

  if (!isSupabaseEnabled()) return;

  // Only advance status — never regress (e.g. don't overwrite "opened" with "delivered")
  const STATUS_RANK: Record<string, number> = {
    queued: 0, failed: 0, sent: 1, delayed: 1,
    delivered: 2, opened: 3, clicked: 4, bounced: 2, complained: 2,
  };
  const { data: existing } = await sb()
    .from("email_logs")
    .select("status")
    .eq("resend_id", resendId)
    .single();

  if (existing) {
    const currentRank = STATUS_RANK[existing.status] ?? 0;
    const newRank     = STATUS_RANK[update.status as string] ?? 0;
    if (newRank < currentRank) return; // don't regress
  }

  const { error } = await sb()
    .from("email_logs")
    .update(update)
    .eq("resend_id", resendId);

  if (error) console.error("[resend-webhook] DB update error:", error.message);
}
