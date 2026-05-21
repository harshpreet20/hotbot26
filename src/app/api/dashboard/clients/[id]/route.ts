/**
 * GET /api/dashboard/clients/[id]
 * Returns a single client record by internal UUID id.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import type { Client } from "@/types/dashboard";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager", "sales", "crm_operator"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  // Try to find by internal UUID first, then by clientId
  const clients = await readAll<Client>("clients");
  const client = clients.find((c) => c.id === id || c.clientId === id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Also fetch portal user status from client_users table
  let portalUser = null;
  if (isSupabaseEnabled()) {
    const { data } = await sb()
      .from("client_users")
      .select("id, email, name, role, invite_accepted_at, invite_token, invite_expires_at, is_active, created_at")
      .eq("client_id", client.clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    portalUser = data ?? null;
  }

  return NextResponse.json({ client, portalUser });
}
