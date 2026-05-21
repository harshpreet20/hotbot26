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
  const url = new URL(req.url);
  const visibility = url.searchParams.get("visibility") ?? "";

  let query = sb()
    .from("project_updates")
    .select("*, project_update_comments(*), project_update_reactions(*)")
    .eq("project_id", id)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (visibility === "internal" || visibility === "client") {
    query = query.eq("visibility", visibility);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ updates: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as {
    type?: string;
    title?: string;
    content: string;
    visibility?: "internal" | "client";
    progress?: number;
    attachments?: { name: string; url: string }[];
    pinned?: boolean;
  };

  if (!body.content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Get project to fetch client_id
  const { data: project, error: projError } = await sb()
    .from("projects")
    .select("client_id")
    .eq("id", id)
    .single();

  if (projError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const visibility = body.visibility ?? "internal";

  const { data, error } = await sb()
    .from("project_updates")
    .insert({
      project_id: id,
      client_id: project.client_id,
      type: body.type ?? "update",
      title: body.title ?? null,
      content: body.content,
      visibility,
      progress: body.progress ?? null,
      author_email: session.username,
      author_name: session.username,
      author_type: "team",
      attachments: body.attachments ?? [],
      pinned: body.pinned ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If client-visible, create a notification for the client
  if (visibility === "client" && project.client_id) {
    // Look up client email
    const { data: client } = await sb()
      .from("clients")
      .select("email, name")
      .eq("client_id", project.client_id)
      .single();

    if (client?.email) {
      await sb()
        .from("crm_notifications")
        .insert({
          recipient_email: client.email,
          recipient_type: "client",
          type: "project_update",
          title: body.title ?? "New project update",
          body: body.content.slice(0, 200),
          link: `/customers/projects/${id}`,
          entity_type: "project_update",
          entity_id: data.id,
        }).then(({ error: e }) => { if (e) console.error("[notify]", e.message); });
    }
  }

  return NextResponse.json({ update: data }, { status: 201 });
}
