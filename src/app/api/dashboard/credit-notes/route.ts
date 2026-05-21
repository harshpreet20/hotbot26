/**
 * GET   /api/dashboard/credit-notes             — list credit notes, ?invoice_id= filter
 * POST  /api/dashboard/credit-notes             — create credit note
 * PATCH /api/dashboard/credit-notes             — update status { id, status }
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { readAll } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Invoice } from "@/types/dashboard";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function calcTotals(lineItems: LineItem[], taxRate: number, discount: number) {
  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - discount + taxAmount).toFixed(2));
  return { subtotal, taxAmount, total };
}

async function getNextCreditNoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  if (!isSupabaseEnabled()) return `CN-${year}-0001`;

  const { count } = await sb()
    .from("credit_notes")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`);

  const seq = ((count ?? 0) + 1);
  return `CN-${year}-${String(seq).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const invoiceId = new URL(req.url).searchParams.get("invoice_id");

  let query = sb()
    .from("credit_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (invoiceId) query = query.eq("invoice_id", invoiceId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ creditNotes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json() as {
    invoice_id?: string;
    client_name: string;
    client_email: string;
    reason: string;
    line_items: LineItem[];
    tax_rate?: number;
    discount?: number;
    currency?: string;
    notes?: string;
    cancel_invoice?: boolean;
  };

  if (!body.client_name || !body.client_email || !body.reason) {
    return NextResponse.json({ error: "client_name, client_email, and reason are required" }, { status: 400 });
  }

  const lineItems: LineItem[] = (body.line_items ?? []).map((li) => ({
    description: li.description ?? "",
    quantity:    Number(li.quantity) || 0,
    unitPrice:   Number(li.unitPrice) || 0,
    amount:      Number(li.quantity) * Number(li.unitPrice),
  }));

  const taxRate  = Number(body.tax_rate)  || 0;
  const discount = Number(body.discount)  || 0;
  const { subtotal, taxAmount, total } = calcTotals(lineItems, taxRate, discount);

  const creditNoteNumber = await getNextCreditNoteNumber();

  const record = {
    credit_note_number: creditNoteNumber,
    invoice_id:         body.invoice_id ?? null,
    client_name:        body.client_name,
    client_email:       body.client_email,
    reason:             body.reason,
    line_items:         lineItems,
    subtotal,
    tax_rate:           taxRate,
    tax_amount:         taxAmount,
    discount,
    total,
    currency:           body.currency ?? "INR",
    status:             "issued",
    issued_date:        new Date().toISOString().split("T")[0],
    notes:              body.notes ?? null,
    created_by:         session.username,
    created_at:         new Date().toISOString(),
  };

  const { data, error } = await sb()
    .from("credit_notes")
    .insert(record)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optionally cancel the linked invoice if credit equals invoice total
  if (body.invoice_id && body.cancel_invoice) {
    const invoices = await readAll<Invoice>("invoices");
    const inv = invoices.find((i) => i.id === body.invoice_id);
    if (inv && Math.abs(total - inv.total) < 0.01) {
      await sb()
        .from("invoices")
        .update({ status: "cancelled" })
        .eq("id", body.invoice_id);
    }
  }

  return NextResponse.json({ creditNote: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json() as { id: string; status: string };

  if (!body.id)     return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!body.status) return NextResponse.json({ error: "Missing status" }, { status: 400 });

  const validStatuses = ["issued", "applied", "voided"];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("credit_notes")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ creditNote: data });
}
