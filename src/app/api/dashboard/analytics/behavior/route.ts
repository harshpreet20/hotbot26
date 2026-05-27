export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopEngaged {
  email: string;
  lead_quality: "cold" | "warm" | "hot";
  engagement_score: number;
  intent_score: number;
  sessions_count: number;
  last_activity: string;
  pricing_visits: number;
  proposal_views: number;
  lead_id?: string;
}

interface FunnelStage {
  stage: string;
  count: number;
  conversion_pct: number;
}

interface PortalActivity {
  client_id: string;
  email: string;
  event_count: number;
  last_active: string;
  top_event_type: string;
}

interface RecentPortalEvent {
  email: string;
  event_type: string;
  entity_type: string | null;
  page: string | null;
  created_at: string;
}

interface BehaviorStats {
  total_visitor_profiles: number;
  hot_leads_count: number;
  warm_leads_count: number;
  active_portal_clients_7d: number;
  total_portal_events_7d: number;
}

interface BehaviorResponse {
  top_engaged: TopEngaged[];
  funnel: FunnelStage[];
  portal_activity: PortalActivity[];
  recent_portal_events: RecentPortalEvent[];
  stats: BehaviorStats;
}

// ── Ordered funnel stages ─────────────────────────────────────────────────────
const FUNNEL_ORDER = [
  "lead_form_submit",
  "lead",
  "proposal",
  "payment",
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await authorizeAny(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const empty: BehaviorResponse = {
    top_engaged: [],
    funnel: [],
    portal_activity: [],
    recent_portal_events: [],
    stats: {
      total_visitor_profiles: 0,
      hot_leads_count: 0,
      warm_leads_count: 0,
      active_portal_clients_7d: 0,
      total_portal_events_7d: 0,
    },
  };

  try {
    const client = sb();
    const ago30d = daysAgo(30);
    const ago24h = daysAgo(1);
    const ago7d  = daysAgo(7);

    // ── Run all queries in parallel ──────────────────────────────────────────

    const [
      engagedResult,
      journeyResult,
      portalActivityResult,
      recentEventsResult,
      profileCountResult,
      hotCountResult,
      warmCountResult,
      portalClients7dResult,
      portalEvents7dResult,
    ] = await Promise.allSettled([
      // Top 10 by engagement_score
      client
        .from("lead_engagement_scores")
        .select("email, lead_quality, engagement_score, intent_score, sessions_count, last_activity, pricing_visits, proposal_views, lead_id")
        .order("engagement_score", { ascending: false })
        .limit(10),

      // All journey stages
      client
        .from("site_journey_events")
        .select("stage"),

      // Portal activity last 30d: get all rows then aggregate in JS
      client
        .from("portal_events")
        .select("client_id, email, event_type, created_at")
        .gte("created_at", ago30d)
        .order("created_at", { ascending: false }),

      // Recent portal events last 24h
      client
        .from("portal_events")
        .select("email, event_type, entity_type, page, created_at")
        .gte("created_at", ago24h)
        .order("created_at", { ascending: false })
        .limit(50),

      // Total visitor profiles count
      client.from("visitor_profiles").select("id", { count: "exact", head: true }),

      // Hot leads count
      client
        .from("lead_engagement_scores")
        .select("email", { count: "exact", head: true })
        .eq("lead_quality", "hot"),

      // Warm leads count
      client
        .from("lead_engagement_scores")
        .select("email", { count: "exact", head: true })
        .eq("lead_quality", "warm"),

      // Active portal clients 7d
      client
        .from("portal_events")
        .select("client_id", { count: "exact", head: true })
        .gte("created_at", ago7d),

      // Total portal events 7d
      client
        .from("portal_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", ago7d),
    ]);

    // ── Top engaged ──────────────────────────────────────────────────────────

    const topEngaged: TopEngaged[] = [];
    if (engagedResult.status === "fulfilled" && !engagedResult.value.error) {
      for (const row of engagedResult.value.data ?? []) {
        topEngaged.push({
          email:            row.email           as string,
          lead_quality:     (row.lead_quality   as "cold" | "warm" | "hot") ?? "cold",
          engagement_score: Number(row.engagement_score ?? 0),
          intent_score:     Number(row.intent_score     ?? 0),
          sessions_count:   Number(row.sessions_count   ?? 0),
          last_activity:    (row.last_activity   as string) ?? "",
          pricing_visits:   Number(row.pricing_visits  ?? 0),
          proposal_views:   Number(row.proposal_views  ?? 0),
          lead_id:          (row.lead_id as string | undefined) ?? undefined,
        });
      }
    } else if (engagedResult.status === "fulfilled" && engagedResult.value.error) {
      console.warn("[behavior] lead_engagement_scores:", engagedResult.value.error.message);
    }

    // ── Conversion funnel ────────────────────────────────────────────────────

    const funnel: FunnelStage[] = [];
    if (journeyResult.status === "fulfilled" && !journeyResult.value.error) {
      const stageMap = new Map<string, number>();
      for (const row of journeyResult.value.data ?? []) {
        const stage = row.stage as string;
        stageMap.set(stage, (stageMap.get(stage) ?? 0) + 1);
      }

      // Build ordered funnel from known stages + any extra stages found
      const orderedStages = [
        ...FUNNEL_ORDER.filter((s) => stageMap.has(s)),
        ...Array.from(stageMap.keys()).filter((s) => !FUNNEL_ORDER.includes(s)),
      ];

      const firstCount = orderedStages.length > 0 ? (stageMap.get(orderedStages[0]) ?? 0) : 0;
      for (const stage of orderedStages) {
        const count = stageMap.get(stage) ?? 0;
        funnel.push({
          stage,
          count,
          conversion_pct: firstCount > 0
            ? Math.round((count / firstCount) * 100 * 10) / 10
            : 0,
        });
      }
    } else if (journeyResult.status === "fulfilled" && journeyResult.value.error) {
      console.warn("[behavior] site_journey_events:", journeyResult.value.error.message);
    }

    // ── Portal activity aggregation ──────────────────────────────────────────

    const portalActivity: PortalActivity[] = [];
    if (portalActivityResult.status === "fulfilled" && !portalActivityResult.value.error) {
      type PortalActivityAgg = {
        email: string;
        event_count: number;
        last_active: string;
        event_type_counts: Map<string, number>;
      };
      const aggMap = new Map<string, PortalActivityAgg>();

      for (const row of portalActivityResult.value.data ?? []) {
        const clientId = row.client_id as string;
        const email    = row.email     as string;
        const evType   = row.event_type as string;
        const createdAt = row.created_at as string;

        if (!aggMap.has(clientId)) {
          aggMap.set(clientId, {
            email,
            event_count: 0,
            last_active: createdAt,
            event_type_counts: new Map(),
          });
        }
        const entry = aggMap.get(clientId)!;
        entry.event_count += 1;
        if (createdAt > entry.last_active) entry.last_active = createdAt;
        entry.event_type_counts.set(evType, (entry.event_type_counts.get(evType) ?? 0) + 1);
      }

      for (const [clientId, agg] of aggMap.entries()) {
        let topEvType = "";
        let topEvCount = 0;
        for (const [et, cnt] of agg.event_type_counts.entries()) {
          if (cnt > topEvCount) { topEvCount = cnt; topEvType = et; }
        }
        portalActivity.push({
          client_id:      clientId,
          email:          agg.email,
          event_count:    agg.event_count,
          last_active:    agg.last_active,
          top_event_type: topEvType,
        });
      }

      portalActivity.sort((a, b) => b.event_count - a.event_count);
    } else if (portalActivityResult.status === "fulfilled" && portalActivityResult.value.error) {
      console.warn("[behavior] portal_events (activity):", portalActivityResult.value.error.message);
    }

    // ── Recent portal events ─────────────────────────────────────────────────

    const recentPortalEvents: RecentPortalEvent[] = [];
    if (recentEventsResult.status === "fulfilled" && !recentEventsResult.value.error) {
      for (const row of recentEventsResult.value.data ?? []) {
        recentPortalEvents.push({
          email:       row.email       as string,
          event_type:  row.event_type  as string,
          entity_type: (row.entity_type as string | null) ?? null,
          page:        (row.page        as string | null) ?? null,
          created_at:  row.created_at  as string,
        });
      }
    } else if (recentEventsResult.status === "fulfilled" && recentEventsResult.value.error) {
      console.warn("[behavior] portal_events (recent):", recentEventsResult.value.error.message);
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    const totalProfiles  = profileCountResult.status === "fulfilled"
      ? (profileCountResult.value.count ?? 0)
      : 0;
    const hotCount       = hotCountResult.status === "fulfilled"
      ? (hotCountResult.value.count ?? 0)
      : 0;
    const warmCount      = warmCountResult.status === "fulfilled"
      ? (warmCountResult.value.count ?? 0)
      : 0;

    // Active portal clients 7d: count distinct client_ids from the activity data
    const activeClients7d = portalActivityResult.status === "fulfilled" && !portalActivityResult.value.error
      ? new Set(
          (portalActivityResult.value.data ?? [])
            .filter((r) => (r.created_at as string) >= ago7d)
            .map((r) => r.client_id as string)
        ).size
      : (portalClients7dResult.status === "fulfilled" ? (portalClients7dResult.value.count ?? 0) : 0);

    const totalEvents7d  = portalEvents7dResult.status === "fulfilled"
      ? (portalEvents7dResult.value.count ?? 0)
      : 0;

    return NextResponse.json({
      top_engaged:          topEngaged,
      funnel,
      portal_activity:      portalActivity,
      recent_portal_events: recentPortalEvents,
      stats: {
        total_visitor_profiles:    totalProfiles,
        hot_leads_count:           hotCount,
        warm_leads_count:          warmCount,
        active_portal_clients_7d:  activeClients7d,
        total_portal_events_7d:    totalEvents7d,
      },
    } satisfies BehaviorResponse);

  } catch (err) {
    console.error("[behavior/GET]", err);
    return NextResponse.json(empty);
  }
}
