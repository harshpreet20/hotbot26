export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await sb().from("client_users").select("client_id, name").eq("email", email).single();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: tasks } = await sb()
    .from("tasks")
    .select("id, title, description, status, priority, due_date, assigned_to, created_at")
    .eq("client_id", user.client_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ tasks: tasks ?? [] });
}

export async function POST(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await sb().from("client_users").select("client_id, name").eq("email", email).single();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, description, priority } = (await req.json()) as { title?: string; description?: string; priority?: string };
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const { data: task, error } = await sb().from("tasks").insert({
    title: title.trim(),
    description: description?.trim() ?? "",
    status: "pending",
    priority: priority ?? "medium",
    client_id: user.client_id,
    requester_name: user.name,
    requester_email: email,
    source: "portal",
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task }, { status: 201 });
}
