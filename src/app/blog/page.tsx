import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "Blog | AI Automation & Digital Marketing Insights",
  description:
    "Expert insights on AI automation, digital marketing, content production, software development, and growth strategies for US businesses — by the HotBot Studios team.",
  keywords: ["AI automation blog", "digital marketing blog USA", "AI chatbot news", "marketing agency blog"],
  openGraph: {
    title: "HotBot Studios Blog | AI & Marketing Insights",
    description: "Deep-dives into AI, marketing, content, and technology from the team that builds and implements these strategies daily.",
    url: "https://hotbotstudios.com/blog",
  },
  alternates: { canonical: "https://hotbotstudios.com/blog" },
};

const POSTS = [
  {
    slug: "ai-automation-us-business-2025",
    title: "How AI Automation is Transforming US Businesses in 2025",
    excerpt: "Discover how leading US companies are using AI agents, voice AI, and workflow automation to cut costs, increase efficiency, and outpace competition.",
    date: "2025-01-15",
    category: "AI Automation",
    readTime: "8 min read",
    author: "HotBot Studios",
  },
  {
    slug: "digital-marketing-strategy-us",
    title: "The Complete Digital Marketing Strategy for US SMBs in 2025",
    excerpt: "From SEO to paid ads to social media — a comprehensive playbook for US small and medium businesses to compete with larger rivals.",
    date: "2025-01-10",
    category: "Digital Marketing",
    readTime: "12 min read",
    author: "HotBot Studios",
  },
  {
    slug: "voice-ai-customer-service",
    title: "Voice AI: The Future of Customer Service for US Businesses",
    excerpt: "How Heka Voice AI and similar systems are replacing traditional phone support, reducing costs, and improving customer satisfaction simultaneously.",
    date: "2025-01-05",
    category: "AI Products",
    readTime: "6 min read",
    author: "HotBot Studios",
  },
  {
    slug: "content-marketing-roi-2025",
    title: "Content Marketing ROI: How to Measure What Actually Matters",
    excerpt: "Stop measuring pageviews. Learn the content marketing metrics that actually tie to revenue and how to build a reporting framework that impresses stakeholders.",
    date: "2024-12-28",
    category: "Content Strategy",
    readTime: "10 min read",
    author: "HotBot Studios",
  },
  {
    slug: "pr-strategy-us-business",
    title: "PR on a Budget: How US SMBs Can Win National Media Coverage",
    excerpt: "Big PR budgets aren't required. Here's how small businesses can land coverage in major US publications with the right strategy and relationships.",
    date: "2024-12-20",
    category: "Public Relations",
    readTime: "7 min read",
    author: "HotBot Studios",
  },
  {
    slug: "n8n-automation-guide-us",
    title: "n8n: The Open-Source Automation Tool Every US Business Should Know",
    excerpt: "A beginner's guide to n8n — the workflow automation platform we use to connect 500+ apps and automate complex business processes without code.",
    date: "2024-12-15",
    category: "AI Automation",
    readTime: "9 min read",
    author: "HotBot Studios",
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
      <PageHeader
        label="Blog"
        title="Insights From the Frontlines of Growth"
        subtitle="Deep-dives into AI, marketing, content, and technology — written by the team that builds and implements these strategies every day."
      />

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.07}>
              <Link href={`/blog/${post.slug}`}>
                <div className="group h-full flex flex-col p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        background: `${CATEGORY_COLORS[post.category] || "#3b82f6"}15`,
                        color: CATEGORY_COLORS[post.category] || "#93c5fd",
                        border: `1px solid ${CATEGORY_COLORS[post.category] || "#3b82f6"}25`,
                      }}
                    >
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-3 group-hover:text-blue-300 transition-colors leading-snug flex-1">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-auto">
                    <span>{new Date(post.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
