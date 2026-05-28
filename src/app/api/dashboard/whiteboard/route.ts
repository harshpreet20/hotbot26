import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

function getIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// GET /api/dashboard/whiteboard?entityType=project&entityId=xxx
export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId   = searchParams.get("entityId");
  const token      = searchParams.get("token");

  // Allow anon access via share token
  if (token) {
    const { data, error } = await sb()
      .from("whiteboard_sessions")
      .select("*")
      .eq("share_token", token)
      .single();
    if (error || !data) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    return NextResponse.json({ session: data });
  }

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "Missing entityType or entityId" }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("whiteboard_sessions")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data ?? [] });
}

// POST /api/dashboard/whiteboard — create a new whiteboard session
export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    entityType: string; entityId: string; title?: string; data?: object;
  };

  if (!body.entityType || !body.entityId) {
    return NextResponse.json({ error: "Missing entityType or entityId" }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("whiteboard_sessions")
    .insert({
      entity_type: body.entityType,
      entity_id:   body.entityId,
      title:       body.title || "Whiteboard",
      data:        body.data  || {},
      created_by:  session.username,
      updated_by:  session.username,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data }, { status: 201 });
}

// PATCH /api/dashboard/whiteboard — save whiteboard state
export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string; data: object; title?: string };
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await sb()
    .from("whiteboard_sessions")
    .update({
      data:       body.data,
      title:      body.title,
      updated_at: new Date().toISOString(),
      updated_by: session.username,
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

// DELETE /api/dashboard/whiteboard?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["super_admin", "admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await sb().from("whiteboard_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
