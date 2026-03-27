import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActivityLogs } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const result = await getActivityLogs({
    page,
    limit,
    action,
    userId: session.user.role !== "super_admin" ? session.user.id : userId,
    from,
    to,
  });

  return NextResponse.json({ ...result, page, limit });
}
