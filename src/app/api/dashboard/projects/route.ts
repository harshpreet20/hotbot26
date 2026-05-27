import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const clientId = url.searchParams.get("client_id") ?? "";

  let query = sb()
    .from("projects")
    .select("*, clients(name, client_id)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ProjectRow = Record<string, unknown> & { clients?: { name?: string; client_id?: string } | null };
  type MappedProject = Record<string, unknown> & { client_name: string | null };
  let projects: MappedProject[] = (data ?? []).map((row: ProjectRow) => ({
    ...row,
    client_name: row.clients?.name ?? null,
    clients: undefined,
  }));

  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter((p) =>
      ["name", "client_name", "project_number", "client_id"].some(
        (k) => p[k] && String(p[k]).toLowerCase().includes(q)
      )
    );
  }

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    client_id: string;
    name: string;
    description?: string;
    stage?: string;
    priority?: string;
    start_date?: string;
    target_date?: string;
    assigned_to?: string[];
    account_manager?: string;
    budget?: number;
    currency?: string;
    tags?: string[];
  };

  if (!body.client_id || !body.name) {
    return NextResponse.json({ error: "client_id and name are required" }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("projects")
    .insert({
      client_id: body.client_id,
      name: body.name,
      description: body.description ?? null,
      status: "planning",
      stage: body.stage ?? "discovery",
      priority: body.priority ?? "medium",
      progress: 0,
      start_date: body.start_date ?? null,
      target_date: body.target_date ?? null,
      assigned_to: body.assigned_to ?? [],
      account_manager: body.account_manager ?? null,
      budget: body.budget ?? null,
      currency: body.currency ?? "INR",
      tags: body.tags ?? [],
      created_by: session.username,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data }, { status: 201 });
}
