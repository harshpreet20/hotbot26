import { NextRequest, NextResponse } from 'next/server'
import { requireRole, hashPassword } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { UserRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Only super_admin can create users
  const user = await requireRole(req, ['super_admin'])
  if (user instanceof NextResponse) return user

  try {
    const body = await req.json() as {
      username?: string
      password?: string
      role?: string
      email?: string
    }
    const { username, password, role = 'editor', email } = body

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const validRoles: UserRole[] = ['super_admin', 'admin', 'editor', 'finance']
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const { data, error } = await getSupabaseAdmin()
      .from('admin_users')
      .insert({
        username: username.trim(),
        password_hash: passwordHash,
        role: role as UserRole,
        email: email?.trim() || null,
        is_active: true,
      })
      .select('id, username, role, email, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
