import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/sections/CTASection";
import { AdSlot } from "@/components/blog/AdSlot";
import type { BlogPost, AdSlot as AdSlotType } from "@/types/blog";
import { getPost, getPublishedPosts } from "@/lib/postsStore";

interface PageProps {
  params: { slug: string };
}

const SITE_URL = "https://hotbotstudios.com";

// Allow new slugs published via N8N to be rendered on-demand without a rebuild.
// revalidatePath('/blog/[slug]') called from /api/blog/publish handles cache refresh.
export const dynamicParams = true;
export const revalidate = 60; // fallback ISR for edge cases

const CATEGORY_COLORS: Record<string, string> = {
  "AI Automation": "#3b82f6",
  "Digital Marketing": "#22c55e",
  "AI Products": "#8b5cf6",
  "Content Strategy": "#ec4899",
  "Public Relations": "#f59e0b",
  "SEO": "#22c55e",
  "Social Media": "#ec4899",
};

function loadPost(slug: string): BlogPost | null  { return getPost(slug); }
function loadAllPosts(): BlogPost[]               { return getPublishedPosts(); }

export async function generateStaticParams() {
  const posts = loadAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = loadPost(params.slug);
  if (!post) {
    return {
      title: "Post Not Found | HotBot Studios Blog",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  // Derive primary keyword from first tag or category
  const primaryKw = post.focusKeyword || post.tags?.[0] || post.category;
  const allKeywords = [
    post.title,
    post.category,
    ...(post.tags || []),
    `${primaryKw} USA`,
    "HotBot Studios",
    "AI automation agency",
    "digital marketing agency USA",
  ];

  // Description: prefer metaDescription, then truncate excerpt to 155 chars
  const rawDesc = post.metaDescription || post.excerpt || "";
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "..." : rawDesc;

  // OG/Twitter title uses the post title without suffix for cleaner social cards
  const ogTitle = post.metaTitle || post.title;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${post.metaTitle || post.title} | HotBot Studios Blog`,
    description,
    keywords: allKeywords,
    authors: [{ name: post.author || "HotBot Studios", url: SITE_URL }],
    creator: post.author || "HotBot Studios",
    publisher: "HotBot Studios",
    category: post.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: "HotBot Studios",
      title: ogTitle,
      description,
      url: canonicalUrl,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author || "HotBot Studios"],
      section: post.category,
      tags: post.tags || [],
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: ["/og-image.png"],
      creator: "@hotbotstudios",
      site: "@hotbotstudios",
    },
    alternates: { canonical: canonicalUrl },
  };
}

/**
 * Split HTML on [ad:N] shortcodes.
 * Returns an array alternating between html strings and ad-slot indices (1-based).
 * e.g. ["<p>intro</p>", 1, "<p>more</p>", 2, "<p>end</p>"]
 */
function splitOnAdShortcodes(html: string): Array<string | number> {
  const parts: Array<string | number> = [];
  const re = /\[ad:(\d+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) parts.push(html.slice(last, m.index));
    parts.push(parseInt(m[1], 10));
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push(html.slice(last));
  return parts;
}

export default function BlogPostPage({ params }: PageProps) {
  const post = loadPost(params.slug);
  if (!post) notFound();

  const allPosts = loadAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  // WordCount for schema
  const wordCount = (post.content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

  // Full Article / BlogPosting schema (Google News + E-E-A-T)
  const postImage = post.featuredImage || `${SITE_URL}/og-image.png`;
  const authorName = post.author || "HotBot Studios";
  // Determine if author is an individual (not the brand itself) for Person vs Organization
  const isPersonAuthor = authorName !== "HotBot Studios";
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting"],
    "@id": canonicalUrl,
    headline: post.title,
    description: post.excerpt,
    articleSection: post.category,
    keywords: (post.tags || []).join(", "),
    wordCount,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    url: canonicalUrl,
    image: postImage,
    author: isPersonAuthor
      ? { "@type": "Person", name: authorName }
      : {
          "@type": "Organization",
          name: "HotBot Studios",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logos/hotbot-logo.svg`,
          },
        },
    publisher: {
      "@type": "Organization",
      name: "HotBot Studios",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logos/hotbot-logo.svg`,
        width: 160,
        height: 40,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: "HotBot Studios Blog",
      url: `${SITE_URL}/blog`,
    },
  };

  // BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  const contentParts = splitOnAdShortcodes(post.content || "");
  const adSlots: AdSlotType[] = post.adSlots ?? [];
  const accentColor = CATEGORY_COLORS[post.category] || "#3b82f6";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Article Header ── */}
      <section className="relative z-10 pt-28 sm:pt-32 pb-8 px-4 sm:px-6 max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors mb-6 sm:mb-8">
          ← Back to Blog
        </Link>

        {/* Category + read time */}
        <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 sm:mb-5">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-6 sm:mb-7">{post.excerpt}</p>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-6 sm:pb-7 border-b border-white/[0.08] text-sm text-slate-500">
          <span className="font-medium text-slate-400">{post.author}</span>
          <span>·</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span>·</span>
          <span>{post.readTime}</span>
          {post.tags?.length > 0 && (
            <>
              <span className="hidden sm:inline">·</span>
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
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

      {/* ── Article Content with manually-placed Ad Slots ── */}
      <section className="relative z-10 px-4 sm:px-6 max-w-3xl mx-auto pb-12">
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-black prose-headings:text-white
          prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
          prose-li:text-slate-300 prose-li:leading-relaxed
          prose-strong:text-white
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
          prose-ul:my-4 prose-ol:my-4
        ">
          {contentParts.map((part, i) => {
            if (typeof part === "number") {
              const slot = adSlots[part - 1];
              return slot ? <AdSlot key={`ad-${i}`} slot={slot} /> : null;
            }
            return <div key={i} dangerouslySetInnerHTML={{ __html: part }} />;
          })}
        </div>

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
        <section className="relative z-10 px-4 sm:px-6 max-w-5xl mx-auto pb-16">
          <h2 className="text-xl font-black text-white mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {related.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="group block p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300"
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
