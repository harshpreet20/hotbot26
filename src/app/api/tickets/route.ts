/**
 * Public ticket API - no authentication required.
 * POST  /api/tickets        - submit a new ticket
 * GET   /api/tickets?id=    - get a single ticket by ID (for status page)
 * POST  /api/tickets/comment - add a public comment to a ticket
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAll, updateById, insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import { sendTicketConfirmation } from "@/lib/ticketEmail";
import { fireJourneyEvent } from "@/lib/journey";
import type { Ticket, TicketComment, Client, Lead } from "@/types/dashboard";

const NewTicketSchema = z.object({
  title:          z.string({ error: "title is required" }).min(1, "title is required").max(200),
  description:    z.string().max(10_000).optional().default(""),
  requesterName:  z.string({ error: "requesterName is required" }).min(1).max(200),
  requesterEmail: z.string({ error: "requesterEmail is required" }).email("Invalid email address").max(200),
  category:       z.enum(["bug", "feature", "support", "billing", "general"]).optional(),
  priority:       z.enum(["low", "medium", "high", "critical"]).optional(),
  clientId:       z.string().max(50).optional(),
  recaptchaToken: z.string().optional(),
});

const PublicCommentSchema = z.object({
  type:          z.literal("comment"),
  ticketId:      z.string({ error: "ticketId is required" }).min(1),
  text:          z.string({ error: "text is required" }).min(1, "text is required").max(4_000),
  requesterName: z.string().max(200).optional(),
});

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
  const limited = await rateLimitResponse(ip, "tickets", { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  try {
    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const isComment = typeof rawBody === "object" && rawBody !== null &&
      (rawBody as Record<string, unknown>).type === "comment";

    // ── Add public comment ────────────────────────────────────────────────────
    if (isComment) {
      let body: z.infer<typeof PublicCommentSchema>;
      try {
        body = PublicCommentSchema.parse(rawBody);
      } catch (err) {
        const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      const tickets = await readAll<Ticket>("tickets");
      const ticket = tickets.find((t) => t.id === body.ticketId);
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

      const comment: TicketComment = {
        id:         newId(),
        ticketId:   body.ticketId,
        text:       body.text.trim(),
        authorName: body.requesterName ?? "Anonymous",
        isStaff:    false,
        createdAt:  new Date().toISOString(),
      };
      await updateById<Ticket>("tickets", body.ticketId, {
        comments:  [...(ticket.comments ?? []), comment],
        updatedAt: new Date().toISOString(),
      } as Partial<Ticket>);
      return NextResponse.json({ comment }, { status: 201 });
    }

    // ── Create new ticket ─────────────────────────────────────────────────────
    let body: z.infer<typeof NewTicketSchema>;
    try {
      body = NewTicketSchema.parse(rawBody);
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const isHuman = await verifyRecaptcha(body.recaptchaToken ?? null);
    if (!isHuman) return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 403 });

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
      description:    body.description ?? "",
      status:         "open",
      priority:       body.priority ?? "medium",
      category:       body.category ?? "general",
      requesterName:  body.requesterName.trim(),
      requesterEmail: body.requesterEmail.trim(),
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
      ip,
      comments:       [],
    };
    await insert<Ticket>("tickets", ticket);

    insert<Lead>("leads", {
      id:        newId(),
      name:      ticket.requesterName,
      email:     ticket.requesterEmail,
      phone:     null,
      company:   null,
      service:   ticket.category,
      budget:    null,
      message:   `[Support Ticket #${ticket.ticketNumber}] ${ticket.title}`,
      formType:  "support-ticket",
      source:    "support",
      ip:        ip,
      createdAt: ticket.createdAt,
      status:    "new",
    }).catch((err) => console.error("[ticket] lead insert failed:", err));

    sendTicketConfirmation(ticket).catch((err) =>
      console.error("[Ticket Email] Confirmation failed:", err)
    );

    fireJourneyEvent({
      sessionId: null,
      email:     ticket.requesterEmail,
      stage:     "lead",
      source:    "support",
      page:      req.headers.get("referer") ?? null,
      metadata:  { formType: "support-ticket", ticketNumber: ticket.ticketNumber, category: ticket.category },
    }).catch(() => {});

    return NextResponse.json({ ticket: { id: ticket.id, ticketNumber: ticket.ticketNumber, status: ticket.status } }, { status: 201 });
  } catch (err) {
    console.error("Ticket submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
