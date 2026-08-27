/**
 * Public client verification endpoint.
 * POST /api/clients/verify  { clientId: string }
 * Returns { valid: boolean, clientName?: string, status?: string }
 *
 * Any client in the DB (active, old, reactivation_needed) is considered valid
 * for ticket submission — they have been or are a HotBot Studios client.
 */
import { NextRequest, NextResponse } from "next/server";
import { readAll } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Client } from "@/types/dashboard";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const limited = await rateLimitResponse(ip, "client-verify", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json().catch(() => ({})) as { clientId?: string };
  const raw = (body.clientId ?? "").trim().toUpperCase();

  if (!raw) return NextResponse.json({ valid: false });

  const clients = await readAll<Client>("clients");
  const match = clients.find((c) => c.clientId.toUpperCase() === raw);

  if (!match) return NextResponse.json({ valid: false });

  return NextResponse.json({
    valid:      true,
    clientName: match.name,
    status:     match.status,
  });
}
