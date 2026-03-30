import { NextRequest, NextResponse } from 'next/server'
import { login, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { username?: string; password?: string }
    const { username, password } = body

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const result = await login(username.trim(), password)
    if (!result) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const res = NextResponse.json({
      user: { id: result.user.id, username: result.user.username, role: result.user.role, email: result.user.email },
    })
    setSessionCookie(res, result.token)
    return res
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
