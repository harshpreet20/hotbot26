import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, updateById, removeById, newId } from "@/lib/store";
import { sendStaffReplyNotification, sendStatusUpdateNotification } from "@/lib/ticketEmail";
import type { Ticket, TicketComment, TicketStatus } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = await readAll<Ticket>("tickets");
  const status  = new URL(req.url).searchParams.get("status") as TicketStatus | null;
  return NextResponse.json({ tickets: status ? tickets.filter((t) => t.status === status) : tickets });
}

export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    id?: string;
    status?: TicketStatus;
    assignedTo?: string;
    priority?: Ticket["priority"];
    type?: string;
    text?: string;
  };

  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tickets = await readAll<Ticket>("tickets");
  const ticket  = tickets.find((t) => t.id === body.id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Add staff comment
  if (body.type === "comment") {
    if (!body.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
    const comment: TicketComment = {
      id:         newId(),
      ticketId:   body.id,
      text:       body.text.trim(),
      authorName: session.username,
      isStaff:    true,
      createdAt:  new Date().toISOString(),
    };
    const updatedComments = [...(ticket.comments ?? []), comment];
    const updatedTicket: Ticket = { ...ticket, comments: updatedComments, updatedAt: new Date().toISOString() };
    await updateById<Ticket>("tickets", body.id, updatedTicket);

    sendStaffReplyNotification(updatedTicket, comment).catch((err) =>
      console.error("[Ticket Email] Staff reply failed:", err)
    );
    return NextResponse.json({ comment });
  }

  // Update ticket fields
  const prevStatus = ticket.status;
  const updated: Ticket = {
    ...ticket,
    status:     body.status     ?? ticket.status,
    assignedTo: body.assignedTo !== undefined ? body.assignedTo : ticket.assignedTo,
    priority:   body.priority   ?? ticket.priority,
    updatedAt:  new Date().toISOString(),
    resolvedAt: (body.status === "resolved" || body.status === "closed") && !ticket.resolvedAt
      ? new Date().toISOString()
      : ticket.resolvedAt,
  };

  await updateById<Ticket>("tickets", body.id, updated);

  if (body.status && body.status !== prevStatus) {
    sendStatusUpdateNotification(updated, body.status).catch((err) =>
      console.error("[Ticket Email] Status update failed:", err)
    );
  }

  return NextResponse.json({ ticket: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tickets = await readAll<Ticket>("tickets");
  if (!tickets.find((t) => t.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await removeById("tickets", id);
  return NextResponse.json({ ok: true });
}
