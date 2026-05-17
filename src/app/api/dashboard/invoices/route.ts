import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Invoice, InvoiceLineItem } from "@/types/dashboard";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

function getNextInvoiceNumber(invoices: Invoice[]): string {
  const nums = invoices
    .map((inv) => parseInt(inv.invoiceNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

function calcTotals(lineItems: InvoiceLineItem[], taxRate: number, discount: number) {
  const subtotal  = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxAmount = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal - discount + taxAmount).toFixed(2));
  return { subtotal, taxAmount, total };
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await readAll<Invoice>("invoices");
  const leadId   = new URL(req.url).searchParams.get("leadId");
  return NextResponse.json({ invoices: leadId ? invoices.filter((inv) => inv.leadId === leadId) : invoices });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "finance"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body     = await req.json() as Partial<Invoice>;
  const invoices = await readAll<Invoice>("invoices");

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

  try {
    await insert<Invoice>("invoices", invoice);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[invoices] insert error:", msg);
    return NextResponse.json({ error: "Failed to create invoice. Database error." }, { status: 500 });
  }
  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "finance"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Partial<Invoice> & { id: string };
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoices = await readAll<Invoice>("invoices");
  const existing = invoices.find((inv) => inv.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    id:            body.id,
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

  await updateById<Invoice>("invoices", body.id, updated);
  return NextResponse.json({ invoice: updated });
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoices = await readAll<Invoice>("invoices");
  if (!invoices.find((inv) => inv.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await removeById("invoices", id);
  return NextResponse.json({ ok: true });
}
