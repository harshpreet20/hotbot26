import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { BlogPostsStore } from "@/types/blog";

const POSTS_FILE = path.join(process.cwd(), "public", "data", "posts.json");

function readPosts(): BlogPostsStore {
  try {
    const raw = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(raw) as BlogPostsStore;
  } catch {
    return { posts: [] };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "published";
  const limit = parseInt(searchParams.get("limit") || "100");

  const store = readPosts();
  let posts = store.posts.filter((p) => p.status === status);

  if (category) {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  posts = posts.slice(0, limit);

  return NextResponse.json(
    { posts },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
