import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/dashboardAuth";
import { readAll, writeAll } from "@/lib/store";
import type { CallbackRequest } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!isAuthorized(secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ callbacks: readAll<CallbackRequest>("callbacks") });
}

// PATCH /api/dashboard/callbacks?secret=&id=  — mark as called
export async function PATCH(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!isAuthorized(secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json() as { id: string };
  const items = readAll<CallbackRequest>("callbacks");
  const idx = items.findIndex((c) => c.id === id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  items[idx].status = "called";
  writeAll("callbacks", items);
  return NextResponse.json({ success: true });
}
