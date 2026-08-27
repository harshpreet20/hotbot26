import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll, updateById, newId } from "@/lib/store";
import type { PortalDocument, DocumentComment, DocumentSuggestion, DocumentSignature } from "@/app/api/dashboard/documents/route";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const all = await readAll<PortalDocument>("documents");
  const docs = all.filter(d =>
    (d.clientId === user.clientRef || d.clientId === user.clientId || d.clientEmail === user.email)
    && d.status !== "draft"
  );

  if (id) {
    const doc = docs.find(d => d.id === id);
    return doc ? NextResponse.json({ document: doc }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ documents: docs });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    id: string;
    action: "comment" | "suggest" | "sign";
    text?: string;
    originalText?: string;
    suggestedText?: string;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<PortalDocument>("documents");
  const existing = all.find(d =>
    d.id === body.id &&
    (d.clientId === user.clientRef || d.clientId === user.clientId || d.clientEmail === user.email) &&
    d.status !== "draft"
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.status === "signed" && body.action !== "comment") {
    return NextResponse.json({ error: "Document is already signed" }, { status: 409 });
  }

  const now = new Date().toISOString();
  let updated: PortalDocument = { ...existing, updatedAt: now };

  if (body.action === "comment") {
    if (!body.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
    const comment: DocumentComment = {
      id: newId(), author: user.name || user.email, text: body.text.trim(), createdAt: now,
    };
    updated.comments = [...existing.comments, comment];

  } else if (body.action === "suggest") {
    if (!body.originalText || !body.suggestedText) return NextResponse.json({ error: "originalText and suggestedText required" }, { status: 400 });
    const suggestion: DocumentSuggestion = {
      id: newId(), author: user.name || user.email,
      originalText: body.originalText, suggestedText: body.suggestedText,
      status: "pending", createdAt: now,
    };
    updated.suggestions = [...existing.suggestions, suggestion];

  } else if (body.action === "sign") {
    const alreadySigned = existing.signatures.some(s => s.signerEmail === user.email);
    if (alreadySigned) return NextResponse.json({ error: "Already signed" }, { status: 409 });
    const signature: DocumentSignature = {
      id: newId(), signerName: user.name || user.email, signerEmail: user.email, signedAt: now,
    };
    updated.signatures = [...existing.signatures, signature];
    updated.status = "signed";
  }

  await updateById<PortalDocument>("documents", body.id, updated);
  return NextResponse.json({ document: updated });
}
