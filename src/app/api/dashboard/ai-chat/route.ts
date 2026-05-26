import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ── Tool implementations ──────────────────────────────────────────────────────

async function getAnalytics() {
  const client = sb();
  const since = daysAgo(30);

  const [pvRes, sessRes, evRes, countryRes, refRes] = await Promise.all([
    client.from("site_page_views").select("page_path, created_at").gte("created_at", since),
    client.from("site_sessions").select("id, is_bounce, duration_ms, device_type, created_at").gte("created_at", since),
    client.from("site_events").select("event_name, created_at").gte("created_at", since),
    client.from("site_sessions").select("country").gte("created_at", since),
    client.from("site_sessions").select("referrer").gte("created_at", since),
  ]);

  const sessions = sessRes.data ?? [];
  const pageviews = pvRes.data ?? [];
  const events = evRes.data ?? [];

  const bounces = sessions.filter((s) => s.is_bounce).length;
  const totalDur = sessions.reduce((a, s) => a + (s.duration_ms ?? 0), 0);

  const pageCounts: Record<string, number> = {};
  for (const pv of pageviews) {
    const p = pv.page_path as string;
    pageCounts[p] = (pageCounts[p] ?? 0) + 1;
  }
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, views]) => ({ page, views }));

  const eventCounts: Record<string, number> = {};
  for (const ev of events) {
    const n = ev.event_name as string;
    eventCounts[n] = (eventCounts[n] ?? 0) + 1;
  }

  const deviceCounts: Record<string, number> = {};
  for (const s of sessions) {
    const d = (s.device_type as string) ?? "unknown";
    deviceCounts[d] = (deviceCounts[d] ?? 0) + 1;
  }

  const countryCounts: Record<string, number> = {};
  for (const s of (countryRes.data ?? [])) {
    const c = (s.country as string) ?? "Unknown";
    countryCounts[c] = (countryCounts[c] ?? 0) + 1;
  }

  function cleanRef(r: string | null) {
    if (!r) return "Direct";
    try { return new URL(r.startsWith("http") ? r : `https://${r}`).hostname.replace(/^www\./, ""); } catch { return r.slice(0, 40) || "Direct"; }
  }
  const refCounts: Record<string, number> = {};
  for (const s of (refRes.data ?? [])) {
    const r = cleanRef(s.referrer as string | null);
    refCounts[r] = (refCounts[r] ?? 0) + 1;
  }

  return {
    period: "last 30 days",
    visitors: sessions.length,
    pageviews: pageviews.length,
    bounceRate: sessions.length ? Math.round(bounces / sessions.length * 100) : 0,
    avgDurationSec: sessions.length ? Math.round(totalDur / sessions.length / 1000) : 0,
    topPages,
    topEvents: Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count })),
    devices: Object.entries(deviceCounts).map(([device, count]) => ({ device, count })),
    topCountries: Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, count]) => ({ country, count })),
    topReferrers: Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([source, count]) => ({ source, count })),
  };
}

async function getCrmSummary() {
  const client = sb();
  const since = daysAgo(30);

  const [leadsRes, ticketsRes, callbacksRes, chatsRes] = await Promise.all([
    client.from("leads").select("status, created_at").gte("created_at", since),
    client.from("tickets").select("status, priority, created_at").gte("created_at", since),
    client.from("callbacks").select("status, created_at").gte("created_at", since),
    client.from("chats").select("needs_human, agent_username, created_at").gte("created_at", since),
  ]);

  function countBy<T extends Record<string, unknown>>(rows: T[], key: string) {
    const out: Record<string, number> = {};
    for (const r of rows) { const v = (r[key] as string) ?? "unknown"; out[v] = (out[v] ?? 0) + 1; }
    return out;
  }

  const leads = leadsRes.data ?? [];
  const tickets = ticketsRes.data ?? [];
  const callbacks = callbacksRes.data ?? [];
  const chats = chatsRes.data ?? [];

  return {
    period: "last 30 days",
    leads: { total: leads.length, byStatus: countBy(leads, "status") },
    tickets: { total: tickets.length, byStatus: countBy(tickets, "status"), byPriority: countBy(tickets, "priority") },
    callbacks: { total: callbacks.length, byStatus: countBy(callbacks, "status") },
    chats: { total: chats.length, needsHuman: chats.filter((c) => c.needs_human).length, agentHandled: chats.filter((c) => c.agent_username).length },
  };
}

