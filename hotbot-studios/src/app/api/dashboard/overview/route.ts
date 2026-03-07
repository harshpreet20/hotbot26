import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeData } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import { readPosts } from "@/lib/postsStore";
import type { Lead, Contact, CallbackRequest, NewsletterSubscriber, ChatSession } from "@/types/dashboard";

export async function GET(req: NextRequest) {
  if (!authorizeData(extractToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads      = readAll<Lead>("leads");
  const contacts   = readAll<Contact>("contacts");
  const newsletter = readAll<NewsletterSubscriber>("newsletter");
  const callbacks  = readAll<CallbackRequest>("callbacks");
  const chats      = readAll<ChatSession>("chats");
  const postsCount = readPosts().posts?.length ?? 0;

  return NextResponse.json({
    leads:           leads.length,
    contacts:        contacts.length,
    newsletter:      newsletter.length,
    callbacks:       callbacks.length,
    chats:           chats.length,
    posts:           postsCount,
    recentLeads:     leads.slice(0, 5),
    recentContacts:  contacts.slice(0, 5),
    recentCallbacks: callbacks.slice(0, 5),
  });
}
