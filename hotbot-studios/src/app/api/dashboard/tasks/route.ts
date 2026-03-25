import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll, writeAll, prepend, newId } from "@/lib/store";
import type { CRMTask } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = readAll<CRMTask>("crm_tasks");
  const { searchParams } = new URL(req.url);
  const leadId    = searchParams.get("leadId");
  const invoiceId = searchParams.get("invoiceId");
  const assignee  = searchParams.get("assignedTo");
  const status    = searchParams.get("status");

  let filtered = tasks;
  if (leadId)    filtered = filtered.filter((t) => t.leadId    === leadId);
  if (invoiceId) filtered = filtered.filter((t) => t.invoiceId === invoiceId);
  if (assignee)  filtered = filtered.filter((t) => t.assignedTo === assignee);
  if (status)    filtered = filtered.filter((t) => t.status    === status);

  return NextResponse.json({ tasks: filtered });
}

export async function POST(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<CRMTask>;

  const task: CRMTask = {
    id:          newId(),
    title:       body.title ?? "Untitled Task",
    description: body.description,
    priority:    body.priority  ?? "medium",
    status:      body.status    ?? "open",
    assignedTo:  body.assignedTo,
    createdBy:   session.username,
    createdAt:   new Date().toISOString(),
    dueDate:     body.dueDate,
    leadId:      body.leadId,
    invoiceId:   body.invoiceId,
  };

  prepend<CRMTask>("crm_tasks", task);
  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json() as Partial<CRMTask> & { id: string };
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tasks = readAll<CRMTask>("crm_tasks");
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = tasks[idx];
  const updated: CRMTask = {
    ...existing,
    ...body,
    id,
    completedAt: body.status === "done" && !existing.completedAt
      ? new Date().toISOString()
      : (body.status === "done" ? existing.completedAt : (body.completedAt ?? existing.completedAt)),
  };

  tasks[idx] = updated;
  writeAll<CRMTask>("crm_tasks", tasks);
  return NextResponse.json({ task: updated });
}

export async function DELETE(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tasks   = readAll<CRMTask>("crm_tasks");
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  writeAll<CRMTask>("crm_tasks", filtered);
  return NextResponse.json({ ok: true });
}
