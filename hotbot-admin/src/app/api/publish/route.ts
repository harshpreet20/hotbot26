import { NextRequest, NextResponse } from "next/server";

const MAIN_SITE = process.env.MAIN_SITE_URL || "https://hotbotstudios.com";
const PUBLISH_SECRET = process.env.BLOG_PUBLISH_SECRET || "";

/**
 * Server-side proxy for blog publish/delete/edit operations.
 * Keeps BLOG_PUBLISH_SECRET out of the browser — never exposed as NEXT_PUBLIC_*.
 *
 * POST /api/publish
 * Body: { action: "publish" | "delete", post: {...} }
 * Returns: { success, url?, slug?, error? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { action?: string; post: Record<string, unknown> };

    if (!PUBLISH_SECRET) {
      return NextResponse.json(
        { error: "BLOG_PUBLISH_SECRET is not configured on the admin server." },
        { status: 500 }
      );
    }

    if (!body.post?.slug || !body.post?.title) {
      return NextResponse.json(
        { error: "Missing required fields: slug, title" },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${MAIN_SITE}/api/blog/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: PUBLISH_SECRET,
        action: body.action || "publish",
        post: body.post,
      }),
    });

    const data = await upstream.json() as Record<string, unknown>;
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Admin publish proxy error:", error);
    return NextResponse.json({ error: "Could not reach the main site." }, { status: 502 });
  }
}

/**
 * GET /api/publish?slug=<slug>
 * Check if a slug exists + fetch full post data for editing.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!PUBLISH_SECRET) {
      return NextResponse.json({ error: "BLOG_PUBLISH_SECRET not configured." }, { status: 500 });
    }

    const url = slug
      ? `${MAIN_SITE}/api/blog/publish?secret=${encodeURIComponent(PUBLISH_SECRET)}&slug=${encodeURIComponent(slug)}`
      : `${MAIN_SITE}/api/blog/publish?secret=${encodeURIComponent(PUBLISH_SECRET)}`;

    const upstream = await fetch(url);
    const data = await upstream.json() as Record<string, unknown>;
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Admin publish proxy GET error:", error);
    return NextResponse.json({ error: "Could not reach the main site." }, { status: 502 });
  }
}
