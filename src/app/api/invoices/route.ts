import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const GST_RATE = 0.18 // 18% GST

// GET — list invoices
export async function GET(req: NextRequest) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | null
    const customerId = searchParams.get('customer_id')

    let query = getSupabaseAdmin()
      .from('invoices')
      .select('*, customers(name, email, company), invoice_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (customerId) query = query.eq('customer_id', customerId)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ invoices: data, total: count })
  } catch (error) {
    console.error('Invoice list error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST — create invoice with auto-generated number
export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      customer_id?: string
      due_date?: string
      notes?: string
      status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
      items?: Array<{
        description: string
        quantity: number
        unit_price: number
      }>
    }

    if (!body.customer_id) {
      return NextResponse.json({ error: 'customer_id required' }, { status: 400 })
    }

    const items = body.items || []
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const taxAmount = Math.round(subtotal * GST_RATE * 100) / 100
    const total = Math.round((subtotal + taxAmount) * 100) / 100

    // Generate invoice number: INV-01000 + sequence
    const { count } = await getSupabaseAdmin()
      .from('invoices')
      .select('*', { count: 'exact', head: true })
    const invoiceNumber = `INV-${String(1000 + (count || 0) + 1).padStart(5, '0')}`

    const { data: invoice, error } = await getSupabaseAdmin()
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        customer_id: body.customer_id,
        status: body.status || 'draft',
        due_date: body.due_date || null,
        subtotal,
        tax_rate: GST_RATE,
        tax_amount: taxAmount,
        total,
        notes: body.notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Insert line items
    if (items.length > 0) {
      const lineItems = items.map((item, idx) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: Math.round(item.quantity * item.unit_price * 100) / 100,
        sort_order: idx,
      }))

      await getSupabaseAdmin()
        .from('invoice_items')
        .insert(lineItems)
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Invoice create error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
