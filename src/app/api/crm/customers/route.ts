import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET — list customers with optional filters
export async function GET(req: NextRequest) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as 'lead' | 'prospect' | 'active' | 'inactive' | 'churned' | null
    const search = searchParams.get('search')

    let query = getSupabaseAdmin()
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ customers: data, total: count })
  } catch (error) {
    console.error('CRM list error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

// POST — upsert customer by email
export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      name?: string
      email?: string
      phone?: string
      company?: string
      status?: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
      source?: string
      tags?: string[]
      notes?: string
    }

    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('customers')
      .upsert(
        {
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone || null,
          company: body.company || null,
          status: body.status || 'lead',
          source: body.source || null,
          tags: body.tags || [],
          notes: body.notes || null,
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ customer: data }, { status: 201 })
  } catch (error) {
    console.error('CRM upsert error:', error)
    return NextResponse.json({ error: 'Failed to save customer' }, { status: 500 })
  }
}
