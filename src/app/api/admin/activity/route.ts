import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const offset = (page - 1) * limit;
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("activity_logs")
    .select("*, users!activity_logs_user_id_fkey(username, display_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Regular admins can only see their own logs
  if (session.user.role !== "super_admin") {
    query = query.eq("user_id", session.user.id);
  } else if (userId) {
    query = query.eq("user_id", userId);
  }

  if (action) query = query.eq("action", action);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data: logs, count } = await query;

  return NextResponse.json({ logs: logs || [], total: count || 0, page, limit });
}
