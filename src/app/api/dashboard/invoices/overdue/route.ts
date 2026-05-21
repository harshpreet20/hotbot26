/**
 * POST /api/dashboard/invoices/overdue
 * Marks all invoices where due_date < today AND status IN ('sent','viewed') as 'overdue'.
 * Can be triggered by a cron job or N8N.
 * Protected — requires any valid dashboard session or publish secret.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, updateById } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { Invoice } from "@/types/dashboard";

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  if (isSupabaseEnabled()) {
    // Use Supabase direct update for efficiency
    const { data, error } = await sb()
      .from("invoices")
      .update({ status: "overdue" })
      .in("status", ["sent", "viewed"])
      .lt("due_date", today)
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
  }

  // Filesystem fallback
  const invoices = await readAll<Invoice>("invoices");
  let updated = 0;

  for (const inv of invoices) {
    if (["sent", "viewed"].includes(inv.status) && inv.dueDate && inv.dueDate < today) {
      await updateById<Invoice>("invoices", inv.id, { status: "overdue" });
      updated++;
    }
  }

  return NextResponse.json({ ok: true, updated });
}
