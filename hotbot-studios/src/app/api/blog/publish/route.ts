import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getPublishSecret } from "@/lib/adminStore";
import { getSession } from "@/lib/sessions";
import type { BlogPost, BlogPostsStore } from "@/types/blog";

const POSTS_FILE = path.join(process.cwd(), "public", "data", "posts.json");

function isPublishAuthorized(secret: string | null | undefined): boolean {
  if (!secret) return false;
  // Accept admin session token
  const session = getSession(secret);
  if (session?.role === "admin") return true;
  // Accept static publish secret
  const ps = getPublishSecret();
  return !!ps && secret === ps;
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

// Called by the Backdrop admin at /enter/backdrop/dashboard/blog.
// Payload: { secret, action, post: BlogPost }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { secret: string; action?: string; post: BlogPost };

    if (!isPublishAuthorized(body.secret)) {
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

// Check if a slug exists — accepts session token or publish secret
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const slug   = searchParams.get("slug");

  if (!isPublishAuthorized(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = readPosts();

  if (slug) {
    const post = store.posts.find((p) => p.slug === slug);
    return NextResponse.json({ exists: !!post, post: post || null });
  }

  return NextResponse.json({ count: store.posts.length, slugs: store.posts.map((p) => p.slug) });
}
