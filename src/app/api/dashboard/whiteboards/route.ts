import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Whiteboard } from "@/types/dashboard";

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const id = searchParams.get("id");

  let boards = await readAll<Whiteboard>("whiteboards");
  if (id) {
    const board = boards.find((b) => b.id === id);
    return board
      ? NextResponse.json({ whiteboard: board })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const projectId = searchParams.get("projectId");
  if (clientId) boards = boards.filter((b) => b.clientId === clientId || b.clientEmail === clientId);
  if (projectId) boards = boards.filter((b) => (b as { projectId?: string }).projectId === projectId);

  return NextResponse.json({ whiteboards: boards });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<Whiteboard>;
  if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const now = new Date().toISOString();
  const board: Whiteboard & { projectId?: string } = {
    id:            newId(),
    name:          body.name.trim(),
    clientId:      body.clientId,
    clientEmail:   body.clientEmail,
    elements:      body.elements ?? "[]",
    projectId:     (body as { projectId?: string }).projectId,
    createdBy:     session.username,
    lastEditedBy:  session.username,
    createdAt:     now,
    updatedAt:     now,
  };

  try {
    await insert<Whiteboard>("whiteboards", board);
  } catch (err) {
    console.error("[whiteboards] insert error:", err);
    return NextResponse.json({ error: "Failed to create whiteboard" }, { status: 500 });
  }
  return NextResponse.json({ whiteboard: board }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string; elements?: string; name?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<Whiteboard>("whiteboards");
  const existing = all.find((b) => b.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Whiteboard = {
    ...existing,
    name:         body.name?.trim()  ?? existing.name,
    elements:     body.elements      ?? existing.elements,
    lastEditedBy: session.username,
    updatedAt:    new Date().toISOString(),
  };

  try {
    await updateById<Whiteboard>("whiteboards", body.id, updated);
  } catch (err) {
    console.error("[whiteboards] update error:", err);
    return NextResponse.json({ error: "Failed to save whiteboard" }, { status: 500 });
  }
  return NextResponse.json({ whiteboard: updated });
}

export async function DELETE(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<Whiteboard>("whiteboards");
  if (!all.find((b) => b.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await removeById("whiteboards", id);
  } catch (err) {
    console.error("[whiteboards] delete error:", err);
    return NextResponse.json({ error: "Failed to delete whiteboard" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
