export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, phaseId } = await params;
  const body = await req.json() as Record<string, unknown>;

  const allowed = [
    "name", "description", "phase_type", "status",
    "start_date", "end_date", "progress", "color",
    "sort_order", "visibility", "deliverables", "assigned_team",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await sb()
    .from("project_phases")
    .update(update)
    .eq("id", phaseId)
    .eq("project_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update phase" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

  return NextResponse.json({ phase: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, phaseId } = await params;

  const { error } = await sb()
    .from("project_phases")
    .delete()
    .eq("id", phaseId)
    .eq("project_id", id);

  if (error) return NextResponse.json({ error: "Failed to delete phase" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
