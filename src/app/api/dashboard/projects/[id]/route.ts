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

  const [projectRes, updatesRes, filesRes] = await Promise.all([
    sb()
      .from("projects")
      .select("*, clients(name, client_id, email, phone, company, status)")
      .eq("id", id)
      .single(),
    sb()
      .from("project_updates")
      .select("*, project_update_comments(count), project_update_reactions(count)")
      .eq("project_id", id)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    sb()
      .from("project_files")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (projectRes.error) {
    if (projectRes.error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: projectRes.error.message }, { status: 500 });
  }

  const project = {
    ...projectRes.data,
    client_name: (projectRes.data.clients as { name?: string } | null)?.name ?? null,
    client_info: projectRes.data.clients,
  };

  return NextResponse.json({
    project,
    updates: updatesRes.data ?? [],
    files: filesRes.data ?? [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  // Only allow updating specific fields
  const allowed = [
    "name", "description", "status", "stage", "priority", "progress",
    "start_date", "target_date", "completed_date", "assigned_to",
    "account_manager", "budget", "currency", "tags",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await sb()
    .from("projects")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error } = await sb()
    .from("projects")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
