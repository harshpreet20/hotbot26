import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { Lead } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!isAuthorized(secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ leads: readAll<Lead>("leads") });
}
