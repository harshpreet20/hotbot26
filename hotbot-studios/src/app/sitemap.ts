import { MetadataRoute } from "next";

const BASE = "https://hotbotstudios.com";

// Regenerate at most once per day on deployment
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    lastModified?: Date;
  }> = [
    { path: "",                    priority: 1.0, changeFrequency: "weekly"  },
    { path: "/about",              priority: 0.8, changeFrequency: "monthly" },
    { path: "/ai-automation",      priority: 0.9, changeFrequency: "monthly" },
    { path: "/marketing-services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/content-studio",                      priority: 0.8, changeFrequency: "monthly" },
    { path: "/content-studio/video-production",     priority: 0.8, changeFrequency: "monthly" },
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
    { path: "/public-relations",   priority: 0.8, changeFrequency: "monthly" },
    { path: "/ui-ux-design",       priority: 0.8, changeFrequency: "monthly" },
    { path: "/consultancy",        priority: 0.8, changeFrequency: "monthly" },
    { path: "/products",           priority: 0.7, changeFrequency: "monthly" },
    { path: "/blog",               priority: 0.7, changeFrequency: "weekly"  },
    { path: "/contact",            priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy",            priority: 0.3, changeFrequency: "yearly"  },
    { path: "/terms",              priority: 0.3, changeFrequency: "yearly"  },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
