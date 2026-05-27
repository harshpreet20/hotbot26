/**
 * GET /api/payments/status/[invoiceId]
 * Returns all payments for an invoice (for dashboard payment history).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Payment } from "@/types/dashboard";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function toCamelPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id ?? ""),
    invoiceId: String(row.invoice_id ?? ""),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? ""),
    gateway: (row.gateway as Payment["gateway"]) ?? "manual",
    gatewayOrderId: row.gateway_order_id ? String(row.gateway_order_id) : undefined,
    gatewayPaymentId: row.gateway_payment_id ? String(row.gateway_payment_id) : undefined,
    status: (row.status as Payment["status"]) ?? "pending",
    paidAt: row.paid_at ? String(row.paid_at) : undefined,
    payerEmail: row.payer_email ? String(row.payer_email) : undefined,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  const { invoiceId } = params;
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[payments/status] DB error:", error.message);
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }

    const payments: Payment[] = (data ?? []).map((row) =>
      toCamelPayment(row as Record<string, unknown>)
    );

    return NextResponse.json({ payments });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[payments/status] error:", msg);
    return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 });
  }
}
