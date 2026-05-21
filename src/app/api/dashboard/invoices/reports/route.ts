import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeRole } from "@/lib/dashboardAuth";
import { sb } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await authorizeRole(extractToken(req), "super_admin", "admin", "finance");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  if (!type) return NextResponse.json({ error: "Missing ?type= parameter" }, { status: 400 });

  try {
    switch (type) {
      case "aging": {
        const { data: rows, error: err } = await sb()
          .from("invoices")
          .select("id, invoice_number, client_name, client_email, client_company, total, currency, due_date, status")
          .in("status", ["sent", "viewed", "overdue"]);
        if (err) return NextResponse.json({ error: err.message }, { status: 500 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        type AgingRow = {
          id: string;
          invoice_number: string;
          client_name: string;
          client_email: string;
          client_company: string | null;
          total: number;
          currency: string;
          due_date: string;
          status: string;
          daysOverdue: number;
        };

        const enriched: AgingRow[] = (rows ?? []).map((r) => {
          const due = new Date(r.due_date as string);
          due.setHours(0, 0, 0, 0);
          const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000);
          return {
            id:             r.id as string,
            invoice_number: r.invoice_number as string,
            client_name:    r.client_name as string,
            client_email:   r.client_email as string,
            client_company: r.client_company as string | null,
            total:          Number(r.total),
            currency:       r.currency as string,
            due_date:       r.due_date as string,
            status:         r.status as string,
            daysOverdue,
          };
        });

        const buckets = {
          current:  enriched.filter((r) => r.daysOverdue <= 0),
          days1_30:  enriched.filter((r) => r.daysOverdue > 0 && r.daysOverdue <= 30),
          days31_60: enriched.filter((r) => r.daysOverdue > 30 && r.daysOverdue <= 60),
          days61_90: enriched.filter((r) => r.daysOverdue > 60 && r.daysOverdue <= 90),
          days90plus: enriched.filter((r) => r.daysOverdue > 90),
        };

        const summary = {
          current:    { count: buckets.current.length,    total: buckets.current.reduce((s, r) => s + r.total, 0) },
          days1_30:   { count: buckets.days1_30.length,   total: buckets.days1_30.reduce((s, r) => s + r.total, 0) },
          days31_60:  { count: buckets.days31_60.length,  total: buckets.days31_60.reduce((s, r) => s + r.total, 0) },
          days61_90:  { count: buckets.days61_90.length,  total: buckets.days61_90.reduce((s, r) => s + r.total, 0) },
          days90plus: { count: buckets.days90plus.length, total: buckets.days90plus.reduce((s, r) => s + r.total, 0) },
        };

        const allRows = [...enriched].sort((a, b) => b.daysOverdue - a.daysOverdue);
        return NextResponse.json({ type: "aging", summary, rows: allRows });
      }

      case "gst": {
        let query = sb()
          .from("invoices")
          .select("invoice_number, client_name, issued_date, subtotal, discount, tax_rate, tax_amount, total, currency")
          .neq("status", "cancelled")
          .order("issued_date", { ascending: false });

        if (from) query = query.gte("issued_date", from);
        if (to)   query = query.lte("issued_date", to);

        const { data: rows, error: err } = await query;
        if (err) return NextResponse.json({ error: err.message }, { status: 500 });

        type GstRow = {
          invoiceNumber: string;
          clientName: string;
          issuedDate: string;
          subtotal: number;
          discount: number;
          taxableAmount: number;
          taxRate: number;
          taxAmount: number;
          cgst: number;
          sgst: number;
          total: number;
          currency: string;
        };

        const mapped: GstRow[] = (rows ?? []).map((r) => {
          const sub      = Number(r.subtotal);
          const disc     = Number(r.discount);
          const taxAmt   = Number(r.tax_amount);
          const taxable  = sub - disc;
          const cgst     = parseFloat((taxAmt / 2).toFixed(2));
          const sgst     = parseFloat((taxAmt / 2).toFixed(2));
          return {
            invoiceNumber: r.invoice_number as string,
            clientName:    r.client_name as string,
            issuedDate:    r.issued_date as string,
            subtotal:      sub,
            discount:      disc,
            taxableAmount: parseFloat(taxable.toFixed(2)),
            taxRate:       Number(r.tax_rate),
            taxAmount:     taxAmt,
            cgst,
            sgst,
            total:         Number(r.total),
            currency:      r.currency as string,
          };
        });

        const totals = {
          totalTaxable: parseFloat(mapped.reduce((s, r) => s + r.taxableAmount, 0).toFixed(2)),
          totalCgst:    parseFloat(mapped.reduce((s, r) => s + r.cgst, 0).toFixed(2)),
          totalSgst:    parseFloat(mapped.reduce((s, r) => s + r.sgst, 0).toFixed(2)),
          totalGst:     parseFloat(mapped.reduce((s, r) => s + r.taxAmount, 0).toFixed(2)),
          totalRevenue: parseFloat(mapped.reduce((s, r) => s + r.total, 0).toFixed(2)),
        };

        return NextResponse.json({ type: "gst", totals, rows: mapped });
      }

      case "sales": {
        const { data: rows, error: err } = await sb()
          .from("invoices")
          .select("issued_date, total, status, currency")
          .neq("status", "cancelled")
          .order("issued_date", { ascending: false });
        if (err) return NextResponse.json({ error: err.message }, { status: 500 });

        // Group by month
        type MonthGroup = {
          month: string;
          invoiceCount: number;
          grossRevenue: number;
          collected: number;
          outstanding: number;
          currency: string;
        };

        const monthMap = new Map<string, MonthGroup>();

        for (const r of rows ?? []) {
          const d = new Date(r.issued_date as string);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const currency = r.currency as string;
          const key = `${monthKey}__${currency}`;
          const total = Number(r.total);
          const status = r.status as string;

          if (!monthMap.has(key)) {
            monthMap.set(key, {
              month: monthKey,
              invoiceCount: 0,
              grossRevenue: 0,
              collected: 0,
              outstanding: 0,
              currency,
            });
          }
          const g = monthMap.get(key)!;
          g.invoiceCount++;
          g.grossRevenue += total;
          if (status === "paid") g.collected += total;
          if (["sent", "viewed", "overdue"].includes(status)) g.outstanding += total;
        }

        const result = Array.from(monthMap.values())
          .sort((a, b) => b.month.localeCompare(a.month))
          .slice(0, 24)
          .map((g) => ({
            ...g,
            grossRevenue: parseFloat(g.grossRevenue.toFixed(2)),
            collected:    parseFloat(g.collected.toFixed(2)),
            outstanding:  parseFloat(g.outstanding.toFixed(2)),
          }));

        return NextResponse.json({ type: "sales", rows: result });
      }

      case "outstanding": {
        const { data: rows, error: err } = await sb()
          .from("invoices")
          .select("client_email, client_name, client_company, total, due_date, currency")
          .in("status", ["sent", "viewed", "overdue"]);
        if (err) return NextResponse.json({ error: err.message }, { status: 500 });

        type OutstandingGroup = {
          clientEmail: string;
          clientName: string;
          clientCompany: string | null;
          invoiceCount: number;
          totalOutstanding: number;
          oldestDue: string;
          latestDue: string;
          currency: string;
        };

        const clientMap = new Map<string, OutstandingGroup>();

        for (const r of rows ?? []) {
          const email    = r.client_email as string;
          const currency = r.currency as string;
          const key      = `${email}__${currency}`;
          const total    = Number(r.total);
          const due      = r.due_date as string;

          if (!clientMap.has(key)) {
            clientMap.set(key, {
              clientEmail:      email,
              clientName:       r.client_name as string,
              clientCompany:    r.client_company as string | null,
              invoiceCount:     0,
              totalOutstanding: 0,
              oldestDue:        due,
              latestDue:        due,
              currency,
            });
          }
          const g = clientMap.get(key)!;
          g.invoiceCount++;
          g.totalOutstanding += total;
          if (due < g.oldestDue) g.oldestDue = due;
          if (due > g.latestDue) g.latestDue = due;
        }

        const result = Array.from(clientMap.values())
          .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
          .map((g) => ({
            ...g,
            totalOutstanding: parseFloat(g.totalOutstanding.toFixed(2)),
          }));

        const grandTotal = parseFloat(result.reduce((s, r) => s + r.totalOutstanding, 0).toFixed(2));

        return NextResponse.json({ type: "outstanding", grandTotal, rows: result });
      }

      default:
        return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
