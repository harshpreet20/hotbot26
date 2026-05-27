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
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load milestones" }, { status: 500 });

  return NextResponse.json({ milestones: data ?? [] });
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
    due_date?: string;
    description?: string;
    status?: string;
    visibility?: "internal" | "client";
    color?: string;
    sort_order?: number;
  };

  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!body.due_date) return NextResponse.json({ error: "due_date is required" }, { status: 400 });

  // Fetch client_id from project
  const { data: project } = await sb()
    .from("projects")
    .select("client_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data, error } = await sb()
    .from("milestones")
    .insert({
      project_id: id,
      client_id: project.client_id,
      title: body.title,
      due_date: body.due_date,
      description: body.description ?? null,
      status: body.status ?? "pending",
      visibility: body.visibility ?? "client",
      color: body.color ?? "#6366f1",
      sort_order: body.sort_order ?? 0,
      created_by: session.username,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });

  return NextResponse.json({ milestone: data }, { status: 201 });
}
