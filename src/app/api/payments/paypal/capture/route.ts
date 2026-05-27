/**
 * POST /api/payments/paypal/capture
 * Body: { order_id, invoice_id }
 *
 * Required env vars (add to .env.local — NEVER commit keys):
 *   PAYPAL_CLIENT_ID=xxxx
 *   PAYPAL_CLIENT_SECRET=xxxx
 *   PAYPAL_SANDBOX=true   (set to false in production)
 */
import { NextRequest, NextResponse } from "next/server";
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

interface PayPalCaptureUnit {
  payments?: {
    captures?: Array<{
      id: string;
      status: string;
    }>;
  };
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: PayPalCaptureUnit[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      order_id: string;
      invoice_id: string;
    };

    const { order_id, invoice_id } = body;
    if (!order_id || !invoice_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const base = getPayPalBase();

    // Capture the PayPal order
    const captureRes = await fetch(`${base}/v2/checkout/orders/${order_id}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureRes.ok) {
      const text = await captureRes.text();
      console.error("[paypal/capture] capture error:", text);
      return NextResponse.json({ error: "Failed to capture PayPal payment" }, { status: 500 });
    }

    const capture = await captureRes.json() as PayPalCaptureResponse;

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${capture.status}` },
        { status: 400 }
      );
    }

    const transactionId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? order_id;

    // Update payment row in Supabase
    const supabase = getSupabase();
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        gateway_payment_id: transactionId,
        paid_at: new Date().toISOString(),
      })
      .eq("gateway_order_id", order_id);

    if (paymentUpdateError) {
      console.error("[paypal/capture] payment update error:", paymentUpdateError.message);
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
        lastUpdatedBy: "paypal-capture",
      };
      await updateById<Invoice>("invoices", invoice_id, updated);
    }

    return NextResponse.json({ success: true, transactionId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[paypal/capture] error:", msg);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
