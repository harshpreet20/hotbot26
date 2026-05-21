/**
 * POST /api/dashboard/invoice-schedules/generate
 * Cron trigger: generates invoices for all active schedules where next_invoice_date <= TODAY.
 * Protected — any valid session.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { readAll, insert, newId } from "@/lib/store";
import { addFrequencyInterval } from "@/app/api/dashboard/invoice-schedules/route";
import type { Invoice, InvoiceLineItem } from "@/types/dashboard";

type Frequency = "weekly" | "monthly" | "quarterly" | "annually";

function calcTotals(lineItems: InvoiceLineItem[], taxRate: number, discount: number) {
  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - discount + taxAmount).toFixed(2));
  return { subtotal, taxAmount, total };
}

function getNextInvoiceNumber(invoices: Invoice[]): string {
  const nums = invoices
    .map((inv) => parseInt(inv.invoiceNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

type ScheduleRecord = {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_company: string | null;
  client_address: string | null;
  line_items: InvoiceLineItem[];
  tax_rate: number;
  discount: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  frequency: Frequency;
  next_invoice_date: string;
  end_date: string | null;
  payment_terms_days: number;
  lead_id: string | null;
  invoices_generated: number;
};

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const today = new Date().toISOString().split("T")[0];

  // Find active schedules due today or earlier
  const { data: schedules, error: schedErr } = await sb()
    .from("invoice_schedules")
    .select("*")
    .eq("active", true)
    .lte("next_invoice_date", today);

  if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });

  if (!schedules || schedules.length === 0) {
    return NextResponse.json({ generated: 0, message: "No schedules due today" });
  }

  const existingInvoices = await readAll<Invoice>("invoices");
  let generated = 0;

  for (const sch of schedules as ScheduleRecord[]) {
    try {
      const lineItems: InvoiceLineItem[] = (sch.line_items ?? []).map((li: InvoiceLineItem) => ({
        id:          li.id ?? newId(),
        description: li.description ?? "",
        quantity:    Number(li.quantity) || 0,
        unitPrice:   Number(li.unitPrice) || 0,
        amount:      Number(li.quantity) * Number(li.unitPrice),
      }));

      const taxRate  = Number(sch.tax_rate)  || 0;
      const discount = Number(sch.discount)  || 0;
      const { subtotal, taxAmount, total } = calcTotals(lineItems, taxRate, discount);

      const paymentTermsDays = sch.payment_terms_days ?? 30;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + paymentTermsDays);

      const invoice: Invoice = {
        id:            newId(),
        invoiceNumber: getNextInvoiceNumber([...existingInvoices]),
        status:        "sent",
        clientName:    sch.client_name,
        clientEmail:   sch.client_email,
        clientPhone:   sch.client_phone ?? undefined,
        clientCompany: sch.client_company ?? undefined,
        clientAddress: sch.client_address ?? undefined,
        lineItems,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        currency:      sch.currency ?? "INR",
        issuedDate:    today,
        dueDate:       dueDate.toISOString().split("T")[0],
        notes:         sch.notes ?? undefined,
        terms:         sch.terms ?? undefined,
        createdAt:     new Date().toISOString(),
        createdBy:     `schedule:${sch.id}`,
        leadId:        sch.lead_id ?? undefined,
      };

      await insert<Invoice>("invoices", invoice);
      existingInvoices.push(invoice);

      // Advance next_invoice_date
      const nextDate = addFrequencyInterval(sch.next_invoice_date, sch.frequency);

      // Check end_date
      const shouldDeactivate = sch.end_date && nextDate > sch.end_date;

      await sb()
        .from("invoice_schedules")
        .update({
          next_invoice_date:   nextDate,
          invoices_generated:  (sch.invoices_generated ?? 0) + 1,
          last_generated_at:   new Date().toISOString(),
          ...(shouldDeactivate ? { active: false } : {}),
        })
        .eq("id", sch.id);

      generated++;
    } catch (err) {
      console.error(`[schedule:generate] Failed for schedule ${sch.id}:`, err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ generated });
}
