import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/dashboardAuth";
import { readAll, updateById, removeById, insert, newId } from "@/lib/store";
import { sendStaffReplyNotification, sendStatusUpdateNotification } from "@/lib/ticketEmail";
import type { Ticket, TicketComment, TicketActivity, TicketStatus } from "@/types/dashboard";

const TicketStatusEnum   = z.enum(["draft", "open", "in_progress", "waiting", "resolved", "closed"]);
const TicketPriorityEnum = z.enum(["low", "medium", "high", "critical"]);
const TicketCategoryEnum = z.enum(["bug", "feature", "support", "billing", "general"]);

const CreateTicketSchema = z.object({
  title:          z.string().min(1).max(200).trim(),
  description:    z.string().max(10_000).optional(),
  priority:       TicketPriorityEnum.optional(),
  category:       TicketCategoryEnum.optional(),
  status:         TicketStatusEnum.optional(),
  requesterName:  z.string().max(200).optional(),
  requesterEmail: z.string().email().max(200).optional().or(z.literal("")),
  assignedTo:     z.string().max(100).optional(),
  labels:         z.array(z.string().max(50)).max(20).optional(),
  dueDate:        z.string().datetime().optional(),
  isInternal:     z.boolean().optional(),
  raisedAgainst:  z.string().max(100).optional(),
  raisedBy:       z.string().max(100).optional(),
});

const UpdateTicketSchema = z.object({
  id:          z.string().min(1),
  status:      TicketStatusEnum.optional(),
  assignedTo:  z.string().max(100).nullable().optional(),
  priority:    TicketPriorityEnum.optional(),
  category:    TicketCategoryEnum.optional(),
  title:       z.string().min(1).max(200).trim().optional(),
  description: z.string().max(10_000).optional(),
  labels:      z.array(z.string().max(50)).max(20).optional(),
  dueDate:     z.string().datetime().nullable().optional(),
  type:        z.enum(["comment", "internal_note"]).optional(),
  text:        z.string().max(4_000).optional(),
});

function getNextTicketNumber(tickets: Ticket[]): string {
  const nums = tickets
    .map((t) => parseInt(t.ticketNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `TKT-${String(next).padStart(4, "0")}`;
}

function makeActivity(
  ticketId: string,
  type: TicketActivity["type"],
  actorName: string,
  metadata?: Record<string, string>,
): TicketActivity {
  return { id: newId(), ticketId, type, actorName, createdAt: new Date().toISOString(), metadata };
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url    = new URL(req.url);
  const status = url.searchParams.get("status") as TicketStatus | null;
  const id     = url.searchParams.get("id");

  const tickets = await readAll<Ticket>("tickets");

  if (id) {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ticket });
  }

  return NextResponse.json({ tickets: status ? tickets.filter((t) => t.status === status) : tickets });
}

