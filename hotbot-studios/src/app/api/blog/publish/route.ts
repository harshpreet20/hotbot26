import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import type { BlogPost, BlogPostsStore } from "@/types/blog";

const POSTS_FILE = path.join(process.cwd(), "public", "data", "posts.json");
const PUBLISH_SECRET = process.env.BLOG_PUBLISH_SECRET || "hotbot-blog-secret-2026";

const ALLOWED_ORIGINS = [
  "https://backdrop.hotbotstudios.com",
  "https://hotbotstudios.com",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
].filter(Boolean);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function readPosts(): BlogPostsStore {
  try {
    const raw = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(raw) as BlogPostsStore;
  } catch {
    return { posts: [] };
  }
}

function writePosts(store: BlogPostsStore): void {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// Called by N8N after processing/enhancing content with Claude.
// Payload from N8N: { secret, action, post: BlogPost }
export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);
  try {
    const body = await req.json() as { secret: string; action?: string; post: BlogPost };

    if (body.secret !== PUBLISH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
    }

    const { action = "publish", post } = body;

    if (!post?.slug || !post?.title) {
      return NextResponse.json({ error: "Missing required post fields: slug, title" }, { status: 400, headers: cors });
    }

    const store = readPosts();

    if (action === "delete") {
      store.posts = store.posts.filter((p) => p.slug !== post.slug);
      writePosts(store);
      // Revalidate blog list and the deleted post's page
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
      return NextResponse.json({ success: true, action: "deleted", slug: post.slug }, { headers: cors });
    }

    // Upsert — update if slug exists, otherwise insert
    const now = new Date().toISOString();
    const existingIndex = store.posts.findIndex((p) => p.slug === post.slug);
    const finalPost: BlogPost = {
      ...post,
      id: post.id || String(Date.now()),
      publishedAt: post.publishedAt || now,
      updatedAt: now,
      status: post.status || "published",
      adTopic: post.adTopic || "general",
      tags: post.tags || [],
      author: post.author || "HotBot Studios",
    };

    if (existingIndex >= 0) {
      store.posts[existingIndex] = finalPost;
    } else {
      store.posts.unshift(finalPost); // newest first
    }

    writePosts(store);

    // On-demand revalidation — blog list + this specific post + all dynamic blog slugs
    revalidatePath("/blog");
    revalidatePath(`/blog/${finalPost.slug}`);
    // Revalidate the entire /blog/[slug] layout so Next.js picks up new slugs too
    revalidatePath("/blog/[slug]", "page");

    return NextResponse.json({
      success: true,
      action: existingIndex >= 0 ? "updated" : "created",
      slug: finalPost.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com"}/blog/${finalPost.slug}`,
    }, { headers: cors });
  } catch (error) {
    console.error("Blog publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: cors });
  }
}

// Allow N8N and Backdrop to check if a slug already exists
export async function GET(req: NextRequest) {
  const cors = corsHeaders(req);
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== PUBLISH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  const store = readPosts();

  if (slug) {
    const post = store.posts.find((p) => p.slug === slug);
    return NextResponse.json({ exists: !!post, post: post || null }, { headers: cors });
  }

  return NextResponse.json({ count: store.posts.length, slugs: store.posts.map((p) => p.slug) }, { headers: cors });
}