async function getEmailStats() {
  const client = sb();
  const since = daysAgo(30);
  const { data } = await client.from("email_logs").select("status, email_type, created_at").gte("created_at", since);
  const rows = data ?? [];

  function countBy(key: string) {
    const out: Record<string, number> = {};
    for (const r of rows) { const v = (r[key as keyof typeof r] as string) ?? "unknown"; out[v] = (out[v] ?? 0) + 1; }
    return out;
  }
  const total = rows.length;
  const byStatus = countBy("status");
  const byType = countBy("email_type");
  return {
    period: "last 30 days",
    total,
    byStatus,
    byType,
    deliveryRate: total ? Math.round(((byStatus.delivered ?? 0) + (byStatus.opened ?? 0) + (byStatus.clicked ?? 0)) / total * 100) : 0,
    openRate: total ? Math.round(((byStatus.opened ?? 0) + (byStatus.clicked ?? 0)) / total * 100) : 0,
    bounceRate: total ? Math.round((byStatus.bounced ?? 0) / total * 100) : 0,
  };
}

async function getRecentLeads(limit = 10) {
  const { data } = await sb().from("leads").select("name, email, status, source, service, created_at").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

async function getRecentTickets(limit = 10) {
  const { data } = await sb().from("tickets").select("subject, status, priority, email, created_at").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

// ── Local intelligence: intent detection & response formatting ─────────────

function detectIntent(query: string): string[] {
  const q = query.toLowerCase();
  const intents: string[] = [];

  if (/\b(analytic|traffic|visitor|session|pageview|page view|bounce|referr|source|device|country|top page)\b/.test(q)) intents.push("analytics");
  if (/\b(lead|crm|sales|callback|chat|ticket|support)\b/.test(q)) intents.push("crm");
  if (/\b(email|mail|deliver|open rate|bounce rate|newsletter|broadcast)\b/.test(q)) intents.push("email");
  if (/\b(recent lead|new lead|latest lead|lead list)\b/.test(q)) intents.push("leads");
  if (/\b(recent ticket|open ticket|latest ticket|ticket list)\b/.test(q)) intents.push("tickets");
  if (/\b(overview|summary|all|everything|dashboard|how.*doing|strategic|recommend)\b/.test(q)) {
    intents.push("analytics", "crm", "email");
  }

  return [...new Set(intents)];
}

function fmt(n: number, unit = "") {
  return `**${n.toLocaleString()}**${unit ? " " + unit : ""}`;
}

function formatAnalytics(d: Awaited<ReturnType<typeof getAnalytics>>): string {
  const topPages = d.topPages.slice(0, 5).map((p, i) => `  ${i + 1}. \`${p.page}\` — ${p.views} views`).join("\n");
  const topRefs  = d.topReferrers.slice(0, 5).map((r, i) => `  ${i + 1}. ${r.source} — ${r.count} sessions`).join("\n");
  const devices  = d.devices.map((dv) => `${dv.device}: ${dv.count}`).join(", ");
  const topCountries = d.topCountries.slice(0, 5).map((c) => `${c.country}: ${c.count}`).join(", ");

  return `### Website Analytics (last 30 days)

- **Visitors / Sessions:** ${fmt(d.visitors)}
- **Pageviews:** ${fmt(d.pageviews)}
- **Bounce Rate:** ${fmt(d.bounceRate, "%")}
- **Avg Session Duration:** ${fmt(d.avgDurationSec, "sec")}

**Top Pages:**
${topPages || "  No data"}

**Traffic Sources:**
${topRefs || "  No data"}

**Devices:** ${devices || "No data"}

**Top Countries:** ${topCountries || "No data"}`;
}

function formatCrm(d: Awaited<ReturnType<typeof getCrmSummary>>): string {
  const leadStatuses = Object.entries(d.leads.byStatus).map(([k, v]) => `${k}: ${v}`).join(", ");
  const ticketStatuses = Object.entries(d.tickets.byStatus).map(([k, v]) => `${k}: ${v}`).join(", ");
  const ticketPriorities = Object.entries(d.tickets.byPriority).map(([k, v]) => `${k}: ${v}`).join(", ");
  const callbackStatuses = Object.entries(d.callbacks.byStatus).map(([k, v]) => `${k}: ${v}`).join(", ");

  return `### CRM Summary (last 30 days)

**Leads:** ${fmt(d.leads.total)} total
${leadStatuses ? `  Status: ${leadStatuses}` : ""}

**Tickets:** ${fmt(d.tickets.total)} total
${ticketStatuses ? `  Status: ${ticketStatuses}` : ""}
${ticketPriorities ? `  Priority: ${ticketPriorities}` : ""}

**Callbacks:** ${fmt(d.callbacks.total)} total${callbackStatuses ? ` — ${callbackStatuses}` : ""}

**Live Chats:** ${fmt(d.chats.total)} total — ${fmt(d.chats.needsHuman)} escalated to human, ${fmt(d.chats.agentHandled)} agent-handled`;
}

function formatEmail(d: Awaited<ReturnType<typeof getEmailStats>>): string {
  const byType = Object.entries(d.byType).map(([k, v]) => `${k}: ${v}`).join(", ");
  return `### Email Stats (last 30 days)

- **Total emails sent:** ${fmt(d.total)}
- **Delivery Rate:** ${fmt(d.deliveryRate, "%")}
- **Open Rate:** ${fmt(d.openRate, "%")}
- **Bounce Rate:** ${fmt(d.bounceRate, "%")}
${byType ? `\n**By Type:** ${byType}` : ""}`;
}

function formatLeads(rows: Awaited<ReturnType<typeof getRecentLeads>>): string {
  if (rows.length === 0) return "No recent leads found.";
  const table = rows.slice(0, 10).map((r, i) => {
    const date = new Date(r.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `  ${i + 1}. **${r.name ?? "—"}** (${r.email ?? "—"}) — ${r.status ?? "—"} · ${r.source ?? "—"} · ${date}`;
  }).join("\n");
  return `### Recent Leads (last ${rows.length})\n\n${table}`;
}

function formatTickets(rows: Awaited<ReturnType<typeof getRecentTickets>>): string {
  if (rows.length === 0) return "No recent tickets found.";
  const table = rows.slice(0, 10).map((r, i) => {
    const date = new Date(r.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `  ${i + 1}. **${r.subject ?? "—"}** — ${r.status ?? "—"} · ${r.priority ?? "—"} · ${date}`;
  }).join("\n");
  return `### Recent Tickets (last ${rows.length})\n\n${table}`;
}

const HELP_MSG = `I'm your HotBot Studios data assistant. Ask me about:

- **Analytics** — traffic, visitors, top pages, devices, countries, referrers
- **CRM** — leads, tickets, callbacks, live chats
- **Email** — delivery rates, open rates, bounces
- **Recent leads** or **recent tickets** — latest entries

Try: *"Show me analytics"* or *"How are leads performing?"*`;

// ── POST handler ──────────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { messages: Message[] };
  const lastMsg = (body.messages ?? []).at(-1);
  const query = lastMsg?.role === "user" ? lastMsg.content.trim() : "";

  if (!query) return NextResponse.json({ reply: HELP_MSG, toolsUsed: [] });

  const intents = detectIntent(query);
  const toolsUsed: string[] = [];

  if (intents.length === 0) {
    return NextResponse.json({
      reply: HELP_MSG,
      toolsUsed: [],
    });
  }

  const parts: string[] = [];

  await Promise.all(intents.map(async (intent) => {
    try {
      if (intent === "analytics") {
        toolsUsed.push("get_analytics");
        parts.push(formatAnalytics(await getAnalytics()));
      } else if (intent === "crm") {
        toolsUsed.push("get_crm_summary");
        parts.push(formatCrm(await getCrmSummary()));
      } else if (intent === "email") {
        toolsUsed.push("get_email_stats");
        parts.push(formatEmail(await getEmailStats()));
      } else if (intent === "leads") {
        toolsUsed.push("get_recent_leads");
        parts.push(formatLeads(await getRecentLeads(10)));
      } else if (intent === "tickets") {
        toolsUsed.push("get_recent_tickets");
        parts.push(formatTickets(await getRecentTickets(10)));
      }
    } catch (err) {
      parts.push(`_Error fetching ${intent} data: ${err instanceof Error ? err.message : "unknown error"}_`);
    }
  }));

  const reply = parts.join("\n\n---\n\n") || HELP_MSG;
  return NextResponse.json({ reply, toolsUsed: [...new Set(toolsUsed)] });
}
