import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Lazy-initialized Supabase clients — avoids build-time crashes when env vars are absent.

let _supabase: SupabaseClient<Database> | null = null
let _supabaseAdmin: SupabaseClient<Database> | null = null

// Public client (anon key — respects RLS)
export function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase URL and anon key are required')
    _supabase = createClient<Database>(url, key)
  }
  return _supabase
}

// Admin client (service role key — bypasses RLS, server-side only)
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase URL and service role key are required')
    _supabaseAdmin = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _supabaseAdmin
}

// Named exports for convenience — call the getters on each use so env vars are
// read lazily (safe during Next.js build time when vars may not be set).
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_t, prop: string | symbol) {
    return Reflect.get(getSupabaseAdmin(), prop)
  },
})

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_t, prop: string | symbol) {
    return Reflect.get(getSupabase(), prop)
  },
})
