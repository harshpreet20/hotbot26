import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  const { update_id, content } = (await req.json()) as { update_id?: string; content?: string };

  if (!update_id || !content?.trim()) {
    return NextResponse.json({ error: "update_id and content required" }, { status: 400 });
  }

  const { data: user } = await sb()
    .from("client_users")
    .select("client_id, name")
    .eq("email", email)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify update belongs to this project and is visible to client
  const { data: update } = await sb()
    .from("project_updates")
    .select("id, project_id, client_id")
    .eq("id", update_id)
    .eq("project_id", projectId)
    .eq("client_id", user.client_id)
    .single();

  if (!update) return NextResponse.json({ error: "Update not found" }, { status: 404 });

  const { data: comment, error } = await sb()
    .from("project_update_comments")
    .insert({
      update_id,
      content:     content.trim(),
      author_email: email,
      author_name:  user.name || email,
      author_type:  "client",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify team (fire-and-forget)
  sb().from("crm_notifications").insert({
    recipient_email: "team@hotbotstudios.com",
    recipient_type:  "team",
    type:            "comment",
    title:           `New client comment on project update`,
    body:            content.trim().slice(0, 200),
    link:            `/enter/backdrop/dashboard/projects/${projectId}`,
    entity_type:     "project_update_comment",
    entity_id:       comment.id,
  }).then(({ error: e }) => { if (e) console.error(e); });

  return NextResponse.json({ comment });
}
