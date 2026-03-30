import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import type { Database } from '@/types/database'

type CustomerUpdate = Database['public']['Tables']['customers']['Update']

// GET /api/crm/customers/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('customers')
    .select('*, customer_interactions(*)')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  return NextResponse.json({ customer: data })
}

// PATCH /api/crm/customers/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const admin = createAdminClient()
  const body = await req.json() as CustomerUpdate

  const { data, error } = await admin
    .from('customers')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ customer: data })
}

// DELETE /api/crm/customers/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const admin = createAdminClient()

  const { error } = await admin
    .from('customers')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
