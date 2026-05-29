import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, removeById, newId, insert, updateById } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimitResponse } from "@/lib/rateLimit";

const ALLOWED_ROLES = ["super_admin", "admin", "manager", "sales", "crm_operator"];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "video/mp4", "video/webm",
  "audio/mpeg", "audio/wav", "audio/ogg",
  "font/ttf", "font/otf", "font/woff", "font/woff2",
]);

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
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const clientId  = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");

  try {
    let files = await readAll<ClientResource>("client_resources");
    if (clientId)  files = files.filter(f => f.clientId === clientId);
    if (projectId) files = files.filter(f => f.projectId === projectId);
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-uploads", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file      = formData.get("file") as File | null;
  const clientId  = formData.get("clientId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const category  = (formData.get("category") as string | null) ?? "general";

  if (!file)     return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 413 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  }

  const id       = newId();
  const ext      = file.name.split(".").pop() ?? "";
  const safeName = id + (ext ? `.${ext}` : "");
  const path     = `${clientId}/${safeName}`;
  let   fileUrl  = "";

  if (isSupabaseEnabled()) {
    try {
      const bytes = await file.arrayBuffer();
      const { data, error } = await sb().storage
        .from("client-files")
        .upload(path, bytes, { contentType: file.type, upsert: false });
      if (error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      const { data: urlData } = sb().storage.from("client-files").getPublicUrl(data.path);
      fileUrl = urlData.publicUrl;
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
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

  try {
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
      if (error) return NextResponse.json({ error: "Failed to save file record" }, { status: 500 });
    } else {
      await insert<ClientResource>("client_resources", resource);
    }
  } catch {
    return NextResponse.json({ error: "Failed to save file record" }, { status: 500 });
  }

  return NextResponse.json({ file: resource }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { id: string; visibility?: "both" | "admin_only" };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const all = await readAll<ClientResource>("client_resources");
    const existing = all.find(f => f.id === body.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated: ClientResource = {
      ...existing,
      visibility: body.visibility ?? existing.visibility,
    };

    if (isSupabaseEnabled()) {
      const { error } = await sb().from("client_resources").update({ visibility: updated.visibility }).eq("id", body.id);
      if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    } else {
      await updateById<ClientResource>("client_resources", body.id, updated);
    }

    return NextResponse.json({ file: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const limited = rateLimitResponse(ip(req), "dashboard-uploads", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const all = await readAll<ClientResource>("client_resources");
    const existing = all.find(f => f.id === id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (isSupabaseEnabled()) {
      const ext  = existing.fileName.split(".").pop() ?? "";
      const path = `${existing.clientId}/${id}${ext ? `.${ext}` : ""}`;
      await sb().storage.from("client-files").remove([path]).catch(() => {});
      await sb().from("client_resources").delete().eq("id", id);
    } else {
      await removeById("client_resources", id);
    }
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
