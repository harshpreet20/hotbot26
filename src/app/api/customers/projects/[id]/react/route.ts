import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  const { update_id, emoji } = (await req.json()) as { update_id?: string; emoji?: string };

  if (!update_id || !emoji) {
    return NextResponse.json({ error: "update_id and emoji required" }, { status: 400 });
  }

  const { data: user } = await sb()
    .from("client_users")
    .select("client_id, name")
    .eq("email", email)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify update belongs to this project
  const { data: update } = await sb()
    .from("project_updates")
    .select("id")
    .eq("id", update_id)
    .eq("project_id", projectId)
    .eq("client_id", user.client_id)
    .single();

  if (!update) return NextResponse.json({ error: "Update not found" }, { status: 404 });

  // Check if this user already reacted with this emoji
  const { data: existing } = await sb()
    .from("project_update_reactions")
    .select("id")
    .eq("update_id", update_id)
    .eq("author_email", email)
    .eq("emoji", emoji)
    .single();

  if (existing) {
    // Toggle off
    await sb().from("project_update_reactions").delete().eq("id", existing.id);
  } else {
    // Add reaction
    await sb().from("project_update_reactions").insert({
      update_id,
      author_email: email,
      author_name:  user.name || email,
      author_type:  "client",
      emoji,
    });
  }

  // Return updated reactions for this update
  const { data: reactions } = await sb()
    .from("project_update_reactions")
    .select("id, update_id, author_email, author_name, author_type, emoji, created_at")
    .eq("update_id", update_id);

  return NextResponse.json({ reactions: reactions ?? [] });
}
