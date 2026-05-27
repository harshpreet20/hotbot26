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

  const [ganttRes, depsRes] = await Promise.all([
    sb()
      .from("gantt_items")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true }),
    sb()
      .from("gantt_dependencies")
      .select("*")
      .eq("project_id", id),
  ]);

  if (ganttRes.error) {
    return NextResponse.json({ error: "Failed to load gantt items" }, { status: 500 });
  }

  return NextResponse.json({
    gantt_items: ganttRes.data ?? [],
    dependencies: depsRes.data ?? [],
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as {
    title?: string;
    item_type?: string;
    parent_id?: string;
    phase_id?: string;
    description?: string;
    status?: string;
    priority?: string;
    start_date?: string;
    end_date?: string;
    progress?: number;
    assigned_to?: string[];
    assigned_dept?: string;
    blocker_reason?: string;
    visibility?: "internal" | "client";
    sort_order?: number;
  };

  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!body.item_type) return NextResponse.json({ error: "item_type is required" }, { status: 400 });

  // Fetch client_id from project
  const { data: project } = await sb()
    .from("projects")
    .select("client_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data, error } = await sb()
    .from("gantt_items")
    .insert({
      project_id: id,
      client_id: project.client_id,
      title: body.title,
      item_type: body.item_type,
      parent_id: body.parent_id ?? null,
      phase_id: body.phase_id ?? null,
      description: body.description ?? null,
      status: body.status ?? "pending",
      priority: body.priority ?? "medium",
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      progress: body.progress ?? 0,
      assigned_to: body.assigned_to ?? [],
      assigned_dept: body.assigned_dept ?? null,
      blocker_reason: body.blocker_reason ?? null,
      visibility: body.visibility ?? "client",
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create gantt item" }, { status: 500 });

  return NextResponse.json({ gantt_item: data }, { status: 201 });
}
