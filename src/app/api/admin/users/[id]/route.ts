import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password_hash: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}

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
    const updates: Record<string, unknown> = {};
    const allowedFields = ["email", "role", "display_name", "is_active"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const user = await updateUser(params.id, updates);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity({
      userId: session.user.id,
      action: "user_updated",
      details: { targetUserId: params.id, updates: Object.keys(updates) },
    });

    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
  }

  await updateUser(params.id, { is_active: false });

  await logActivity({
    userId: session.user.id,
    action: "user_deactivated",
    details: { targetUserId: params.id },
  });

  return NextResponse.json({ message: "User deactivated" });
}
