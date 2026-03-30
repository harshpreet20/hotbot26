import { NextRequest, NextResponse } from 'next/server'
import { requireRole, hashPassword } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']

// Only super_admin can create new users
export async function POST(req: NextRequest) {
  try {
    await requireRole('super_admin')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { username, password, full_name, role } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)
  const db = createAdminClient()

  const { data, error } = await db
    .from('admin_users')
    .insert({
      username,
      password_hash,
      full_name: full_name || null,
      role: role || 'admin',
    } as AdminUserInsert)
    .select('id, username, full_name, role, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ user: data }, { status: 201 })
}
