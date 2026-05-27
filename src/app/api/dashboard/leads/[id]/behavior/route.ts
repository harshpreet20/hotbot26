export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VisitorProfile {
  id: string;
  email: string;
  first_seen_at: string | null;
  last_seen_at: string | null;
  total_sessions: number;
  total_pageviews: number;
  total_events: number;
  avg_session_ms: number;
  max_scroll_depth: number;
  pages_visited: string[];
  journey_stages: string[];
  engagement_score: number;
  lead_id: string | null;
  client_id: string | null;
  is_client: boolean;
  last_ip: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  updated_at: string;
}

interface EngagementScore {
  email: string;
  lead_id: string | null;
  client_id: string | null;
  engagement_score: number;
  intent_score: number;
  sessions_count: number;
  pageviews_count: number;
  events_count: number;
  pricing_visits: number;
  proposal_views: number;
  return_visits: number;
  days_since_last_visit: number | null;
  lead_quality: "cold" | "warm" | "hot";
  portal_active: boolean;
  last_activity: string | null;
  updated_at: string;
}

interface JourneyEvent {
  id: string;
  session_id: string | null;
  email: string | null;
  stage: string;
  lead_id: string | null;
  client_id: string | null;
  invoice_id: string | null;
  revenue_amount: number | null;
  created_at: string;
}

interface RecentPage {
  page: string;
  count: number;
  last_visit: string;
}

interface PortalEvent {
  id: string;
  email: string;
  client_id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  page: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface BehaviorProfileResponse {
  profile: VisitorProfile | null;
  score: EngagementScore | null;
  journey: JourneyEvent[];
  recent_pages: RecentPage[];
  portal_events: PortalEvent[] | null;
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await authorizeAny(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const empty: BehaviorProfileResponse = {
    profile:       null,
    score:         null,
    journey:       [],
    recent_pages:  [],
    portal_events: null,
  };

  const { id } = params;
  if (!id) {
    return NextResponse.json(empty);
  }

  try {
    const client = sb();

    // 1. Get lead by id
    const { data: lead, error: leadErr } = await client
      .from("leads")
      .select("id, email, name")
      .eq("id", id)
      .single();

    if (leadErr || !lead) {
      console.warn("[lead/behavior] lead not found:", id, leadErr?.message);
      return NextResponse.json(empty);
    }

    const email = lead.email as string | null;
    if (!email) {
      return NextResponse.json(empty);
    }

    // 2. Run profile, score, and journey queries in parallel
    const [profileResult, scoreResult, journeyResult] = await Promise.allSettled([
      client
        .from("visitor_profiles")
        .select("*")
        .eq("email", email)
        .single(),

      client
        .from("lead_engagement_scores")
        .select("*")
        .eq("email", email)
        .single(),

      client
        .from("site_journey_events")
        .select("id, session_id, email, stage, lead_id, client_id, invoice_id, revenue_amount, created_at")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const profile: VisitorProfile | null =
      profileResult.status === "fulfilled" && !profileResult.value.error
        ? (profileResult.value.data as VisitorProfile)
        : null;

    const score: EngagementScore | null =
      scoreResult.status === "fulfilled" && !scoreResult.value.error
        ? (scoreResult.value.data as EngagementScore)
        : null;

    const journey: JourneyEvent[] =
      journeyResult.status === "fulfilled" && !journeyResult.value.error
        ? ((journeyResult.value.data ?? []) as JourneyEvent[])
        : [];

    // 3. Collect session_ids from journey events for page view lookups
    const sessionIds = Array.from(
      new Set(journey.map((j) => j.session_id).filter((sid): sid is string => !!sid))
    );

    // 4. Fetch page views and portal events in parallel (conditional on session_ids)
    const [pageViewsResult, portalEventsResult] = await Promise.allSettled([
      sessionIds.length > 0
        ? client
            .from("site_page_views")
            .select("page, created_at")
            .in("session_id", sessionIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as Array<{ page: string; created_at: string }>, error: null }),

      client
        .from("portal_events")
        .select("id, email, client_id, event_type, entity_type, entity_id, page, metadata, created_at")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    // 5. Aggregate recent pages
    const recentPages: RecentPage[] = [];
    if (pageViewsResult.status === "fulfilled" && !pageViewsResult.value.error) {
      const pageMap = new Map<string, { count: number; last_visit: string }>();
      for (const row of pageViewsResult.value.data ?? []) {
        const p = row.page as string;
        const ts = row.created_at as string;
        const existing = pageMap.get(p);
        if (!existing) {
          pageMap.set(p, { count: 1, last_visit: ts });
        } else {
          existing.count += 1;
          if (ts > existing.last_visit) existing.last_visit = ts;
        }
      }
      for (const [page, { count, last_visit }] of pageMap.entries()) {
        recentPages.push({ page, count, last_visit });
      }
      recentPages.sort((a, b) => b.count - a.count);
    }

    // 6. Portal events
    const portalEvents: PortalEvent[] | null =
      portalEventsResult.status === "fulfilled" && !portalEventsResult.value.error
        ? ((portalEventsResult.value.data ?? []) as PortalEvent[])
        : null;

    return NextResponse.json({
      profile,
      score,
      journey,
      recent_pages: recentPages,
      portal_events: portalEvents,
    } satisfies BehaviorProfileResponse);

  } catch (err) {
    console.error("[lead/behavior/GET]", err);
    return NextResponse.json(empty);
  }
}
