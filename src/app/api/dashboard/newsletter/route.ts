import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, removeById } from "@/lib/store";
import type { NewsletterSubscriber } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ subscribers: await readAll<NewsletterSubscriber>("newsletter") });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await removeById("newsletter", id);
  return NextResponse.json({ ok: true });
}
