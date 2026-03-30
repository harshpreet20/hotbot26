import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  return url
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  return key
}

// Lazy-initialized browser/client-side client (uses anon key, respects RLS)
let _supabase: SupabaseClient<Database> | null = null
export function getSupabase() {
  if (!_supabase) _supabase = createClient<Database>(getUrl(), getAnonKey())
  return _supabase
}

// Kept for backwards-compat in simple imports — lazy getter
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Server-side admin client (bypasses RLS — only use in API routes)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient<Database>(getUrl(), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
