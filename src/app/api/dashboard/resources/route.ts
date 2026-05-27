export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const token = extractToken(req);
  const session = await authorizeAny(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "client_id is required" }, { status: 400 });

  const { data, error } = await sb()
    .from("client_resources")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ resources: data ?? [] });
}

export async function POST(req: NextRequest) {
  const token = extractToken(req);
  const session = await authorizeAny(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    client_id?: string;
    name?: string;
    description?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    category?: string;
    project_id?: string;
    visibility?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { client_id, name, description, file_url, file_name, file_size, mime_type, category, project_id, visibility } = body;

  if (!client_id || !name || !file_url || !file_name || !mime_type) {
    return NextResponse.json({ error: "client_id, name, file_url, file_name, and mime_type are required" }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("client_resources")
    .insert({
      id: randomUUID(),
      client_id,
      project_id: project_id ?? null,
      name,
      description: description ?? null,
      file_url,
      file_name,
      file_size: file_size ?? null,
      mime_type,
      category: category ?? "general",
      uploaded_by: session.username,
      uploaded_by_type: "team",
      visibility: visibility ?? "client",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ resource: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const token = extractToken(req);
  const session = await authorizeAny(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await sb()
    .from("client_resources")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
