import { NextRequest, NextResponse } from "next/server";
import { requireDataAccess } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { NewsletterSubscriber } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const session = await requireDataAccess(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ subscribers: await readAll<NewsletterSubscriber>("newsletter") });
}
