import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeSuperAdmin } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

export async function DELETE(req: NextRequest) {
  const session = await authorizeSuperAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isSupabaseEnabled()) return NextResponse.json({ ok: true, deleted: 0 });

  const params = req.nextUrl.searchParams;
  const before = params.get("before"); // ISO date — delete data before this date

  const client = sb();

  if (before) {
    await client.from("site_events").delete().lt("created_at", before);
    await client.from("site_page_views").delete().lt("created_at", before);
    const { count } = await client.from("site_sessions").delete().lt("created_at", before);
    return NextResponse.json({ ok: true, deleted: count ?? "all" });
  }

  // Full wipe: truncate via gte epoch
  await client.from("site_events").delete().gte("created_at", "2000-01-01");
  await client.from("site_page_views").delete().gte("created_at", "2000-01-01");
  const { count } = await client.from("site_sessions").delete().gte("created_at", "2000-01-01");

  return NextResponse.json({ ok: true, deleted: count ?? "all" });
}
