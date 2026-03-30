import { NextRequest, NextResponse } from "next/server";
import { analyzeAll } from "@/lib/seo-analyzer";
import type { AnalyzerInput } from "@/lib/seo-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AnalyzerInput;
    const result = analyzeAll(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("SEO analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
