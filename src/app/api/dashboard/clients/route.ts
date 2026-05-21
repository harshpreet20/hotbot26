/**
 * Admin clients API — requires bearer auth.
 * GET    /api/dashboard/clients         list all clients
 * POST   /api/dashboard/clients         create a new client
 * PATCH  /api/dashboard/clients         update a client (status, name, notes, etc.)
 * DELETE /api/dashboard/clients?id=     delete a client
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny, authorizeAdmin } from "@/lib/dashboardAuth";
import { insert, readAll, updateById, removeById, newId } from "@/lib/store";
import type { Client, ClientStatus, OnboardingStage, SubscriptionStatus } from "@/types/dashboard";
import crypto from "crypto";

function generateClientId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "HBS-";
  for (let i = 0; i < 5; i++) {
    result += chars[crypto.randomInt(chars.length)];
  }
  return result;
}

async function uniqueClientId(): Promise<string> {
  const all = await readAll<Client>("clients");
  const existing = new Set(all.map((c) => c.clientId));
  let id = generateClientId();
  let attempts = 0;
  while (existing.has(id) && attempts++ < 20) {
    id = generateClientId();
  }
  return id;
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager", "sales", "crm_operator"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clients = await readAll<Client>("clients");
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager", "sales"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: ClientStatus;
    notes?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const client: Client = {
    id:        newId(),
    clientId:  await uniqueClientId(),
    name:      body.name.trim(),
    email:     body.email?.trim() ?? "",
    phone:     body.phone?.trim() ?? "",
    company:   body.company?.trim() ?? "",
    status:    body.status ?? "active",
    notes:     body.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await insert<Client>("clients", client);
  return NextResponse.json({ client }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager", "sales", "crm_operator"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: ClientStatus;
    notes?: string;
    onboardingStage?: OnboardingStage;
    accountManager?: string;
    portalEnabled?: boolean;
    portalInviteSentAt?: string;
    subscriptionStatus?: SubscriptionStatus;
    industry?: string;
    website?: string;
    address?: string;
    tags?: string[];
    clientType?: string;
  };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: Partial<Client> = { updatedAt: new Date().toISOString() };
  if (body.name               !== undefined) update.name               = body.name.trim();
  if (body.email              !== undefined) update.email              = body.email.trim();
  if (body.phone              !== undefined) update.phone              = body.phone.trim();
  if (body.company            !== undefined) update.company            = body.company.trim();
  if (body.status             !== undefined) update.status             = body.status;
  if (body.notes              !== undefined) update.notes              = body.notes.trim();
  if (body.onboardingStage    !== undefined) update.onboardingStage    = body.onboardingStage;
  if (body.accountManager     !== undefined) update.accountManager     = body.accountManager;
  if (body.portalEnabled      !== undefined) update.portalEnabled      = body.portalEnabled;
  if (body.portalInviteSentAt !== undefined) update.portalInviteSentAt = body.portalInviteSentAt;
  if (body.subscriptionStatus !== undefined) update.subscriptionStatus = body.subscriptionStatus;
  if (body.industry           !== undefined) update.industry           = body.industry;
  if (body.website            !== undefined) update.website            = body.website;
  if (body.address            !== undefined) update.address            = body.address;
  if (body.tags               !== undefined) update.tags               = body.tags;
  if (body.clientType         !== undefined) update.clientType         = body.clientType;

  await updateById<Client>("clients", body.id, update);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized or insufficient permissions" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await removeById("clients", id);
  return NextResponse.json({ success: true });
}
