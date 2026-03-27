import { NextResponse } from "next/server";
import crypto from "crypto";
import { getUserByEmail, addResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const successResponse = NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });

    const user = await getUserByEmail(email);
    if (!user) return successResponse;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await addResetToken(user.id, token, expiresAt);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email!, resetUrl);

    await logActivity({
      userId: user.id,
      action: "password_reset_requested",
      details: { email },
    });

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
