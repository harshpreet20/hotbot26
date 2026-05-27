export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sb } from "@/lib/supabase";
import { sendPortalMagicLink } from "@/lib/resend";
import { rateLimitResponse } from "@/lib/rateLimit";

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(getIp(req), "portal-magic", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

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

    if (!user || !user.is_active) {
      // Don't reveal whether account exists or is inactive — always return ok.
      // This prevents email enumeration: an attacker cannot distinguish missing
      // accounts from inactive ones by comparing response shape.
      return NextResponse.json({ ok: true });
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
