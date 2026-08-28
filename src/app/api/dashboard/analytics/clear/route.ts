import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function DELETE(req: NextRequest) {
  const session = await requireRole(req, "super_admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isSupabaseEnabled()) return NextResponse.json({ ok: true, deleted: 0 });

  const params = req.nextUrl.searchParams;
  const before = params.get("before"); // ISO date — delete data before this date

  const client = sb();

  if (before) {
    const [r1, r2, r3] = await Promise.all([
      client.from("site_events").delete().lt("created_at", before),
      client.from("site_page_views").delete().lt("created_at", before),
      client.from("site_sessions").delete().lt("created_at", before),
    ]);
    const err = r1.error ?? r2.error ?? r3.error;
    if (err) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: r3.count ?? "all" });
  }

  // Full wipe: truncate via gte epoch
  const [r1, r2, r3] = await Promise.all([
    client.from("site_events").delete().gte("created_at", "2000-01-01"),
    client.from("site_page_views").delete().gte("created_at", "2000-01-01"),
    client.from("site_sessions").delete().gte("created_at", "2000-01-01"),
  ]);
  const err = r1.error ?? r2.error ?? r3.error;
  if (err) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  return NextResponse.json({ ok: true, deleted: r3.count ?? "all" });
}
