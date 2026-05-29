import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { Project } from "@/types/dashboard";

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status   = searchParams.get("status");

  let projects = await readAll<Project>("projects");
  if (clientId) projects = projects.filter((p) => p.clientId === clientId);
  if (status)   projects = projects.filter((p) => p.status === status);

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<Project>;
  if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!body.clientId)     return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const now = new Date().toISOString();
  const project: Project = {
    id:          newId(),
    name:        body.name.trim(),
    description: body.description?.trim(),
    clientId:    body.clientId,
    clientEmail: body.clientEmail,
    clientName:  body.clientName,
    status:      body.status ?? "planning",
    startDate:   body.startDate,
    endDate:     body.endDate,
    color:       body.color ?? "#6366f1",
    budget:      body.budget,
    currency:    body.currency ?? "USD",
    tags:        body.tags ?? [],
    createdBy:   session.username,
    createdAt:   now,
    updatedAt:   now,
  };

  // Supabase projects table uses auto-generated UUID — omit our text id
  const { id: _id, ...projectWithoutId } = project;
  await insert<Omit<Project, "id">>("projects", projectWithoutId);
  // Re-fetch to get the Supabase-generated UUID so callers don't get a stale local id
  const all = await readAll<Project>("projects");
  const saved = all.find(p => p.createdBy === session.username && p.createdAt === now) ?? project;
  return NextResponse.json({ project: saved }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<Project> & { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<Project>("projects");
  const existing = all.find((p) => p.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Project = {
    ...existing,
    name:        body.name?.trim()        ?? existing.name,
    description: body.description         ?? existing.description,
    status:      body.status              ?? existing.status,
    startDate:   body.startDate           ?? existing.startDate,
    endDate:     body.endDate             ?? existing.endDate,
    color:       body.color               ?? existing.color,
    budget:      body.budget              ?? existing.budget,
    currency:    body.currency            ?? existing.currency,
    tags:        body.tags                ?? existing.tags,
    updatedAt:   new Date().toISOString(),
  };

  await updateById<Project>("projects", body.id, updated);
  return NextResponse.json({ project: updated });
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await removeById("projects", id);
  return NextResponse.json({ ok: true });
}
