import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));

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
    chats: {
      total: chats.length,
      needsHuman: chats.filter((c) => c.needs_human).length,
      agentHandled: chats.filter((c) => c.agent_username).length,
    },
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

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_analytics",
      description: "Fetch website analytics for the last 30 days: visitors, pageviews, bounce rate, avg session duration, top pages, top events, devices, countries, referrers.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_crm_summary",
      description: "Fetch CRM summary for the last 30 days: leads, tickets, callbacks, and live chat statistics with status breakdowns.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_email_stats",
      description: "Fetch email marketing and transactional email statistics for the last 30 days: delivery, open, bounce rates, breakdown by type.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_leads",
      description: "Fetch the most recent leads from the CRM.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "Number of leads to return (default 10, max 25)" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_tickets",
      description: "Fetch the most recent support tickets.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "Number of tickets to return (default 10, max 25)" } },
      },
    },
  },
];

const SYSTEM_PROMPT = `You are the HotBot Studios AI Analyst — a data-grounded business intelligence assistant for the HotBot Studios dashboard.

RULES (non-negotiable):
1. ALWAYS call the appropriate tool(s) before answering any factual question. Never answer from memory or training data.
2. NEVER hallucinate numbers, names, or metrics. If data is missing, say so explicitly.
3. Only answer questions about HotBot Studios business data: analytics, CRM, email, leads, tickets, callbacks, chats.
4. For off-topic requests (coding help, general knowledge, news, etc.), respond: "I can only help with HotBot Studios business metrics and strategy. Ask me about your analytics, CRM, email performance, or growth strategy."
5. You CAN help with strategy — but only when grounded in actual fetched data. Suggest concrete actions based on the numbers.
6. Be concise, clear, and professional. Use bullet points for lists. Bold key metrics.
7. Never mention competitors, make promises, or give legal/financial advice.
8. If you cannot answer confidently from the tool data, say so — never guess.`;

// ── POST: chat ────────────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; content: string };
type ToolCall = { id: string; name: string; args: Record<string, unknown> };

export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { messages: Message[] };
  const history = (body.messages ?? []).slice(-20); // keep last 20 for context

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const toolsUsed: string[] = [];

  try {
    // Agentic loop: keep calling until no more tool calls
    for (let iter = 0; iter < 5; iter++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.2,
        max_tokens: 1500,
      });

      const msg = response.choices[0]?.message;
      if (!msg) break;

      messages.push(msg);

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        // Final text response
        return NextResponse.json({
          reply: msg.content ?? "",
          toolsUsed,
        });
      }

      // Execute each tool call
      const toolResults: OpenAI.Chat.ChatCompletionToolMessageParam[] = [];
      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        const name = tc.function.name;
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.function.arguments) as Record<string, unknown>; } catch { /* ignore */ }

        toolsUsed.push(name);
        const call: ToolCall = { id: tc.id, name, args };

        let result: unknown;
        try {
          if (call.name === "get_analytics")      result = await getAnalytics();
          else if (call.name === "get_crm_summary") result = await getCrmSummary();
          else if (call.name === "get_email_stats") result = await getEmailStats();
          else if (call.name === "get_recent_leads") result = await getRecentLeads(Math.min((call.args.limit as number) ?? 10, 25));
          else if (call.name === "get_recent_tickets") result = await getRecentTickets(Math.min((call.args.limit as number) ?? 10, 25));
          else result = { error: "Unknown tool" };
        } catch (err) {
          result = { error: err instanceof Error ? err.message : "Tool error" };
        }

        toolResults.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
      }
      messages.push(...toolResults);
    }

    return NextResponse.json({ reply: "I was unable to generate a response. Please try again.", toolsUsed });
  } catch (err) {
    console.error("[ai-chat]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI error" }, { status: 500 });
  }
}
