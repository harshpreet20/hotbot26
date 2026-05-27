export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: user } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: project, error } = await sb()
    .from("projects")
    .select("id, project_number, name, description, status, stage, priority, progress, start_date, target_date, assigned_to, account_manager, budget, currency, client_id")
    .eq("id", id)
    .eq("client_id", user.client_id)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch client-visible updates
  const { data: updates } = await sb()
    .from("project_updates")
    .select("id, type, title, content, visibility, progress, author_email, author_name, author_type, attachments, pinned, created_at")
    .eq("project_id", id)
    .eq("visibility", "client")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const updateIds = (updates ?? []).map((u) => u.id);

  let comments: unknown[] = [];
  let reactions: unknown[] = [];

  if (updateIds.length > 0) {
    const [commentsRes, reactionsRes] = await Promise.all([
      sb()
        .from("project_update_comments")
        .select("id, update_id, content, author_email, author_name, author_type, created_at")
        .in("update_id", updateIds)
        .order("created_at", { ascending: true }),
      sb()
        .from("project_update_reactions")
        .select("id, update_id, author_email, author_name, author_type, emoji, created_at")
        .in("update_id", updateIds),
    ]);
    comments  = commentsRes.data  ?? [];
    reactions = reactionsRes.data ?? [];
  }

  return NextResponse.json({ project, updates: updates ?? [], comments, reactions });
}
