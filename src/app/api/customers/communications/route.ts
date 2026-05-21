import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cu } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();

  if (!cu) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: items, error } = await sb()
    .from("client_announcements")
    .select("*")
    .eq("client_id", cu.client_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: items ?? [] });
}

export async function POST(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cu } = await sb()
    .from("client_users")
    .select("client_id, name, role")
    .eq("email", email)
    .single();

  if (!cu) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let body: { title?: string; content?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, type = "shared_note" } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const { data: item, error } = await sb()
    .from("client_announcements")
    .insert({
      client_id: cu.client_id,
      title,
      content,
      type,
      author_type: "client",
      author_name: cu.name ?? email,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ item }, { status: 201 });
}
