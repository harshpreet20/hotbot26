import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll, writeAll } from "@/lib/store";
import type { CallbackRequest } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!authorizeData(extractToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ callbacks: readAll<CallbackRequest>("callbacks") });
}

// PATCH — mark as called (admin + manager)
export async function PATCH(req: NextRequest) {
  if (!authorizeData(extractToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id: string };
  const items = readAll<CallbackRequest>("callbacks");
  const idx = items.findIndex((c) => c.id === id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  items[idx].status = "called";
  writeAll("callbacks", items);
  return NextResponse.json({ success: true });
}
