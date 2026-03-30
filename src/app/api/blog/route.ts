import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase'

// GET /api/blog — list published posts (public)
// GET /api/blog?all=1 — list all posts (admin only)
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1'
  const tag = req.nextUrl.searchParams.get('tag')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20')
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0')

  let query = supabase
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,tags,status,published_at,created_at,author_id')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (!all) query = query.eq('status', 'published')
  if (tag) query = query.contains('tags', [tag])

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

// POST /api/blog — create post (admin/editor)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const admin = createAdminClient()

  // Auto-generate slug if not provided
  if (!body.slug && body.title) {
    body.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const { data, error } = await admin
    .from('blog_posts')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ post: data }, { status: 201 })
}
