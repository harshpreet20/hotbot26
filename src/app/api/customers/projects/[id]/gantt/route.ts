export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: user } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify the project belongs to this client
  const { data: project } = await sb()
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("client_id", user.client_id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const [ganttRes, depsRes, milestonesRes] = await Promise.all([
    sb()
      .from("gantt_items")
      .select(
        "id, parent_id, phase_id, title, description, item_type, status, priority, " +
        "start_date, end_date, progress, assigned_to, assigned_dept, blocker_reason, sort_order, created_at, updated_at"
      )
      .eq("project_id", id)
      .eq("visibility", "client")
      .order("sort_order", { ascending: true }),
    sb()
      .from("gantt_dependencies")
      .select("id, source_id, target_id, dependency_type, lag_days")
      .eq("project_id", id),
    sb()
      .from("milestones")
      .select(
        "id, title, description, due_date, completed_at, status, color, sort_order, created_at, updated_at"
      )
      .eq("project_id", id)
      .eq("visibility", "client")
      .order("sort_order", { ascending: true }),
  ]);

  if (ganttRes.error) {
    return NextResponse.json({ error: "Failed to load gantt items" }, { status: 500 });
  }

  return NextResponse.json({
    gantt_items: ganttRes.data ?? [],
    dependencies: depsRes.data ?? [],
    milestones: milestonesRes.data ?? [],
  });
}
