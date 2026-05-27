import { NextRequest, NextResponse } from "next/server";
import { extractToken, authorizeAny } from "@/lib/dashboardAuth";
import { readPosts } from "@/lib/postsStore";

export async function GET(req: NextRequest) {
  const session = await authorizeAny(extractToken(req));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id       = searchParams.get("id");
  const status   = searchParams.get("status") ?? "all";
  const limit    = parseInt(searchParams.get("limit") ?? "100");

  const store = readPosts();
  let posts = status === "all" ? store.posts : store.posts.filter((p) => p.status === status);

  if (id) {
    const post = posts.find((p) => p.id === id) ?? null;
    return NextResponse.json({ post });
  }

  return NextResponse.json({ posts: posts.slice(0, limit) });
}
