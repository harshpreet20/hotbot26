import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, writeAll, prepend, newId } from "@/lib/store";
import type { Invoice, InvoiceLineItem } from "@/types/dashboard";

function getNextInvoiceNumber(invoices: Invoice[]): string {
  const nums = invoices
    .map((inv) => parseInt(inv.invoiceNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

function calcTotals(
  lineItems: InvoiceLineItem[],
  taxRate: number,
  discount: number
) {
  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - discount + taxAmount).toFixed(2));
  return { subtotal, taxAmount, total };
}

export async function GET(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = readAll<Invoice>("invoices");
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  const filtered = leadId ? invoices.filter((inv) => inv.leadId === leadId) : invoices;
  return NextResponse.json({ invoices: filtered });
}

export async function POST(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Partial<Invoice>;
  const invoices = readAll<Invoice>("invoices");

  const lineItems: InvoiceLineItem[] = (body.lineItems ?? []).map((li) => ({
    id:          li.id ?? newId(),
    description: li.description ?? "",
    quantity:    Number(li.quantity)  || 0,
    unitPrice:   Number(li.unitPrice) || 0,
    amount:      Number(li.quantity)  * Number(li.unitPrice),
  }));

  const taxRate  = Number(body.taxRate)  || 0;
  const discount = Number(body.discount) || 0;
  const { subtotal, taxAmount, total } = calcTotals(lineItems, taxRate, discount);

  const invoice: Invoice = {
    id:            newId(),
    invoiceNumber: getNextInvoiceNumber(invoices),
    status:        body.status        ?? "draft",
    clientName:    body.clientName    ?? "",
    clientEmail:   body.clientEmail   ?? "",
    clientPhone:   body.clientPhone,
    clientCompany: body.clientCompany,
    clientAddress: body.clientAddress,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total,
    currency:      body.currency   ?? "INR",
    issuedDate:    body.issuedDate ?? new Date().toISOString().split("T")[0],
    dueDate:       body.dueDate    ?? "",
    paidDate:      body.paidDate,
    notes:         body.notes,
    terms:         body.terms,
    createdAt:     new Date().toISOString(),
    createdBy:     session.username,
    leadId:        body.leadId,
  };

  prepend<Invoice>("invoices", invoice);
  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json() as Partial<Invoice> & { id: string };
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoices = readAll<Invoice>("invoices");
  const idx = invoices.findIndex((inv) => inv.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = invoices[idx];
  const lineItems = body.lineItems
    ? body.lineItems.map((li) => ({
        id:          li.id ?? newId(),
        description: li.description ?? "",
        quantity:    Number(li.quantity)  || 0,
        unitPrice:   Number(li.unitPrice) || 0,
        amount:      Number(li.quantity)  * Number(li.unitPrice),
      }))
    : existing.lineItems;

  const taxRate  = body.taxRate  !== undefined ? Number(body.taxRate)  : existing.taxRate;
  const discount = body.discount !== undefined ? Number(body.discount) : existing.discount;
  const { subtotal, taxAmount, total } = calcTotals(lineItems, taxRate, discount);

  const updated: Invoice = {
    ...existing,
    ...body,
    id,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: session.username,
    paidDate: body.status === "paid" && !existing.paidDate
      ? new Date().toISOString().split("T")[0]
      : (body.paidDate ?? existing.paidDate),
  };

  invoices[idx] = updated;
  writeAll<Invoice>("invoices", invoices);
  return NextResponse.json({ invoice: updated });
}

export async function DELETE(req: NextRequest) {
  const session = authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoices = readAll<Invoice>("invoices");
  const filtered = invoices.filter((inv) => inv.id !== id);
  if (filtered.length === invoices.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  writeAll<Invoice>("invoices", filtered);
  return NextResponse.json({ ok: true });
}
