import { NextRequest, NextResponse } from "next/server";
import { triggerN8n } from "@/lib/n8n";
import { createAdminClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

type InteractionInsert = Database['public']['Tables']['customer_interactions']['Insert'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const data = await triggerN8n<Record<string, string>>("chat", {
      message: message.trim(),
      history: (history || []).slice(-10),
      mode: "chat",
    });

    const reply =
      data?.message ||
      data?.response ||
      data?.text ||
      data?.output ||
      "Thanks! Our team will follow up shortly.";

    // Log chat interaction to Supabase (non-blocking, best-effort)
    try {
      const admin = createAdminClient();
      // If an email was provided in history, try to link to customer
      const email = body.email as string | undefined;
      if (email) {
        const { data: customer } = await admin
          .from('customers')
          .select('id')
          .eq('email', email)
          .single();
        if (customer) {
          await admin.from('customer_interactions').insert({
            customer_id: customer.id,
            type: 'chat',
            subject: 'Chat message',
            body: `User: ${message.trim()}\nBot: ${reply}`,
          } as InteractionInsert);
        }
      }
    } catch { /* fail silently */ }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Chat pipeline error:", error);
    return NextResponse.json({
      message:
        "I've forwarded your message. Our team will connect via WhatsApp or Telegram shortly.",
    });
  }
}
