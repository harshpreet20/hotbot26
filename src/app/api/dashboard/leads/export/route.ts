import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { Lead } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = await requireRole(req, "super_admin", "admin");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await readAll<Lead>("leads");

  const headers = ["ID", "Name", "Email", "Phone", "Company", "Service", "Budget", "Status", "Source", "Message", "Created At"];
  const rows = leads.map(l => [
    l.id,
    l.name,
    l.email,
    l.phone        || "",
    l.company      || "",
    l.service      || "",
    l.budget       || "",
    l.status       || "",
    l.source       || "",
    (l.message     || "").replace(/"/g, '""'),
    l.createdAt    || "",
  ].map(v => `"${v}"`).join(","));

  const csv = [headers.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
