export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await params;
  const body = await req.json() as Record<string, unknown>;

  const allowed = [
    "title", "description", "item_type", "status", "priority",
    "start_date", "end_date", "progress", "assigned_to", "assigned_dept",
    "blocker_reason", "visibility", "sort_order", "parent_id", "phase_id",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await sb()
    .from("gantt_items")
    .update(update)
    .eq("id", itemId)
    .eq("project_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update gantt item" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Gantt item not found" }, { status: 404 });

  return NextResponse.json({ gantt_item: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await params;

  const { error } = await sb()
    .from("gantt_items")
    .delete()
    .eq("id", itemId)
    .eq("project_id", id);

  if (error) return NextResponse.json({ error: "Failed to delete gantt item" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
