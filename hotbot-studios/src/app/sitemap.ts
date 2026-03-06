import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import type { BlogPost } from "@/types/blog";

// Force dynamic so Google always gets a fresh sitemap the instant a new post is published.
// N8N → /api/blog/publish writes posts.json → Next.js revalidates /blog → sitemap is live.
export const dynamic = "force-dynamic";

const BASE = "https://hotbotstudios.com";

function loadBlogPosts(): BlogPost[] {
  try {
    const postsFile = path.join(process.cwd(), "public", "data", "posts.json");
    const raw = fs.readFileSync(postsFile, "utf-8");
    const store = JSON.parse(raw) as { posts: BlogPost[] };
    return store.posts.filter((p) => p.status === "published");
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "",                    priority: 1.0, changeFrequency: "weekly"  },
    { path: "/about",              priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation",                              priority: 0.9, changeFrequency: "monthly" },
    { path: "/ai-automation/custom-ai-agents",             priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation/n8n-workflow-automation",      priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation/ai-chatbots",                  priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation/voice-ai-heka",                priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation/ai-analytics",                 priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation/llm-gpt-integration",          priority: 0.8, changeFrequency: "monthly" },
    { path: "/digital-marketing",                         priority: 0.9, changeFrequency: "monthly" },
    { path: "/digital-marketing/seo-services",                     priority: 0.8, changeFrequency: "monthly" },
    { path: "/digital-marketing/social-media-marketing",            priority: 0.8, changeFrequency: "monthly" },
    { path: "/digital-marketing/ppc-management",                     priority: 0.8, changeFrequency: "monthly" },
    { path: "/digital-marketing/email-marketing",         priority: 0.8, changeFrequency: "monthly" },
    { path: "/digital-marketing/marketing-analytics",               priority: 0.8, changeFrequency: "monthly" },
    { path: "/digital-marketing/conversion-rate-optimization",                     priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio",                                                       priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production",                                      priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production/brand-films",                          priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production/product-explainer-videos",             priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production/testimonial-case-study",               priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production/short-form-social",                    priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production/youtube-series",                       priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production/video-ads",                            priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/photography",          priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/copywriting",          priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/podcast-production",   priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/social-media-content", priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/print-design",         priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development",                       priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development/web-app-development",   priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development/mobile-app-development",priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development/saas-development",      priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development/api-integrations",      priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development/ecommerce-development", priority: 0.8, changeFrequency: "monthly" },
    { path: "/software-development/enterprise-software",   priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations",                          priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations/media-relations",          priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations/press-releases",           priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations/crisis-communications",    priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations/thought-leadership",       priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations/podcast-pr",               priority: 0.8, changeFrequency: "monthly" },
    { path: "/public-relations/digital-pr-seo",           priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design",                        priority: 0.9, changeFrequency: "monthly" },
    { path: "/ui-ux-design/ux-research",            priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design/wireframing",            priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design/visual-ui-design",       priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design/prototyping",            priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design/mobile-design",          priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design/accessibility",          priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketing-consulting",                         priority: 0.9, changeFrequency: "monthly" },
    { path: "/marketing-consulting/growth-strategy",         priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketing-consulting/digital-transformation",  priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketing-consulting/marketing-audit",         priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketing-consulting/martech-stack",           priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketing-consulting/team-building",           priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketing-consulting/go-to-market",            priority: 0.8, changeFrequency: "monthly" },
    { path: "/products",           priority: 0.7, changeFrequency: "monthly" },
    { path: "/blog",               priority: 0.9, changeFrequency: "daily"   },
    { path: "/contact",            priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy",            priority: 0.3, changeFrequency: "yearly"  },
    { path: "/terms",              priority: 0.3, changeFrequency: "yearly"  },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Dynamically include every published blog post — fresh on every request
  const blogPosts = loadBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...blogEntries];
}
