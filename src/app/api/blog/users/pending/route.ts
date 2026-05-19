import { NextRequest, NextResponse } from "next/server";
import { sb, isSupabaseEnabled } from "@/lib/supabase";
import { authorizeAdmin, extractToken } from "@/lib/dashboardAuth";
import { log } from "@/lib/logger";
import type { Role } from "@/types/dashboard";
import { sendUserApprovedEmail, sendUserRejectedEmail } from "@/lib/resend";

// GET - list users pending approval (admin only)
export async function GET(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ pending: [] });
  }

  const { data, error } = await sb()
    .from("backdrop_users")
    .select("id, email, username, role, status, created_at")
    .in("status", ["pending_email", "pending_approval"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch pending users." }, { status: 500 });
  }

  // Normalise to the shape the dashboard UI expects
  const pending = (data || []).map((u) => ({
    id:            u.id,
    name:          u.username || u.email,
    email:         u.email,
    requestedRole: u.role,
    status:        u.status === "pending_approval" ? "pending" : u.status,
    createdAt:     u.created_at,
  }));

  return NextResponse.json({ pending });
}

// PATCH - approve or reject a pending user
export async function PATCH(req: NextRequest) {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: { id?: string; action?: string; role?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const { id, action, role: roleOverride } = body;
  if (!id || !action) return NextResponse.json({ error: "id and action are required." }, { status: 400 });

  const { data: userRow, error: fetchErr } = await sb()
    .from("backdrop_users")
    .select("email, username, role, status")
    .eq("id", id)
    .single();

  if (fetchErr || !userRow) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (action === "reject") {
    const { error } = await sb().from("backdrop_users").update({
      status:     "rejected",
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) return NextResponse.json({ error: "Failed to reject user." }, { status: 500 });

    log.info("users.reject", `User rejected: "${userRow.email}" by "${session.username}"`, {
      details: { targetId: id },
    });
    sendUserRejectedEmail({ email: userRow.email, username: userRow.username || userRow.email }).catch(() => {});
    return NextResponse.json({ success: true });
  }

  if (action === "approve") {
    const finalRole = (roleOverride as Role) || (userRow.role as Role);

    const { error: updateErr } = await sb().from("backdrop_users").update({
      status:      "approved",
      role:        finalRole,
      approved_by: session.username,
      approved_at: new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    }).eq("id", id);

    if (updateErr) return NextResponse.json({ error: "Failed to approve user." }, { status: 500 });

    log.info("users.approve", `User approved: "${userRow.email}" as ${finalRole} by "${session.username}"`, {
      details: { targetId: id, role: finalRole },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com"}/enter/backdrop`;
    sendUserApprovedEmail({ email: userRow.email, username: userRow.username || userRow.email, resetLink }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Access granted for ${userRow.email}. They can now sign in.`,
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
