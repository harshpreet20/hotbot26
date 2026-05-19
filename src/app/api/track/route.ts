import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

// ── In-memory rate limiter: ~60 req/min per IP ────────────────────────────────
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 60;
  const hits = (ipHits.get(ip) ?? []).filter((t) => t > now - windowMs);
  hits.push(now);
  ipHits.set(ip, hits);
  // Prune old IPs occasionally
  if (Math.random() < 0.01) {
    for (const [k, v] of ipHits.entries()) {
      if (v.every((t) => t < now - windowMs)) ipHits.delete(k);
    }
  }
  return hits.length > limit;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TrackPayload =
  | { type: "session"; sessionId: string; firstPage: string; referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; device?: string; browser?: string; os?: string; trafficCategory?: string; trafficSource?: string; timezone?: string }
  | { type: "pageview"; sessionId: string; page: string; referrer?: string; durationMs?: number; timezone?: string; hourUtc?: number; maxScrollDepth?: number }
  | { type: "event"; sessionId: string; eventName: string; page?: string; properties?: Record<string, unknown> }
  | { type: "session_update"; sessionId: string; pageCount?: number; durationMs?: number; isBounce?: boolean; tabSwitches?: number; tabHiddenMs?: number };

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    const payload = (await req.json()) as TrackPayload;

    // Drop any tracking from internal dashboard/admin paths
    const page = "page" in payload ? payload.page : ("firstPage" in payload ? payload.firstPage : "");
    if (page && page.startsWith("/enter/")) return NextResponse.json({ ok: true });

    if (!isSupabaseEnabled()) return NextResponse.json({ ok: true });

    // Vercel injects geo headers
    const country = req.headers.get("x-vercel-ip-country") ?? undefined;
    const city    = req.headers.get("x-vercel-ip-city")    ?? undefined;

    const client = sb();

    if (payload.type === "session") {
      await client.from("site_sessions").upsert({
        id:               payload.sessionId,
        first_page:       payload.firstPage,
        referrer:         payload.referrer         ?? null,
        utm_source:       payload.utmSource        ?? null,
        utm_medium:       payload.utmMedium        ?? null,
        utm_campaign:     payload.utmCampaign      ?? null,
        device:           payload.device           ?? null,
        browser:          payload.browser          ?? null,
        os:               payload.os               ?? null,
        country:          country                  ?? null,
        city:             city                     ?? null,
        traffic_category: payload.trafficCategory  ?? null,
        traffic_source:   payload.trafficSource    ?? null,
        timezone:         payload.timezone         ?? null,
        page_count:       1,
        duration_ms:      0,
        is_bounce:        true,
        created_at:       new Date().toISOString(),
        last_seen_at:     new Date().toISOString(),
      }, { onConflict: "id" });

    } else if (payload.type === "pageview") {
      await client.from("site_page_views").insert({
        session_id:       payload.sessionId,
        page:             payload.page,
        referrer:         payload.referrer        ?? null,
        duration_ms:      payload.durationMs      ?? null,
        hour_utc:         payload.hourUtc         ?? null,
        timezone:         payload.timezone        ?? null,
        max_scroll_depth: payload.maxScrollDepth  ?? null,
        created_at:       new Date().toISOString(),
      });

    } else if (payload.type === "event") {
      await client.from("site_events").insert({
        session_id:  payload.sessionId,
        event_name:  payload.eventName,
        page:        payload.page       ?? null,
        properties:  payload.properties ?? null,
        created_at:  new Date().toISOString(),
      });

    } else if (payload.type === "session_update") {
      const updateData: Record<string, unknown> = {
        last_seen_at: new Date().toISOString(),
      };
      if (payload.pageCount   !== undefined) updateData.page_count   = payload.pageCount;
      if (payload.durationMs  !== undefined) updateData.duration_ms  = payload.durationMs;
      if (payload.isBounce    !== undefined) updateData.is_bounce    = payload.isBounce;
      if (payload.tabSwitches !== undefined) updateData.tab_switches = payload.tabSwitches;
      if (payload.tabHiddenMs !== undefined) updateData.tab_hidden_ms = payload.tabHiddenMs;

      await client
        .from("site_sessions")
        .update(updateData)
        .eq("id", payload.sessionId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/track]", err);
    return NextResponse.json({ ok: false });
  }
}
