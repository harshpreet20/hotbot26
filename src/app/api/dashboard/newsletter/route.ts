import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { NewsletterSubscriber } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ subscribers: await readAll<NewsletterSubscriber>("newsletter") });
}
