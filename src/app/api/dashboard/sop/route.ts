import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { ProjectSOP } from "@/types/dashboard";
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ROLES = ["super_admin", "admin", "manager"];

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const id        = searchParams.get("id");

  try {
    let sops = await readAll<ProjectSOP>("project_sops");
    if (id)        sops = sops.filter(s => s.id === id);
    if (projectId) sops = sops.filter(s => s.projectId === projectId);
    return NextResponse.json({ sops });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve SOPs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "sop-generate", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { projectId: string; clientId: string; title: string; brief: string };
  if (!body.projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  if (!body.brief?.trim()) return NextResponse.json({ error: "brief required" }, { status: 400 });

  let content = "";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const msg = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        system: "You are an expert project manager and technical writer. Generate a clear, structured Standard Operating Procedure (SOP) in markdown format. Include: numbered steps, clearly defined responsibilities, success criteria, prerequisites, and any relevant warnings or notes. Use professional language appropriate for a client-facing document.",
        messages: [{ role: "user", content: `Write a comprehensive SOP for the following project brief:\n\n${body.brief}\n\nProject title: ${body.title || "Project SOP"}` }],
      });
      content = msg.content[0].type === "text" ? msg.content[0].text : "";
    } catch {
      return NextResponse.json({ error: "AI generation failed. Please try again or write manually." }, { status: 502 });
    }
  } else {
    content = `# ${body.title || "Project SOP"}\n\n*AI generation unavailable — ANTHROPIC_API_KEY not configured.*\n\n## Brief\n\n${body.brief}\n\n## Steps\n\n1. \n2. \n3. `;
  }

  const now = new Date().toISOString();
  const sop: ProjectSOP = {
    id:          newId(),
    projectId:   body.projectId,
    clientId:    body.clientId ?? "",
    title:       body.title?.trim() || "Project SOP",
    brief:       body.brief,
    content,
    createdBy:   session.username,
    createdAt:   now,
    updatedAt:   now,
  };

  try {
    await insert<ProjectSOP>("project_sops", sop);
  } catch {
    return NextResponse.json({ error: "Failed to save SOP" }, { status: 500 });
  }

  return NextResponse.json({ sop }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { id: string; title?: string; content?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const all = await readAll<ProjectSOP>("project_sops");
    const existing = all.find(s => s.id === body.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated: ProjectSOP = {
      ...existing,
      title:        body.title?.trim()       ?? existing.title,
      content:      body.content             ?? existing.content,
      lastEditedBy: session.username,
      updatedAt:    new Date().toISOString(),
    };

    await updateById<ProjectSOP>("project_sops", body.id, updated);
    return NextResponse.json({ sop: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update SOP" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await removeById("project_sops", id);
  } catch {
    return NextResponse.json({ error: "Failed to delete SOP" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
