import { NextRequest, NextResponse } from "next/server";
import { extractToken, isAuthorized } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { ChatSession } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await isAuthorized(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ sessions: await readAll<ChatSession>("chats") });
}
