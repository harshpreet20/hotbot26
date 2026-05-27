export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data, error } = await sb()
    .from("project_health")
    .select("*")
    .eq("project_id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned — that's fine, return null
    return NextResponse.json({ error: "Failed to load health record" }, { status: 500 });
  }

  return NextResponse.json({ health: data ?? null });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as {
    overall_health?: "green" | "yellow" | "red";
    schedule_health?: "green" | "yellow" | "red";
    budget_health?: "green" | "yellow" | "red";
    quality_health?: "green" | "yellow" | "red";
    scope_health?: "green" | "yellow" | "red";
    pending_approvals_count?: number;
    sprint_velocity?: number;
    risk_items?: unknown[];
    health_notes?: string;
  };

  // Fetch client_id from project
  const { data: project } = await sb()
    .from("projects")
    .select("client_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Auto-compute live counters from gantt_items and milestones
  const [ganttRes, milestonesRes] = await Promise.all([
    sb()
      .from("gantt_items")
      .select("status")
      .eq("project_id", id),
    sb()
      .from("milestones")
      .select("status, visibility")
      .eq("project_id", id),
  ]);

  const ganttItems = ganttRes.data ?? [];
  const milestones = milestonesRes.data ?? [];

  const delayed_items_count = ganttItems.filter((g) => g.status === "delayed").length;
  const blocked_items_count = ganttItems.filter((g) => g.status === "blocked").length;

  const clientMilestones = milestones.filter((m) => m.visibility === "client");
  const total_milestones = clientMilestones.length;
  const completed_milestones = clientMilestones.filter((m) => m.status === "completed").length;
  const milestone_completion_rate =
    total_milestones > 0
      ? Math.round((completed_milestones / total_milestones) * 100 * 100) / 100
      : null;

  const inProgress = ganttItems.filter(
    (g) => g.status !== "delayed" && g.status !== "cancelled" && g.status !== "blocked"
  ).length;
  const total = ganttItems.length;
  const on_track_percentage =
    total > 0 ? Math.round((inProgress / total) * 100 * 100) / 100 : null;

  const upsertPayload: Record<string, unknown> = {
    project_id: id,
    client_id: project.client_id,
    delayed_items_count,
    blocked_items_count,
    completed_milestones,
    total_milestones,
    milestone_completion_rate,
    on_track_percentage,
    last_updated_by: session.username,
    updated_at: new Date().toISOString(),
  };

  // Merge caller-supplied fields
  const healthFields = [
    "overall_health", "schedule_health", "budget_health",
    "quality_health", "scope_health", "pending_approvals_count",
    "sprint_velocity", "risk_items", "health_notes",
  ] as const;
  for (const key of healthFields) {
    if (key in body) upsertPayload[key] = body[key];
  }

  const { data, error } = await sb()
    .from("project_health")
    .upsert(upsertPayload, { onConflict: "project_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to save health record" }, { status: 500 });

  return NextResponse.json({ health: data });
}
