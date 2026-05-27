export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sb } from "@/lib/supabase";
import { createPortalSession, buildPortalCookie } from "@/lib/portal-session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { data: user, error } = await sb()
      .from("client_users")
      .select("id, email, name, role, client_id, password_hash, is_active")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is inactive. Contact your account manager." }, { status: 403 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: "No password set. Use magic link to sign in." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createPortalSession(user.email);
    const cookie = buildPortalCookie(token);

    const res = NextResponse.json({
      ok: true,
      user: { email: user.email, name: user.name, role: user.role, client_id: user.client_id },
    });
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (err) {
    console.error("[portal/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
