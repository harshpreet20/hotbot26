import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { CRMTask } from "@/types/dashboard";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks  = await readAll<CRMTask>("crm_tasks");
  const params = new URL(req.url).searchParams;
  const leadId    = params.get("leadId");
  const invoiceId = params.get("invoiceId");
  const assignee  = params.get("assignedTo");
  const status    = params.get("status");

  let filtered = tasks;
  if (leadId)    filtered = filtered.filter((t) => t.leadId    === leadId);
  if (invoiceId) filtered = filtered.filter((t) => t.invoiceId === invoiceId);
  if (assignee)  filtered = filtered.filter((t) => t.assignedTo === assignee);
  if (status)    filtered = filtered.filter((t) => t.status    === status);

  return NextResponse.json({ tasks: filtered });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
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

  await insert<CRMTask>("crm_tasks", task);
  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<CRMTask> & { id: string };
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tasks = await readAll<CRMTask>("crm_tasks");
  const existing = tasks.find((t) => t.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: CRMTask = {
    ...existing,
    ...body,
    id: body.id,
    completedAt: body.status === "done" && !existing.completedAt
      ? new Date().toISOString()
      : (body.status === "done" ? existing.completedAt : (body.completedAt ?? existing.completedAt)),
  };

  await updateById<CRMTask>("crm_tasks", body.id, updated);
  return NextResponse.json({ task: updated });
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tasks = await readAll<CRMTask>("crm_tasks");
  if (!tasks.find((t) => t.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await removeById("crm_tasks", id);
  return NextResponse.json({ ok: true });
}
