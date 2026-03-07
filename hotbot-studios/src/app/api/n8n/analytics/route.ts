import { NextResponse } from "next/server";

// Analytics events — acknowledged immediately, no external relay needed.
// GA4 (NEXT_PUBLIC_GA_ID) handles client-side analytics tracking.
export async function POST() {
  return NextResponse.json({ success: true });
}
