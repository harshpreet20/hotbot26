import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sb } from "@/lib/supabase";
import { createPortalSession, buildPortalCookie } from "@/lib/portal-session";
import { sendPortalWelcome } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { token, password, name } = (await req.json()) as {
      token?: string;
      password?: string;
      name?: string;
    };

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const { data: user } = await sb()
      .from("client_users")
      .select("id, email, name, role, client_id, invite_expires_at, is_active")
      .eq("invite_token", token)
      .single();

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired invitation link" }, { status: 400 });
    }

    if (user.invite_expires_at && new Date(user.invite_expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation link has expired" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await sb()
      .from("client_users")
      .update({
        password_hash:      passwordHash,
        name:               name?.trim() || user.name,
        invite_token:       null,
        invite_expires_at:  null,
        invite_accepted_at: new Date().toISOString(),
        is_active:          true,
      })
      .eq("id", user.id);

    // Fetch client info for welcome email
    const { data: client } = await sb()
      .from("clients")
      .select("name, client_id")
      .eq("client_id", user.client_id)
      .single();

    const finalName = name?.trim() || user.name || "there";
    if (client) {
      await sendPortalWelcome(user.email, finalName, client.name, client.client_id).catch(console.error);
    }

    const sessionToken = createPortalSession(user.email);
    const cookie = buildPortalCookie(sessionToken);

    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (err) {
    console.error("[portal/setup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
