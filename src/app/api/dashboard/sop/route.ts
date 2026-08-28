import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";
import type { ProjectSOP } from "@/types/dashboard";
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ROLES = ["super_admin", "admin", "manager"];

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
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
  const limited = await rateLimitResponse(ip(req), "sop-generate", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const session = await requireAuth(req);
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
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: `You are an expert project manager and ISO-certified technical writer at a professional services agency. Generate a Standard Operating Procedure (SOP) in markdown format that follows ISO 9001 documentation standards.

REQUIRED STRUCTURE — use exactly these section headers and markers:

---
**Document ID:** SOP-[AUTO]
**Version:** v1.0
**Date:** [DATE]
**Prepared By:** [AUTHOR]
**Approved By:** [APPROVER]
**Review Date:** [REVIEW DATE - 12 months from date]
---

## 1. Purpose
[Single paragraph stating why this SOP exists]

## 2. Scope
[Who this applies to, what systems/processes are covered]

## 3. Definitions
[Key terms and abbreviations used in this document]

## 4. Responsibilities
| Role | Responsibility |
|------|---------------|
| [ROLE 1] | [RESPONSIBILITY] |

## 5. Prerequisites
- [Prerequisite 1]

## 6. Procedure
### 6.1 [Phase Name]
1. [Step]
   **Owner:** [ROLE]
   **Duration:** [TIME]
   **Output:** [DELIVERABLE]

## 7. Success Criteria
- [ ] [Criterion 1]

## 8. References
- [Reference 1]

## 9. Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | [DATE] | [AUTHOR] | Initial release |

Use [PLACEHOLDER] markers wherever specific names/dates/values should be filled in by the human. Fill in all content from the brief — never leave sections empty. Write professional, precise language.`,
        messages: [{ role: "user", content: `Write a comprehensive SOP for the following project brief:\n\n${body.brief}\n\nProject title: ${body.title || "Project SOP"}` }],
      });
      content = msg.content[0].type === "text" ? msg.content[0].text : "";
    } catch (err) {
      console.error("[sop] Anthropic generation failed:", err instanceof Error ? err.message : err);
      content = `# ${body.title || "Project SOP"}\n\n> ⚠️ AI generation failed — please fill in the template manually.\n\n---\n**Document ID:** SOP-[AUTO]\n**Version:** v1.0\n**Date:** [DATE]\n**Prepared By:** [AUTHOR]\n**Approved By:** [APPROVER]\n**Review Date:** [DATE + 12 months]\n---\n\n## 1. Purpose\n[Why this SOP exists]\n\n## 2. Scope\n[Who and what this covers]\n\n## 3. Definitions\n[Key terms]\n\n## 4. Responsibilities\n| Role | Responsibility |\n|------|---------------|\n| [ROLE] | [RESPONSIBILITY] |\n\n## 5. Prerequisites\n- [Prerequisite]\n\n## 6. Procedure\n### 6.1 [Phase]\n1. [Step] — **Owner:** [ROLE] **Duration:** [TIME]\n\n## 7. Success Criteria\n- [ ] [Criterion]\n\n## 8. References\n- [Reference]\n\n## 9. Change Log\n| Version | Date | Author | Changes |\n|---------|------|--------|---------|\n| v1.0 | [DATE] | [AUTHOR] | Initial release |\n\n---\n## Brief\n${body.brief}`;
    }
  } else {
    content = `# ${body.title || "Project SOP"}\n\n> ⚠️ AI generation unavailable — ANTHROPIC_API_KEY not configured. Fill in the template below.\n\n---\n**Document ID:** SOP-[AUTO]\n**Version:** v1.0\n**Date:** [DATE]\n**Prepared By:** [AUTHOR]\n**Approved By:** [APPROVER]\n**Review Date:** [DATE + 12 months]\n---\n\n## 1. Purpose\n[Why this SOP exists]\n\n## 2. Scope\n[Who and what this covers]\n\n## 3. Definitions\n[Key terms]\n\n## 4. Responsibilities\n| Role | Responsibility |\n|------|---------------|\n| [ROLE] | [RESPONSIBILITY] |\n\n## 5. Prerequisites\n- [Prerequisite]\n\n## 6. Procedure\n### 6.1 [Phase]\n1. [Step] — **Owner:** [ROLE] **Duration:** [TIME]\n\n## 7. Success Criteria\n- [ ] [Criterion]\n\n## 8. References\n- [Reference]\n\n## 9. Change Log\n| Version | Date | Author | Changes |\n|---------|------|--------|---------|\n| v1.0 | [DATE] | [AUTHOR] | Initial release |\n\n---\n## Brief\n${body.brief}`;
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
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await requireAuth(req);
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
  const session = await requireAuth(req);
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
