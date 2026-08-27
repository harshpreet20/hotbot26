import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll } from "@/lib/store";
import type { Project } from "@/types/dashboard";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getPortalUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const all = await readAll<Project>("projects");
  const project = all.find(
    p => p.id === id && (
      p.clientId === user.clientRef || p.clientId === user.clientId || p.clientEmail === user.email
    )
  );

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}
