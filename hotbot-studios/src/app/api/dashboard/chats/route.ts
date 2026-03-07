import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { ChatSession } from "@/types/dashboard";

// Chats are accessible to any authenticated user (admin, manager, agent)
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!isAuthorized(secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ sessions: readAll<ChatSession>("chats") });
}
