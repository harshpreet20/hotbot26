import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, extractToken } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isSupabaseEnabled()) return NextResponse.json({ logs: [], stats: null });

  const params    = req.nextUrl.searchParams;
  const page      = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const limit     = Math.min(100, parseInt(params.get("limit") ?? "50", 10));
  const offset    = (page - 1) * limit;
  const type      = params.get("type") ?? "";
  const status    = params.get("status") ?? "";
  const search    = params.get("q") ?? "";

  let query = sb()
    .from("email_logs")
    .select("id, resend_id, to_email, subject, email_type, status, last_event, sent_at, delivered_at, opened_at, clicked_at, bounced_at, complained_at, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type)   query = query.eq("email_type", type);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`to_email.ilike.%${search}%,subject.ilike.%${search}%`);

  const { data: logs, count, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch logs." }, { status: 500 });

  // Aggregate stats (all time, unfiltered)
  const { data: statsRows } = await sb()
    .from("email_logs")
    .select("status");

  const stats = { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0, failed: 0 };
  for (const r of statsRows ?? []) {
    stats.total++;
    const s = r.status as string;
    if (s === "sent")      stats.sent++;
    else if (s === "delivered") stats.delivered++;
    else if (s === "opened")    stats.opened++;
    else if (s === "clicked")   stats.clicked++;
    else if (s === "bounced")   stats.bounced++;
    else if (s === "complained") stats.complained++;
    else if (s === "failed")    stats.failed++;
  }

  return NextResponse.json({ logs: logs ?? [], total: count ?? 0, page, limit, stats });
}
