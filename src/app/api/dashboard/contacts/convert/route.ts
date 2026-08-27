import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Contact, Lead } from "@/types/dashboard";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(getIp(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["super_admin", "admin", "manager", "sales", "crm_operator"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let contactId: string | undefined;
  try {
    const body = await req.json() as { contactId?: string };
    contactId = body.contactId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!contactId) {
    return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
  }

  const contacts = await readAll<Contact>("contacts");
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const lead: Lead = {
    id: newId(),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: "",
    service: "Inbound Contact",
    budget: "",
    message: contact.message || contact.subject || "",
    formType: "contact-conversion",
    source: contact.source || "contacts-to-leads",
    ip: "",
    createdAt: new Date().toISOString(),
    status: "new",
    notes: `Converted from contact message (${contact.createdAt}). Original subject: ${contact.subject || "N/A"}`,
  };

  try {
    await insert<Lead>("leads", lead);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[contacts/convert] insert error:", msg);
    return NextResponse.json({ error: "Failed to create lead." }, { status: 500 });
  }

  return NextResponse.json({ lead: { id: lead.id, name: lead.name } });
}
