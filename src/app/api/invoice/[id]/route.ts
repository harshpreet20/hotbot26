import { NextRequest, NextResponse } from "next/server";
import { readAll } from "@/lib/store";
import type { Invoice } from "@/types/dashboard";

/**
 * Public endpoint - no auth required.
 * Returns a sanitized invoice by ID for client-facing sharing / preview.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoices = await readAll<Invoice>("invoices");
  const inv = invoices.find((i) => i.id === id);
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip internal-only fields before sending to public
  const { createdBy, lastUpdatedBy, leadId, ...safe } = inv;
  void createdBy; void lastUpdatedBy; void leadId;

  return NextResponse.json({ invoice: safe });
}
