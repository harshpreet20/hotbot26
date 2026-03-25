import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll, writeAll, prepend, newId } from "@/lib/store";
import type { Lead, CRMUpdate, LeadStatus } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!authorizeData(extractToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leads = readAll<Lead>("leads");
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as LeadStatus | null;
  const filtered = status ? leads.filter((l) => l.status === status) : leads;
  return NextResponse.json({ leads: filtered });
}

export async function POST(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
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
  prepend<Lead>("leads", lead);
  return NextResponse.json({ lead }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = authorizeData(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json() as Partial<Lead> & { id: string };
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const leads = readAll<Lead>("leads");
  const idx   = leads.findIndex((l) => l.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = leads[idx];
  const prevStatus = existing.status;

  const updated: Lead = {
    ...existing,
    ...body,
    id,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: session.username,
  };

  leads[idx] = updated;
  writeAll<Lead>("leads", leads);

  // Auto-log a status change activity if status changed
  if (body.status && body.status !== prevStatus) {
    const statusUpdate: CRMUpdate = {
      id:        newId(),
      leadId:    id,
      type:      "status_change",
      content:   `Status changed from "${prevStatus}" to "${body.status}"`,
      createdAt: new Date().toISOString(),
      createdBy: session.username,
      metadata:  { prevStatus: prevStatus ?? "new", newStatus: body.status },
    };
    const updates = readAll<CRMUpdate>("crm_updates");
    updates.unshift(statusUpdate);
    writeAll<CRMUpdate>("crm_updates", updates);
  }

  // Auto-log assignment change
  if (body.assignedTo !== undefined && body.assignedTo !== existing.assignedTo) {
    const assignUpdate: CRMUpdate = {
      id:        newId(),
      leadId:    id,
      type:      "assignment",
      content:   body.assignedTo
        ? `Assigned to ${body.assignedTo}`
        : "Assignment removed",
      createdAt: new Date().toISOString(),
      createdBy: session.username,
    };
    const updates = readAll<CRMUpdate>("crm_updates");
    updates.unshift(assignUpdate);
    writeAll<CRMUpdate>("crm_updates", updates);
  }

  return NextResponse.json({ lead: updated });
}
