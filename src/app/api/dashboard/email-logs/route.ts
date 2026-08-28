import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await requireRole(req, "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isSupabaseEnabled()) return NextResponse.json({ logs: [], stats: null });

  const params     = req.nextUrl.searchParams;
  const page       = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const limit      = Math.min(100, parseInt(params.get("limit") ?? "50", 10));
  const offset     = (page - 1) * limit;
  const type       = params.get("type") ?? "";
  const status     = params.get("status") ?? "";
  const search     = params.get("q") ?? "";
  const entityType = params.get("entity_type") ?? "";
  const entityId   = params.get("entity_id") ?? "";

  let query = sb()
    .from("email_logs")
    .select("id, resend_id, to_email, subject, email_type, status, last_event, sent_at, delivered_at, opened_at, last_opened_at, open_count, open_history, clicked_at, last_clicked_at, click_count, click_history, bounced_at, complained_at, metadata, entity_type, entity_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type)       query = query.eq("email_type", type);
  if (status)     query = query.eq("status", status);
  if (search)     query = query.or(`to_email.ilike.%${search}%,subject.ilike.%${search}%`);
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId)   query = query.eq("entity_id", entityId);

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
    if (s === "sent")           stats.sent++;
    else if (s === "delivered") stats.delivered++;
    else if (s === "opened")    stats.opened++;
    else if (s === "clicked")   stats.clicked++;
    else if (s === "bounced")   stats.bounced++;
    else if (s === "complained") stats.complained++;
    else if (s === "failed")    stats.failed++;
  }

  return NextResponse.json({ logs: logs ?? [], total: count ?? 0, page, limit, stats });
}

export async function DELETE(req: NextRequest) {
  const session = await requireRole(req, "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (session.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await sb().from("email_logs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
