import { createAdminClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import type { AdminUser } from '@/types/database'

const SESSION_COOKIE = 'hb_session'
const SESSION_TTL_HOURS = 24

type SafeUser = Omit<AdminUser, 'password_hash'>

/**
 * Verify username + password, create a session, set cookie.
 * Returns the user (without password_hash) or null.
 */
export async function login(
  username: string,
  password: string
): Promise<SafeUser | null> {
  const db = createAdminClient()

  const { data: user, error } = await db
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (error || !user) return null

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return null

  // Create session token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString()

  await db.from('sessions').insert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
  })

  // Update last_login
  await db
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id)

  // Set HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  })

  const { password_hash: _, ...safeUser } = user
  return safeUser
}

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated or session expired.
 */
export async function getSession(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const db = createAdminClient()

    const { data: session } = await db
      .from('sessions')
      .select('*, admin_users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session?.admin_users) return null

    const user = session.admin_users as unknown as AdminUser
    if (!user.is_active) return null

    const { password_hash: _, ...safeUser } = user
    return safeUser
  } catch {
    return null
  }
}

/**
 * Destroy the current session (logout).
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    const db = createAdminClient()
    await db.from('sessions').delete().eq('token', token)
  }

  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Require authentication — returns user or throws 401 Response.
 * Use in API routes: const user = await requireAuth()
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getSession()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

/**
 * Require specific roles. Throws if user lacks permission.
 */
export async function requireRole(
  ...roles: AdminUser['role'][]
): Promise<SafeUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN')
  return user
}

/**
 * Hash a password with bcrypt (10 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
