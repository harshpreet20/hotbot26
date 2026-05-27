/**
 * Admin view of portal-submitted task requests for a specific client.
 * Portal tasks live in the `tasks` table (distinct from CRM `crm_tasks`).
 */
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clientId } = await params;

  const { data, error } = await sb()
    .from("tasks")
    .select("id, title, description, status, priority, due_date, assigned_to, requester_name, requester_email, client_email, source, created_at, updated_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await params; // clientId not needed for this op

  const { taskId, status, assigned_to } = await req.json() as {
    taskId?: string;
    status?: string;
    assigned_to?: string;
  };
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status)      updates.status      = status;
  if (assigned_to !== undefined) updates.assigned_to = assigned_to;

  const { data, error } = await sb()
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request: data });
}
