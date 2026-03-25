import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, writeAll, prepend, newId } from "@/lib/store";
import type { CRMUpdate } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = readAll<CRMUpdate>("crm_updates");
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");

  const filtered = leadId ? updates.filter((u) => u.leadId === leadId) : updates;
  return NextResponse.json({ updates: filtered });
}

export async function POST(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<CRMUpdate>;
  if (!body.leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const update: CRMUpdate = {
    id:        newId(),
    leadId:    body.leadId,
    type:      body.type     ?? "note",
    content:   body.content  ?? "",
    createdAt: new Date().toISOString(),
    createdBy: session.username,
    metadata:  body.metadata,
  };

  prepend<CRMUpdate>("crm_updates", update);
  return NextResponse.json({ update }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates = readAll<CRMUpdate>("crm_updates");
  const update  = updates.find((u) => u.id === id);
  if (!update) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (update.createdBy !== session.username && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  writeAll<CRMUpdate>("crm_updates", updates.filter((u) => u.id !== id));
  return NextResponse.json({ ok: true });
}
