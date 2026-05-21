/**
 * POST /api/payments/stripe/create-session
 * Body: { invoice_id, amount, currency, customer_email, customer_name, invoice_number }
 *
 * Required env vars (.env.local only — NEVER commit):
 *   STRIPE_SECRET_KEY=sk_test_xxxx
 *   NEXT_PUBLIC_APP_URL=https://hotbotstudios.com
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
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

// Stripe fee: 2% domestic + 18% GST on fee = 2.36% effective
// (matching Razorpay for consistency; adjust if your Stripe rate differs)
const STRIPE_BASE_RATE = 0.02;
const STRIPE_GST_RATE  = 0.18;

function calcStripeFee(amount: number) {
  const baseFee  = Math.ceil(amount * STRIPE_BASE_RATE * 100) / 100;
  const gst      = Math.ceil(baseFee * STRIPE_GST_RATE * 100) / 100;
  const totalFee = Math.ceil((baseFee + gst) * 100) / 100;
  return { totalFee, total: Math.ceil((amount + totalFee) * 100) / 100 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      invoice_id: string;
      amount: number;
      currency: string;
      customer_email?: string;
      customer_name?: string;
      invoice_number?: string;
    };

    const { invoice_id, amount, currency, customer_email, customer_name, invoice_number } = body;
    if (!invoice_id || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    // Validate invoice
    const invoices = await readAll<Invoice>("invoices");
    const invoice = invoices.find((i) => i.id === invoice_id);
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });
    if (invoice.status === "cancelled") return NextResponse.json({ error: "Invoice cancelled" }, { status: 400 });

    const stripe = new Stripe(secretKey);
    const fee = calcStripeFee(amount);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hotbotstudios.com";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customer_email ?? invoice.clientEmail ?? undefined,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice_number ?? invoice_id}`,
              description: `Payment to Hotbot Studios LLP`,
            },
            unit_amount: Math.round(fee.total * 100), // Stripe uses smallest currency unit
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id,
        invoice_amount: String(amount),
        gateway_fee: String(fee.totalFee),
        fee_rate: "2% + 18% GST",
        customer_name: customer_name ?? invoice.clientName ?? "",
      },
      success_url: `${appUrl}/invoice/${invoice_id}?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/invoice/${invoice_id}?stripe=cancelled`,
    });

    // Insert pending payment row
    const supabase = getSupabase();
    await supabase.from("payments").insert({
      invoice_id,
      amount: fee.total,
      currency,
      gateway: "stripe",
      gateway_order_id: session.id,
      stripe_session_id: session.id,
      status: "pending",
      payer_email: customer_email ?? invoice.clientEmail,
      metadata: {
        invoice_amount: amount,
        gateway_fee: fee.totalFee,
        fee_rate: "2% + 18% GST",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe/create-session]", msg);
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 });
  }
}
