import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractToken, authorizeData, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Lead, CRMUpdate, LeadStatus } from "@/types/dashboard";

const LeadStatusEnum = z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "converted"]);

const CreateLeadSchema = z.object({
  name:       z.string().max(200).optional().default(""),
  email:      z.string().email().max(200).optional().or(z.literal("")).default(""),
  phone:      z.string().max(50).optional().default(""),
  company:    z.string().max(200).optional().default(""),
  service:    z.string().max(200).optional().default(""),
  budget:     z.string().max(100).optional().default(""),
  message:    z.string().max(10_000).optional().default(""),
  formType:   z.string().max(50).optional(),
  source:     z.string().max(100).optional(),
  status:     LeadStatusEnum.optional(),
  assignedTo: z.string().max(100).optional(),
  notes:      z.string().max(10_000).optional(),
  tags:       z.array(z.string().max(50)).max(20).optional(),
});

const UpdateLeadSchema = z.object({
  id:             z.string().min(1),
  name:           z.string().max(200).optional(),
  email:          z.string().email().max(200).optional().or(z.literal("")),
  phone:          z.string().max(50).optional(),
  company:        z.string().max(200).optional(),
  service:        z.string().max(200).optional(),
  budget:         z.string().max(100).optional(),
  message:        z.string().max(10_000).optional(),
  status:         LeadStatusEnum.optional(),
  assignedTo:     z.string().max(100).nullable().optional(),
  notes:          z.string().max(10_000).optional(),
  tags:           z.array(z.string().max(50)).max(20).optional(),
  journeyStage:   z.string().max(50).optional(),
  lastUpdatedAt:  z.string().optional(),
});

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
  const limited = await rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "manager", "sales"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: z.infer<typeof CreateLeadSchema>;
  try {
    body = CreateLeadSchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const lead: Lead = {
    id:         newId(),
    name:       body.name,
    email:      body.email,
    phone:      body.phone,
    company:    body.company,
    service:    body.service,
    budget:     body.budget,
    message:    body.message,
    formType:   body.formType ?? "manual",
    source:     body.source   ?? "manual",
    ip:         "",
    createdAt:  new Date().toISOString(),
    status:     body.status   ?? "new",
    assignedTo: body.assignedTo,
    notes:      body.notes,
    tags:       body.tags,
  };
  try {
    await insert<Lead>("leads", lead);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[leads] insert error:", msg);
    return NextResponse.json({ error: "Failed to create lead. Database error." }, { status: 500 });
  }
  return NextResponse.json({ lead }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = await rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof UpdateLeadSchema>;
  try {
    body = UpdateLeadSchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { id } = body;

  const leads = await readAll<Lead>("leads");
  const existing = leads.find((l) => l.id === id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Lead = {
    ...existing,
    ...(body.name          !== undefined && { name:          body.name }),
    ...(body.email         !== undefined && { email:         body.email }),
    ...(body.phone         !== undefined && { phone:         body.phone }),
    ...(body.company       !== undefined && { company:       body.company }),
    ...(body.service       !== undefined && { service:       body.service }),
    ...(body.budget        !== undefined && { budget:        body.budget }),
    ...(body.message       !== undefined && { message:       body.message }),
    ...(body.status        !== undefined && { status:        body.status }),
    ...(body.notes         !== undefined && { notes:         body.notes }),
    ...(body.assignedTo    !== undefined && { assignedTo:    body.assignedTo }),
    ...(body.journeyStage  !== undefined && { journeyStage:  body.journeyStage }),
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: session.username,
  };

  try {
    await updateById<Lead>("leads", id, updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[leads] update error:", msg);
    return NextResponse.json({ error: "Failed to update lead. Database error." }, { status: 500 });
  }

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

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const leads = await readAll<Lead>("leads");
  if (!leads.find((l) => l.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await removeById("leads", id);
  return NextResponse.json({ success: true });
}
