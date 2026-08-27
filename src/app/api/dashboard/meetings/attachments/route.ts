/**
 * Meeting Attachments API — proposals, agreements, and any files tied to a meeting.
 * GET    /api/dashboard/meetings/attachments?meetingId=   list attachments
 * POST   /api/dashboard/meetings/attachments              upload a file (multipart)
 * DELETE /api/dashboard/meetings/attachments?id=          delete a file
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readAll, insert, removeById, newId } from "@/lib/store";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { rateLimitResponse } from "@/lib/rateLimit";

export interface MeetingAttachment {
  id: string;
  meetingId: string;
  name: string;           // original file name
  fileUrl: string;
  fileName: string;       // safe stored name
  fileSize: number;
  mimeType: string;
  category: "proposal" | "agreement" | "other";
  uploadedBy: string;
  createdAt: string;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "text/plain": "txt",
  "application/zip": "zip",
};

const ALLOWED_TYPES = new Set(Object.keys(MIME_TO_EXT));

function ip(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meetingId = new URL(req.url).searchParams.get("meetingId");
  if (!meetingId) return NextResponse.json({ error: "meetingId required" }, { status: 400 });

  const all = await readAll<MeetingAttachment>("meeting_attachments");
  return NextResponse.json({ attachments: all.filter((a) => a.meetingId === meetingId) });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitResponse(ip(req), "dashboard-writes", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData   = await req.formData();
  const file       = formData.get("file") as File | null;
  const meetingId  = formData.get("meetingId") as string | null;
  const category   = (formData.get("category") as string | null) ?? "other";

  if (!file)       return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!meetingId)  return NextResponse.json({ error: "meetingId required" }, { status: 400 });
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  }

  const validCategory = (["proposal", "agreement", "other"].includes(category) ? category : "other") as MeetingAttachment["category"];

  const id       = newId();
  const ext      = MIME_TO_EXT[file.type] ?? "";
  const safeName = id + (ext ? `.${ext}` : "");
  let   fileUrl  = "";

  if (isSupabaseEnabled()) {
    const path  = `meetings/${meetingId}/${safeName}`;
    const bytes = await file.arrayBuffer();
    const { data, error } = await sb()
      .storage
      .from("meeting-files")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[meeting-attachments] upload error:", error.message);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const { data: urlData } = sb().storage.from("meeting-files").getPublicUrl(data.path);
    fileUrl = urlData.publicUrl;
  } else {
    fileUrl = `/api/dashboard/meetings/attachments/${id}`;
  }

  const attachment: MeetingAttachment = {
    id,
    meetingId,
    name:       file.name,
    fileUrl,
    fileName:   safeName,
    fileSize:   file.size,
    mimeType:   file.type,
    category:   validCategory,
    uploadedBy: session.username,
    createdAt:  new Date().toISOString(),
  };

  try {
    await insert<MeetingAttachment>("meeting_attachments", attachment);
  } catch (err) {
    console.error("[meeting-attachments] insert error:", err);
    return NextResponse.json({ error: "Failed to save attachment record" }, { status: 500 });
  }

  return NextResponse.json({ attachment }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const all = await readAll<MeetingAttachment>("meeting_attachments");
  const existing = all.find((a) => a.id === id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isSupabaseEnabled()) {
    const ext  = MIME_TO_EXT[existing.mimeType] ?? "";
    const path = `meetings/${existing.meetingId}/${existing.id}${ext ? `.${ext}` : ""}`;
    await sb().storage.from("meeting-files").remove([path]).catch(() => {});
    const { error } = await sb().from("meeting_attachments").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  } else {
    try {
      await removeById("meeting_attachments", id);
    } catch (err) {
      console.error("[meeting-attachments] delete error:", err);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
