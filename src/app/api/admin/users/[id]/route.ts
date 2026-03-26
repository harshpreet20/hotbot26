import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

// Get single user
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, username, email, role, display_name, is_active, last_login_at, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// Update user
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const allowedFields = ["email", "role", "display_name", "is_active"];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", params.id)
      .select("id, username, email, role, display_name, is_active, last_login_at, created_at, updated_at")
      .single();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity({
      userId: session.user.id,
      action: "user_updated",
      details: { targetUserId: params.id, updates: Object.keys(updates).filter(k => k !== "updated_at") },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Deactivate user (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent self-deactivation
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  await logActivity({
    userId: session.user.id,
    action: "user_deactivated",
    details: { targetUserId: params.id },
  });

  return NextResponse.json({ message: "User deactivated" });
}
