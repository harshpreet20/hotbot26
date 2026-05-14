import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll, updateById } from "@/lib/store";
import type { CallbackRequest } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ callbacks: await readAll<CallbackRequest>("callbacks") });
}

export async function PATCH(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const callbacks = await readAll<CallbackRequest>("callbacks");
  if (!callbacks.find((c) => c.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await updateById<CallbackRequest>("callbacks", id, { status: "called" });
  return NextResponse.json({ success: true });
}
