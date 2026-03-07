import { NextRequest, NextResponse } from "next/server";
import { extractToken, isAuthorized } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { ChatSession } from "@/types/dashboard";

// Chats are accessible to any authenticated user (admin, manager, agent)
export async function GET(req: NextRequest) {
  if (!isAuthorized(extractToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ sessions: readAll<ChatSession>("chats") });
}
