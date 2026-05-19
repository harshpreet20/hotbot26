/**
 * Audit log viewer.
 *
 * GET /api/blog/audit-logs          – all logs, newest first (admin+)
 * GET /api/blog/audit-logs?userId=X – logs for a specific actor (admin+)
 * GET /api/blog/audit-logs?action=X – logs by action prefix (admin+)
 * GET /api/blog/audit-logs?limit=N  – limit results (default 200)
 */
import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, authorizeSuperAdmin, extractToken } from "@/lib/dashboardAuth";
import { getAuditLogs, getUserActivity, getLogsByAction } from "@/lib/agents/monitoring";

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get("backdrop_auth")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    null
  );
}

export async function GET(req: NextRequest) {
  const token   = getToken(req);
  const session = await authorizeAdmin(token);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 1000);

  // Monitoring logs for specific user: super_admin sees all, admin cannot see super_admin activity
  if (userId) {
    const logs = await getUserActivity(userId, limit);
    // Admin cannot view super_admin's logs
    if (session.role !== "super_admin") {
      const filtered = logs.filter((l) => l.actorRole !== "super_admin");
      return NextResponse.json({ logs: filtered, total: filtered.length });
    }
    return NextResponse.json({ logs, total: logs.length });
  }

  if (action) {
    const logs = await getLogsByAction(action, limit);
    return NextResponse.json({ logs, total: logs.length });
  }

  const all = await getAuditLogs(limit);
  // Admin cannot view super_admin's activity
  const logs = session.role === "super_admin"
    ? all
    : all.filter((l) => l.actorRole !== "super_admin");

  return NextResponse.json({ logs, total: logs.length });
}
