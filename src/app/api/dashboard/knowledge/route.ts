/**
 * AI Knowledge Base API — requires bearer auth.
 * GET    /api/dashboard/knowledge         list all knowledge entries
 * POST   /api/dashboard/knowledge         create a new entry
 * PATCH  /api/dashboard/knowledge         update an entry
 * DELETE /api/dashboard/knowledge?id=     delete an entry
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { insert, readAll, updateById, removeById } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { KnowledgeEntry } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await readAll<KnowledgeEntry>("ai_knowledge_base");
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const limited = await rateLimitResponse(ip, "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json() as {
    title?: string;
    content?: string;
    category?: string;
    active?: boolean;
    priority?: number;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const entry: KnowledgeEntry = {
    id:         crypto.randomUUID(),
    title:      body.title.trim(),
    content:    body.content.trim(),
    category:   body.category?.trim() || undefined,
    active:     body.active ?? true,
    priority:   body.priority ?? 10,
    createdBy:  session.username,
    createdAt:  now,
    updatedAt:  now,
  };

  try {
    await insert<KnowledgeEntry>("ai_knowledge_base", entry);
  } catch (err) {
    console.error("[knowledge] insert error:", err);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
  return NextResponse.json({ entry }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const limited = await rateLimitResponse(ip, "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json() as {
    id?: string;
    title?: string;
    content?: string;
    category?: string;
    active?: boolean;
    priority?: number;
  };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const entries = await readAll<KnowledgeEntry>("ai_knowledge_base");
  if (!entries.find((e) => e.id === body.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const update: Partial<KnowledgeEntry> = { updatedAt: new Date().toISOString() };
  if (body.title    !== undefined) update.title    = body.title.trim();
  if (body.content  !== undefined) update.content  = body.content.trim();
  if (body.category !== undefined) update.category = body.category?.trim() || undefined;
  if (body.active   !== undefined) update.active   = body.active;
  if (body.priority !== undefined) update.priority = body.priority;

  try {
    await updateById<KnowledgeEntry>("ai_knowledge_base", body.id, update);
  } catch (err) {
    console.error("[knowledge] update error:", err);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized or insufficient permissions" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const limited = await rateLimitResponse(ip, "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const entries = await readAll<KnowledgeEntry>("ai_knowledge_base");
  if (!entries.find((e) => e.id === id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await removeById("ai_knowledge_base", id);
  } catch (err) {
    console.error("[knowledge] delete error:", err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
