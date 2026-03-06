"use client";

import Link from "next/link";
import type { BlogAdTopic } from "@/types/blog";

interface AdConfig {
  headline: string;
  subline: string;
  cta: string;
  href: string;
  accentColor: string;
  badge: string;
  icon: string;
}

const AD_MAP: Record<BlogAdTopic, AdConfig> = {
  seo: {
    headline: "Rank #1 on Google — Without the Guesswork",
    subline: "HotBot Studios' SEO team has driven 300%+ organic growth for US businesses. Technical SEO, content strategy, and link building — all done-for-you.",
    cta: "Get a Free SEO Audit →",
    href: "/digital-marketing/seo-services",
    accentColor: "#22c55e",
    badge: "SEO Services",
    icon: "📈",
  },
  ppc: {
    headline: "Stop Burning Budget on Google Ads That Don't Convert",
    subline: "Our certified PPC team manages $2M+ in ad spend monthly for US businesses. Average client ROAS: 3.8×. Start with a free account audit.",
    cta: "Get a Free PPC Audit →",
    href: "/digital-marketing/ppc-management",
    accentColor: "#f59e0b",
    badge: "PPC Advertising",
    icon: "💰",
  },
  "social-media": {
    headline: "30× Social Content Per Month — For Less Than 1 Hire",
    subline: "AI-powered content production for Instagram, LinkedIn, TikTok, and X. Our team creates, schedules, and manages everything while you focus on your business.",
    cta: "See Social Media Packages →",
    href: "/digital-marketing/social-media-marketing",
    accentColor: "#ec4899",
    badge: "Social Media",
    icon: "📱",
  },
  "email-marketing": {
    headline: "Email That Actually Gets Opened — and Gets Sales",
    subline: "Automated email sequences, newsletters, and campaigns designed to convert subscribers into customers. Average open rate for our clients: 38%.",
    cta: "Explore Email Marketing →",
    href: "/digital-marketing/email-marketing",
    accentColor: "#3b82f6",
    badge: "Email Marketing",
    icon: "✉️",
  },
  analytics: {
    headline: "See the Full Picture: AI-Powered Marketing Analytics",
    subline: "Stop guessing which channels are working. Our analytics setup gives you real attribution from first click to closed deal — across every marketing channel.",
    cta: "Book an Analytics Call →",
    href: "/digital-marketing/marketing-analytics",
    accentColor: "#06b6d4",
    badge: "Analytics",
    icon: "📊",
  },
  content: {
    headline: "Content That Ranks, Converts, and Builds Authority",
    subline: "Expert copywriters, editors, and SEO specialists creating content that drives real business outcomes — not just pageviews. Blog posts, landing pages, case studies, and more.",
    cta: "View Content Services →",
    href: "/content-studio/copywriting",
    accentColor: "#8b5cf6",
    badge: "Content Studio",
    icon: "✍️",
  },
  video: {
    headline: "Video Content That Stops the Scroll and Drives Sales",
    subline: "Brand films, product explainers, social reels, YouTube series — our production team creates video that converts at every stage of your funnel.",
    cta: "Explore Video Production →",
    href: "/content-studio/video-production",
    accentColor: "#ef4444",
    badge: "Video Production",
    icon: "🎬",
  },
  "ai-automation": {
    headline: "Automate 200+ Hours/Month With Custom AI Agents",
    subline: "Stop doing manually what AI can do better and faster. HotBot Studios designs and deploys custom AI automation stacks for US businesses — from simple workflows to full AI operations.",
    cta: "Explore AI Automation →",
    href: "/ai-automation",
    accentColor: "#3b82f6",
    badge: "AI Automation",
    icon: "🤖",
  },
  "ai-chatbot": {
    headline: "Your Website Deserves a Smarter Chatbot",
    subline: "Custom AI chatbots trained on your business — answering questions, capturing leads, booking appointments, and qualifying prospects 24/7. No human needed.",
    cta: "Build Your AI Chatbot →",
    href: "/ai-automation/ai-chatbots",
    accentColor: "#6366f1",
    badge: "AI Chatbots",
    icon: "💬",
  },
  "voice-ai": {
    headline: "Every Call Answered. Every Lead Captured. 24/7.",
    subline: "Heka Voice AI handles your inbound calls with a natural, intelligent AI receptionist. Book appointments, answer FAQs, qualify leads — while you sleep.",
    cta: "See Heka Voice AI →",
    href: "/ai-automation/voice-ai-heka",
    accentColor: "#8b5cf6",
    badge: "Voice AI",
    icon: "🎙️",
  },
  n8n: {
    headline: "Connect Every Tool in Your Stack — No Code Required",
    subline: "We design and deploy n8n workflow automations that connect your CRM, email, Slack, Google Workspace, and 500+ other apps. Automated pipelines that run 24/7.",
    cta: "Explore n8n Automation →",
    href: "/ai-automation/n8n-workflow-automation",
    accentColor: "#f97316",
    badge: "n8n Automation",
    icon: "⚡",
  },
  pr: {
    headline: "Get Your Business Featured in Forbes, TechCrunch & More",
    subline: "Our PR team has secured coverage in 200+ publications for US SMBs. Media relations, press releases, thought leadership, and digital PR — all under one roof.",
    cta: "Explore PR Services →",
    href: "/public-relations",
    accentColor: "#f59e0b",
    badge: "Public Relations",
    icon: "📰",
  },
  "software-dev": {
    headline: "Custom Software Built to Scale Your Business",
    subline: "Web apps, mobile apps, SaaS platforms, API integrations — our development team ships fast, builds to last, and integrates AI where it matters.",
    cta: "Explore Software Development →",
    href: "/software-development",
    accentColor: "#06b6d4",
    badge: "Software Dev",
    icon: "💻",
  },
  "ui-ux": {
    headline: "Design That Converts — Not Just Impresses",
    subline: "UX research, wireframing, visual design, and prototyping built around your users' real behavior. We've improved conversion rates by 60%+ for our clients.",
    cta: "Explore UI/UX Design →",
    href: "/ui-ux-design",
    accentColor: "#ec4899",
    badge: "UI/UX Design",
    icon: "🎨",
  },
  consultancy: {
    headline: "The Growth Strategy Your Business Has Been Missing",
    subline: "HotBot Studios' senior consultants work with US businesses to build go-to-market strategies, digital transformation roadmaps, and marketing stacks that scale.",
    cta: "Book a Strategy Call →",
    href: "/marketing-consulting",
    accentColor: "#22c55e",
    badge: "Consultancy",
    icon: "🧠",
  },
  general: {
    headline: "Grow Faster With HotBot Studios",
    subline: "AI automation, digital marketing, content production, and software development — everything your US business needs to compete and win in 2026.",
    cta: "Explore All Services →",
    href: "/",
    accentColor: "#3b82f6",
    badge: "HotBot Studios",
    icon: "🚀",
  },
};

