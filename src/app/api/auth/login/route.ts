import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const user = await login(username, password)

  if (!user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
