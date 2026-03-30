import { NextRequest, NextResponse } from 'next/server'
import { logout, getTokenFromRequest, clearSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (token) {
    await logout(token).catch(() => {}) // Silent fail — cookie cleared regardless
  }
  const res = NextResponse.json({ success: true })
  clearSessionCookie(res)
  return res
}
