import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll, updateById } from "@/lib/store";
import type { Whiteboard } from "@/types/dashboard";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = await readAll<Whiteboard>("whiteboards");
  const boards = all.filter(
    (b) => b.clientId === user.clientRef || b.clientId === user.clientId || b.clientEmail === user.email
  );

  if (id) {
    const board = boards.find((b) => b.id === id);
    return board
      ? NextResponse.json({ whiteboard: board })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ whiteboards: boards });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string; elements: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<Whiteboard>("whiteboards");
  const existing = all.find(
    (b) => b.id === body.id && (b.clientId === user.clientRef || b.clientId === user.clientId || b.clientEmail === user.email)
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Whiteboard = {
    ...existing,
    elements:     body.elements,
    lastEditedBy: user.name,
    updatedAt:    new Date().toISOString(),
  };

  await updateById<Whiteboard>("whiteboards", body.id, updated);
  return NextResponse.json({ whiteboard: updated });
}
