import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, removeById, newId } from "@/lib/store";
import type { CRMUpdate } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await readAll<CRMUpdate>("crm_updates");
  const params    = new URL(req.url).searchParams;
  const leadId    = params.get("leadId");
  const projectId = params.get("projectId");
  let filtered = updates;
  if (leadId) filtered = filtered.filter((u) => u.leadId === leadId);
  if (projectId) filtered = filtered.filter((u) => (u as { projectId?: string }).projectId === projectId);
  return NextResponse.json({ updates: filtered });
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<CRMUpdate> & { projectId?: string };
  if (!body.leadId && !body.projectId) return NextResponse.json({ error: "leadId or projectId required" }, { status: 400 });

  const update: CRMUpdate & { projectId?: string } = {
    id:        newId(),
    leadId:    body.leadId ?? "",
    type:      body.type    ?? "note",
    content:   body.content ?? "",
    createdAt: new Date().toISOString(),
    createdBy: session.username,
    metadata:  body.metadata,
    projectId: body.projectId,
  };

  try {
    await insert<CRMUpdate>("crm_updates", update);
  } catch {
    return NextResponse.json({ error: "Failed to save update." }, { status: 500 });
  }
  return NextResponse.json({ update }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates = await readAll<CRMUpdate>("crm_updates");
  const update  = updates.find((u) => u.id === id);
  if (!update) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (update.createdBy !== session.username && !["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await removeById("crm_updates", id);
  return NextResponse.json({ ok: true });
}
