/**
 * POST /api/payments/paypal/create-order
 * Body: { invoice_id, amount, currency, customer_email }
 *
 * Required env vars (add to .env.local — NEVER commit keys):
 *   PAYPAL_CLIENT_ID=xxxx
 *   PAYPAL_CLIENT_SECRET=xxxx
 *   PAYPAL_SANDBOX=true   (set to false in production)
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

function getPayPalBase() {
  const isSandbox = process.env.PAYPAL_SANDBOX !== "false";
  return isSandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const base = getPayPalBase();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error: ${text}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      invoice_id: string;
      amount: number;
      currency: string;
      customer_email?: string;
    };

    const { invoice_id, amount, currency, customer_email } = body;
    if (!invoice_id || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate invoice
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

    const accessToken = await getPayPalAccessToken();
    const base = getPayPalBase();

    // Create PayPal order
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/invoice/${invoice_id}?paypal_order_id=PAYPAL_ORDER_ID&invoice_id=${invoice_id}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/invoice/${invoice_id}?paypal_cancelled=true`;

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: invoice_id,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: `Invoice ${invoice.invoiceNumber} — Hotbot Studios LLP`,
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: "Hotbot Studios LLP",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!orderRes.ok) {
      const text = await orderRes.text();
      console.error("[paypal/create-order] PayPal order error:", text);
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
    }

    const order = await orderRes.json() as { id: string; links: PayPalLink[] };

    // Insert pending payment row
    const supabase = getSupabase();
    const { error: dbError } = await supabase.from("payments").insert({
      invoice_id,
      amount,
      currency,
      gateway: "paypal",
      gateway_order_id: order.id,
      status: "pending",
      payer_email: customer_email ?? invoice.clientEmail,
    });

    if (dbError) {
      console.error("[paypal/create-order] DB insert error:", dbError.message);
    }

    const approvalUrl = order.links.find((l) => l.rel === "approve")?.href ?? "";

    return NextResponse.json({
      orderId: order.id,
      approvalUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[paypal/create-order] error:", msg);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
