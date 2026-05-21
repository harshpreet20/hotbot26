/**
 * GET    /api/dashboard/invoice-schedules        — list all schedules
 * POST   /api/dashboard/invoice-schedules        — create new schedule
 * PATCH  /api/dashboard/invoice-schedules        — update schedule { id, ...fields }
 * DELETE /api/dashboard/invoice-schedules?id=    — deactivate (set active=false)
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimitResponse } from "@/lib/rateLimit";

type Frequency = "weekly" | "monthly" | "quarterly" | "annually";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Compute next invoice date from a start date and frequency */
function computeNextDate(startDate: string, frequency: Frequency): string {
  const d = new Date(startDate);
  switch (frequency) {
    case "weekly":    d.setDate(d.getDate() + 7); break;
    case "monthly":   d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "annually":  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split("T")[0];
}

/** Add one frequency interval to a date */
export function addFrequencyInterval(date: string, frequency: Frequency): string {
  return computeNextDate(date, frequency);
}

export async function GET(req: NextRequest) {
  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data, error } = await sb()
    .from("invoice_schedules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedules: data ?? [] });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json() as Record<string, unknown>;

  const frequency = body.frequency as string;
  if (!["weekly", "monthly", "quarterly", "annually"].includes(frequency)) {
    return NextResponse.json({ error: "frequency must be weekly|monthly|quarterly|annually" }, { status: 400 });
  }

  if (!body.name || !body.client_email || !body.start_date) {
    return NextResponse.json({ error: "name, client_email, and start_date are required" }, { status: 400 });
  }

  const startDate = body.start_date as string;
  const nextInvoiceDate = computeNextDate(startDate, frequency as Frequency);

  const record = {
    name:                body.name,
    client_name:         body.client_name ?? "",
    client_email:        body.client_email,
    client_phone:        body.client_phone ?? null,
    client_company:      body.client_company ?? null,
    client_address:      body.client_address ?? null,
    line_items:          body.line_items ?? [],
    tax_rate:            Number(body.tax_rate) || 0,
    discount:            Number(body.discount) || 0,
    currency:            body.currency ?? "INR",
    notes:               body.notes ?? null,
    terms:               body.terms ?? null,
    frequency,
    start_date:          startDate,
    end_date:            body.end_date ?? null,
    next_invoice_date:   nextInvoiceDate,
    payment_terms_days:  Number(body.payment_terms_days) || 30,
    lead_id:             body.lead_id ?? null,
    active:              true,
    invoices_generated:  0,
    created_by:          session.username,
    created_at:          new Date().toISOString(),
  };

  const { data, error } = await sb()
    .from("invoice_schedules")
    .insert(record)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json() as Record<string, unknown> & { id: string };
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { id, ...fields } = body;

  // If frequency changed and start_date provided, recompute next_invoice_date
  if (fields.frequency && fields.start_date) {
    const freq = fields.frequency as Frequency;
    if (!["weekly", "monthly", "quarterly", "annually"].includes(freq)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }
    fields.next_invoice_date = computeNextDate(fields.start_date as string, freq);
  }

  const { data, error } = await sb()
    .from("invoice_schedules")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schedule: data });
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id=" }, { status: 400 });

  // Deactivate rather than delete
  const { error } = await sb()
    .from("invoice_schedules")
    .update({ active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
