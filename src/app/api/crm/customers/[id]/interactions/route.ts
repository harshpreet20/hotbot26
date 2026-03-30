import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// GET /api/crm/customers/[id]/interactions
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('customer_interactions')
    .select('*')
    .eq('customer_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ interactions: data })
}

// POST /api/crm/customers/[id]/interactions
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient()
  const body = await req.json()

  const { data, error } = await admin
    .from('customer_interactions')
    .insert({ ...body, customer_id: params.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ interaction: data }, { status: 201 })
}
