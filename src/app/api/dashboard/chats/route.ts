import { NextRequest, NextResponse } from "next/server";
import { extractToken, isAuthorized, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, removeById } from "@/lib/store";
import type { ChatSession } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await isAuthorized(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ sessions: await readAll<ChatSession>("chats") });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await removeById("chats", id);
  return NextResponse.json({ ok: true });
}
