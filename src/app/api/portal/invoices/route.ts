import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { getPortalUser } from "@/lib/portalAuth";

// GET — list invoices for the authenticated portal user
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSupabaseEnabled()) {
    const orFilter = [
      `client_email.eq.${user.email}`,
      ...(user.clientRef ? [`client_id.eq.${user.clientRef}`] : []),
      ...(user.clientId  ? [`client_id.eq.${user.clientId}`]  : []),
    ].join(",");

    const { data: rows, error } = await sb()
      .from("invoices")
      .select(
        "id, invoice_number, status, client_name, line_items, subtotal, tax_amount, total, currency, issued_date, due_date, paid_date, notes"
      )
      .or(orFilter)
      .neq("status", "draft")
      .order("issued_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: 500 }
      );
    }

    const invoices = (rows ?? []).map((inv: Record<string, unknown>) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      status: inv.status,
      clientName: inv.client_name,
      lineItems: inv.line_items,
      subtotal: inv.subtotal,
      taxAmount: inv.tax_amount,
      total: inv.total,
      currency: inv.currency,
      issuedDate: inv.issued_date,
      dueDate: inv.due_date,
      paidDate: inv.paid_date,
      notes: inv.notes,
    }));
    return NextResponse.json({ invoices });
  }

  // In-memory fallback
  const { readAll } = await import("@/lib/store");
  const allInvoices = (await readAll("invoices")) as Array<{
    id: string;
    invoice_number?: string;
    invoiceNumber?: string;
    status: string;
    client_name?: string;
    clientName?: string;
    client_email?: string;
    clientEmail?: string;
    line_items?: unknown;
    lineItems?: unknown;
    subtotal?: number;
    tax_amount?: number;
    taxAmount?: number;
    total?: number;
    currency?: string;
    issued_date?: string;
    issuedDate?: string;
    due_date?: string;
    dueDate?: string;
    paid_date?: string;
    paidDate?: string;
    notes?: string;
  }>;

  const invoices = allInvoices
    .filter(
      (inv) =>
        (inv.client_email === user.email || inv.clientEmail === user.email) &&
        inv.status !== "draft"
    )
    .map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number ?? inv.invoiceNumber,
      status: inv.status,
      clientName: inv.client_name ?? inv.clientName,
      lineItems: inv.line_items ?? inv.lineItems,
      subtotal: inv.subtotal,
      taxAmount: inv.tax_amount ?? inv.taxAmount,
      total: inv.total,
      currency: inv.currency,
      issuedDate: inv.issued_date ?? inv.issuedDate,
      dueDate: inv.due_date ?? inv.dueDate,
      paidDate: inv.paid_date ?? inv.paidDate,
      notes: inv.notes,
    }));

  return NextResponse.json({ invoices });
}
