import { NextRequest, NextResponse } from "next/server";
import { authorizeData } from "@/lib/dashboardAuth";
import { readAll } from "@/lib/store";
import type { Lead, Contact, CallbackRequest, NewsletterSubscriber, ChatSession } from "@/types/dashboard";
import type { BlogPostsStore } from "@/types/blog";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!authorizeData(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads      = readAll<Lead>("leads");
  const contacts   = readAll<Contact>("contacts");
  const newsletter = readAll<NewsletterSubscriber>("newsletter");
  const callbacks  = readAll<CallbackRequest>("callbacks");
  const chats      = readAll<ChatSession>("chats");

  let postsCount = 0;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "public", "data", "posts.json"), "utf-8");
    const store = JSON.parse(raw) as BlogPostsStore;
    postsCount = store.posts?.length ?? 0;
  } catch { /* no posts yet */ }

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
