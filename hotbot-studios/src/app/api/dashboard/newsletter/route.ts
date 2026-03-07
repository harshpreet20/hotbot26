import { NextRequest, NextResponse } from "next/server";
import { authorizeData } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { NewsletterSubscriber } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!authorizeData(secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ subscribers: readAll<NewsletterSubscriber>("newsletter") });
}