// POST - staff creates an internal ticket
export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof CreateTicketSchema>;
  try {
    body = CreateTicketSchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const existing = await readAll<Ticket>("tickets");
  const now      = new Date().toISOString();

  const ticket: Ticket = {
    id:             newId(),
    ticketNumber:   getNextTicketNumber(existing),
    title:          body.title.trim(),
    description:    body.description?.trim() ?? "",
    status:         body.status ?? "draft",
    priority:       body.priority ?? "medium",
    category:       body.category ?? "general",
    requesterName:  body.requesterName?.trim() ?? session.username,
    requesterEmail: body.requesterEmail?.trim() ?? "",
    assignedTo:     body.assignedTo,
    labels:         body.labels ?? [],
    dueDate:        body.dueDate,
    isInternal:     body.isInternal ?? false,
    raisedAgainst:  body.raisedAgainst,
    raisedBy:       body.raisedBy ?? session.username,
    createdAt:      now,
    updatedAt:      now,
    comments:       [],
    activity:       [makeActivity("", "created", session.username)],
  };
  // Fix ticketId on the activity entry
  ticket.activity![0].ticketId = ticket.id;

  try {
    await insert<Ticket>("tickets", ticket);
  } catch {
    return NextResponse.json({ error: "Failed to create ticket." }, { status: 500 });
  }
  return NextResponse.json({ ticket }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof UpdateTicketSchema>;
  try {
    body = UpdateTicketSchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const tickets = await readAll<Ticket>("tickets");
  const ticket  = tickets.find((t) => t.id === body.id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now      = new Date().toISOString();
  const newActivity: TicketActivity[] = [];

  // Add comment or internal note
  if (body.type === "comment" || body.type === "internal_note") {
    if (!body.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
    const isInternal = body.type === "internal_note";
    const comment: TicketComment = {
      id:         newId(),
      ticketId:   body.id,
      text:       body.text.trim(),
      authorName: session.username,
      isStaff:    true,
      isInternal,
      createdAt:  now,
    };
    const updatedComments = [...(ticket.comments ?? []), comment];
    newActivity.push(makeActivity(ticket.id, isInternal ? "internal_note" : "comment_added", session.username));
    const updatedTicket: Ticket = {
      ...ticket,
      comments: updatedComments,
      activity: [...(ticket.activity ?? []), ...newActivity],
      updatedAt: now,
    };
    try {
      await updateById<Ticket>("tickets", body.id, updatedTicket);
    } catch (err) {
      console.error("[tickets] comment update error:", err);
      return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
    }

    if (!isInternal) {
      sendStaffReplyNotification(updatedTicket, comment).catch((err) =>
        console.error("[Ticket Email] Staff reply failed:", err)
      );
    }
    return NextResponse.json({ comment });
  }

  // Update ticket fields
  const prevStatus   = ticket.status;
  const prevPriority = ticket.priority;
  const prevAssigned = ticket.assignedTo;

  if (body.status && body.status !== prevStatus) {
    newActivity.push(makeActivity(ticket.id, "status_changed", session.username, { from: prevStatus, to: body.status }));
  }
  if (body.priority && body.priority !== prevPriority) {
    newActivity.push(makeActivity(ticket.id, "priority_changed", session.username, { from: prevPriority, to: body.priority }));
  }
  if (body.assignedTo !== undefined && body.assignedTo !== prevAssigned) {
    if (body.assignedTo) {
      newActivity.push(makeActivity(ticket.id, "assigned", session.username, { to: body.assignedTo }));
    } else {
      newActivity.push(makeActivity(ticket.id, "unassigned", session.username, { from: prevAssigned ?? "" }));
    }
  }
  if (body.dueDate !== undefined && body.dueDate !== ticket.dueDate) {
    newActivity.push(makeActivity(ticket.id, "due_date_set", session.username, { date: body.dueDate ?? "" }));
  }

  const updated: Ticket = {
    ...ticket,
    status:      body.status      ?? ticket.status,
    priority:    body.priority    ?? ticket.priority,
    category:    body.category    ?? ticket.category,
    title:       body.title?.trim()       ?? ticket.title,
    description: body.description?.trim() ?? ticket.description,
    assignedTo:  body.assignedTo !== undefined ? (body.assignedTo ?? undefined) : ticket.assignedTo,
    labels:      body.labels      ?? ticket.labels,
    dueDate:     body.dueDate !== undefined ? (body.dueDate ?? undefined) : ticket.dueDate,
    activity:    [...(ticket.activity ?? []), ...newActivity],
    updatedAt:   now,
    resolvedAt:  (body.status === "resolved" || body.status === "closed") && !ticket.resolvedAt
      ? now
      : ticket.resolvedAt,
  };

  try {
    await updateById<Ticket>("tickets", body.id, updated);
  } catch (err) {
    console.error("[tickets] update error:", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }

  if (body.status && body.status !== prevStatus) {
    sendStatusUpdateNotification(updated, body.status).catch((err) =>
      console.error("[Ticket Email] Status update failed:", err)
    );
  }

  return NextResponse.json({ ticket: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tickets = await readAll<Ticket>("tickets");
  if (!tickets.find((t) => t.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await removeById("tickets", id);
  return NextResponse.json({ ok: true });
}
