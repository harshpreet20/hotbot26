import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll, insert, newId } from "@/lib/store";

// GET — list tickets for the authenticated portal user
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSupabaseEnabled()) {
    // Match on: requester_email, client_email, or client_id (HBS-xxx ref or internal UUID)
    const orFilter = [
      `requester_email.eq.${user.email}`,
      `client_email.eq.${user.email}`,
      ...(user.clientRef ? [`client_id.eq.${user.clientRef}`] : []),
      ...(user.clientId ? [`client_id.eq.${user.clientId}`] : []),
    ].join(",");

    const { data: rows, error } = await sb()
      .from("tickets")
      .select(
        "id, ticket_number, title, status, priority, category, client_email, requester_email, created_at, updated_at, resolved_at"
      )
      .or(orFilter)
      .neq("status", "draft")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch tickets" },
        { status: 500 }
      );
    }

    const tickets = (rows ?? []).map((t: Record<string, unknown>) => ({
      id: t.id,
      ticketNumber: t.ticket_number,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      resolvedAt: t.resolved_at,
    }));

    return NextResponse.json({ tickets });
  }

  // In-memory fallback
  const allTickets = (await readAll("tickets")) as Array<{
    id: string;
    ticketNumber?: string;
    ticket_number?: string;
    title: string;
    status: string;
    priority: string;
    category?: string;
    requesterEmail?: string;
    clientEmail?: string;
    clientId?: string;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
    resolvedAt?: string;
    resolved_at?: string;
  }>;

  const tickets = allTickets
    .filter(
      (t) =>
        t.status !== "draft" && (
          t.requesterEmail === user.email ||
          t.clientEmail === user.email ||
          t.clientId === user.clientRef ||
          t.clientId === user.clientId
        )
    )
    .map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber ?? t.ticket_number,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      createdAt: t.createdAt ?? t.created_at,
      updatedAt: t.updatedAt ?? t.updated_at,
      resolvedAt: t.resolvedAt ?? t.resolved_at,
    }));

  return NextResponse.json({ tickets });
}

// POST — create a new support ticket from the portal
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    title?: string;
    description?: string;
    priority?: string;
    category?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const title = body.title.trim();
  const description = body.description?.trim() ?? "";
  const priority = (["low", "medium", "high", "critical"].includes(body.priority ?? "")) ? body.priority! : "medium";
  const category = (["bug", "feature", "support", "billing", "general"].includes(body.category ?? "")) ? body.category! : "general";

  const id = newId();

  if (isSupabaseEnabled()) {
    // Derive ticket number from current count
    const { count } = await sb()
      .from("tickets")
      .select("*", { count: "exact", head: true });
    const nextNum = (count ?? 0) + 1;
    const ticketNumber = `TKT-${String(nextNum).padStart(4, "0")}`;

    const { error: insertError } = await sb()
      .from("tickets")
      .insert({
        id,
        ticket_number: ticketNumber,
        title,
        description,
        status: "open",
        priority,
        category,
        requester_name: user.name,
        requester_email: user.email,
        client_email: user.email,
        client_id: user.clientRef || user.clientId || null,
        is_internal: false,
        created_at: now,
        updated_at: now,
      });

    if (insertError) {
      console.error("[portal/tickets] insert error:", insertError.message);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({
      ticket: { id, ticketNumber, title, status: "open", priority, category, createdAt: now },
    }, { status: 201 });
  }

  // In-memory fallback
  const allTickets = (await readAll("tickets")) as Array<{ ticketNumber?: string; ticket_number?: string }>;
  const nums = allTickets.map((t) => {
    const num = parseInt(((t.ticketNumber ?? t.ticket_number) || "").replace(/\D/g, ""), 10);
    return isNaN(num) ? 0 : num;
  });
  const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  const ticketNumber = `TKT-${String(nextNum).padStart(4, "0")}`;

  const ticket = {
    id,
    ticketNumber,
    title,
    description,
    status: "open",
    priority,
    category,
    requesterName: user.name,
    requesterEmail: user.email,
    clientEmail: user.email,
    clientId: user.clientRef || user.clientId || undefined,
    isInternal: false,
    labels: [],
    comments: [],
    activity: [{ id: newId(), ticketId: id, type: "created", actorName: user.name, createdAt: now }],
    createdAt: now,
    updatedAt: now,
  };

  try {
    await insert("tickets", ticket);
  } catch {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }

  return NextResponse.json({
    ticket: { id, ticketNumber, title, status: "open", priority, category, createdAt: now },
  }, { status: 201 });
}
