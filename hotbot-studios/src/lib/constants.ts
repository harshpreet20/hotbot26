// src/lib/constants.ts
// App-wide constants

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hotbotstudios.com";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5CNWV5X1KC";

export const SERVICES = [
  { label: "AI Automation", href: "/ai-automation" },
  { label: "Digital Marketing", href: "/marketing-services" },
  { label: "Content Studio", href: "/content-studio" },
  { label: "Software Development", href: "/software-development" },
  { label: "Public Relations", href: "/public-relations" },
  { label: "UI/UX Design", href: "/ui-ux-design" },
  { label: "Consulting", href: "/consultancy" },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "AI Automation", href: "/ai-automation" },
  { label: "Digital Marketing", href: "/marketing-services" },
  { label: "Content Studio", href: "/content-studio" },
  { label: "Software Dev", href: "/software-development" },
  { label: "PR", href: "/public-relations" },
  { label: "UI/UX", href: "/ui-ux-design" },
  { label: "Consulting", href: "/consultancy" },
] as const;

export const FORM_TYPES = {
  GET_STARTED: "get-started",
  CONTACT_SALES: "contact-sales",
  STRATEGY_CALL: "strategy-call",
  CONSULTATION: "consultation",
} as const;

export const SERVICE_LIST = [
  "Digital Marketing",
  "AI Automation",
  "Content Production",
  "Software Development",
  "Public Relations",
  "UI/UX Design",
  "Marketing Consulting",
  "Not sure yet",
];

export const BUDGET_LIST = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Let's discuss",
];

export const PRODUCTS = [
  {
    name: "Heka Voice AI",
    tagline: "24/7 AI voice receptionist for US businesses",
    description: "Heka handles every inbound call — qualifying leads, answering FAQs, and booking appointments automatically. Powered by Sarvam AI for natural, human-like conversations. Integrates with HubSpot, Salesforce, and Calendly. Never miss a lead again.",
    icon: "🎙️",
    color: "#3b82f6",
    href: "/products/heka-voice-ai",
  },
  {
    name: "Website Keyword Assistant",
    tagline: "Real-time on-page SEO intelligence",
    description: "An AI-powered widget that continuously scans your website for keyword opportunities, content gaps, and SERP ranking improvements. Get actionable SEO recommendations without hiring an analyst — updated daily using live Google search data.",
    icon: "🔍",
    color: "#8b5cf6",
    href: "/products/website-keyword-assistant",
  },
  {
    name: "Telegram SEO Assistant",
    tagline: "Daily SEO briefings in your pocket",
    description: "Track your keyword rankings, monitor competitor moves, and receive daily SEO performance briefings delivered directly to your Telegram — no dashboards to check, no reports to pull. Automated keyword tracking for US businesses.",
    icon: "📱",
    color: "#06b6d4",
    href: "/products/telegram-seo-assistant",
  },
  {
    name: "LinkedIn Post Assistant",
    tagline: "High-engagement B2B content, automated",
    description: "Generate scroll-stopping LinkedIn posts from your blog articles, industry news, or product updates. Trained on top-performing B2B LinkedIn content patterns. Maintains your authentic brand voice while dramatically increasing post reach and engagement.",
    icon: "💼",
    color: "#22c55e",
    href: "/products/linkedin-post-assistant",
  },
  {
    name: "Instagram Content Assistant",
    tagline: "AI-generated captions that convert",
    description: "Auto-generate on-brand captions, strategic hashtag sets, and creative hooks for Instagram Reels, Stories, and Feed posts. Fine-tuned to your brand voice and target audience. Cuts content creation time by 80% while improving engagement rate.",
    icon: "📸",
    color: "#ec4899",
    href: "/products/instagram-content-assistant",
  },
  {
    name: "Mental Wellness Assistant",
    tagline: "AI-powered employee mental health support",
    description: "A confidential, 24/7 AI wellness companion for your team. Delivers guided CBT exercises, real-time mood check-ins, and stress management tools. Escalates to human support when needed. Reduces employee burnout and improves productivity.",
    icon: "🧠",
    color: "#f59e0b",
    href: "/products/mental-wellness-assistant",
  },
];
