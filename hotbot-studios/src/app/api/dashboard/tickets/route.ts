import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, writeAll, newId } from "@/lib/store";
import type { Ticket, TicketComment, TicketStatus } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = readAll<Ticket>("tickets");
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as TicketStatus | null;
  const filtered = status ? tickets.filter((t) => t.status === status) : tickets;
  return NextResponse.json({ tickets: filtered });
}

export async function PATCH(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    id?: string;
    status?: TicketStatus;
    assignedTo?: string;
    priority?: Ticket["priority"];
    // Staff comment
    type?: string;
    text?: string;
  };

  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tickets = readAll<Ticket>("tickets");
  const idx = tickets.findIndex((t) => t.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    tickets[idx].comments  = [...(tickets[idx].comments ?? []), comment];
    tickets[idx].updatedAt = new Date().toISOString();
    writeAll<Ticket>("tickets", tickets);
    return NextResponse.json({ comment });
  }

  // Update ticket fields
  const updated: Ticket = {
    ...tickets[idx],
    status:     body.status     ?? tickets[idx].status,
    assignedTo: body.assignedTo !== undefined ? body.assignedTo : tickets[idx].assignedTo,
    priority:   body.priority   ?? tickets[idx].priority,
    updatedAt:  new Date().toISOString(),
    resolvedAt: (body.status === "resolved" || body.status === "closed") && !tickets[idx].resolvedAt
      ? new Date().toISOString()
      : tickets[idx].resolvedAt,
  };
  tickets[idx] = updated;
  writeAll<Ticket>("tickets", tickets);
  return NextResponse.json({ ticket: updated });
}

export async function DELETE(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tickets = readAll<Ticket>("tickets");
  const filtered = tickets.filter((t) => t.id !== id);
  if (filtered.length === tickets.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  writeAll<Ticket>("tickets", filtered);
  return NextResponse.json({ ok: true });
}
