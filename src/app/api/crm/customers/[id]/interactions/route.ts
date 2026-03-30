import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET — list interactions for a customer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ interactions: data })
  } catch (error) {
    console.error('Interactions list error:', error)
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 })
  }
}

// POST — log a new interaction
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      type?: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
      summary?: string
      details?: Record<string, unknown>
    }

    if (!body.type) {
      return NextResponse.json({ error: 'Interaction type required' }, { status: 400 })
    }

    const validTypes = ['email', 'call', 'meeting', 'note', 'form', 'chat'] as const
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('customer_interactions')
      .insert({
        customer_id: params.id,
        type: body.type,
        summary: body.summary || null,
        details: (body.details || null) as import('@/types/database').Json | null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ interaction: data }, { status: 201 })
  } catch (error) {
    console.error('Interaction create error:', error)
    return NextResponse.json({ error: 'Failed to log interaction' }, { status: 500 })
  }
}
