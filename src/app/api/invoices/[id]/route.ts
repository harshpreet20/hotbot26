import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']

// GET /api/invoices/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('invoices')
    .select('*, customers(*), invoice_items(*)')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  return NextResponse.json({ invoice: data })
}

// PATCH /api/invoices/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient()
  const raw = await req.json() as InvoiceUpdate & { items?: InvoiceItemInsert[] }
  const { items, ...body } = raw

  // Recompute subtotal if items are updated
  if (Array.isArray(items)) {
    body.subtotal = items.reduce(
      (sum: number, item: InvoiceItemInsert) =>
        sum + (item.quantity ?? 1) * item.unit_price,
      0
    )
    // Replace all line items
    await admin.from('invoice_items').delete().eq('invoice_id', params.id)
    const lineItems: InvoiceItemInsert[] = items.map((item, i) => ({
      ...item,
      invoice_id: params.id,
      sort_order: i,
    }))
    await admin.from('invoice_items').insert(lineItems)
  }

  // Mark paid_at when status changes to paid
  if (body.status === 'paid' && !body.paid_at) {
    body.paid_at = new Date().toISOString()
  }

  const { data, error } = await admin
    .from('invoices')
    .update(body as InvoiceUpdate)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ invoice: data })
}

// DELETE /api/invoices/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient()

  const { error } = await admin.from('invoices').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
