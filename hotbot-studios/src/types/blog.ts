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

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  category: string;
  tags: string[];
  author: string;
  publishedAt: string; // ISO date string
  updatedAt: string;
  status: "published" | "draft";
  readTime: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  adTopic: BlogAdTopic;
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
