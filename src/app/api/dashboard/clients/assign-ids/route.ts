/**
 * POST /api/dashboard/clients/assign-ids
 * One-time migration: back-fills clientId for any client that lacks one.
 * Assigns sequential HOT-XXXX IDs starting at HOT-1001.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { readAll, updateById } from "@/lib/store";
import type { Client } from "@/types/dashboard";

export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized or insufficient permissions" }, { status: 401 });

  const all = await readAll<Client>("clients");

  // Sort by createdAt ascending so earliest clients get lowest IDs
  const missing = all
    .filter((c) => !c.clientId || c.clientId.trim() === "")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (missing.length === 0) {
    return NextResponse.json({ assigned: 0, message: "All clients already have IDs." });
  }

  // Determine the highest existing HOT-XXXX number to avoid collisions
  const existingNums = all
    .filter((c) => c.clientId && /^HOT-\d{4,}$/.test(c.clientId))
    .map((c) => parseInt(c.clientId.replace("HOT-", ""), 10))
    .filter((n) => !isNaN(n));

  let counter = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1001;

  let assigned = 0;
  for (const client of missing) {
    const newClientId = `HOT-${counter++}`;
    await updateById<Client>("clients", client.id, { clientId: newClientId, updatedAt: new Date().toISOString() });
    assigned++;
  }

  return NextResponse.json({ assigned, message: `Assigned ${assigned} client ID(s).` });
}
