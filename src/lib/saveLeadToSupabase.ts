import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type InteractionInsert = Database['public']['Tables']['customer_interactions']['Insert']

/**
 * Upsert a customer by email and optionally log an interaction.
 * Non-blocking — errors are logged but never thrown so n8n routes still work
 * even if Supabase is down or env vars are missing.
 */
export async function saveLeadToSupabase(
  customer: Omit<CustomerInsert, 'id' | 'created_at' | 'updated_at'>,
  interaction?: Omit<InteractionInsert, 'id' | 'customer_id' | 'created_at'>
) {
  try {
    const admin = createAdminClient()

    // Upsert customer by email (update if exists, insert if new)
    const { data: saved, error: custErr } = await admin
      .from('customers')
      .upsert(customer as CustomerInsert, {
        onConflict: 'email',
        ignoreDuplicates: false,
      })
      .select('id')
      .single()

    if (custErr || !saved) {
      console.error('Supabase customer upsert failed:', custErr?.message)
      return null
    }

    // Log interaction if provided
    if (interaction) {
      const { error: intErr } = await admin
        .from('customer_interactions')
        .insert({
          ...interaction,
          customer_id: saved.id,
        } as InteractionInsert)

      if (intErr) {
        console.error('Supabase interaction insert failed:', intErr.message)
      }
    }

    return saved.id
  } catch (err) {
    // Fail silently — don't break the n8n pipeline
    console.error('Supabase save failed:', err)
    return null
  }
}
