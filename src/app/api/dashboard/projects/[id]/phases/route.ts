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
    .from("project_phases")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load phases" }, { status: 500 });

  return NextResponse.json({ phases: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as {
    name?: string;
    phase_type?: string;
    status?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    progress?: number;
    color?: string;
    sort_order?: number;
    visibility?: "internal" | "client";
    deliverables?: string[];
    assigned_team?: string[];
  };

  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!body.phase_type) return NextResponse.json({ error: "phase_type is required" }, { status: 400 });
  if (!body.status) return NextResponse.json({ error: "status is required" }, { status: 400 });

  // Fetch client_id from project
  const { data: project } = await sb()
    .from("projects")
    .select("client_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data, error } = await sb()
    .from("project_phases")
    .insert({
      project_id: id,
      client_id: project.client_id,
      name: body.name,
      phase_type: body.phase_type,
      status: body.status,
      description: body.description ?? null,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      progress: body.progress ?? 0,
      color: body.color ?? "#6366f1",
      sort_order: body.sort_order ?? 0,
      visibility: body.visibility ?? "client",
      deliverables: body.deliverables ?? [],
      assigned_team: body.assigned_team ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create phase" }, { status: 500 });

  return NextResponse.json({ phase: data }, { status: 201 });
}
