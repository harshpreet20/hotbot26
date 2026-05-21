import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sb } from "@/lib/supabase";
import { sendPortalMagicLink } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const { data: user } = await sb()
      .from("client_users")
      .select("id, email, name, is_active")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!user) {
      // Don't reveal whether account exists
      return NextResponse.json({ ok: true });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is inactive." }, { status: 403 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await sb()
      .from("client_users")
      .update({ invite_token: token, invite_expires_at: expires })
      .eq("id", user.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hotbotstudios.com";
    const link = `${appUrl}/customers/verify?token=${token}`;

    await sendPortalMagicLink(user.email, link);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/magic]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
