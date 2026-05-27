/**
 * Admin management of client_announcements — the data source for the portal
 * "Communications" page. Admins post announcements here; clients read them.
 */
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

  const { id: clientId } = await params;

  const { data, error } = await sb()
    .from("client_announcements")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clientId } = await params;

  const { title, content, type } = await req.json() as {
    title?: string;
    content?: string;
    type?: string;
  };
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const VALID_TYPES = ["announcement", "shared_note", "update", "warning"] as const;
  const annoType = VALID_TYPES.includes(type as typeof VALID_TYPES[number]) ? type : "announcement";

  const { data, error } = await sb()
    .from("client_announcements")
    .insert({
      client_id:   clientId,
      title:       title.trim(),
      content:     content.trim(),
      type:        annoType,
      author_type: "team",
      author_name: session.username,
      created_at:  new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcement: data }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await params;

  const annoId = new URL(req.url).searchParams.get("annoId");
  if (!annoId) return NextResponse.json({ error: "annoId required" }, { status: 400 });

  const { error } = await sb().from("client_announcements").delete().eq("id", annoId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
