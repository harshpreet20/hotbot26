import { NextRequest, NextResponse } from "next/server";
import { getPortalUser } from "@/lib/portalAuth";
import { readAll } from "@/lib/store";

interface RawTask {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt?: string;
  clientId?: string;
  linkedEntityType?: string;
  linkedEntityLabel?: string;
}

// GET — list tasks linked to the authenticated portal user's client
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getPortalUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allTasks = await readAll<RawTask>("crm_tasks");

  const tasks = allTasks
    .filter((t) => t.clientId === user.clientRef || t.clientId === user.clientId)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      linkedEntityType: t.linkedEntityType,
      linkedEntityLabel: t.linkedEntityLabel,
    }));

  return NextResponse.json({ tasks });
}
