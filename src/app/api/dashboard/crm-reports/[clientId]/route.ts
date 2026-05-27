/**
 * GET /api/dashboard/crm-reports/[clientId]
 * Aggregates CRM data for a single client: projects, invoices, tickets + a health score.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";
import { readAll } from "@/lib/store";
import type { Invoice, Ticket } from "@/types/dashboard";

// ── Health score ───────────────────────────────────────────────────────────────

function calcHealthScore(params: {
  completedProjects: number;
  overdueInvoices: number;
  openTickets: number;
  allPaid: boolean;
}): number {
  let score = 75;

  if (params.completedProjects > 0) score += 15;

  const invoicePenalty = Math.min(params.overdueInvoices * 10, 30);
  score -= invoicePenalty;

  const ticketPenalty = Math.min(params.openTickets * 5, 20);
  score -= ticketPenalty;

  if (params.allPaid) score += 10;

  return Math.max(0, Math.min(100, score));
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await params;

  // 1. Client info from Supabase
  const { data: client, error: clientError } = await sb()
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // 2. Projects for this client
  // projects.client_id is the HBS-XXXXX varchar key (FK → clients.client_id), NOT the UUID.
  // Use client.client_id (the HBS code fetched above) to avoid a UUID/varchar mismatch.
  const { data: projectRows, error: projectsError } = await sb()
    .from("projects")
    .select("*")
    .eq("client_id", (client as Record<string, unknown>).client_id ?? clientId)
    .order("created_at", { ascending: false });

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const projects = (projectRows ?? []) as Record<string, unknown>[];

  // 3. Invoices — read all, filter by client email or name
  const allInvoices = await readAll<Invoice>("invoices");
  const clientEmail: string = (client.email as string) ?? "";
  const clientName: string = (client.name as string) ?? "";

  const clientInvoices = allInvoices.filter(
    (inv) =>
      inv.clientEmail === clientEmail ||
      inv.clientName?.toLowerCase() === clientName.toLowerCase()
  );

  // 4. Tickets — read all, filter by clientId or requester email
  const allTickets = await readAll<Ticket>("tickets");
  const clientTickets = allTickets.filter(
    (t) => t.clientId === clientId || t.requesterEmail === clientEmail
  );

  // ── Summaries ────────────────────────────────────────────────────────────────

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;

  const totalRevenue = clientInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  const outstandingBalance = clientInvoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  const overdueInvoices = clientInvoices.filter((inv) => inv.status === "overdue").length;

  const openTickets = clientTickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting"
  ).length;

  const resolvedTickets = clientTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;

  const allPaid =
    clientInvoices.length > 0 &&
    clientInvoices.every((inv) => inv.status === "paid" || inv.status === "cancelled");

  const healthScore = calcHealthScore({
    completedProjects,
    overdueInvoices,
    openTickets,
    allPaid,
  });

  // ── Shape output ─────────────────────────────────────────────────────────────

  return NextResponse.json({
    client: {
      id:               client.id,
      name:             client.name,
      email:            client.email,
      company:          client.company,
      status:           client.status,
      onboarding_stage: client.onboarding_stage,
      account_manager:  client.account_manager,
      created_at:       client.created_at,
      tags:             client.tags ?? [],
    },
    summary: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      outstandingBalance,
      openTickets,
      resolvedTickets,
      healthScore,
    },
    projects: projects.map((p) => ({
      id:             p.id,
      project_number: p.project_number,
      name:           p.name,
      status:         p.status,
      stage:          p.stage,
      priority:       p.priority,
      progress:       p.progress,
      start_date:     p.start_date,
      target_date:    p.target_date,
      created_at:     p.created_at,
    })),
    invoices: clientInvoices.map((inv) => ({
      id:            inv.id,
      invoiceNumber: inv.invoiceNumber,
      status:        inv.status,
      total:         inv.total,
      currency:      inv.currency,
      issuedDate:    inv.issuedDate,
      dueDate:       inv.dueDate,
      paidDate:      inv.paidDate,
    })),
    tickets: clientTickets.map((t) => ({
      id:           t.id,
      ticketNumber: t.ticketNumber,
      title:        t.title,
      status:       t.status,
      priority:     t.priority,
      createdAt:    t.createdAt,
      resolvedAt:   t.resolvedAt,
    })),
  });
}
