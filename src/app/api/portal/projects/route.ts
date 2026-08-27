import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll } from "@/lib/store";
import type { Project } from "@/types/dashboard";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await readAll<Project>("projects");
  const projects = all.filter(
    (p) => p.clientId === user.clientRef || p.clientId === user.clientId || p.clientEmail === user.email
  );

  return NextResponse.json({ projects });
}
