/**
 * GET  /api/dashboard/invoices/ai-insights?email=...
 *   Returns saved insights for a client email.
 *
 * POST /api/dashboard/invoices/ai-insights
 *   Body: { email: string }
 *   Computes and upserts AI insights using Supabase data only — no external API.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing ?email= parameter" }, { status: 400 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await sb()
    .from("invoice_ai_insights")
    .select("*")
    .eq("client_email", email)
    .order("computed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const insights: Record<string, unknown> = {};
  for (const row of data ?? []) {
    insights[row.insight_type as string] = row.insight_data;
  }

  return NextResponse.json({ email, insights, rows: data });
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { email?: string };
  const email = body.email?.trim();
  if (!email) return NextResponse.json({ error: "Missing email in body" }, { status: 400 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // 1. Fetch all invoices for this client
  const { data: invoices, error: invErr } = await sb()
    .from("invoices")
    .select("id, status, total, issued_date, paid_date, due_date, created_at")
    .eq("client_email", email)
    .order("created_at", { ascending: true });

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  const allInvoices = invoices ?? [];

  // 2. Avg days to pay (paid invoices only)
  const paidInvoices = allInvoices.filter(
    (i) => i.status === "paid" && i.paid_date && i.issued_date,
  );

  const avgDaysToPay = paidInvoices.length > 0
    ? paidInvoices.reduce((sum, inv) => {
        const issued = new Date(inv.issued_date as string);
        const paid   = new Date(inv.paid_date as string);
        return sum + Math.floor((paid.getTime() - issued.getTime()) / 86400000);
      }, 0) / paidInvoices.length
    : 30; // default

  // 3. Payment risk score (0–100, higher = riskier)
  const overdueCount = allInvoices.filter((i) => i.status === "overdue").length;
  const totalCount   = allInvoices.length;
  const riskScore    = Math.min(
    100,
    Math.round((overdueCount / (totalCount || 1)) * 100 + (avgDaysToPay > 30 ? 20 : 0)),
  );

  // 4. Suggested follow-up day
  const suggestedFollowupDay = Math.max(7, Math.round(avgDaysToPay * 0.8));

  // 5. Revenue trend: last 3 months vs previous 3 months
  const now = new Date();

  const recentStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const priorStart  = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const priorEnd    = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const recentRevenue = allInvoices
    .filter((i) => {
      const d = new Date(i.issued_date as string);
      return d >= recentStart;
    })
    .reduce((s, i) => s + Number(i.total), 0);

  const priorRevenue = allInvoices
    .filter((i) => {
      const d = new Date(i.issued_date as string);
      return d >= priorStart && d < priorEnd;
    })
    .reduce((s, i) => s + Number(i.total), 0);

  const trend: "up" | "down" | "flat" =
    recentRevenue > priorRevenue ? "up" : recentRevenue < priorRevenue ? "down" : "flat";

  const changePct = priorRevenue > 0
    ? Math.round(((recentRevenue - priorRevenue) / priorRevenue) * 100)
    : 0;

  const riskLabel: "High" | "Medium" | "Low" =
    riskScore > 60 ? "High" : riskScore > 30 ? "Medium" : "Low";

  // 6. Upsert all insights
  const computedAt = new Date().toISOString();

  const insightRows = [
    {
      client_email:  email,
      insight_type:  "avg_days_to_pay",
      insight_data:  { days: parseFloat(avgDaysToPay.toFixed(1)), sample_size: paidInvoices.length },
      computed_at:   computedAt,
    },
    {
      client_email:  email,
      insight_type:  "payment_risk",
      insight_data:  { score: riskScore, overdue_count: overdueCount, total_invoices: totalCount, label: riskLabel },
      computed_at:   computedAt,
    },
    {
      client_email:  email,
      insight_type:  "suggested_followup",
      insight_data:  {
        days_after_issue: suggestedFollowupDay,
        message:          `Send reminder ${suggestedFollowupDay} days after issuing`,
      },
      computed_at:   computedAt,
    },
    {
      client_email:  email,
      insight_type:  "revenue_trend",
      insight_data:  {
        recent_3m:  parseFloat(recentRevenue.toFixed(2)),
        prior_3m:   parseFloat(priorRevenue.toFixed(2)),
        trend,
        change_pct: changePct,
      },
      computed_at:   computedAt,
    },
  ];

  const { error: upsertErr } = await sb()
    .from("invoice_ai_insights")
    .upsert(insightRows, { onConflict: "client_email,insight_type" });

  if (upsertErr) {
    console.error("[ai-insights] upsert error:", upsertErr.message);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // Return computed insights
  const result: Record<string, unknown> = {
    avg_days_to_pay:  insightRows[0].insight_data,
    payment_risk:     insightRows[1].insight_data,
    suggested_followup: insightRows[2].insight_data,
    revenue_trend:    insightRows[3].insight_data,
  };

  return NextResponse.json({ email, insights: result, computedAt });
}
