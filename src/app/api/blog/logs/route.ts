import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { getLogs } from "@/lib/logger";
import type { LogLevel } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const token   = extractToken(req);
  const session = await authorizeAdmin(token);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 1000);
  const level  = searchParams.get("level") as LogLevel | null;
  const event  = searchParams.get("event") ?? undefined;
  const since  = searchParams.get("since") ?? undefined;

  const entries = await getLogs({
    limit,
    level:  level ?? undefined,
    event,
    since,
  });

  return NextResponse.json({ logs: entries, count: entries.length });
}
