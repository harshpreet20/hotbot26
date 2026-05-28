/**
 * POST /api/dashboard/invoices/check-overdue
 * - Marks invoices with status sent/viewed and past due_date as overdue.
 * - Invoices overdue 7+ days: suspend the linked client (if not already suspended).
 * - Invoices overdue 30+ days: log a termination recommendation.
 * Requires super_admin or admin role.
 */
import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAdmin } from "@/lib/dashboardAuth";
import { readAll, updateById, insert, newId } from "@/lib/store";
import { sb } from "@/lib/supabase";
import type { Invoice, Client, CRMUpdate } from "@/types/dashboard";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await authorizeAdmin(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized or insufficient permissions" }, { status: 401 });

  const now    = new Date();
  const nowIso = now.toISOString();

  // Fetch all invoices
  const invoices = await readAll<Invoice>("invoices");

  // Find sent/viewed invoices past their due date
  const overdueInvoices = invoices.filter((inv) => {
    if (inv.status !== "sent" && inv.status !== "viewed") return false;
    if (!inv.dueDate) return false;
    return new Date(inv.dueDate) < now;
  });

  const summary = {
    markedOverdue:              0,
    clientsSuspended:           0,
    terminationRecommendations: 0,
    skipped:                    0,
    details:                    [] as string[],
  };

  if (overdueInvoices.length === 0) {
    return NextResponse.json({ message: "No overdue invoices found.", summary });
  }

  // Fetch all clients (we need account_status from DB directly)
  const { data: dbClients } = await sb()
    .from("clients")
    .select("id, client_id, name, email, account_status");
  const clientMap = new Map<string, { id: string; clientId: string; name: string; email: string; accountStatus: string }>();
  for (const c of (dbClients ?? [])) {
    // Index by clientId (HBS-XXXXX) since invoices may link by clientEmail or leadId
    clientMap.set(c.client_id, {
      id:            c.id,
      clientId:      c.client_id,
      name:          c.name,
      email:         c.email,
      accountStatus: c.account_status ?? "active",
    });
  }

  // Also fetch clients by email for matching
  const clientByEmail = new Map<string, typeof clientMap extends Map<string, infer V> ? V : never>();
  for (const c of clientMap.values()) {
    if (c.email) clientByEmail.set(c.email.toLowerCase(), c);
  }

  for (const inv of overdueInvoices) {
    const dueDate      = new Date(inv.dueDate);
    const daysOverdue  = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // 1. Mark invoice as overdue
    try {
      await updateById<Invoice>("invoices", inv.id, {
        status:        "overdue",
        lastUpdatedAt: nowIso,
        lastUpdatedBy: session.username,
      });
      summary.markedOverdue++;
      summary.details.push(`${inv.invoiceNumber}: marked overdue (${daysOverdue}d past due)`);
    } catch (err) {
      console.error("[check-overdue] update invoice error:", err instanceof Error ? err.message : err);
      summary.skipped++;
      continue;
    }

    // Try to find the linked client by email
    const client = inv.clientEmail
      ? clientByEmail.get(inv.clientEmail.toLowerCase())
      : undefined;

    if (!client) {
      summary.details.push(`${inv.invoiceNumber}: no linked client found for email "${inv.clientEmail}"`);
      continue;
    }

    // 2. Overdue 7+ days → suspend client (if not already suspended/terminated)
    if (daysOverdue >= 7 && client.accountStatus === "active") {
      try {
        const reason = `Invoice ${inv.invoiceNumber} is ${daysOverdue} days overdue (due: ${inv.dueDate}).`;
        const { error } = await sb()
          .from("clients")
          .update({
            account_status:    "suspended",
            suspended_at:      nowIso,
            suspension_reason: reason,
            updated_at:        nowIso,
          })
          .eq("id", client.id);

        if (!error) {
          client.accountStatus = "suspended"; // update local cache
          summary.clientsSuspended++;
          summary.details.push(`${inv.invoiceNumber}: client "${client.name}" suspended (${daysOverdue}d overdue)`);

          // Log to crm_updates
          const crmEntry: CRMUpdate = {
            id:        newId(),
            leadId:    client.id,
            type:      "account_status_change" as CRMUpdate["type"],
            content:   `Account auto-suspended: ${reason}`,
            createdAt: nowIso,
            createdBy: "system",
            metadata:  {
              entityType:  "client",
              clientId:    client.clientId,
              invoiceId:   inv.id,
              invoiceNumber: inv.invoiceNumber,
              daysOverdue: String(daysOverdue),
              newStatus:   "suspended",
            },
          };
          await insert<CRMUpdate>("crm_updates", crmEntry).catch(console.error);
        } else {
          console.error("[check-overdue] suspend client error:", error.message);
        }
      } catch (err) {
        console.error("[check-overdue] suspend client unexpected error:", err instanceof Error ? err.message : err);
      }
    }

    // 3. Overdue 30+ days → log termination recommendation
    if (daysOverdue >= 30) {
      try {
        const content = `Termination recommended: Invoice ${inv.invoiceNumber} is ${daysOverdue} days overdue (total: ${inv.total} ${inv.currency}). Client has not settled the outstanding balance.`;
        const crmEntry: CRMUpdate = {
          id:        newId(),
          leadId:    client.id,
          type:      "note" as CRMUpdate["type"],
          content,
          createdAt: nowIso,
          createdBy: "system",
          metadata:  {
            entityType:    "client",
            clientId:      client.clientId,
            invoiceId:     inv.id,
            invoiceNumber: inv.invoiceNumber,
            daysOverdue:   String(daysOverdue),
            recommendation: "terminate",
          },
        };
        await insert<CRMUpdate>("crm_updates", crmEntry).catch(console.error);
        summary.terminationRecommendations++;
        summary.details.push(`${inv.invoiceNumber}: termination recommendation logged for client "${client.name}" (${daysOverdue}d overdue)`);
      } catch (err) {
        console.error("[check-overdue] termination recommendation error:", err instanceof Error ? err.message : err);
      }
    }
  }

  return NextResponse.json({
    message: `Processed ${overdueInvoices.length} overdue invoice(s).`,
    summary,
  });
}
