export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: cu } = await sb()
    .from("client_users")
    .select("client_id")
    .eq("email", email)
    .single();

  if (!cu) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Get all client's projects first
  const { data: projects } = await sb()
    .from("projects")
    .select("id, name")
    .eq("client_id", cu.client_id);

  const projectMap: Record<string, string> = {};
  (projects ?? []).forEach((p) => { projectMap[p.id] = p.name; });

  const projectIds = (projects ?? []).map((p) => p.id);

  if (projectIds.length === 0) {
    return NextResponse.json({ files: [] });
  }

  const { data: files, error } = await sb()
    .from("project_files")
    .select("id, project_id, name, url, mime_type, size, created_at, visibility")
    .in("project_id", projectIds)
    .eq("visibility", "client")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (files ?? []).map((f) => ({
    ...f,
    project_name: projectMap[f.project_id] ?? "Unknown Project",
  }));

  return NextResponse.json({ files: enriched });
}
