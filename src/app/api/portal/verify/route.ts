import { NextRequest, NextResponse } from 'next/server';
import { sb, isSupabaseEnabled } from '@/lib/supabase';
import { createPortalSession } from '@/lib/portal-auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { token?: string };
    const token = (body.token ?? '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (!isSupabaseEnabled()) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Find valid unused token
    const { data: rows, error } = await sb()
      .from('customer_portal_tokens')
      .select('id, email')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('used_at', null)
      .limit(1);

    if (error) {
      console.error('[portal/verify] lookup error:', error);
      return NextResponse.json({ error: 'Service error' }, { status: 500 });
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
    }

    const row = rows[0] as { id: string; email: string };

    // Mark token as used
    await sb()
      .from('customer_portal_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', row.id);

    // Create session cookie
    const sessionToken = createPortalSession(row.email);

    const response = NextResponse.json({ ok: true, email: row.email });
    response.cookies.set('portal_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('[portal/verify] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
