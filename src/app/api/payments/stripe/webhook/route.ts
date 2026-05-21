/**
 * POST /api/payments/stripe/webhook
 * Handles Stripe events: checkout.session.completed
 *
 * Required env vars (.env.local only — NEVER commit):
 *   STRIPE_SECRET_KEY=sk_test_xxxx
 *   STRIPE_WEBHOOK_SECRET=whsec_xxxx
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { readAll, update as storeUpdate } from "@/lib/store";
import type { Invoice } from "@/types/dashboard";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("[stripe/webhook] signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoice_id = session.metadata?.invoice_id;
    if (!invoice_id) return NextResponse.json({ received: true });

    const supabase = getSupabase();

    // Update payment row to completed
    await supabase
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
        gateway_payment_id: typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id,
        payer_email: session.customer_email ?? undefined,
      })
      .eq("stripe_session_id", session.id);

    // Mark invoice as paid in Supabase
    await supabase
      .from("invoices")
      .update({ status: "paid", paid_date: new Date().toISOString().split("T")[0] })
      .eq("id", invoice_id);

    // Mark invoice as paid in file store (if Supabase not primary)
    try {
      const invoices = await readAll<Invoice>("invoices");
      const inv = invoices.find((i) => i.id === invoice_id);
      if (inv) {
        await storeUpdate("invoices", invoice_id, { ...inv, status: "paid", paidDate: new Date().toISOString().split("T")[0] });
      }
    } catch {
      // store update is best-effort
    }

    console.log(`[stripe/webhook] Invoice ${invoice_id} marked paid`);
  }

  return NextResponse.json({ received: true });
}
