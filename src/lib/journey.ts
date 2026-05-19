import { sb } from "@/lib/supabase";
import { newId } from "@/lib/store";

export async function fireJourneyEvent(event: {
  sessionId?: string | null;
  email?: string | null;
  stage: string;
  leadId?: string | null;
  clientId?: string | null;
  invoiceId?: string | null;
  revenueAmount?: number | null;
  currency?: string;
  source?: string | null;
  page?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await sb()
      .from("site_journey_events")
      .insert({
        id: newId(),
        session_id: event.sessionId ?? null,
        email: event.email ?? null,
        stage: event.stage,
        lead_id: event.leadId ?? null,
        client_id: event.clientId ?? null,
        invoice_id: event.invoiceId ?? null,
        revenue_amount: event.revenueAmount ?? null,
        currency: event.currency ?? null,
        source: event.source ?? null,
        page: event.page ?? null,
        metadata: event.metadata ?? null,
        created_at: new Date().toISOString(),
      });
  } catch {
    // Fire-and-forget: never throw
  }
}
