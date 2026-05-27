export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cu } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();

  if (!cu) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: resources, error } = await sb()
    .from("client_resources")
    .select("*")
    .eq("client_id", cu.client_id)
    .eq("visibility", "client")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ resources: resources ?? [] });
}

export async function POST(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cu } = await sb()
    .from("client_users")
    .select("client_id, name")
    .eq("email", email)
    .single();

  if (!cu) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let body: {
    name?: string;
    description?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    category?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, file_url, file_name, file_size, mime_type, category } = body;

  if (!name || !file_url || !file_name || !mime_type) {
    return NextResponse.json({ error: "name, file_url, file_name, and mime_type are required" }, { status: 400 });
  }

  // Validate file_url is a Supabase Storage URL to prevent SSRF / arbitrary URL injection.
  // Fail closed: if the env var is not set we cannot verify the hostname, so reject the request.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Server configuration error: storage URL not set" }, { status: 503 });
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(file_url);
  } catch {
    return NextResponse.json({ error: "Invalid file_url" }, { status: 400 });
  }
  const allowedHostname = new URL(supabaseUrl).hostname;
  if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== allowedHostname) {
    return NextResponse.json({ error: "file_url must be a valid Supabase Storage URL" }, { status: 400 });
  }

  const { data, error } = await sb()
    .from("client_resources")
    .insert({
      id: randomUUID(),
      client_id: cu.client_id,
      project_id: null,
      name,
      description: description ?? null,
      file_url,
      file_name,
      file_size: file_size ?? null,
      mime_type,
      category: category ?? "general",
      uploaded_by: cu.name ?? email,
      uploaded_by_type: "client",
      visibility: "client",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ resource: data }, { status: 201 });
}
