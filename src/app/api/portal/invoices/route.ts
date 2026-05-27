export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { sb, isSupabaseEnabled } from '@/lib/supabase';
import { verifyPortalSession } from '@/lib/portal-auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sessionCookie = req.cookies.get('portal_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = verifyPortalSession(sessionCookie);
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseEnabled()) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Fetch invoices for this email
    const { data: invoices, error: invErr } = await sb()
      .from('invoices')
      .select('id, invoice_number, status, client_name, client_company, total, currency, issued_date, due_date, paid_date, subtotal, tax_amount, discount, line_items')
      .eq('client_email', email)
      .order('created_at', { ascending: false });

    if (invErr) {
      console.error('[portal/invoices] invoices error:', invErr);
      return NextResponse.json({ error: 'Service error' }, { status: 500 });
    }

    const safeInvoices = invoices ?? [];

    // Fetch payments for these invoices
    let payments: unknown[] = [];
    if (safeInvoices.length > 0) {
      const ids = safeInvoices.map((i: { id: string }) => i.id);
      const { data: paymentRows, error: payErr } = await sb()
        .from('payments')
        .select('*')
        .in('invoice_id', ids)
        .eq('status', 'completed');

      if (payErr) {
        // Non-fatal — payments table may not exist
        console.warn('[portal/invoices] payments error:', payErr);
      } else {
        payments = paymentRows ?? [];
      }
    }

    return NextResponse.json({ email, invoices: safeInvoices, payments });
  } catch (err) {
    console.error('[portal/invoices] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
