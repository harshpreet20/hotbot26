export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

// ── Allowed portal event types ────────────────────────────────────────────────
const ALLOWED_EVENT_TYPES = [
  "page_view", "project_view", "update_view", "invoice_view", "file_download",
  "ticket_create", "milestone_ack", "approval", "login", "comment", "task_create",
  "notification_read", "file_upload",
] as const;

type PortalEventType = (typeof ALLOWED_EVENT_TYPES)[number];

// ── In-memory rate limiter: 120 events/min per email ─────────────────────────
const emailHits = new Map<string, number[]>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 120;
  const hits = (emailHits.get(email) ?? []).filter((t) => t > now - windowMs);
  hits.push(now);
  emailHits.set(email, hits);
  if (Math.random() < 0.01) {
    for (const [k, v] of emailHits.entries()) {
      if (v.every((t) => t < now - windowMs)) emailHits.delete(k);
    }
  }
  return hits.length > limit;
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(email)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  // Fire-and-forget: errors are logged but we always return 200
  try {
    let body: {
      event_type?: unknown;
      entity_type?: unknown;
      entity_id?: unknown;
      page?: unknown;
      metadata?: unknown;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: true });
    }

    const { event_type, entity_type, entity_id, page, metadata } = body;

    if (!ALLOWED_EVENT_TYPES.includes(event_type as PortalEventType)) {
      return NextResponse.json({ ok: false, error: "Invalid event_type" }, { status: 400 });
    }

    // Look up client_id from client_users
    const { data: cu } = await sb()
      .from("client_users")
      .select("client_id")
      .eq("email", email)
      .single();

    if (!cu?.client_id) {
      // User not found — log and swallow silently
      console.warn("[portal-events] client_id not found for email:", email);
      return NextResponse.json({ ok: true });
    }

    await sb().from("portal_events").insert({
      email,
      client_id:   cu.client_id,
      event_type:  event_type as PortalEventType,
      entity_type: typeof entity_type === "string" ? entity_type : null,
      entity_id:   typeof entity_id   === "string" ? entity_id   : null,
      page:        typeof page        === "string" ? page        : null,
      metadata:    metadata && typeof metadata === "object" ? metadata : {},
      created_at:  new Date().toISOString(),
    });
  } catch (err) {
    console.error("[portal-events] insert error:", err);
    // Fire-and-forget: still return ok
  }

  return NextResponse.json({ ok: true });
}
