import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import type { BlogPost, BlogPostsStore } from "@/types/blog";

const POSTS_FILE = path.join(process.cwd(), "public", "data", "posts.json");
const PUBLISH_SECRET = process.env.BLOG_PUBLISH_SECRET || "hotbot-blog-secret-2026";
const N8N_BASE = process.env.N8N_BASE_URL || "http://localhost:5678/webhook/";
const N8N_BLOG_SHEETS = process.env.N8N_WEBHOOK_BLOG_SHEETS;

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

/** Fire-and-forget: sends post to N8N → Google Sheets backup */
async function syncToSheets(post: BlogPost): Promise<void> {
  if (!N8N_BLOG_SHEETS) return;
  try {
    await fetch(`${N8N_BASE}${N8N_BLOG_SHEETS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: post.id,
        slug: post.slug,
        title: post.title,
        status: post.status,
        category: post.category,
        author: post.author,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        excerpt: post.excerpt,
        tags: post.tags.join(", "),
        readTime: post.readTime,
        featuredImage: post.featuredImage || "",
        featuredImageAlt: post.featuredImageAlt || "",
        adTopic: post.adTopic,
        // SEO fields
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        focusKeyword: post.focusKeyword || "",
        seoScore: post.seoScore ?? 0,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com"}/blog/${post.slug}`,
      }),
    });
  } catch (err) {
    console.warn("N8N Sheets sync failed (non-blocking):", err);
  }
}

// Called by N8N after processing/enhancing content with Claude.
// Also called by the Backdrop admin at /enter/backdrop.
// Payload: { secret, action, post: BlogPost }
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
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
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
      // SEO fields — preserve or carry forward
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt || "",
      focusKeyword: post.focusKeyword || "",
      featuredImageAlt: post.featuredImageAlt || "",
      seoScore: post.seoScore ?? 0,
    };

    if (existingIndex >= 0) {
      store.posts[existingIndex] = finalPost;
    } else {
      store.posts.unshift(finalPost); // newest first
    }

    writePosts(store);

    revalidatePath("/blog");
    revalidatePath(`/blog/${finalPost.slug}`);
    revalidatePath("/blog/[slug]", "page");

    // Sync to Google Sheets via N8N (non-blocking)
    void syncToSheets(finalPost);

    return NextResponse.json({
      success: true,
      action: existingIndex >= 0 ? "updated" : "created",
      slug: finalPost.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com"}/blog/${finalPost.slug}`,
    });
  } catch (error) {
    console.error("Blog publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Allow N8N and the Backdrop admin to check if a slug already exists
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
