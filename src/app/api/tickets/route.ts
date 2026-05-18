/**
 * Public ticket API - no authentication required.
 * POST  /api/tickets        - submit a new ticket
 * GET   /api/tickets?id=    - get a single ticket by ID (for status page)
 * POST  /api/tickets/comment - add a public comment to a ticket
 */
import { NextRequest, NextResponse } from "next/server";
import { readAll, updateById, insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import { sendTicketConfirmation } from "@/lib/ticketEmail";
import type { Ticket, TicketComment, TicketCategory, TicketPriority, Client } from "@/types/dashboard";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN = 0.4;

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true;
  if (!token) return true; // Client has no site key configured — allow through
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    });
    const d = await res.json() as { success: boolean; score: number };
    return d.success && d.score >= RECAPTCHA_MIN;
  } catch {
    return true;
  }
}

function getNextTicketNumber(tickets: Ticket[]): string {
  const nums = tickets
    .map((t) => parseInt(t.ticketNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `TKT-${String(next).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const tickets = await readAll<Ticket>("tickets");
  const ticket  = tickets.find((t) => t.id === id || t.ticketNumber === id.toUpperCase());
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Return ticket without internal IP
  const { ip: _ip, ...safe } = ticket;
  return NextResponse.json({ ticket: safe });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limited = rateLimitResponse(ip, "tickets", { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json() as {
      title?: string;
      description?: string;
      requesterName?: string;
      requesterEmail?: string;
      category?: TicketCategory;
      priority?: TicketPriority;
      clientId?: string;
      recaptchaToken?: string;
      // For adding a comment
      type?: string;
      ticketId?: string;
      text?: string;
    };

    const isHuman = await verifyRecaptcha(body.recaptchaToken ?? null);
    if (!isHuman) return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 403 });

    // ── Add public comment ────────────────────────────────────────────────────
    if (body.type === "comment") {
      if (!body.ticketId || !body.text?.trim() || !body.requesterName) {
        return NextResponse.json({ error: "ticketId, text, and requesterName required" }, { status: 400 });
      }
      const tickets = await readAll<Ticket>("tickets");
      const ticket = tickets.find((t) => t.id === body.ticketId);
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

      const comment: TicketComment = {
        id:          newId(),
        ticketId:    body.ticketId,
        text:        body.text.trim(),
        authorName:  body.requesterName,
        authorEmail: body.requesterEmail,
        isStaff:     false,
        createdAt:   new Date().toISOString(),
      };
      await updateById<Ticket>("tickets", body.ticketId, {
        comments:  [...(ticket.comments ?? []), comment],
        updatedAt: new Date().toISOString(),
      } as Partial<Ticket>);
      return NextResponse.json({ comment }, { status: 201 });
    }

    // ── Create ticket ─────────────────────────────────────────────────────────
    if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!body.requesterName?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!body.requesterEmail?.trim()) return NextResponse.json({ error: "Email required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.requesterEmail.trim())) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // ── Client ID verification ────────────────────────────────────────────────
    const clientIdRaw = body.clientId?.trim().toUpperCase() ?? "";
    if (!clientIdRaw) {
      return NextResponse.json({ error: "A valid Client ID is required to submit a support ticket. Please contact your account manager if you don't have one." }, { status: 403 });
    }
    const clients = await readAll<Client>("clients");
    const matchedClient = clients.find((c) => c.clientId.toUpperCase() === clientIdRaw);
    if (!matchedClient) {
      return NextResponse.json({ error: "Client ID not recognised. Only HotBot Studios clients can submit support tickets." }, { status: 403 });
    }

    const tickets = await readAll<Ticket>("tickets");
    const ticket: Ticket = {
      id:             newId(),
      ticketNumber:   getNextTicketNumber(tickets),
      title:          body.title.trim(),
      description:    body.description?.trim() ?? "",
      status:         "open",
      priority:       body.priority  ?? "medium",
      category:       body.category  ?? "general",
      requesterName:  body.requesterName.trim(),
      requesterEmail: body.requesterEmail.trim(),
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
      ip,
      comments:       [],
    };
    await insert<Ticket>("tickets", ticket);

    // Send confirmation email to requester (non-blocking)
    sendTicketConfirmation(ticket).catch((err) =>
      console.error("[Ticket Email] Confirmation failed:", err)
    );

    return NextResponse.json({ ticket: { id: ticket.id, ticketNumber: ticket.ticketNumber, status: ticket.status } }, { status: 201 });
  } catch (err) {
    console.error("Ticket submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
