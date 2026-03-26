import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent user enumeration
    const successResponse = NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });

    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (!user) return successResponse;

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    // Send email
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
