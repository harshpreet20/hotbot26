import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET — public: list published posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const tag = searchParams.get('tag')

    let query = getSupabaseAdmin()
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, tags, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ posts: data, total: count })
  } catch (error) {
    console.error('Blog list error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST — auth required: create post
export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      title?: string
      slug?: string
      content?: string
      excerpt?: string
      cover_image?: string
      tags?: string[]
      status?: 'draft' | 'published' | 'archived'
      seo_title?: string
      seo_description?: string
    }

    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .insert({
        title: body.title.trim(),
        slug: body.slug.trim(),
        content: body.content || null,
        excerpt: body.excerpt || null,
        cover_image: body.cover_image || null,
        tags: body.tags || [],
        status: body.status || 'draft',
        author_id: user.id,
        published_at: body.status === 'published' ? new Date().toISOString() : null,
        seo_title: body.seo_title || null,
        seo_description: body.seo_description || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) {
    console.error('Blog create error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
