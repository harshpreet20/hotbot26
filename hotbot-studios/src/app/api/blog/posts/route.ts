import { NextRequest, NextResponse } from "next/server";
import { readPosts } from "@/lib/postsStore";
import { getSession } from "@/lib/sessions";

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.cookies.get("backdrop_auth")?.value || null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status   = searchParams.get("status") || "published";
  const limit    = parseInt(searchParams.get("limit") || "100");

  // Drafts / all-posts require an authenticated admin session
  if (status !== "published") {
    const token   = extractToken(req);
    const session = token ? getSession(token) : null;
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const store = readPosts();

  // "all" → no status filter; anything else → exact match
  let posts = status === "all"
    ? store.posts
    : store.posts.filter((p) => p.status === status);

  if (category) {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  posts = posts.slice(0, limit);

  return NextResponse.json(
    { posts },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
