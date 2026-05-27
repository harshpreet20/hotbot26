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

  // Verify the project belongs to this client and fetch basic info
  const { data: project } = await sb()
    .from("projects")
    .select("id, name, status, progress, start_date, target_date")
    .eq("id", id)
    .eq("client_id", user.client_id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const [phasesRes, milestonesRes] = await Promise.all([
    sb()
      .from("project_phases")
      .select(
        "id, name, description, phase_type, status, start_date, end_date, " +
        "progress, color, sort_order, deliverables, assigned_team, created_at, updated_at"
      )
      .eq("project_id", id)
      .eq("visibility", "client")
      .order("sort_order", { ascending: true }),
    sb()
      .from("milestones")
      .select(
        "id, title, description, due_date, completed_at, status, color, sort_order, created_at, updated_at"
      )
      .eq("project_id", id)
      .eq("visibility", "client")
      .order("sort_order", { ascending: true }),
  ]);

  if (phasesRes.error) {
    return NextResponse.json({ error: "Failed to load phases" }, { status: 500 });
  }

  return NextResponse.json({
    project,
    phases: phasesRes.data ?? [],
    milestones: milestonesRes.data ?? [],
  });
}
