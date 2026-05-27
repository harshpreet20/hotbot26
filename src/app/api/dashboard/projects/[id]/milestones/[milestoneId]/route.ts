export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, milestoneId } = await params;
  const body = await req.json() as Record<string, unknown>;

  const allowed = [
    "title", "description", "due_date", "completed_at",
    "status", "visibility", "color", "sort_order",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await sb()
    .from("milestones")
    .update(update)
    .eq("id", milestoneId)
    .eq("project_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });

  return NextResponse.json({ milestone: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, milestoneId } = await params;

  const { error } = await sb()
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("project_id", id);

  if (error) return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
