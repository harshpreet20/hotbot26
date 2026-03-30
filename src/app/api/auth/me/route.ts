import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await requireAuth(req)
  if (user instanceof NextResponse) return user
  return NextResponse.json({ user })
}
