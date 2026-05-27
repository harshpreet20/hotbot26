/**
 * Supabase anon client for the customer portal.
 * Only use this in browser (client) components for Realtime subscriptions.
 * Lazy-initialized to avoid build-time failures when env vars are absent.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getPortalClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    _client = createClient(url, key);
  }
  return _client;
}

// Proxy so existing imports of `portalClient.channel(...)` keep working
// while initialization is deferred until runtime (browser).
export const portalClient: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_: SupabaseClient, prop: string | symbol) {
    return Reflect.get(getPortalClient(), prop);
  },
});
