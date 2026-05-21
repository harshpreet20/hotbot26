import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoices, error } = await sb()
    .from("invoices")
    .select("id, invoice_number, status, client_name, client_email, total, currency, issued_date, due_date, paid_date")
    .eq("client_email", email)
    .order("issued_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const invoiceIds = (invoices ?? []).map((i) => i.id);
  let payments: unknown[] = [];

  if (invoiceIds.length > 0) {
    const { data: pData } = await sb()
      .from("payments")
      .select("id, invoice_id, amount, currency, gateway, status, paid_at")
      .in("invoice_id", invoiceIds)
      .order("paid_at", { ascending: false });
    payments = pData ?? [];
  }

  const totalBilled      = (invoices ?? []).reduce((s, i) => s + (i.total ?? 0), 0);
  const totalPaid        = (invoices ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + (i.total ?? 0), 0);
  const outstanding      = (invoices ?? []).filter((i) => ["sent", "viewed", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total ?? 0), 0);

  return NextResponse.json({
    invoices:   invoices ?? [],
    payments,
    summary: { totalBilled, totalPaid, outstanding },
  });
}
