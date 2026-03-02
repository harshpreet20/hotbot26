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

export const metadata: Metadata = {
  title: "Video Production Agency USA — Brand Films, Reels & YouTube Content | HotBot Studios",
  description:
    "HotBot Studios produces broadcast-quality brand films, product videos, testimonial videos, Instagram Reels, TikTok content, and YouTube series for US businesses. 2.1× higher CTR than static ads. Free video strategy session.",
  keywords: [
    "video production agency USA",
    "brand film production USA",
    "corporate video production agency",
    "product video production USA",
    "YouTube video production agency",
    "Instagram Reels production USA",
    "TikTok video agency USA",
    "testimonial video production",
    "explainer video agency USA",
    "social media video production",
    "video marketing agency USA",
    "B2B video production company",
    "video content agency USA",
    "commercial video production USA",
  ],
  openGraph: {
    title: "Video Production Agency USA — Brand Films, Reels & YouTube | HotBot Studios",
    description: "Broadcast-quality brand films, product videos, testimonial videos & social media Reels for US businesses. 2.1× higher CTR. Free video strategy session.",
    url: "https://hotbotstudios.com/content-studio/video-production",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Video Production Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Production Agency USA | HotBot Studios",
    description: "Brand films, product videos, Reels & YouTube content for US businesses. 2.1× higher CTR than static ads.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production" },
};

// ── Schema Markup ────────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Video Production Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Video Production & Video Marketing",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Full-service video production for US brands: brand films, product explainers, testimonial videos, Instagram Reels, TikTok content, YouTube series, and video ads. Broadcast quality, social-first delivery.",
  url: "https://hotbotstudios.com/content-studio/video-production",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How long does a brand video take to produce?", acceptedAnswer: { "@type": "Answer", text: "A standard brand film (60–90 seconds) takes 2–3 weeks from brief to final delivery — covering scriptwriting, shoot day, edit, and revisions. Social media Reels and short-form content batches are delivered in 5–7 business days." } },
    { "@type": "Question", name: "What video formats does HotBot Studios produce?", acceptedAnswer: { "@type": "Answer", text: "We produce brand films, product explainer videos, customer testimonial videos, YouTube series, Instagram Reels, TikTok videos, YouTube Shorts, corporate documentaries, trade show loops, and video ads for Meta and Google." } },
    { "@type": "Question", name: "Do you handle scripting and storyboarding?", acceptedAnswer: { "@type": "Answer", text: "Yes — full pre-production is included. Our team handles creative brief, script development, storyboard, shot list, location scouting or studio booking, and talent direction. You just show up on shoot day." } },
  ],
};

// ── Content Data ──────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🎬", title: "Brand Films", desc: "Cinematic brand stories that define who you are, what you stand for, and why customers should choose you. Shot in 4K, colour-graded to your brand palette, scored with original or licensed music.", href: "/content-studio/video-production/brand-films" },
  { icon: "📦", title: "Product & Explainer Videos", desc: "60–90 second videos that demonstrate your product's value, simplify complex ideas, and overcome objections at the bottom of your funnel. Highest-converting video format for B2B SaaS and e-commerce.", href: "/content-studio/video-production/product-explainer-videos" },
  { icon: "⭐", title: "Testimonial & Case Study Videos", desc: "Real customer success stories filmed professionally and edited to highlight measurable outcomes. The most trusted content type at the purchase decision stage — 89% of buyers say video testimonials influence their final choice.", href: "/content-studio/video-production/testimonial-case-study" },
  { icon: "📱", title: "Short-Form Social (Reels & TikTok)", desc: "Platform-native vertical video built for Instagram Reels, TikTok, and YouTube Shorts. Trend-informed, hook-first, captioned, and optimised for the first 3 seconds that determine whether viewers scroll or stop.", href: "/content-studio/video-production/short-form-social" },
  { icon: "▶️", title: "YouTube Series & Long-Form", desc: "Episodic YouTube content that builds authority, grows a subscriber base, and compounds organic search traffic over time. Strategy, scripting, filming, editing, thumbnails, and SEO-optimised titles included.", href: "/content-studio/video-production/youtube-series" },
  { icon: "📡", title: "Video Ads (Meta & Google)", desc: "Direct-response video ads optimised for Meta (Facebook/Instagram), YouTube pre-roll, and Google Display — with split-test variations, platform-specific aspect ratios, and CTA-driven scripts built to convert.", href: "/content-studio/video-production/video-ads" },
];