type AdVariant = "default" | "compact" | "sidebar";

interface InlineAdBannerProps {
  topic: BlogAdTopic;
  variant?: AdVariant;
}

export function InlineAdBanner({ topic, variant = "default" }: InlineAdBannerProps) {
  const ad = AD_MAP[topic] || AD_MAP.general;

  if (variant === "compact") {
    return (
      <div
        className="my-8 rounded-xl p-4 flex items-center gap-4 border"
        style={{
          background: `${ad.accentColor}08`,
          borderColor: `${ad.accentColor}25`,
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: `${ad.accentColor}15` }}
        >
          {ad.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-snug truncate">{ad.headline}</p>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{ad.subline}</p>
        </div>
        <Link
          href={ad.href}
          className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-opacity hover:opacity-80"
          style={{ background: ad.accentColor, color: "#000" }}
        >
          {ad.cta}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="my-10 rounded-2xl p-6 md:p-8 border relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${ad.accentColor}0a 0%, ${ad.accentColor}05 100%)`,
        borderColor: `${ad.accentColor}30`,
      }}
    >
      {/* Background accent glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"
        style={{ background: ad.accentColor }}
      />

      <div className="relative z-10">
        {/* Badge */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: `${ad.accentColor}18`,
              border: `1px solid ${ad.accentColor}35`,
              color: ad.accentColor,
            }}
          >
            <span>{ad.icon}</span>
            <span>Sponsored · {ad.badge}</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex-1">
            <h3 className="text-white font-black text-lg md:text-xl leading-tight mb-2">
              {ad.headline}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{ad.subline}</p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href={ad.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${ad.accentColor}, ${ad.accentColor}cc)`,
                color: "#000",
                boxShadow: `0 4px 20px ${ad.accentColor}30`,
              }}
            >
              {ad.cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
