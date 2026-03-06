import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/sections/CTASection";
import { InlineAdBanner } from "@/components/blog/InlineAdBanner";
import type { BlogPost } from "@/types/blog";
import fs from "fs";
import path from "path";

interface PageProps {
  params: { slug: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  "AI Automation": "#3b82f6",
  "Digital Marketing": "#22c55e",
  "AI Products": "#8b5cf6",
  "Content Strategy": "#ec4899",
  "Public Relations": "#f59e0b",
  "SEO": "#22c55e",
  "Social Media": "#ec4899",
};

function loadPost(slug: string): BlogPost | null {
  try {
    const postsFile = path.join(process.cwd(), "public", "data", "posts.json");
    const raw = fs.readFileSync(postsFile, "utf-8");
    const store = JSON.parse(raw) as { posts: BlogPost[] };
    return store.posts.find((p) => p.slug === slug && p.status === "published") || null;
  } catch {
    return null;
  }
}

function loadAllPosts(): BlogPost[] {
  try {
    const postsFile = path.join(process.cwd(), "public", "data", "posts.json");
    const raw = fs.readFileSync(postsFile, "utf-8");
    const store = JSON.parse(raw) as { posts: BlogPost[] };
    return store.posts.filter((p) => p.status === "published");
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const posts = loadAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = loadPost(params.slug);
  if (!post) {
    return { title: "Post Not Found | HotBot Studios Blog" };
  }
  return {
    title: `${post.title} | HotBot Studios Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://hotbotstudios.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: `https://hotbotstudios.com/blog/${post.slug}` },
  };
}

// Split HTML content into paragraphs/sections so we can inject ads between them.
// Returns an array of HTML strings, each representing a content chunk.
function splitContentChunks(html: string): string[] {
  // Split on </p>, </h2>, </h3>, </ul>, </ol> boundaries
  const chunks: string[] = [];
  let remaining = html;

  const closingTags = ["</p>", "</h2>", "</h3>", "</ul>", "</ol>", "</blockquote>"];

  while (remaining.length > 0) {
    let splitAt = -1;
    let splitTagLen = 4;

    for (const tag of closingTags) {
      const idx = remaining.indexOf(tag);
      if (idx !== -1 && (splitAt === -1 || idx < splitAt)) {
        splitAt = idx + tag.length;
        splitTagLen = tag.length;
      }
    }

    if (splitAt === -1) {
      chunks.push(remaining);
      break;
    }

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }

  return chunks.filter((c) => c.trim().length > 0);
}

export default function BlogPostPage({ params }: PageProps) {
  const post = loadPost(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = loadAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.adTopic === post.adTopic))
    .slice(0, 3);

  // Build article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author, url: "https://hotbotstudios.com" },
    publisher: {
      "@type": "Organization",
      name: "HotBot Studios",
      logo: { "@type": "ImageObject", url: "https://hotbotstudios.com/logos/hotbot-logo.svg" },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `https://hotbotstudios.com/blog/${post.slug}`,
    keywords: post.tags?.join(", "),
  };

  // Split content and inject ads every ~3 content chunks
  const chunks = splitContentChunks(post.content || "");
  const AD_INTERVAL = 3; // insert ad every N chunks

  const accentColor = CATEGORY_COLORS[post.category] || "#3b82f6";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* ── Article Header ── */}
      <section className="relative z-10 pt-32 pb-8 px-6 max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors mb-8">
          ← Back to Blog
        </Link>

        {/* Category + read time */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              color: accentColor,
            }}
          >
            {post.category}
          </span>
          <span className="text-slate-500 text-xs">{post.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
          {post.title}
        </h1>

        {/* Excerpt / subtitle */}
        <p className="text-slate-400 text-lg leading-relaxed mb-7">{post.excerpt}</p>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 pb-7 border-b border-white/[0.08] text-sm text-slate-500">
          <span className="font-medium text-slate-400">{post.author}</span>
          <span>·</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>·</span>
          <span>{post.readTime}</span>
          {post.tags?.length > 0 && (
            <>
              <span>·</span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] text-slate-500 border border-white/[0.06]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Article Content with Inline Ads ── */}
      <section className="relative z-10 px-6 max-w-3xl mx-auto pb-12">
        {/* First ad — after intro (before main content starts) */}
        <InlineAdBanner topic={post.adTopic} variant="compact" />

        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-black prose-headings:text-white
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
          prose-li:text-slate-300 prose-li:leading-relaxed
          prose-strong:text-white
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
          prose-ul:my-4 prose-ol:my-4
        ">
          {chunks.map((chunk, i) => (
            <div key={i}>
              <div dangerouslySetInnerHTML={{ __html: chunk }} />
              {/* Inject ad after every AD_INTERVAL chunks, but not after the last */}
              {(i + 1) % AD_INTERVAL === 0 && i < chunks.length - 1 && (
                <InlineAdBanner topic={post.adTopic} />
              )}
            </div>
          ))}
        </div>

        {/* Final ad — after content ends */}
        <InlineAdBanner topic={post.adTopic} />

        {/* Tags footer */}
        {post.tags?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <p className="text-slate-500 text-xs mb-2 uppercase tracking-widest font-semibold">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-slate-400 border border-white/[0.08]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Related Posts ── */}
      {related.length > 0 && (
        <section className="relative z-10 px-6 max-w-5xl mx-auto pb-16">
          <h2 className="text-xl font-black text-white mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="group block p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300"
              >
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: `${CATEGORY_COLORS[rp.category] || "#3b82f6"}15`,
                    color: CATEGORY_COLORS[rp.category] || "#93c5fd",
                    border: `1px solid ${CATEGORY_COLORS[rp.category] || "#3b82f6"}25`,
                  }}
                >
                  {rp.category}
                </span>
                <h3 className="text-white font-bold text-sm leading-snug mt-3 mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                  {rp.title}
                </h3>
                <p className="text-slate-500 text-xs">{rp.readTime}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CTASection
        title="Want Results Like These for Your Business?"
        subtitle="Talk to our team about your specific goals. We'll build a strategy around what actually moves the needle."
      />
    </>
  );
}
