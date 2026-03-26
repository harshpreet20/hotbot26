import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [usersResult, activeResult, loginsToday, recentActivity] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("activity_logs").select("id", { count: "exact", head: true }).eq("action", "login").gte("created_at", todayStr),
    supabase.from("activity_logs").select("*, users!activity_logs_user_id_fkey(username, display_name)").order("created_at", { ascending: false }).limit(10),
  ]);

  return NextResponse.json({
    totalUsers: usersResult.count || 0,
    activeUsers: activeResult.count || 0,
    loginsToday: loginsToday.count || 0,
    recentActivity: recentActivity.data || [],
  });
}
