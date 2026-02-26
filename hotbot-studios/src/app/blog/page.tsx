import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "Blog — AI Automation & Digital Marketing Insights for US Businesses | HotBot Studios",
  description:
    "Expert insights on AI automation (GPT-4o, n8n, voice AI), digital marketing (SEO, PPC, social), content strategy, software development, and PR — written by the HotBot Studios team implementing these strategies for 42+ US businesses.",
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
  ],
  openGraph: {
    title: "HotBot Studios Blog — AI Automation & Digital Marketing Insights",
    description: "Deep-dives into AI, marketing, content, and technology from the team building and implementing these strategies for 42+ US businesses.",
    url: "https://hotbotstudios.com/blog",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "HotBot Studios Blog — AI & Marketing Insights" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HotBot Studios Blog | AI & Digital Marketing Insights",
    description: "AI automation, digital marketing & growth strategy insights from the HotBot Studios team.",
  },
  alternates: { canonical: "https://hotbotstudios.com/blog" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://hotbotstudios.com/blog" },
  ],
};

const POSTS = [
  {
    slug: "ai-automation-us-business-2026",
    title: "How AI Automation is Transforming US Businesses in 2026",
    excerpt: "Discover how leading US companies are using custom AI agents (GPT-4o, Claude 3), voice AI receptionists, and n8n workflow automations to cut costs, save 200+ hours/month, and outpace competition.",
    date: "2026-01-15",
    category: "AI Automation",
    readTime: "8 min read",
    author: "HotBot Studios",
    relatedHref: "/ai-automation",
  },
  {
    slug: "digital-marketing-strategy-us",
    title: "The Complete Digital Marketing Strategy for US SMBs in 2026",
    excerpt: "From SEO to Google Ads to social media content — a comprehensive, data-backed playbook for US small and medium businesses to compete with larger rivals and achieve 3× ROAS.",
    date: "2026-01-10",
    category: "Digital Marketing",
    readTime: "12 min read",
    author: "HotBot Studios",
    relatedHref: "/marketing-services",
  },
  {
    slug: "voice-ai-customer-service",
    title: "Voice AI: The Future of Customer Service for US Businesses",
    excerpt: "How Heka Voice AI (powered by Sarvam AI) and similar systems are replacing traditional phone support, reducing costs by 70%, and improving customer satisfaction simultaneously.",
    date: "2026-01-05",
    category: "AI Products",
    readTime: "6 min read",
    author: "HotBot Studios",
    relatedHref: "/ai-automation",
  },
  {
    slug: "content-marketing-roi-2026",
    title: "Content Marketing ROI in 2026: How to Measure What Actually Matters",
    excerpt: "Stop measuring pageviews. Learn the content marketing metrics that tie directly to revenue — and how to build a reporting framework that drives decisions and impresses stakeholders.",
    date: "2025-12-28",
    category: "Content Strategy",
    readTime: "10 min read",
    author: "HotBot Studios",
    relatedHref: "/content-studio",
  },
  {
    slug: "pr-strategy-us-business",
    title: "PR on a Budget: How US SMBs Can Win National Media Coverage",
    excerpt: "Big PR budgets aren't required. Here's how US small businesses can land coverage in Forbes, TechCrunch, and major publications with the right strategy, relationships, and data-driven pitches.",
    date: "2025-12-20",
    category: "Public Relations",
    readTime: "7 min read",
    author: "HotBot Studios",
    relatedHref: "/public-relations",
  },
  {
    slug: "n8n-automation-guide-us",
    title: "n8n Workflow Automation: The Complete Guide for US Businesses in 2026",
    excerpt: "A complete guide to n8n — the open-source workflow automation platform we use to connect HubSpot, Salesforce, Google Workspace, and 500+ apps for US clients. With real workflow examples.",
    date: "2025-12-15",
    category: "AI Automation",
    readTime: "9 min read",
    author: "HotBot Studios",
    relatedHref: "/ai-automation",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "AI Automation": "#3b82f6",
  "Digital Marketing": "#22c55e",
  "AI Products": "#8b5cf6",
  "Content Strategy": "#ec4899",
  "Public Relations": "#f59e0b",
};

export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <PageHeader
        label="HotBot Studios Blog"
        title="Insights From the Frontlines of Growth"
        subtitle="Deep-dives into AI automation, digital marketing, content strategy, software development, and PR — written by the HotBot Studios team that builds and implements these strategies for 42+ US businesses every day."
      />

      {/* ── Topic Clusters (Internal Links) ──────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-6">
        <Reveal>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "AI Automation", href: "/ai-automation", color: "#3b82f6" },
              { label: "Digital Marketing", href: "/marketing-services", color: "#22c55e" },
              { label: "Content Production", href: "/content-studio", color: "#ec4899" },
              { label: "Software Development", href: "/software-development", color: "#8b5cf6" },
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

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.07}>
              <Link href={`/blog/${post.slug}`}>
                <article className="group h-full flex flex-col p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        background: `${CATEGORY_COLORS[post.category] || "#3b82f6"}15`,
                        color: CATEGORY_COLORS[post.category] || "#93c5fd",
                        border: `1px solid ${CATEGORY_COLORS[post.category] || "#3b82f6"}25`,
                      }}>
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-base mb-3 group-hover:text-blue-300 transition-colors leading-snug flex-1">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-auto mb-3">
                    <span>{new Date(post.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link href={post.relatedHref}
                    className="text-[11px] font-medium transition-colors hover:text-blue-300"
                    style={{ color: CATEGORY_COLORS[post.category] || "#93c5fd" }}
                    onClick={(e) => e.stopPropagation()}>
                    Explore {post.category} Services →
                  </Link>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
