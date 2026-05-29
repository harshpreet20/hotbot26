import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, removeById, newId } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimitResponse } from "@/lib/rateLimit";

interface ClientResource {
  id: string;
  clientId: string;
  projectId?: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category?: string;
  uploadedBy: string;
  uploadedByType: "admin" | "client";
  visibility: "both" | "admin_only";
  createdAt: string;
}

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId  = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");

  let files = await readAll<ClientResource>("client_resources");
  if (clientId)  files = files.filter(f => f.clientId === clientId);
  if (projectId) files = files.filter(f => f.projectId === projectId);

  return NextResponse.json({ files });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-uploads", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file      = formData.get("file") as File | null;
  const clientId  = formData.get("clientId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const category  = (formData.get("category") as string | null) ?? "general";

  if (!file)     return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const id       = newId();
  const ext      = file.name.split(".").pop() ?? "";
  const path     = `${clientId}/${id}${ext ? `.${ext}` : ""}`;
  let   fileUrl  = "";

  if (isSupabaseEnabled()) {
    const bytes = await file.arrayBuffer();
    const { data, error } = await sb().storage
      .from("client-files")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data: urlData } = sb().storage.from("client-files").getPublicUrl(data.path);
    fileUrl = urlData.publicUrl;
  } else {
    fileUrl = `/api/dashboard/files/${id}`;
  }

  const resource: ClientResource = {
    id,
    clientId,
    projectId: projectId ?? undefined,
    name:         file.name,
    fileUrl,
    fileName:     file.name,
    fileSize:     file.size,
    mimeType:     file.type,
    category,
    uploadedBy:   session.username,
    uploadedByType: "admin",
    visibility:   "both",
    createdAt:    new Date().toISOString(),
  };

  if (isSupabaseEnabled()) {
    const { error } = await sb().from("client_resources").insert({
      id:               resource.id,
      client_id:        resource.clientId,
      project_id:       resource.projectId ?? null,
      name:             resource.name,
      file_url:         resource.fileUrl,
      file_name:        resource.fileName,
      file_size:        resource.fileSize,
      mime_type:        resource.mimeType,
      category:         resource.category,
      uploaded_by:      resource.uploadedBy,
      uploaded_by_type: resource.uploadedByType,
      visibility:       resource.visibility,
      created_at:       resource.createdAt,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: resource }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-uploads", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<ClientResource>("client_resources");
  const existing = all.find(f => f.id === id);

  if (existing && isSupabaseEnabled()) {
    const clientId = existing.clientId;
    const ext      = existing.fileName.split(".").pop() ?? "";
    const path     = `${clientId}/${id}${ext ? `.${ext}` : ""}`;
    await sb().storage.from("client-files").remove([path]).catch(() => {});
    await sb().from("client_resources").delete().eq("id", id);
  } else {
    await removeById("client_resources", id);
  }

  return NextResponse.json({ ok: true });
}
