// CRM helper — upsert customer + log interaction (non-blocking, fail-safe)
// Used by public n8n routes so Supabase persistence never breaks n8n pipelines.

import { getSupabaseAdmin } from './supabase'

interface UpsertCustomerOptions {
  name: string
  email: string
  phone?: string
  company?: string
  source?: string
  tags?: string[]
}

interface LogInteractionOptions {
  customerId: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
  summary?: string
  details?: Record<string, unknown>
}

export async function upsertCustomer(opts: UpsertCustomerOptions): Promise<string | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('customers')
      .upsert(
        {
          name: opts.name.trim(),
          email: opts.email.trim().toLowerCase(),
          phone: opts.phone || null,
          company: opts.company || null,
          status: 'lead',
          source: opts.source || null,
          tags: opts.tags || [],
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (error) {
      console.error('CRM upsert error:', error)
      return null
    }
    return data?.id || null
  } catch (err) {
    console.error('CRM upsert exception:', err)
    return null
  }
}

export async function logInteraction(opts: LogInteractionOptions): Promise<void> {
  try {
    await getSupabaseAdmin()
      .from('customer_interactions')
      .insert({
        customer_id: opts.customerId,
        type: opts.type,
        summary: opts.summary || null,
        details: (opts.details || null) as import('../types/database').Json | null,
      })
  } catch (err) {
    console.error('CRM log interaction exception:', err)
  }
}

export async function upsertAndLog(
  customer: UpsertCustomerOptions,
  interaction: Omit<LogInteractionOptions, 'customerId'>
): Promise<void> {
  const customerId = await upsertCustomer(customer)
  if (customerId) {
    await logInteraction({ ...interaction, customerId })
  }
}