const STATS = [
  { value: 2.1, suffix: "×", label: "Higher CTR vs Static Ads", color: "#ec4899" },
  { value: 86, suffix: "%", label: "Buyers Want More Brand Video", color: "#8b5cf6" },
  { value: 300, suffix: "+", label: "Videos Produced", color: "#3b82f6" },
  { value: 48, suffix: "hr", label: "Rush Reel Turnaround", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Creative Brief & Strategy", desc: "We align on your target audience, distribution platform, key message, and success metric. Every video is built backwards from a specific business goal — not just a production spec.", icon: "📋" },
  { n: 2, title: "Pre-Production", desc: "Script, storyboard, shot list, location scouting, and talent direction — all handled before shoot day so you maximise every hour of filming. Nothing is improvised on the day.", icon: "📐" },
  { n: 3, title: "Production & Shoot", desc: "Our crew arrives fully prepared: 4K cameras, lighting rigs, audio capture, and a director to guide your team on camera. Multiple setups captured in a single shoot day to maximise efficiency.", icon: "🎥" },
  { n: 4, title: "Edit, Grade & Deliver", desc: "Professional edit with two rounds of revision, colour grade, sound design, captions, and delivery in all required formats and aspect ratios — 16:9 for YouTube, 9:16 for Reels, 1:1 for feed.", icon: "✅" },
];

const FAQS = [
  { q: "How long does a brand video take to produce?", a: "A standard brand film (60–90 seconds) takes 2–3 weeks from brief to final delivery — covering scriptwriting, shoot day, editing, colour grade, and two rounds of revisions. Social media Reels and short-form batches deliver in 5–7 business days." },
  { q: "What video formats does HotBot Studios produce?", a: "Brand films, product explainer videos, customer testimonials, YouTube series, Instagram Reels, TikTok videos, YouTube Shorts, corporate documentaries, trade show loops, and paid video ads for Meta and Google." },
  { q: "Do you handle scripting and storyboarding?", a: "Yes — full pre-production is included. Our team covers creative brief, script development, storyboard, shot list, location scouting, and talent direction. You review and approve before the shoot day." },
  { q: "Can you produce video content remotely or do you travel?", a: "We can produce remotely (filming guidance for in-house teams, animated explainers, voiceover-driven videos) or travel to your location anywhere in the US for a shoot day. Studio rental is also available." },
  { q: "How do you optimise videos for social media algorithms?", a: "Every platform-native video is built with hook-first scripting (first 3 seconds determine stop rate), native captions, correct aspect ratios, trending audio selection, and algorithm-informed posting guidance. We test hook variants for top-performing content." },
  { q: "Can video production work with paid advertising campaigns?", a: "Absolutely — video production and paid media are deeply integrated at HotBot Studios. Our digital marketing team uses your brand videos as creative for Meta and YouTube ad campaigns, with split-testing across hook variants and calls-to-action." },
];

const RELATED = [
  { title: "Photography & Visual Assets", href: "/content-studio/photography", desc: "Complement your video with brand photography and visual assets.", icon: "📸" },
  { title: "Social Media Content", href: "/content-studio/social-media-content", desc: "Distribute your video content for maximum organic reach.", icon: "📱" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Amplify video content with paid media campaigns.", icon: "📣" },
];

export default function VideoProductionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Video Production Agency USA"
        title="Video That Stops the Scroll and Starts the Conversation"
        subtitle="HotBot Studios produces broadcast-quality brand films, product explainers, testimonial videos, and social-native Reels for US businesses. From script to screen — every video is built to perform on the platform it lives on."
      />

      {/* ── Definition Block (AEO) ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Brand video production (definition):</strong> The end-to-end process of creating video content — from scripting and storyboarding through filming, editing, colour grading, and multi-platform delivery — to communicate a brand&apos;s value to its target audience. In 2026, effective brand video spans short-form social content (Reels, TikTok), YouTube long-form, product explainer videos, and direct-response video ads, each optimised for the platform and audience stage it targets.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Video Performance Data ─────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Why Video Outperforms Every Other Content Format in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.15)" }}>
            <div className="p-6 md:p-8">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "2.1×", label: "higher CTR on video ads vs static image ads (Google, 2025)", color: "#ec4899" },
                  { pct: "86%", label: "of buyers want to see more video from brands they consider", color: "#8b5cf6" },
                  { pct: "300%", label: "more organic engagement for Reels vs static posts (Meta, 2025)", color: "#3b82f6" },
                  { pct: "89%", label: "of marketers say video gives positive ROI (Wyzowl 2025)", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Bar chart: conversion rates by video type */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Avg Conversion Rate Lift by Video Format (HotBot Studios client data)</p>
              <div className="space-y-3">
                {[
                  { label: "Customer testimonial video", lift: 95, max: 100, color: "#ec4899" },
                  { label: "Product explainer video", lift: 80, max: 100, color: "#8b5cf6" },
                  { label: "Instagram Reels / TikTok", lift: 70, max: 100, color: "#3b82f6" },
                  { label: "Brand film (awareness)", lift: 55, max: 100, color: "#06b6d4" },
                  { label: "YouTube pre-roll ad", lift: 45, max: 100, color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-52 shrink-0 text-right hidden md:block">{row.label}</span>
                    <span className="text-slate-400 text-xs shrink-0 md:hidden">+{row.lift}%</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(row.lift / row.max) * 100}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">+{row.lift}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Video Format Matrix */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { format: "Short-Form (≤60s)", platforms: ["Instagram Reels", "TikTok", "YouTube Shorts"], best: "Awareness & reach", color: "#ec4899" },
                  { format: "Mid-Form (1–5min)", platforms: ["YouTube", "LinkedIn Video", "Website embed"], best: "Consideration & education", color: "#8b5cf6" },
                  { format: "Long-Form (5min+)", platforms: ["YouTube Series", "Webinars", "Podcast video"], best: "Authority & retention", color: "#3b82f6" },
                ].map((col, i) => (
                  <div key={i} className="p-4 rounded-2xl" style={{ background: `${col.color}08`, border: `1px solid ${col.color}20` }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: col.color }}>{col.format}</div>
                    <div className="space-y-1 mb-3">
                      {col.platforms.map((p, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                          <span className="text-slate-300 text-xs">{p}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-wide">Best for: {col.best}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">Sources: Wyzowl State of Video Marketing 2025, Meta Business Insights 2025, Google Ads Benchmarks 2025</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Video Production Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Video Production Results" />
      <ProcessSteps steps={PROCESS} title="Our Video Production Process" />

      {/* ── Video Production Package Comparison ─────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Video Package Comparison</h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(236,72,153,0.08)" }}>
                  <th className="text-left p-4 text-slate-300 font-semibold">Feature</th>
                  <th className="text-center p-4 text-pink-400 font-semibold">Starter</th>
                  <th className="text-center p-4 text-purple-400 font-semibold">Growth</th>
                  <th className="text-center p-4 text-blue-400 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Deliverables / month", "2 videos", "6 videos", "Unlimited"],
                  ["Format", "Reels / Shorts", "Reels + 1 Brand Film", "All formats"],
                  ["Script & storyboard", "✅ Included", "✅ Included", "✅ Included"],
                  ["Shoot day", "½ day", "1 full day", "Multi-day"],
                  ["Revision rounds", "2", "3", "Unlimited"],
                  ["Platform delivery", "1 platform", "3 platforms", "All platforms"],
                  ["Paid ad variants", "❌", "✅ 2 variants", "✅ Unlimited"],
                ].map(([feature, starter, growth, enterprise], i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="p-4 text-slate-300 font-medium">{feature}</td>
                    <td className="p-4 text-center text-pink-300">{starter}</td>
                    <td className="p-4 text-center text-purple-300">{growth}</td>
                    <td className="p-4 text-center text-blue-300">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── Video Types Showcase ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">The Right Video for Every Business Goal</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: "🏆", title: "Testimonial Videos", goal: "Build trust at purchase decision", why: "89% of buyers say customer testimonials are the most influential content at the final buying stage. We film, direct, and edit testimonials that feel authentic, not scripted.", color: "#22c55e" },
            { icon: "📦", title: "Product Demo Videos", goal: "Show don't tell", why: "Buyers who watch a product video are 85% more likely to purchase. We create demos that address objections, highlight differentiators, and drive free trial sign-ups.", color: "#3b82f6" },
            { icon: "🎬", title: "Brand Films", goal: "Establish identity & trust at scale", why: "Brand films live on your homepage, run as YouTube pre-roll, and anchor your About page — giving every new visitor a reason to believe in what you do.", color: "#ec4899" },
            { icon: "📱", title: "Social-Native Reels", goal: "Grow organic reach algorithmically", why: "Instagram and TikTok reward native vertical video with disproportionate reach. Our Reels are built for the first 3 seconds — the hook that determines whether viewers stop or scroll.", color: "#8b5cf6" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: item.color }}>Goal: {item.goal}</div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.why}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Video Production for US Brands</h2>
            <ul className="space-y-2">
              {[
                "Video ads generate 2.1× higher CTR than static image ads across Meta and Google platforms.",
                "86% of buyers want to see more brand video — testimonials and product demos drive the most bottom-funnel conversions.",
                "Short-form video (Reels, TikTok, Shorts) delivers 300% more organic engagement than static social posts.",
                "HotBot Studios handles the full production pipeline: brief, script, storyboard, shoot, edit, colour grade, and delivery.",
                "All video content is delivered in platform-native aspect ratios — 9:16, 16:9, and 1:1 — ready to publish.",
                "Video production integrates directly with digital marketing campaigns, using your films as paid ad creative.",
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
        title="Ready to Make Video That Actually Converts?"
        subtitle="Tell us what you want to say and who you want to say it to. We'll design a video production plan that fits your goals and timeline. Free strategy session included."
        formType="get-started"
      />
    </>
  );
}
