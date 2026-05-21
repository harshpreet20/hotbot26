/**
 * Supabase anon client for the customer portal.
 * Only use this in browser (client) components for Realtime subscriptions.
 * All data fetching uses server-side API routes with the service-role key.
 */
import { createClient } from "@supabase/supabase-js";

export const portalClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
