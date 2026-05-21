export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { verifyPortalSession } from "@/lib/portal-session";

export async function GET(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tickets, error } = await sb()
    .from("tickets")
    .select("id, subject, description, status, client_email, client_name, priority, created_at")
    .eq("client_email", email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tickets: tickets ?? [] });
}

export async function POST(req: NextRequest) {
  const email = verifyPortalSession(req);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, description, priority } = (await req.json()) as {
    subject?: string;
    description?: string;
    priority?: string;
  };

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const { data: user } = await sb()
    .from("client_users")
    .select("name")
    .eq("email", email)
    .single();

  const { data: ticket, error } = await sb()
    .from("tickets")
    .insert({
      subject:          subject.trim(),
      description:      description?.trim() ?? "",
      status:           "open",
      client_email:     email,
      client_name:      user?.name ?? email,
      priority:         priority ?? "medium",
      approval_status:  "pending_approval",   // requires manager+ to approve
      source:           "portal",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ticket }, { status: 201 });
}
