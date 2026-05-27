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

  // Try to fetch the persisted health record first
  const { data: health } = await sb()
    .from("project_health")
    .select("*")
    .eq("project_id", id)
    .single();

  if (health) {
    return NextResponse.json({ health });
  }

  // No health record yet — compute basic stats from live data
  const [ganttRes, milestonesRes] = await Promise.all([
    sb()
      .from("gantt_items")
      .select("status, visibility")
      .eq("project_id", id),
    sb()
      .from("milestones")
      .select("status, visibility")
      .eq("project_id", id),
  ]);

  const ganttItems = ganttRes.data ?? [];
  const milestones = milestonesRes.data ?? [];

  const clientGantt = ganttItems.filter((g) => g.visibility === "client");
  const delayed_items_count = clientGantt.filter((g) => g.status === "delayed").length;
  const blocked_items_count = clientGantt.filter((g) => g.status === "blocked").length;

  const clientMilestones = milestones.filter((m) => m.visibility === "client");
  const total_milestones = clientMilestones.length;
  const completed_milestones = clientMilestones.filter((m) => m.status === "completed").length;
  const milestone_completion_rate =
    total_milestones > 0
      ? Math.round((completed_milestones / total_milestones) * 100 * 100) / 100
      : null;

  // Derive an overall health colour from the computed data
  let overall_health: "green" | "yellow" | "red" = "green";
  if (blocked_items_count > 0 || delayed_items_count > 2) {
    overall_health = "red";
  } else if (delayed_items_count > 0) {
    overall_health = "yellow";
  }

  const computed = {
    project_id: id,
    client_id: user.client_id,
    overall_health,
    schedule_health: overall_health,
    budget_health: "green" as const,
    quality_health: "green" as const,
    scope_health: "green" as const,
    delayed_items_count,
    blocked_items_count,
    pending_approvals_count: 0,
    completed_milestones,
    total_milestones,
    sprint_velocity: null,
    milestone_completion_rate,
    on_track_percentage: null,
    risk_items: [],
    health_notes: null,
    last_updated_by: null,
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ health: computed });
}
