import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";

export async function GET() {
  try {
    const data = await triggerN8n<{ leads: unknown[] }>("leads", { action: "list" });
    return NextResponse.json({ leads: data?.leads || [] });
  } catch {
    return NextResponse.json({ leads: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await triggerN8n("leads", body);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await triggerN8n("leads", { action: "update", ...body });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await triggerN8n("leads", { action: "delete", ...body });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
