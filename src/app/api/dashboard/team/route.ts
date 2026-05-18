import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { getAllUsers } from "@/lib/adminStore";

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await getAllUsers();
  return NextResponse.json({
    members: users.map((u) => ({ username: u.username, role: u.role })),
  });
}
