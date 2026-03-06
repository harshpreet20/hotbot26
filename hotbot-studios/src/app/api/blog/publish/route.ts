import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { BlogPost, BlogPostsStore } from "@/types/blog";

const POSTS_FILE = path.join(process.cwd(), "public", "data", "posts.json");
const PUBLISH_SECRET = process.env.BLOG_PUBLISH_SECRET || "hotbot-blog-secret-2026";

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
  try {
    const body = await req.json() as { secret: string; action?: string; post: BlogPost };

    if (body.secret !== PUBLISH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action = "publish", post } = body;

    if (!post?.slug || !post?.title) {
      return NextResponse.json({ error: "Missing required post fields: slug, title" }, { status: 400 });
    }

    const store = readPosts();

    if (action === "delete") {
      store.posts = store.posts.filter((p) => p.slug !== post.slug);
      writePosts(store);
      return NextResponse.json({ success: true, action: "deleted", slug: post.slug });
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

    return NextResponse.json({
      success: true,
      action: existingIndex >= 0 ? "updated" : "created",
      slug: finalPost.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${finalPost.slug}`,
    });
  } catch (error) {
    console.error("Blog publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Allow N8N to check if a slug already exists
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== PUBLISH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = readPosts();

  if (slug) {
    const post = store.posts.find((p) => p.slug === slug);
    return NextResponse.json({ exists: !!post, post: post || null });
  }

  return NextResponse.json({ count: store.posts.length, slugs: store.posts.map((p) => p.slug) });
}
