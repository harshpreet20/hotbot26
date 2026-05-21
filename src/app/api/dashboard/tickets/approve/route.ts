export const dynamic = "force-dynamic";
/**
 * POST /api/dashboard/tickets/approve
 * Body: { ticket_id, action: "approve" | "reject", reason? }
 *
 * Minimum role required: manager
 * (agents and sales reps cannot approve — only manager, admin, super_admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Enforce minimum manager role — no agents or sales can approve
  const session = await authorizeRole(
    extractToken(req),
    "super_admin", "admin", "manager"
  );
  if (!session) {
    return NextResponse.json(
      { error: "Only managers and above can approve or reject ticket requests." },
      { status: 403 }
    );
  }

  const body = await req.json() as {
    ticket_id: string;
    action: "approve" | "reject";
    reason?: string;
  };

  const { ticket_id, action, reason } = body;

  if (!ticket_id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "ticket_id and action (approve|reject) required" }, { status: 400 });
  }

  // Verify ticket exists and is pending approval
  const { data: ticket, error: fetchErr } = await sb()
    .from("tickets")
    .select("id, subject, client_email, approval_status")
    .eq("id", ticket_id)
    .single();

  if (fetchErr || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (ticket.approval_status !== "pending_approval") {
    return NextResponse.json(
      { error: `Ticket is already ${ticket.approval_status}` },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const updatePayload =
    action === "approve"
      ? {
          approval_status:  "approved",
          approved_by:      session.username ?? "unknown",
          approved_at:      now,
          rejection_reason: null,
          // Move to in_progress once approved
          status:           "in_progress",
        }
      : {
          approval_status:  "rejected",
          approved_by:      session.username ?? "unknown",
          approved_at:      now,
          rejection_reason: reason ?? "Request rejected by manager.",
          status:           "closed",
        };

  const { error: updateErr } = await sb()
    .from("tickets")
    .update(updatePayload)
    .eq("id", ticket_id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Notify client via crm_notifications
  sb().from("crm_notifications").insert({
    recipient_email: ticket.client_email,
    recipient_type:  "client",
    type:            action === "approve" ? "ticket_reply" : "ticket_reply",
    title:           action === "approve"
      ? `Your request "${ticket.subject}" has been approved ✅`
      : `Your request "${ticket.subject}" was not approved`,
    body: action === "approve"
      ? "Our team will begin work shortly."
      : reason ?? "Please contact us if you have questions.",
    link:            "/customers/tickets",
    entity_type:     "ticket",
    entity_id:       ticket_id,
  }).then(({ error: e }) => { if (e) console.error("[approve-notify]", e.message); });

  return NextResponse.json({
    ok: true,
    ticket_id,
    action,
    approved_by: session.username,
  });
}
