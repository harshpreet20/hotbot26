/**
 * Centralised read/write for blog posts.
 *
 * Read priority:
 *   1. /tmp/hotbot-data/posts.json   (Vercel — written by previous requests in this instance)
 *   2. GitHub API                    (Vercel cold start — fetches latest committed version)
 *   3. public/data/posts.json        (build-time seed — always present)
 *
 * Write flow:
 *   1. Write to /tmp/hotbot-data/posts.json (immediate — same-instance reads see it at once)
 *   2. Commit to GitHub (fire-and-forget — triggers Vercel redeploy, bakes data into next bundle)
 *
 * Local dev: reads/writes go directly to public/data/posts.json (no /tmp, no GitHub).
 */
import fs   from "fs";
import path from "path";
import type { BlogPost, BlogPostsStore } from "@/types/blog";
import { commitPostsToGitHub, fetchPostsFromGitHub } from "@/lib/githubStore";

const SEED_FILE = path.join(process.cwd(), "public", "data", "posts.json");
const TMP_FILE  = "/tmp/hotbot-data/posts.json";
const IS_VERCEL = !!process.env.VERCEL;

// ── Read ─────────────────────────────────────────────────────────────────────

export function readPosts(): BlogPostsStore {
  if (IS_VERCEL) {
    // 1. Check /tmp (hot path — populated by previous writes in this Lambda instance)
    try {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      return JSON.parse(raw) as BlogPostsStore;
    } catch { /* fall through */ }
  }

  // 2. Fall back to the build-time seed file (always present in the deployment bundle)
  try {
    const raw = fs.readFileSync(SEED_FILE, "utf-8");
    return JSON.parse(raw) as BlogPostsStore;
  } catch {
    return { posts: [] };
  }
}

/**
 * Async variant used on cold starts: tries GitHub before falling back to the
 * seed file so the freshest committed data is returned even after a cold start.
 */
export async function readPostsAsync(): Promise<BlogPostsStore> {
  if (IS_VERCEL) {
    // 1. /tmp hot path
    try {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      return JSON.parse(raw) as BlogPostsStore;
    } catch { /* fall through */ }

    // 2. GitHub — latest committed version
    const ghContent = await fetchPostsFromGitHub();
    if (ghContent) {
      try {
        const store = JSON.parse(ghContent) as BlogPostsStore;
        // Hydrate /tmp so subsequent sync reads are fast
        _writeTmp(ghContent);
        return store;
      } catch { /* fall through */ }
    }
  }

  // 3. Build-time seed
  try {
    const raw = fs.readFileSync(SEED_FILE, "utf-8");
    return JSON.parse(raw) as BlogPostsStore;
  } catch {
    return { posts: [] };
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

function _writeTmp(content: string): void {
  try {
    const dir = path.dirname(TMP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TMP_FILE, content, "utf-8");
  } catch (e) {
    console.error("[postsStore] failed to write /tmp:", e);
  }
}

export function writePosts(store: BlogPostsStore): void {
  const content = JSON.stringify(store, null, 2);

  if (IS_VERCEL) {
    // Immediate write so the same Lambda instance sees the update at once
    _writeTmp(content);
  } else {
    // Local dev: write directly to the seed file (public/data/posts.json)
    fs.writeFileSync(SEED_FILE, content, "utf-8");
  }

  // Fire-and-forget GitHub commit — persists data across cold starts & redeploys
  void commitPostsToGitHub(content);
}

// ── Convenience helpers ───────────────────────────────────────────────────────

export function upsertPost(post: BlogPost): BlogPost {
  const store = readPosts();
  const now   = new Date().toISOString();
  const saved: BlogPost = {
    ...post,
    id:               post.id || String(Date.now()),
    publishedAt:      post.publishedAt || now,
    updatedAt:        now,
    status:           post.status || "published",
    adTopic:          post.adTopic || "general",
    tags:             post.tags || [],
    author:           post.author || "HotBot Studios",
    metaTitle:        post.metaTitle || post.title,
    metaDescription:  post.metaDescription || post.excerpt || "",
    focusKeyword:     post.focusKeyword || "",
    featuredImageAlt: post.featuredImageAlt || "",
    seoScore:         post.seoScore ?? 0,
  };
  const idx = store.posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) { store.posts[idx] = saved; }
  else          { store.posts.unshift(saved); }
  writePosts(store);
  return saved;
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
