/**
 * Projects API — requires bearer auth.
 * GET    /api/dashboard/projects           list all projects (optional ?clientId= filter)
 * POST   /api/dashboard/projects           create a new project
 * PATCH  /api/dashboard/projects           update a project by id
 * DELETE /api/dashboard/projects?id=       delete a project (admin/super_admin only)
 *
 * CRITICAL: projects.client_id is a FK → clients.client_id (text like "HBS-XXXXX")
 * We validate that client_id exists before insert to surface a clear error.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny, authorizeAdmin } from "@/lib/dashboardAuth";
import { sb, isSupabaseEnabled } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

export type ProjectStatus   = "discovery" | "planning" | "in_progress" | "review" | "done";
export type ProjectStage    = "discovery" | "planning" | "design" | "development" | "testing" | "launch" | "maintenance";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: string;
  project_number?: string | null;
  client_id: string;          // FK → clients.client_id  e.g. "HBS-NKG39"
  name: string;
  description?: string | null;
  status: ProjectStatus;
  stage: ProjectStage;
  priority: ProjectPriority;
  progress: number;
  start_date?: string | null;
  target_date?: string | null;
  completed_date?: string | null;
  assigned_to?: string[] | null;
  account_manager?: string | null;
  budget?: number | null;
  currency: string;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Validate that a client_id exists in the clients table. */
async function clientExists(clientId: string): Promise<boolean> {
  if (!isSupabaseEnabled()) return true; // skip in local dev
  const { data, error } = await sb()
    .from("clients")
    .select("client_id")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw new Error(`client lookup failed: ${error.message}`);
  return data !== null;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager", "sales", "crm_operator", "finance"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientId = new URL(req.url).searchParams.get("clientId");

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ projects: [] });
  }

  let query = sb()
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[projects] GET error:", error.message);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }

  return NextResponse.json({ projects: data ?? [] });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    name?: string;
    client_id?: string;
    description?: string;
    status?: ProjectStatus;
    stage?: ProjectStage;
    priority?: ProjectPriority;
    progress?: number;
    start_date?: string;
    target_date?: string;
    assigned_to?: string[];
    account_manager?: string;
    budget?: number;
    currency?: string;
    tags?: string[];
    project_number?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }
  if (!body.client_id?.trim()) {
    return NextResponse.json({ error: "client_id is required (e.g. HBS-XXXXX)" }, { status: 400 });
  }

  // ── FK safety check ──────────────────────────────────────────────────────
  try {
    const exists = await clientExists(body.client_id.trim());
    if (!exists) {
      return NextResponse.json(
        { error: `No client found with client_id "${body.client_id}". Make sure you're using the HBS-XXXXX ID from the Clients page, not the internal UUID.` },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("[projects] client lookup error:", err);
    return NextResponse.json({ error: "Failed to validate client_id" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const row: Omit<Project, "id"> = {
    project_number:  body.project_number?.trim() ?? null,
    client_id:       body.client_id.trim(),
    name:            body.name.trim(),
    description:     body.description?.trim() ?? null,
    status:          body.status     ?? "discovery",
    stage:           body.stage      ?? "discovery",
    priority:        body.priority   ?? "medium",
    progress:        body.progress   ?? 0,
    start_date:      body.start_date  ?? null,
    target_date:     body.target_date ?? null,
    assigned_to:     body.assigned_to ?? null,
    account_manager: body.account_manager?.trim() ?? null,
    budget:          body.budget   ?? null,
    currency:        body.currency ?? "INR",
    tags:            body.tags     ?? null,
    created_by:      session.username,
    created_at:      now,
    updated_at:      now,
  };

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await sb().from("projects").insert(row).select().single();
  if (error) {
    console.error("[projects] POST error:", error.message);
    // Surface FK errors clearly
    if (error.message.includes("projects_client_id_fkey")) {
      return NextResponse.json(
        { error: `FK violation: client_id "${body.client_id}" not found in clients table.` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["super_admin", "admin", "manager"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Partial<Project> & { id?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { id, ...rest } = body;

  // If client_id is being changed, validate FK
  if (rest.client_id) {
    try {
      const exists = await clientExists(rest.client_id);
      if (!exists) {
        return NextResponse.json(
          { error: `No client found with client_id "${rest.client_id}".` },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Failed to validate client_id" }, { status: 500 });
    }
  }

  const update: Record<string, unknown> = { ...rest, updated_at: new Date().toISOString() };

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { error } = await sb().from("projects").update(update).eq("id", id);
  if (error) {
    console.error("[projects] PATCH error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized or insufficient permissions" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { error } = await sb().from("projects").delete().eq("id", id);
  if (error) {
    console.error("[projects] DELETE error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
