export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

const BUCKET = "client-resources";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cu } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();
  if (!cu) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const url = new URL(req.url);
  const filename = url.searchParams.get("filename");
  const contentType = url.searchParams.get("content_type") ?? "application/octet-stream";
  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${cu.client_id}/${Date.now()}_${safeName}`;

  const { data, error } = await sb().storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = sb().storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

  return NextResponse.json({
    signed_url:  data.signedUrl,
    token:       data.token,
    path:        data.path,
    public_url:  publicUrl,
    content_type: contentType,
  });
}
