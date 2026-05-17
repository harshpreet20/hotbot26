import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Lead, CRMUpdate, LeadStatus } from "@/types/dashboard";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await readAll<Lead>("leads");
  const status = new URL(req.url).searchParams.get("status") as LeadStatus | null;
  return NextResponse.json({ leads: status ? leads.filter((l) => l.status === status) : leads });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "manager", "sales"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Partial<Lead>;
  const lead: Lead = {
    id:         newId(),
    name:       body.name     ?? "",
    email:      body.email    ?? "",
    phone:      body.phone    ?? "",
    company:    body.company  ?? "",
    service:    body.service  ?? "",
    budget:     body.budget   ?? "",
    message:    body.message  ?? "",
    formType:   body.formType ?? "manual",
    source:     body.source   ?? "manual",
    ip:         "",
    createdAt:  new Date().toISOString(),
    status:     body.status   ?? "new",
    assignedTo: body.assignedTo,
    notes:      body.notes,
    tags:       body.tags,
  };
  await insert<Lead>("leads", lead);
  return NextResponse.json({ lead }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json() as Partial<Lead> & { id: string };
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const leads = await readAll<Lead>("leads");
  const existing = leads.find((l) => l.id === id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Lead = {
    ...existing,
    ...body,
    id,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: session.username,
  };

  await updateById<Lead>("leads", id, updated);

  // Auto-log status change
  if (body.status && body.status !== existing.status) {
    await insert<CRMUpdate>("crm_updates", {
      id:        newId(),
      leadId:    id,
      type:      "status_change",
      content:   `Status changed from "${existing.status ?? "new"}" to "${body.status}"`,
      createdAt: new Date().toISOString(),
      createdBy: session.username,
      metadata:  { prevStatus: existing.status ?? "new", newStatus: body.status },
    });
  }

  // Auto-log assignment change
  if (body.assignedTo !== undefined && body.assignedTo !== existing.assignedTo) {
    await insert<CRMUpdate>("crm_updates", {
      id:        newId(),
      leadId:    id,
      type:      "assignment",
      content:   body.assignedTo ? `Assigned to ${body.assignedTo}` : "Assignment removed",
      createdAt: new Date().toISOString(),
      createdBy: session.username,
    });
  }

  return NextResponse.json({ lead: updated });
}
