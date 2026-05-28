/**
 * Customer Portal API — public, no bearer auth.
 * Clients authenticate by their HBS client ID.
 *
 * GET /api/portal?clientId=HBS-XXXXX
 *   Returns: { client, projects, tickets, invoices, whiteboards }
 *   Sensitive fields (budget, internal notes) are stripped.
 */
import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { readAll } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Ticket, Client } from "@/types/dashboard";

const ALLOWED_PROJECT_FIELDS = [
  "id", "project_number", "name", "description", "status", "stage",
  "priority", "progress", "start_date", "target_date", "tags",
  "meet_url", "meet_scheduled_at", "created_at", "updated_at",
] as const;

function stripProject(p: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  ALLOWED_PROJECT_FIELDS.forEach((f) => { if (f in p) out[f] = p[f]; });
  return out;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip") || "unknown";

  const limited = rateLimitResponse(ip, "portal-api", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const clientId = (searchParams.get("clientId") ?? "").trim().toUpperCase();

  if (!clientId || !clientId.startsWith("HBS-")) {
    return NextResponse.json({ error: "Valid Client ID required (format: HBS-XXXXX)" }, { status: 400 });
  }

  // Verify client exists
  const clients = await readAll<Client>("clients");
  const client = clients.find((c) => c.clientId?.toUpperCase() === clientId);
  if (!client) {
    return NextResponse.json({ error: "Client ID not recognised." }, { status: 404 });
  }

  // Parallel fetch: projects, tickets, invoices, whiteboards
  const [projectsResult, ticketsResult, invoicesResult, whiteboardsResult] = await Promise.allSettled([
    fetchProjects(clientId),
    fetchTickets(client),
    fetchInvoices(client),
    fetchWhiteboards(clientId),
  ]);

  const projects   = projectsResult.status   === "fulfilled" ? projectsResult.value   : [];
  const tickets    = ticketsResult.status    === "fulfilled" ? ticketsResult.value    : [];
  const invoices   = invoicesResult.status   === "fulfilled" ? invoicesResult.value   : [];
  const whiteboards = whiteboardsResult.status === "fulfilled" ? whiteboardsResult.value : [];

  // Return safe client info
  const safeClient = {
    name:     client.name,
    company:  client.company,
    clientId: client.clientId,
    status:   client.status,
  };

  return NextResponse.json({ client: safeClient, projects, tickets, invoices, whiteboards });
}

async function fetchProjects(clientId: string) {
  if (!isSupabaseEnabled()) return [];
  const { data, error } = await sb()
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(stripProject);
}

async function fetchTickets(client: Client) {
  const allTickets = await readAll<Ticket>("tickets");
  const email = client.email?.toLowerCase();
  return allTickets
    .filter((t) => {
      if (client.clientId && t.clientId === client.clientId) return true;
      if (email && t.requesterEmail?.toLowerCase() === email) return true;
      return false;
    })
    .map((t) => ({
      id:             t.id,
      ticketNumber:   t.ticketNumber,
      title:          t.title,
      status:         t.status,
      priority:       t.priority,
      category:       t.category,
      createdAt:      t.createdAt,
      updatedAt:      t.updatedAt,
      commentCount:   (t.comments ?? []).length,
      lastComment:    (t.comments ?? []).at(-1)?.createdAt ?? null,
      hasStaffReply:  (t.comments ?? []).some((c) => c.isStaff),
    }));
}

async function fetchInvoices(client: Client) {
  if (!isSupabaseEnabled()) return [];
  const email = client.email?.toLowerCase();
  if (!email) return [];
  const { data, error } = await sb()
    .from("invoices")
    .select("id, invoice_number, status, due_date, currency, total, created_at")
    .ilike("client_email", email)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return (data ?? []).map((inv: Record<string, unknown>) => ({
    id:            inv.id,
    invoiceNumber: inv.invoice_number,
    status:        inv.status,
    dueDate:       inv.due_date,
    currency:      inv.currency,
    total:         Number(inv.total ?? 0),
    createdAt:     inv.created_at,
    itemCount:     0,
  }));
}

async function fetchWhiteboards(clientId: string) {
  if (!isSupabaseEnabled()) return [];
  // Get the client's project IDs first
  const { data: projects, error: projErr } = await sb()
    .from("projects")
    .select("id")
    .eq("client_id", clientId);
  if (projErr || !projects || projects.length === 0) return [];

  const projectIds = (projects as { id: string }[]).map((p) => p.id);

  const { data, error } = await sb()
    .from("whiteboard_sessions")
    .select("id, title, share_token, entity_type, entity_id, updated_at")
    .eq("entity_type", "project")
    .in("entity_id", projectIds)
    .order("updated_at", { ascending: false })
    .limit(20);
  if (error) return [];

  return (data ?? []).map((w: Record<string, unknown>) => ({
    id:         w.id,
    title:      w.title,
    shareToken: w.share_token,
    entityType: w.entity_type,
    entityId:   w.entity_id,
    updatedAt:  w.updated_at,
  }));
}
