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
    tagline: "Your 24/7 AI voice receptionist",
    description: "Handle inbound calls, qualify leads, and book appointments — automatically. Powered by Sarvam AI for natural conversations.",
    icon: "🎙️",
    color: "#3b82f6",
    href: "/ai-automation",
  },
  {
    name: "Website Keyword Assistant",
    tagline: "Real-time SEO intelligence on your site",
    description: "A smart widget that surfaces keyword opportunities, content gaps, and competitor insights directly from your website.",
    icon: "🔍",
    color: "#8b5cf6",
    href: "/ai-automation",
  },
  {
    name: "Telegram Keyword Assistant",
    tagline: "SEO insights delivered via Telegram",
    description: "Monitor keyword rankings, track competitor moves, and get daily SEO briefings straight to your Telegram.",
    icon: "📱",
    color: "#06b6d4",
    href: "/ai-automation",
  },
  {
    name: "LinkedIn Post Assistant",
    tagline: "Viral LinkedIn content, on autopilot",
    description: "Generate high-engagement LinkedIn posts from your blog, news, or ideas. Trained on top-performing B2B content.",
    icon: "💼",
    color: "#22c55e",
    href: "/ai-automation",
  },
  {
    name: "Instagram Post Assistant",
    tagline: "Turn ideas into scroll-stopping content",
    description: "Auto-generate captions, hashtags, and creative hooks for Instagram. Matches your brand voice perfectly.",
    icon: "📸",
    color: "#ec4899",
    href: "/ai-automation",
  },
  {
    name: "Mental Wellness Assistant",
    tagline: "AI-powered workplace wellness",
    description: "24/7 confidential support for employee mental health. Guided CBT exercises, mood tracking, and crisis escalation.",
    icon: "🧠",
    color: "#f59e0b",
    href: "/ai-automation",
  },
];
