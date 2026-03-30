import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET — single customer with interactions
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { data: customer, error } = await getSupabaseAdmin()
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const { data: interactions } = await getSupabaseAdmin()
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ customer, interactions: interactions || [] })
  } catch (error) {
    console.error('CRM get error:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

// PATCH — update customer
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      name?: string
      phone?: string
      company?: string
      status?: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
      source?: string
      tags?: string[]
      notes?: string
      assigned_to?: string
    }

    const { data, error } = await getSupabaseAdmin()
      .from('customers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer: data })
  } catch (error) {
    console.error('CRM update error:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

// DELETE — remove customer
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { error } = await getSupabaseAdmin()
      .from('customers')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CRM delete error:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
