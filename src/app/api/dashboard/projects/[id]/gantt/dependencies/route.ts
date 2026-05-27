export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as {
    source_id?: string;
    target_id?: string;
    dependency_type?: string;
    lag_days?: number;
  };

  if (!body.source_id) return NextResponse.json({ error: "source_id is required" }, { status: 400 });
  if (!body.target_id) return NextResponse.json({ error: "target_id is required" }, { status: 400 });
  if (body.source_id === body.target_id) {
    return NextResponse.json({ error: "source_id and target_id must differ" }, { status: 400 });
  }

  // Verify both items belong to this project
  const { data: items } = await sb()
    .from("gantt_items")
    .select("id")
    .eq("project_id", id)
    .in("id", [body.source_id, body.target_id]);

  if (!items || items.length < 2) {
    return NextResponse.json({ error: "One or both gantt items not found in this project" }, { status: 404 });
  }

  const { data, error } = await sb()
    .from("gantt_dependencies")
    .insert({
      project_id: id,
      source_id: body.source_id,
      target_id: body.target_id,
      dependency_type: body.dependency_type ?? "finish_to_start",
      lag_days: body.lag_days ?? 0,
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation = dependency already exists
    if (error.code === "23505") {
      return NextResponse.json({ error: "Dependency already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create dependency" }, { status: 500 });
  }

  return NextResponse.json({ dependency: data }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const dependencyId = url.searchParams.get("dependency_id");

  if (!dependencyId) {
    return NextResponse.json({ error: "dependency_id query param is required" }, { status: 400 });
  }

  const { error } = await sb()
    .from("gantt_dependencies")
    .delete()
    .eq("id", dependencyId)
    .eq("project_id", id);

  if (error) return NextResponse.json({ error: "Failed to delete dependency" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
