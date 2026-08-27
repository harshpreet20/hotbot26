import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll, removeById, newId, insert } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimitResponse } from "@/lib/rateLimit";

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
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif",
  "image/webp": "webp", "image/avif": "avif",
  "application/pdf": "pdf", "text/plain": "txt",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/zip": "zip",
  "video/mp4": "mp4", "video/webm": "webm",
  "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg",
};

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
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientRef = user.clientRef || user.clientId;
  if (!clientRef) return NextResponse.json({ files: [] });

  try {
    const all = await readAll<ClientResource>("client_resources");
    const files = all.filter(f => f.clientId === clientRef && f.visibility !== "admin_only");
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "portal-uploads", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file      = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;
  const category  = (formData.get("category") as string | null) ?? "general";

  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const clientId = user.clientRef || user.clientId;
  if (!clientId) return NextResponse.json({ error: "client identity not resolved" }, { status: 400 });

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 413 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  }

  const id       = newId();
  const ext      = MIME_TO_EXT[file.type] ?? "";
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
    fileUrl = `/api/portal/files/${id}`;
  }

  const resource: ClientResource = {
    id,
    clientId,
    projectId: projectId ?? undefined,
    name:            file.name,
    fileUrl,
    fileName:        file.name,
    fileSize:        file.size,
    mimeType:        file.type,
    category,
    uploadedBy:      user.name || user.email,
    uploadedByType:  "client",
    visibility:      "both",
    createdAt:       new Date().toISOString(),
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

export async function DELETE(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "portal-uploads", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const all = await readAll<ClientResource>("client_resources");
    const clientRef = user.clientRef || user.clientId;
    const existing  = all.find(f => f.id === id && f.clientId === clientRef && f.uploadedByType === "client");
    if (!existing) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

    if (isSupabaseEnabled()) {
      const ext  = MIME_TO_EXT[existing.mimeType] ?? "";
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
