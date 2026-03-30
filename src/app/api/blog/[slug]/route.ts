import { NextRequest, NextResponse } from 'next/server'
import { supabase, createAdminClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import type { Database } from '@/types/database'

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

// GET /api/blog/[slug]
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  return NextResponse.json({ post: data })
}

// PATCH /api/blog/[slug]
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const body = await req.json() as BlogPostUpdate
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('blog_posts')
    .update(body)
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ post: data })
}

// DELETE /api/blog/[slug]
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const admin = createAdminClient()

  const { error } = await admin
    .from('blog_posts')
    .delete()
    .eq('slug', params.slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
