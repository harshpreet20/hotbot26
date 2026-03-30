import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET — single invoice with items
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .select('*, customers(name, email, company, phone), invoice_items(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice: data })
  } catch (error) {
    console.error('Invoice get error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// PATCH — update invoice; auto set paid_at when status changes to 'paid'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
      due_date?: string
      notes?: string
      paid_at?: string
    }

    const updates: Record<string, unknown> = { ...body }

    // Auto-set paid_at when marking as paid
    if (body.status === 'paid' && !body.paid_at) {
      updates.paid_at = new Date().toISOString()
    }
    // Clear paid_at if status changes away from paid
    if (body.status && body.status !== 'paid' && !body.paid_at) {
      updates.paid_at = null
    }

    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice: data })
  } catch (error) {
    console.error('Invoice update error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// DELETE — remove invoice
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { error } = await getSupabaseAdmin()
      .from('invoices')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice delete error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
