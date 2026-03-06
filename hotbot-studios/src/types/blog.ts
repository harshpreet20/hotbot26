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
  adTopic: BlogAdTopic;
}

export interface BlogPostsStore {
  posts: BlogPost[];
}
