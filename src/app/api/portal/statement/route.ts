import { NextRequest, NextResponse } from 'next/server';
import { sb, isSupabaseEnabled } from '@/lib/supabase';
import { verifyPortalSession } from '@/lib/portal-auth';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  currency: string;
  due_date: string;
  paid_date: string | null;
  issued_date: string;
  subtotal: number;
  tax_amount: number;
  discount: number;
}

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

    const { data: invoices, error } = await sb()
      .from('invoices')
      .select('id, invoice_number, status, total, currency, due_date, paid_date, issued_date, subtotal, tax_amount, discount')
      .eq('client_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[portal/statement] error:', error);
      return NextResponse.json({ error: 'Service error' }, { status: 500 });
    }

    const safeInvoices: InvoiceRow[] = (invoices ?? []) as InvoiceRow[];
    const now = new Date();

    let totalBilled = 0;
    let totalPaid = 0;
    const outstanding: {
      id: string;
      invoice_number: string;
      total: number;
      currency: string;
      due_date: string;
      days_overdue: number;
      aging_bucket: string;
    }[] = [];
    const upcomingDues: {
      id: string;
      invoice_number: string;
      total: number;
      currency: string;
      due_date: string;
      days_until_due: number;
    }[] = [];

    for (const inv of safeInvoices) {
      totalBilled += inv.total ?? 0;
      if (inv.status === 'paid') {
        totalPaid += inv.total ?? 0;
      }

      if (inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'draft') {
        const dueDate = new Date(inv.due_date);
        const diffMs = now.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          // Overdue
          let agingBucket = '0-30 days';
          if (diffDays > 60) agingBucket = '60+ days';
          else if (diffDays > 30) agingBucket = '31-60 days';

          outstanding.push({
            id: inv.id,
            invoice_number: inv.invoice_number,
            total: inv.total,
            currency: inv.currency,
            due_date: inv.due_date,
            days_overdue: diffDays,
            aging_bucket: agingBucket,
          });
        } else {
          // Not yet due — check if due within 30 days
          const daysUntilDue = Math.abs(diffDays);
          if (daysUntilDue <= 30) {
            upcomingDues.push({
              id: inv.id,
              invoice_number: inv.invoice_number,
              total: inv.total,
              currency: inv.currency,
              due_date: inv.due_date,
              days_until_due: daysUntilDue,
            });
          }
        }
      }
    }

    const outstandingBalance = totalBilled - totalPaid;

    return NextResponse.json({
      email,
      summary: {
        total_billed: totalBilled,
        total_paid: totalPaid,
        outstanding_balance: outstandingBalance,
      },
      outstanding_invoices: outstanding,
      upcoming_dues: upcomingDues,
    });
  } catch (err) {
    console.error('[portal/statement] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
