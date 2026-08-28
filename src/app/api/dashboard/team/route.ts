import { NextRequest, NextResponse } from "next/server";
import { requireDataAccess } from "@/lib/dashboardAuth";
import { getAllUsers } from "@/lib/adminStore";

export async function GET(req: NextRequest) {
  const session = await requireDataAccess(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await getAllUsers();
  return NextResponse.json({
    members: users.map((u) => ({ username: u.username, role: u.role })),
  });
}
