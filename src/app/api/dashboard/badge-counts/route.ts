import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { Lead, Ticket, CallbackRequest, ChatSession } from "@/types/dashboard";

const EMPTY = { tickets: 0, leads: 0, callbacks: 0, chats: 0 };

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [tickets, leads, callbacks, chats] = await Promise.all([
      readAll<Ticket>("tickets"),
      readAll<Lead>("leads"),
      readAll<CallbackRequest>("callbacks"),
      readAll<ChatSession>("chats"),
    ]);

    return NextResponse.json({
      tickets:   tickets.filter((t) => t.status === "open").length,
      leads:     leads.filter((l) => l.status === "new").length,
      callbacks: callbacks.filter((c) => c.status === "pending").length,
      chats:     chats.filter((c) => c.needsHuman && !c.agentUsername).length,
    });
  } catch {
    return NextResponse.json(EMPTY);
  }
}
