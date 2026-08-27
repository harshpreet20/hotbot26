import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import { sendTaskAssignedEmail } from "@/lib/resend";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { CRMTask } from "@/types/dashboard";

async function lookupUserEmail(username: string): Promise<{ email: string; display: string } | null> {
  if (!isSupabaseEnabled()) return null;
  const { data } = await sb()
    .from("backdrop_users")
    .select("email, username")
    .eq("username", username)
    .single();
  if (!data?.email) return null;
  return { email: data.email as string, display: (data.username as string) || username };
}

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

  const filters: Array<[string, keyof CRMTask]> = [
    ["leadId",       "leadId"],
    ["invoiceId",    "invoiceId"],
    ["ticketId",     "ticketId"],
    ["clientId",     "clientId"],
    ["blogId",       "blogId"],
    ["callbackId",   "callbackId"],
    ["newsletterId", "newsletterId"],
    ["projectId",    "projectId"],
    ["assignedTo",   "assignedTo"],
    ["status",       "status"],
  ];

  let filtered = tasks;
  for (const [param, field] of filters) {
    const val = params.get(param);
    if (val) filtered = filtered.filter((t) => t[field] === val);
  }

  return NextResponse.json({ tasks: filtered });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<CRMTask>;
  const task: CRMTask = {
    id:                newId(),
    title:             body.title ?? "Untitled Task",
    description:       body.description,
    priority:          body.priority  ?? "medium",
    status:            body.status    ?? "open",
    assignedTo:        body.assignedTo,
    createdBy:         session.username,
    createdAt:         new Date().toISOString(),
    dueDate:           body.dueDate,
    leadId:            body.leadId,
    invoiceId:         body.invoiceId,
    ticketId:          body.ticketId,
    clientId:          body.clientId,
    blogId:            body.blogId,
    callbackId:        body.callbackId,
    newsletterId:      body.newsletterId,
    projectId:         body.projectId,
    linkedEntityType:  body.linkedEntityType,
    linkedEntityLabel: body.linkedEntityLabel ?? "",
  };

  try {
    await insert<CRMTask>("crm_tasks", task);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tasks] insert error:", msg);
    return NextResponse.json({ error: "Failed to create task." }, { status: 500 });
  }

  if (task.assignedTo && task.assignedTo !== session.username) {
    lookupUserEmail(task.assignedTo).then((user) => {
      if (!user) return;
      sendTaskAssignedEmail({
        assigneeEmail:     user.email,
        assigneeName:      user.display,
        taskTitle:         task.title,
        taskDescription:   task.description,
        priority:          task.priority,
        dueDate:           task.dueDate,
        assignedBy:        session.username,
        linkedEntityType:  task.linkedEntityType,
        linkedEntityLabel: task.linkedEntityLabel,
      }).catch((err) => console.error("[tasks] email error:", err instanceof Error ? err.message : err));
    }).catch(() => {});
  }

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
    ...(body.title       !== undefined && { title:       body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.status      !== undefined && { status:      body.status }),
    ...(body.priority    !== undefined && { priority:    body.priority }),
    ...(body.assignedTo  !== undefined && { assignedTo:  body.assignedTo }),
    ...(body.dueDate     !== undefined && { dueDate:     body.dueDate }),
    ...(body.tags        !== undefined && { tags:        body.tags }),
    ...(body.projectId   !== undefined && { projectId:   body.projectId }),
    id: body.id,
    completedAt: body.status === "done" && !existing.completedAt
      ? new Date().toISOString()
      : (body.status === "done" ? existing.completedAt : existing.completedAt),
  };

  try {
    await updateById<CRMTask>("crm_tasks", body.id, updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tasks] update error:", msg);
    return NextResponse.json({ error: "Failed to update task. Database error." }, { status: 500 });
  }

  // Notify the new assignee if assignedTo changed and is not the actor
  const assigneeChanged = body.assignedTo && body.assignedTo !== existing.assignedTo;
  if (assigneeChanged && updated.assignedTo && updated.assignedTo !== session.username) {
    lookupUserEmail(updated.assignedTo).then((user) => {
      if (!user) return;
      sendTaskAssignedEmail({
        assigneeEmail:     user.email,
        assigneeName:      user.display,
        taskTitle:         updated.title,
        taskDescription:   updated.description,
        priority:          updated.priority,
        dueDate:           updated.dueDate,
        assignedBy:        session.username,
        linkedEntityType:  updated.linkedEntityType,
        linkedEntityLabel: updated.linkedEntityLabel,
      }).catch((err) => console.error("[tasks] email error:", err instanceof Error ? err.message : err));
    }).catch(() => {});
  }

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
  if (!tasks.find((t) => t.id === id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await removeById("crm_tasks", id);
  return NextResponse.json({ ok: true });
}
