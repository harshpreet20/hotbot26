/**
 * POST /api/payments/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id }
 *
 * Required env vars (add to .env.local — NEVER commit keys):
 *   RAZORPAY_KEY_SECRET=xxxx
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { readAll, updateById } from "@/lib/store";
import type { Invoice } from "@/types/dashboard";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      invoice_id: string;
    };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoice_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update payment record in Supabase
    const supabase = getSupabase();
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        paid_at: new Date().toISOString(),
      })
      .eq("gateway_order_id", razorpay_order_id);

    if (paymentUpdateError) {
      console.error("[razorpay/verify] payment update error:", paymentUpdateError.message);
    }

    // Update invoice status to paid
    const invoices = await readAll<Invoice>("invoices");
    const invoice = invoices.find((i) => i.id === invoice_id);
    if (invoice && invoice.status !== "paid") {
      const updated: Invoice = {
        ...invoice,
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
        lastUpdatedAt: new Date().toISOString(),
        lastUpdatedBy: "razorpay-webhook",
      };
      await updateById<Invoice>("invoices", invoice_id, updated);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[razorpay/verify] error:", msg);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
