import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type CustomerInsert = Database['public']['Tables']['customers']['Insert']

// GET /api/crm/customers
export async function GET(req: NextRequest) {
  const admin = createAdminClient()
  const status = req.nextUrl.searchParams.get('status')
  const search = req.nextUrl.searchParams.get('q')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0')

  let query = admin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customers: data })
}

// POST /api/crm/customers — upsert by email
export async function POST(req: NextRequest) {
  const admin = createAdminClient()
  const body = await req.json() as CustomerInsert

  const { data, error } = await admin
    .from('customers')
    .upsert(body, { onConflict: 'email', ignoreDuplicates: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ customer: data }, { status: 201 })
}
