import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Social Media Content Agency USA - Instagram, TikTok, LinkedIn & YouTube | HotBot Studios",
  description:
    "HotBot Studios creates platform-native social media content for US businesses: Instagram Reels, TikTok videos, LinkedIn posts, YouTube Shorts, and content calendars. 300% avg engagement increase. Free social audit.",
  keywords: [
    "social media content agency USA",
    "Instagram content agency USA",
    "TikTok content agency USA",
    "LinkedIn content agency USA",
    "YouTube Shorts agency USA",
    "social media management agency USA",
    "content calendar agency",
    "social media strategy agency USA",
    "Instagram Reels agency",
    "organic social media growth USA",
    "brand social media content",
    "social media marketing agency USA",
    "content creation agency USA",
    "influencer content strategy USA",
  ],
  openGraph: {
    title: "Social Media Content Agency USA - Instagram, TikTok, LinkedIn & YouTube | HotBot Studios",
    description: "Platform-native content for Instagram Reels, TikTok, LinkedIn & YouTube Shorts. 300% avg engagement increase. Free social audit.",
    url: "https://hotbotstudios.com/content-studio/social-media-content",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Social Media Content Agency USA - HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Content Agency USA | HotBot Studios",
    description: "Instagram Reels, TikTok, LinkedIn & YouTube Shorts for US brands. 300% avg engagement increase.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio/social-media-content" },
};

// ── Schema Markup ────────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Social Media Content Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Social Media Content Creation & Management",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Platform-native social media content for US brands: Instagram Reels, TikTok videos, LinkedIn posts, YouTube Shorts, content calendars, and community management. 300% average engagement increase.",
  url: "https://hotbotstudios.com/content-studio/social-media-content",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Social Media Content", item: "https://hotbotstudios.com/content-studio/social-media-content" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How many social media posts does HotBot Studios produce per month?", acceptedAnswer: { "@type": "Answer", text: "Our standard retainer covers 16–20 posts per month across your active platforms, including a mix of short-form video (Reels/TikTok), static image posts, carousels, and Stories. Volume varies by package - we tailor output to your platform strategy." } },
    { "@type": "Question", name: "Do you manage posting and community management too?", acceptedAnswer: { "@type": "Answer", text: "Yes. Full-service retainers include content creation, scheduling via Later or Buffer, posting at optimal engagement windows, and community management (responding to comments and DMs within 24 hours on weekdays)." } },
    { "@type": "Question", name: "How do you stay current with social media algorithm changes?", acceptedAnswer: { "@type": "Answer", text: "Our social team monitors platform updates, algorithm changes, and trending content formats weekly. We adjust content strategies, posting cadences, and format mixes proactively - not reactively. Monthly strategy reviews are included in all retainers." } },
  ],
};

// ── Content Data ──────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🎬", title: "Instagram Reels & Stories", desc: "Hook-first vertical video content built for the Instagram algorithm: trend-aware scripting, native captions, on-brand editing, and optimised posting times. Includes feed posts, Reels, and Stories sequences.", href: "/content-studio/social-media-content" },
  { icon: "🎵", title: "TikTok Content Creation", desc: "Native TikTok content that performs - trend-informed hooks, audio-first scripting, native text overlays, and strategic hashtag use. Built to grow organically on the For You Page (FYP).", href: "/content-studio/social-media-content" },
  { icon: "💼", title: "LinkedIn Content & Thought Leadership", desc: "Executive ghostwriting and brand LinkedIn content: text posts, carousels, articles, and newsletters. Built to grow personal brand authority and generate B2B inbound leads from decision-maker audiences.", href: "/content-studio/social-media-content" },
  { icon: "▶️", title: "YouTube Shorts & Channel Content", desc: "YouTube Shorts for organic reach plus long-form YouTube content strategy and video descriptions optimised for YouTube SEO. Thumbnails, titles, and upload cadence included.", href: "/content-studio/social-media-content" },
  { icon: "📅", title: "Content Calendar & Strategy", desc: "Monthly content calendars built on audience research, trend analysis, and your campaign objectives. Every post planned with caption, visual direction, hashtags, posting time, and KPI target.", href: "/content-studio/social-media-content" },
  { icon: "💬", title: "Community Management", desc: "Proactive comment responses, DM management, community engagement, and UGC (user-generated content) curation - building an active brand community that amplifies organic reach.", href: "/content-studio/social-media-content" },
];

