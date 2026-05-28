import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { getPortalUser } from "@/lib/portalAuth";

// GET — list tickets for the authenticated portal user
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSupabaseEnabled()) {
    const { data: rows, error } = await sb()
      .from("tickets")
      .select(
        "id, ticket_number, title, status, priority, category, created_at, updated_at, resolved_at"
      )
      .or(`requester_email.eq.${user.email},client_id.eq.${user.clientRef}`)
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
  const { readAll } = await import("@/lib/store");
  const allTickets = (await readAll("tickets")) as Array<{
    id: string;
    ticketNumber?: string;
    ticket_number?: string;
    title: string;
    status: string;
    priority: string;
    category?: string;
    requesterEmail?: string;
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
        t.requesterEmail === user.email || t.clientId === user.clientRef
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
