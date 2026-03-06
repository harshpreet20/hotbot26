import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import type { BlogPost } from "@/types/blog";
import fs from "fs";
import path from "path";

// ISR: revalidate this page whenever /api/blog/publish calls revalidatePath('/blog').
// The default is already on-demand via revalidatePath; this is a fallback safety net.
export const revalidate = 60;

const SITE_URL = "https://hotbotstudios.com";

const CATEGORY_COLORS: Record<string, string> = {
  "AI Automation": "#3b82f6",
  "Digital Marketing": "#22c55e",
  "AI Products": "#8b5cf6",
  "Content Strategy": "#ec4899",
  "Public Relations": "#f59e0b",
  "SEO": "#22c55e",
  "Social Media": "#ec4899",
  "n8n": "#f97316",
};

function loadPosts(): BlogPost[] {
  try {
    const postsFile = path.join(process.cwd(), "public", "data", "posts.json");
    const raw = fs.readFileSync(postsFile, "utf-8");
    const store = JSON.parse(raw) as { posts: BlogPost[] };
    return store.posts.filter((p) => p.status === "published");
  } catch {
    return [];
  }
}

// Dynamic metadata — reflects live post count and latest titles as posts are published
export async function generateMetadata(): Promise<Metadata> {
  const posts = loadPosts();
  const count = posts.length;
  const latestTitles = posts.slice(0, 3).map((p) => p.title);
  const latestCategories = Array.from(new Set(posts.slice(0, 6).map((p) => p.category)));

  const description =
    count > 0
      ? `Expert insights on AI automation, digital marketing, content strategy, and PR from the HotBot Studios team — currently ${count} articles published. Latest: ${latestTitles[0] || ""}. Implementing these strategies for 42+ US businesses.`
      : "Expert insights on AI automation (GPT-4o, n8n, voice AI), digital marketing (SEO, PPC, social), content strategy, software development, and PR — written by the HotBot Studios team implementing these strategies for 42+ US businesses.";

  return {
    metadataBase: new URL(SITE_URL),
    title: "Blog — AI Automation & Digital Marketing Insights for US Businesses | HotBot Studios",
    description,
    keywords: [
      "AI automation blog USA",
      "digital marketing blog USA",
      "n8n automation guide",
      "AI chatbot news 2026",
      "marketing agency blog USA",
      "GPT-4o business applications",
      "SEO tips US businesses",
      "voice AI business USA",
      "content marketing insights",
      "PR strategy US SMBs",
      "software development insights",
      "growth marketing blog",
      ...latestCategories,
    ],
    authors: [{ name: "HotBot Studios", url: SITE_URL }],
    creator: "HotBot Studios",
    publisher: "HotBot Studios",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "HotBot Studios",
      title: "HotBot Studios Blog — AI Automation & Digital Marketing Insights",
      description:
        "Deep-dives into AI, marketing, content, and technology from the team building and implementing these strategies for 42+ US businesses.",
      url: `${SITE_URL}/blog`,
      images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "HotBot Studios Blog — AI & Marketing Insights" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "HotBot Studios Blog | AI & Digital Marketing Insights",
      description: "AI automation, digital marketing & growth strategy insights from the HotBot Studios team.",
      images: ["/og-image.svg"],
    },
    alternates: { canonical: `${SITE_URL}/blog` },
  };
}

export default function BlogPage() {
  const posts = loadPosts();
  const featured = posts[0];
  const gridPosts = posts.slice(1);

  // ItemList JSON-LD — tells Google the articles available on this hub page
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "HotBot Studios Blog",
    description: "AI automation, digital marketing, and growth strategy articles for US businesses.",
    url: `${SITE_URL}/blog`,
    numberOfItems: posts.length,
    itemListElement: posts.slice(0, 20).map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <PageHeader
        label="HotBot Studios Blog"
        title="Insights From the Frontlines of Growth"
        subtitle="Deep-dives into AI automation, digital marketing, content strategy, software development, and PR — written by the HotBot Studios team that builds and implements these strategies for 42+ US businesses every day."
      />

      {/* ── Topic Filter Pills ── */}
      <section className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto py-6">
        <Reveal>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "AI & Automation", href: "/ai-automation", color: "#3b82f6" },
              { label: "SEO & Marketing", href: "/marketing-services", color: "#22c55e" },
              { label: "Content Production", href: "/content-studio", color: "#ec4899" },
              { label: "Software Dev", href: "/software-development", color: "#8b5cf6" },
              { label: "Public Relations", href: "/public-relations", color: "#f59e0b" },
              { label: "UI/UX Design", href: "/ui-ux-design", color: "#06b6d4" },
            ].map((topic, i) => (
              <Link key={i} href={topic.href}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: `${topic.color}15`, border: `1px solid ${topic.color}30`, color: topic.color }}>
                {topic.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Featured Post (hero card) ── */}
      {featured && (
        <section className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto pb-6">
          <Reveal>
            <article className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <Link href={`/blog/${featured.slug}`} className="absolute inset-0 z-0" aria-label={featured.title} />
              <div className="relative z-10 p-6 sm:p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                    style={{
                      background: `${CATEGORY_COLORS[featured.category] || "#3b82f6"}15`,
                      color: CATEGORY_COLORS[featured.category] || "#93c5fd",
                      border: `1px solid ${CATEGORY_COLORS[featured.category] || "#3b82f6"}25`,
                    }}>
                    ✦ Featured · {featured.category}
                  </span>
                  <span className="text-slate-500 text-xs">{featured.readTime}</span>
                </div>
                <h2 className="text-white font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight mb-3 sm:mb-4 group-hover:text-blue-300 transition-colors max-w-4xl">
                  {featured.title}
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl mb-4 sm:mb-6">{featured.excerpt}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-slate-500">
                  <span>{featured.author}</span>
                  <span>·</span>
                  <span>{new Date(featured.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span
                    className="sm:ml-auto font-semibold text-xs transition-colors group-hover:text-blue-300"
                    style={{ color: CATEGORY_COLORS[featured.category] || "#93c5fd" }}>
                    Read Article →
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        </section>
      )}

      {/* ── Grid ── */}
      <section className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto pb-20">
        {gridPosts.length === 0 && posts.length === 0 && (
          <p className="text-center text-slate-500 py-20">No posts published yet.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {(featured ? gridPosts : posts).map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.06}>
              <article className="group h-full flex flex-col p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
                <Link
                  href={`/blog/${post.slug}`}
                  className="absolute inset-0 z-0 rounded-2xl"
                  aria-label={post.title}
                />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: `${CATEGORY_COLORS[post.category] || "#3b82f6"}15`,
                        color: CATEGORY_COLORS[post.category] || "#93c5fd",
                        border: `1px solid ${CATEGORY_COLORS[post.category] || "#3b82f6"}25`,
                      }}>
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-sm leading-snug mb-2.5 group-hover:text-blue-300 transition-colors flex-1 line-clamp-3">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-auto mb-3">
                    <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>{post.readTime}</span>
                  </div>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/[0.05] text-slate-500 border border-white/[0.06]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span
                    className="relative z-10 text-[11px] font-semibold transition-colors hover:opacity-80"
                    style={{ color: CATEGORY_COLORS[post.category] || "#93c5fd" }}>
                    Read Article →
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
