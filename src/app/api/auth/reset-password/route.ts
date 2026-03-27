import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getResetToken, updateUser, markTokenUsed } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const resetToken = await getResetToken(token);
    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await updateUser(resetToken.user_id, { password_hash: passwordHash });
    await markTokenUsed(resetToken.id);

    await logActivity({
      userId: resetToken.user_id,
      action: "password_reset_completed",
    });

    return NextResponse.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
