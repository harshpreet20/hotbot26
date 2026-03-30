import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET — public: get single published post by slug
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Blog get error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PATCH — auth required: update post
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
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

    // If publishing for the first time, set published_at
    const updates: Record<string, unknown> = { ...body }
    if (body.status === 'published') {
      // Only set published_at if not already set
      const { data: existing } = await getSupabaseAdmin()
        .from('blog_posts')
        .select('published_at')
        .eq('slug', params.slug)
        .single()
      if (existing && !existing.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .update(updates)
      .eq('slug', params.slug)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Blog update error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE — auth required: delete post
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user

  try {
    const { error } = await getSupabaseAdmin()
      .from('blog_posts')
      .delete()
      .eq('slug', params.slug)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blog delete error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
