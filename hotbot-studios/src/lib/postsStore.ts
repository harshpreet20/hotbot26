/**
 * Centralised read/write for blog posts.
 * On Vercel the project root (/var/task) is read-only, so we write to /tmp.
 * Reads try /tmp first and fall back to the build-time seed in public/data/posts.json.
 */
import fs from "fs";
import path from "path";
import type { BlogPost, BlogPostsStore } from "@/types/blog";

const SEED_FILE   = path.join(process.cwd(), "public", "data", "posts.json");
const TMP_FILE    = "/tmp/hotbot-data/posts.json";
const WRITABLE    = process.env.VERCEL ? TMP_FILE : SEED_FILE;

export function readPosts(): BlogPostsStore {
  // On Vercel: prefer the mutable /tmp copy if it exists
  if (process.env.VERCEL) {
    try {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      return JSON.parse(raw) as BlogPostsStore;
    } catch {
      // fall through to seed file
    }
  }
  try {
    const raw = fs.readFileSync(SEED_FILE, "utf-8");
    return JSON.parse(raw) as BlogPostsStore;
  } catch {
    return { posts: [] };
  }
}

export function writePosts(store: BlogPostsStore): void {
  const file = WRITABLE;
  const dir  = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(store, null, 2), "utf-8");
}

/** Convenience: merge new/updated posts onto the current store without losing seed data. */
export function upsertPost(post: BlogPost): BlogPost {
  const store = readPosts();
  const now   = new Date().toISOString();
  const finalPost: BlogPost = {
    ...post,
    id:                  post.id || String(Date.now()),
    publishedAt:         post.publishedAt || now,
    updatedAt:           now,
    status:              post.status || "published",
    adTopic:             post.adTopic || "general",
    tags:                post.tags || [],
    author:              post.author || "HotBot Studios",
    metaTitle:           post.metaTitle || post.title,
    metaDescription:     post.metaDescription || post.excerpt || "",
    focusKeyword:        post.focusKeyword || "",
    featuredImageAlt:    post.featuredImageAlt || "",
    seoScore:            post.seoScore ?? 0,
  };
  const idx = store.posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) { store.posts[idx] = finalPost; }
  else          { store.posts.unshift(finalPost); }
  writePosts(store);
  return finalPost;
}

export function deletePost(slug: string): void {
  const store = readPosts();
  store.posts = store.posts.filter((p) => p.slug !== slug);
  writePosts(store);
}

export function getPost(slug: string): BlogPost | null {
  return readPosts().posts.find((p) => p.slug === slug && p.status === "published") || null;
}

export function getPublishedPosts(): BlogPost[] {
  return readPosts().posts.filter((p) => p.status === "published");
}
