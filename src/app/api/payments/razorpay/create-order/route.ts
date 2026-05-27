/**
 * POST /api/payments/razorpay/create-order
 * Body: { invoice_id, amount, currency, customer_email, customer_name }
 *
 * Required env vars (add to .env.local — NEVER commit keys):
 *   RAZORPAY_KEY_ID=rzp_test_xxxx
 *   RAZORPAY_KEY_SECRET=xxxx
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readAll } from "@/lib/store";
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
      invoice_id: string;
      invoice_amount?: number;   // original invoice amount
      gateway_fee?: number;      // razorpay fee passed to customer
      amount: number;            // total charged (invoice_amount + gateway_fee)
      currency: string;
      customer_email?: string;
      customer_name?: string;
    };

    const { invoice_id, invoice_amount, gateway_fee, amount, currency, customer_email, customer_name } = body;
    if (!invoice_id || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate invoice exists and is not already paid
    const invoices = await readAll<Invoice>("invoices");
    const invoice = invoices.find((i) => i.id === invoice_id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }
    if (invoice.status === "cancelled") {
      return NextResponse.json({ error: "Invoice is cancelled" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    // Create Razorpay order
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // convert to paise/cents
      currency,
      receipt: invoice_id,
    }) as { id: string };

    // Insert pending payment row in Supabase (amount = total including gateway fee)
    const supabase = getSupabase();
    const { error: dbError } = await supabase.from("payments").insert({
      invoice_id,
      amount,          // total charged (invoice + fee)
      currency,
      gateway: "razorpay",
      gateway_order_id: order.id,
      status: "pending",
      payer_email: customer_email ?? invoice.clientEmail,
      metadata: {
        invoice_amount: invoice_amount ?? amount,
        gateway_fee: gateway_fee ?? 0,
        fee_rate: "2% + 18% GST",
      },
    });

    if (dbError) {
      console.error("[razorpay/create-order] DB insert error:", dbError.message);
      // Non-fatal — order still created in Razorpay, log and continue
    }

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency,
      keyId,
      customerEmail: customer_email ?? invoice.clientEmail,
      customerName: customer_name ?? invoice.clientName,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[razorpay/create-order] error:", msg);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
