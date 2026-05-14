import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import { readPosts } from "@/lib/postsStore";
import type { Lead, Contact, CallbackRequest, NewsletterSubscriber, ChatSession, Invoice, CRMTask } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!await authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [leads, contacts, newsletter, callbacks, chats, invoices, tasks] = await Promise.all([
    readAll<Lead>("leads"),
    readAll<Contact>("contacts"),
    readAll<NewsletterSubscriber>("newsletter"),
    readAll<CallbackRequest>("callbacks"),
    readAll<ChatSession>("chats"),
    readAll<Invoice>("invoices"),
    readAll<CRMTask>("crm_tasks"),
  ]);

  const postsCount      = readPosts().posts?.length ?? 0;
  const invoiceRevenue  = invoices.filter((inv) => inv.status === "paid").reduce((s, inv) => s + inv.total, 0);
  const openTasks       = tasks.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return NextResponse.json({
    leads:           leads.length,
    contacts:        contacts.length,
    newsletter:      newsletter.length,
    callbacks:       callbacks.length,
    chats:           chats.length,
    posts:           postsCount,
    invoices:        invoices.length,
    invoiceRevenue,
    openTasks,
    recentLeads:     leads.slice(0, 5),
    recentContacts:  contacts.slice(0, 5),
    recentCallbacks: callbacks.slice(0, 5),
    recentInvoices:  invoices.slice(0, 5),
  });
}
