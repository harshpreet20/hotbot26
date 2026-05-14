export type BlogAdTopic =
  | "seo"
  | "ppc"
  | "social-media"
  | "email-marketing"
  | "analytics"
  | "content"
  | "video"
  | "ai-automation"
  | "ai-chatbot"
  | "voice-ai"
  | "n8n"
  | "pr"
  | "software-dev"
  | "ui-ux"
  | "consultancy"
  | "general";

export type AdSlotType = "contextual" | "code";

export interface AdSlot {
  id: string;
  type: AdSlotType;
  topic?: BlogAdTopic; // used when type === "contextual"
  code?: string;       // raw HTML/JS when type === "code"
  label?: string;      // optional display name in editor
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content - use [ad:1], [ad:2] … shortcodes to place ad slots inline
  category: string;
  tags: string[];
  author: string;
  publishedAt: string; // ISO date string
  updatedAt: string;
  status: "published" | "draft";
  readTime: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  adTopic: BlogAdTopic; // legacy fallback topic (kept for backwards compat)
  adSlots?: AdSlot[];   // manually placed ad slots referenced by [ad:N] shortcodes
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  seoScore?: number;
}

export interface BlogPostsStore {
  posts: BlogPost[];
}

export type SeoCheckStatus = "good" | "improvement" | "error";

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoCheckStatus;
  message: string;
}

export interface SeoAnalysis {
  score: number;
  grade: "good" | "ok" | "poor";
  checks: SeoCheck[];
  aiSuggestions?: string[];
}
