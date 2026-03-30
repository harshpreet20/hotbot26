import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']

// GET /api/invoices
export async function GET(req: NextRequest) {
  const admin = createAdminClient()
  const status = req.nextUrl.searchParams.get('status')
  const customerId = req.nextUrl.searchParams.get('customer_id')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0')

  let query = admin
    .from('invoices')
    .select('*, customers(first_name,last_name,email,company), invoice_items(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (customerId) query = query.eq('customer_id', customerId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invoices: data })
}

// POST /api/invoices
export async function POST(req: NextRequest) {
  const admin = createAdminClient()
  const raw = await req.json() as InvoiceInsert & { items?: InvoiceItemInsert[] }
  const { items, ...invoiceBody } = raw

  // Auto-generate invoice number if not provided
  if (!invoiceBody.invoice_number) {
    const { data: numData } = await admin.rpc('next_invoice_number')
    invoiceBody.invoice_number = numData as string
  }

  // Compute subtotal from items
  if (Array.isArray(items) && items.length > 0) {
    invoiceBody.subtotal = items.reduce(
      (sum: number, item: InvoiceItemInsert) =>
        sum + (item.quantity ?? 1) * item.unit_price,
      0
    )
  }

  const { data: invoice, error: invErr } = await admin
    .from('invoices')
    .insert(invoiceBody as InvoiceInsert)
    .select()
    .single()

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 400 })

  if (Array.isArray(items) && items.length > 0) {
    const lineItems = items.map((item, i) => ({
      ...item,
      invoice_id: invoice.id,
      sort_order: i,
    }))
    const { error: itemErr } = await admin.from('invoice_items').insert(lineItems)
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 })
  }

  return NextResponse.json({ invoice }, { status: 201 })
}
