/**
 * GET   /api/dashboard/automations        — list all automations
 * POST  /api/dashboard/automations        — create new automation
 * PATCH /api/dashboard/automations        — toggle active { id, active } or full update
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimitResponse } from "@/lib/rateLimit";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeRole(extractToken(req), "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ automations: [] });

  const { data, error } = await sb()
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ automations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json() as {
    name: string;
    trigger: string;
    action: string;
    config?: Record<string, unknown>;
    active?: boolean;
  };

  if (!body.name || !body.trigger || !body.action) {
    return NextResponse.json({ error: "name, trigger, and action are required" }, { status: 400 });
  }

  const record = {
    name:       body.name,
    trigger:    body.trigger,
    action:     body.action,
    config:     body.config ?? {},
    active:     body.active ?? true,
    created_at: new Date().toISOString(),
    created_by: session.username,
  };

  const { data, error } = await sb()
    .from("automations")
    .insert(record)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ automation: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeRole(extractToken(req), "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json() as { id: string; active?: boolean; name?: string; trigger?: string; action?: string; config?: Record<string, unknown> };

  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Build update object from provided fields
  const update: Record<string, unknown> = {};
  if (body.active !== undefined) update.active = body.active;
  if (body.name !== undefined) update.name = body.name;
  if (body.trigger !== undefined) update.trigger = body.trigger;
  if (body.action !== undefined) update.action = body.action;
  if (body.config !== undefined) update.config = body.config;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("automations")
    .update(update)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ automation: data });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeRole(extractToken(req), "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await sb()
    .from("automations")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
