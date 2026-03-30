import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from './supabase'

const SESSION_COOKIE = 'hb_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'finance'

export interface SessionUser {
  id: string
  username: string
  role: UserRole
  email: string | null
}

// ── Password hashing ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ── Session management ────────────────────────────────────────────────────────

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function login(username: string, password: string): Promise<{ user: SessionUser; token: string } | null> {
  const { data: user, error } = await getSupabaseAdmin()
    .from('admin_users')
    .select('id, username, password_hash, role, email, is_active')
    .eq('username', username)
    .single()

  if (error || !user || !user.is_active) return null

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return null

  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  const { error: sessionError } = await getSupabaseAdmin()
    .from('sessions')
    .insert({ user_id: user.id, token, expires_at: expiresAt })

  if (sessionError) return null

  return {
    user: { id: user.id, username: user.username, role: user.role as UserRole, email: user.email },
    token,
  }
}

export async function logout(token: string): Promise<void> {
  await getSupabaseAdmin()
    .from('sessions')
    .delete()
    .eq('token', token)
}

export async function getSession(token: string): Promise<SessionUser | null> {
  const { data: session, error } = await getSupabaseAdmin()
    .from('sessions')
    .select('user_id, expires_at, admin_users(id, username, role, email, is_active)')
    .eq('token', token)
    .single()

  if (error || !session) return null
  if (new Date(session.expires_at) < new Date()) {
    // Expired — clean up
    await getSupabaseAdmin()
      .from('sessions')
      .delete()
      .eq('token', token)
    return null
  }

  const adminUser = Array.isArray(session.admin_users) ? session.admin_users[0] : session.admin_users
  if (!adminUser || !adminUser.is_active) return null

  return {
    id: adminUser.id,
    username: adminUser.username,
    role: adminUser.role as UserRole,
    email: adminUser.email,
  }
}

// ── Request helpers ───────────────────────────────────────────────────────────

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value || null
}

export async function requireAuth(req: NextRequest): Promise<SessionUser | NextResponse> {
  const token = getTokenFromRequest(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await getSession(token)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}

export async function requireRole(req: NextRequest, roles: UserRole[]): Promise<SessionUser | NextResponse> {
  const result = await requireAuth(req)
  if (result instanceof NextResponse) return result
  if (!roles.includes(result.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return result
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  })
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// ── Seeding (run once) ────────────────────────────────────────────────────────

export async function seedAdminUser(): Promise<void> {
  const { data: existing } = await getSupabaseAdmin()
    .from('admin_users')
    .select('id')
    .eq('username', 'admin')
    .single()

  if (existing) return // already seeded

  const passwordHash = await hashPassword('Hotbotstudios')
  await getSupabaseAdmin()
    .from('admin_users')
    .insert({
      username: 'admin',
      password_hash: passwordHash,
      role: 'super_admin',
      email: null,
      is_active: true,
    })
}
