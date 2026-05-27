export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { clearPortalCookie } from "@/lib/portal-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearPortalCookie());
  return res;
}