const STATS = [
  { value: 300, suffix: "%", label: "Avg Engagement Increase", color: "#ec4899" },
  { value: 20, suffix: "+", label: "Posts Produced Per Month", color: "#8b5cf6" },
  { value: 4, suffix: "×", label: "More Reach with Native Video vs Static", color: "#3b82f6" },
  { value: 40, suffix: "+", label: "Brand Accounts Managed", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Social Audit & Strategy", desc: "We audit your existing social presence, analyse competitor accounts, identify audience segments, and define platform-specific strategies for each channel you want to grow.", icon: "🔍" },
  { n: 2, title: "Content Calendar Planning", desc: "Monthly 30-day content calendars built on trend analysis, campaign objectives, and your content pillars. Every post planned with caption direction, visual brief, hashtags, and posting time.", icon: "📅" },
  { n: 3, title: "Content Production", desc: "Our team produces all content: Reels scripts and editing, static graphic design, carousel creation, and caption copywriting - all in your brand voice and approved before publishing.", icon: "🎨" },
  { n: 4, title: "Publish, Analyse & Optimise", desc: "Posts go live at algorithm-optimised times. Weekly analytics reports track reach, engagement, follower growth, and top performers - with monthly strategy updates based on data.", icon: "📊" },
];

const FAQS = [
  { q: "How many social media posts does HotBot Studios produce per month?", a: "Standard retainers cover 16–20 posts per month across active platforms, including short-form video (Reels/TikTok), static image posts, carousels, and Stories. Volume is tailored to your platform strategy and budget." },
  { q: "Do you manage posting and community management too?", a: "Yes. Full-service retainers include content creation, scheduling via Later or Buffer, posting at optimal engagement windows, and community management (responding to comments and DMs within 24 hours on weekdays)." },
  { q: "How do you stay current with social media algorithm changes?", a: "Our social team monitors platform updates, algorithm changes, and trending formats weekly. We adjust strategies, posting cadences, and format mixes proactively. Monthly strategy reviews are included in all retainers." },
  { q: "Can you grow our following organically?", a: "Yes - organic growth is a direct result of consistent, platform-native content, algorithm-optimised posting, active community management, and strategic use of trending audio and formats. Most clients see meaningful follower growth within 60–90 days of a consistent content strategy." },
  { q: "Do you create content for paid social ads as well?", a: "Yes. Our digital marketing team uses social content as paid ad creative - running performance campaigns on Meta (Facebook/Instagram) and TikTok Ads alongside organic content. Paid and organic strategies are coordinated for maximum impact and lower CPMs." },
  { q: "What platforms do you cover?", a: "Instagram (Reels, Stories, Feed), TikTok, LinkedIn (company pages and personal profiles), YouTube (Shorts and long-form), Facebook, and X (Twitter). We recommend focusing on 2–3 platforms based on your audience and content type." },
];

const RELATED = [
  { title: "Video Production", href: "/content-studio/video-production", desc: "Produce the brand videos that power your social content.", icon: "🎬" },
  { title: "Digital Marketing", href: "/digital-marketing", desc: "Amplify organic content with paid social campaigns.", icon: "📣" },
  { title: "Photography & Visual Assets", href: "/content-studio/photography", desc: "Brand photography for your social media feed and Stories.", icon: "📸" },
];

export default function SocialMediaContentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Social Media Content" }]} />

      <PageHeader
        label="Social Media Content Agency USA"
        title="Platform-Native Content That the Algorithm Actually Rewards"
        subtitle="Generic content gets suppressed. HotBot Studios produces platform-specific content for Instagram Reels, TikTok, LinkedIn, and YouTube Shorts - built on algorithm intelligence, trend research, and brand storytelling that earns organic reach."
      />

      {/* ── Definition Block (AEO) ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Platform-native social media content (definition):</strong> Content created specifically for the format, culture, and algorithm of a single social platform - rather than repurposing the same asset across all channels. In 2026, Instagram favours Reels with native text overlays; TikTok rewards trending audio and FYP-optimised hooks; LinkedIn amplifies text posts and carousels from personal profiles; YouTube prioritises watch time and click-through rate on thumbnails. A social media agency that creates one-size-fits-all content is leaving 70%+ of potential organic reach on the table.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Platform Algorithm Intelligence ─────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Platform Algorithm Intelligence: What Earns Reach in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.15)" }}>
            <div className="p-6 md:p-8">
              {/* Platform breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    platform: "Instagram", color: "#ec4899", icon: "📸",
                    signals: ["Reels watch rate (first 3 seconds critical)", "Save rate (stronger than likes)", "Share to Stories rate", "Consistent posting cadence (5–7×/week)"],
                    stat: "+300% reach for Reels vs static posts",
                  },
                  {
                    platform: "TikTok", color: "#06b6d4", icon: "🎵",
                    signals: ["Full video completion rate", "Re-watch rate", "Trending audio selection", "Hook quality (first 1.5 seconds)"],
                    stat: "FYP reach can scale from 0 to millions organically",
                  },
                  {
                    platform: "LinkedIn", color: "#3b82f6", icon: "💼",
                    signals: ["Dwell time on post (do NOT use external links)", "Comment quality and depth", "Personal profile > company page reach", "Early engagement velocity (first 2 hours)"],
                    stat: "+180% organic reach for personal vs company posts",
                  },
                  {
                    platform: "YouTube", color: "#8b5cf6", icon: "▶️",
                    signals: ["Click-through rate on thumbnails", "Average view duration", "Session start rate (Shorts)", "Subscriber notification engagement"],
                    stat: "Shorts generate 3× subscriber growth rate vs long-form alone",
                  },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-bold text-white">{item.platform}</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {item.signals.map((signal, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: item.color }} />
                          <span className="text-slate-400 text-xs">{signal}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: item.color }}>{item.stat}</div>
                  </div>
                ))}
              </div>

              {/* Engagement by content type */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Avg Organic Engagement Rate by Content Type (HotBot Studios client data)</p>
              <div className="space-y-3">
                {[
                  { label: "Instagram Reels (native, trend-aware)", rate: 8.5, max: 10, color: "#ec4899" },
                  { label: "TikTok (FYP-optimised, trending audio)", rate: 7.8, max: 10, color: "#06b6d4" },
                  { label: "LinkedIn carousels (personal profile)", rate: 6.2, max: 10, color: "#3b82f6" },
                  { label: "YouTube Shorts", rate: 5.5, max: 10, color: "#8b5cf6" },
                  { label: "Static Instagram feed posts", rate: 2.1, max: 10, color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-60 shrink-0 text-right hidden md:block">{row.label}</span>
                    <span className="text-slate-400 text-xs shrink-0 md:hidden">{row.rate}%</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(row.rate / row.max) * 100}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">{row.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">Platform-native content consistently outperforms repurposed content by 2–4× on every metric.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Social Media Content Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Social Media Content Results" />
      <ProcessSteps steps={PROCESS} title="Our Social Media Content Process" />

      {/* ── Content Pillar Framework ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-4">The Content Pillar Framework We Build Every Strategy On</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            Every brand&apos;s social content should serve multiple audience needs simultaneously. We build content strategies around 4 core pillars that balance reach, engagement, trust, and conversion - ensuring no single post type dominates.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "📢", pillar: "Educate", desc: "How-to, tips, industry insights - earns saves and shares, signals expertise", pct: "40%", color: "#3b82f6" },
            { icon: "🎭", pillar: "Entertain", desc: "Trend participation, brand personality, behind-the-scenes - earns reach", pct: "25%", color: "#ec4899" },
            { icon: "🤝", pillar: "Engage", desc: "Questions, polls, UGC reposts - builds community and comment velocity", pct: "20%", color: "#22c55e" },
            { icon: "💰", pillar: "Convert", desc: "Social proof, offers, testimonials - direct response and bottom-funnel", pct: "15%", color: "#f59e0b" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-5 text-center h-full" hover>
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.pct}</div>
                <div className="font-bold text-white text-sm mb-2">{item.pillar}</div>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="text-slate-500 text-xs text-center mt-6">Typical content mix for a B2B brand. Consumer brands may shift toward 30–35% entertainment.</p>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways - Social Media Content for US Brands</h2>
            <ul className="space-y-2">
              {[
                "Platform-native content (Reels, TikTok, LinkedIn carousels) earns 2–4× more reach than repurposed one-size-fits-all posts.",
                "HotBot Studios produces 16–20+ platform-native posts per month, managed from calendar to community.",
                "Instagram Reels deliver 300% more organic engagement than static posts - short-form video is the algorithm's preferred format.",
                "Our 4-pillar content framework (educate, entertain, engage, convert) balances reach, community, and conversions in every strategy.",
                "All social content is coordinated with paid media campaigns - the same creative assets fuel organic and paid performance.",
                "Monthly analytics reports and strategy reviews ensure continuous optimisation based on platform data, not guesswork.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Ready to Build a Social Presence That Actually Grows?"
        subtitle="Share your current social challenges - low reach, inconsistent posting, or zero video content - and we'll design a platform-native strategy that earns organic growth. Free social audit included."
        formType="get-started"
      />
    </>
  );
}
