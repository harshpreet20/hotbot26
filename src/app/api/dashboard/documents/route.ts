import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, updateById, removeById, newId } from "@/lib/store";
import { rateLimitResponse } from "@/lib/rateLimit";

export interface DocumentComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface DocumentSuggestion {
  id: string;
  author: string;
  originalText: string;
  suggestedText: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface DocumentSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
}

export interface PortalDocument {
  id: string;
  title: string;
  type: "proposal" | "contract";
  status: "draft" | "sent" | "signed" | "declined";
  content: string;
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  comments: DocumentComment[];
  suggestions: DocumentSuggestion[];
  signatures: DocumentSignature[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const id       = searchParams.get("id");

  let docs = await readAll<PortalDocument>("documents");
  if (id) {
    const doc = docs.find(d => d.id === id);
    return doc ? NextResponse.json({ document: doc }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const projectId = searchParams.get("projectId");
  if (clientId) docs = docs.filter(d => d.clientId === clientId || d.clientEmail === clientId);
  if (projectId) docs = docs.filter(d => (d as { projectId?: string }).projectId === projectId);

  return NextResponse.json({ documents: docs });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<PortalDocument>;
  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!body.clientId?.trim()) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const now = new Date().toISOString();
  const doc: PortalDocument & { projectId?: string } = {
    id:          newId(),
    title:       body.title.trim(),
    type:        body.type ?? "proposal",
    status:      "draft",
    content:     body.content ?? "",
    clientId:    body.clientId.trim(),
    clientEmail: body.clientEmail?.trim(),
    clientName:  body.clientName?.trim(),
    projectId:   (body as { projectId?: string }).projectId,
    comments:    [],
    suggestions: [],
    signatures:  [],
    createdBy:   session.username,
    createdAt:   now,
    updatedAt:   now,
  };

  await insert<PortalDocument>("documents", doc);
  return NextResponse.json({ document: doc }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<PortalDocument> & { id: string; action?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<PortalDocument>("documents");
  const existing = all.find(d => d.id === body.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let updated: PortalDocument = { ...existing, updatedAt: new Date().toISOString() };

  if (body.action === "accept-suggestion" && body.suggestions) {
    const sid = (body as { suggestionId?: string }).suggestionId as string | undefined;
    updated.suggestions = existing.suggestions.map(s =>
      s.id === sid ? { ...s, status: "accepted" as const } : s
    );
    if (sid) {
      const sugg = existing.suggestions.find(s => s.id === sid);
      if (sugg) updated.content = existing.content.replace(sugg.originalText, sugg.suggestedText);
    }
  } else if (body.action === "reject-suggestion") {
    const sid = (body as { suggestionId?: string }).suggestionId as string | undefined;
    updated.suggestions = existing.suggestions.map(s =>
      s.id === sid ? { ...s, status: "rejected" as const } : s
    );
  } else {
    if (body.title)   updated.title   = body.title;
    if (body.content !== undefined) updated.content = body.content;
    if (body.status)  updated.status  = body.status;
    if (body.clientEmail) updated.clientEmail = body.clientEmail;
    if (body.clientName)  updated.clientName  = body.clientName;
  }

  await updateById<PortalDocument>("documents", body.id, updated);
  return NextResponse.json({ document: updated });
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-writes", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await removeById("documents", id);
  return NextResponse.json({ ok: true });
}
