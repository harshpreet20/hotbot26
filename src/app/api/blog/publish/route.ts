import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readPosts, writePosts, upsertPost, deletePost } from "@/lib/postsStore";
import { getPublishSecret } from "@/lib/adminStore";
import { getSession } from "@/lib/sessions";
import type { BlogPost } from "@/types/blog";

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  // Also accept from request body (handled per-route) or cookie
  return req.cookies.get("backdrop_auth")?.value || null;
}

async function isPublishAuthorized(secret: string | null | undefined): Promise<boolean> {
  if (!secret) return false;
  const session = await getSession(secret);
  if (session?.role === "admin") return true;
  const ps = getPublishSecret();
  return !!ps && secret === ps;
}

// Called by the Backdrop admin at /enter/backdrop/dashboard/blog.
// Payload: { secret, action?, post: BlogPost }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { secret: string; action?: string; post: BlogPost };

    if (!await isPublishAuthorized(body.secret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action = "publish", post } = body;

    if (!post?.slug || !post?.title) {
      return NextResponse.json({ error: "Missing required post fields: slug, title" }, { status: 400 });
    }

    if (action === "delete") {
      deletePost(post.slug);
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
      return NextResponse.json({ success: true, action: "deleted", slug: post.slug });
    }

    // Upsert
    const store  = readPosts();
    const exists = store.posts.some((p) => p.slug === post.slug);
    const saved  = upsertPost(post);

    revalidatePath("/blog");
    revalidatePath(`/blog/${saved.slug}`);
    revalidatePath("/blog/[slug]", "page");

    return NextResponse.json({
      success: true,
      action: exists ? "updated" : "created",
      slug:   saved.slug,
      url:    `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com"}/blog/${saved.slug}`,
    });
  } catch (error) {
    console.error("Blog publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Check if a slug exists - accepts session token or publish secret
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Accept token from Authorization header, cookie, or (legacy) query param
  const secret =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("backdrop_auth")?.value ||
    searchParams.get("secret") ||
    null;

  if (!await isPublishAuthorized(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = readPosts();
  const slug  = searchParams.get("slug");

  if (slug) {
    const post = store.posts.find((p) => p.slug === slug);
    return NextResponse.json({ exists: !!post, post: post || null });
  }

  return NextResponse.json({ count: store.posts.length, slugs: store.posts.map((p) => p.slug) });
}
