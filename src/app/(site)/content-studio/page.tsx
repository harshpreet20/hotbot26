import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Content Production Studio USA — Video, Copy & Social Content | HotBot Studios",
  description:
    "HotBot Studios produces premium brand content for US businesses: video production, photography, copywriting, podcast production, and social media content. 300% avg engagement increase. Get your free content audit.",
  keywords: [
    "content production agency USA",
    "video production agency USA",
    "brand copywriting services USA",
    "podcast production agency USA",
    "social media content agency",
    "content marketing agency USA",
    "B2B content production USA",
    "brand storytelling agency",
    "YouTube video production agency",
    "content strategy agency USA",
    "blog writing services USA",
    "Instagram content creation agency",
    "TikTok content agency USA",
    "content ROI",
  ],
  openGraph: {
    title: "Content Production Studio USA — Video, Copy & Social | HotBot Studios",
    description: "Premium brand content for US businesses: video, photography, copywriting, podcasts & social media content. 300% avg engagement increase. Free content audit.",
    url: "https://hotbotstudios.com/content-studio",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Content Production Studio USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Content Production Studio USA | HotBot Studios",
    description: "Video, copy, photography & social content for US brands. 300% avg engagement increase.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio" },
};

// ── Schema Markup ───────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Content Production Studio for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Content Production & Content Marketing",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Premium content production including video, photography, copywriting, podcast production, and social media content for US brands. 500+ content pieces produced, 300% average engagement increase.",
  url: "https://hotbotstudios.com/content-studio",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How quickly can HotBot Studios produce content?", acceptedAnswer: { "@type": "Answer", text: "Blog articles take 24–48 hours. Video production takes 1–2 weeks from brief to final delivery. Social media content batches are turned around weekly. Podcast episodes are delivered within 72 hours of recording." } },
    { "@type": "Question", name: "Can HotBot Studios match our existing brand voice?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. We conduct a brand voice audit at the start of every engagement and maintain a brand guidelines document that every content creator on your account follows consistently." } },
    { "@type": "Question", name: "Does HotBot Studios handle content distribution?", acceptedAnswer: { "@type": "Answer", text: "Yes. As part of a content retainer, HotBot Studios can manage posting, scheduling, and community management across all your social platforms, plus distribute content via our digital marketing team." } },
  ],
};

// ── Content Data ─────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🎬", title: "Video Production", desc: "Brand films, product explainer videos, customer testimonial videos, social media Reels, YouTube content, and corporate documentaries — scripted, filmed, and edited to broadcast quality.", href: "/content-studio/video-production" },
  { icon: "📸", title: "Photography & Visual Assets", desc: "Product photography, brand lifestyle shoots, executive portraits, event coverage, and stock asset libraries. Shot for digital-first use: social media, website, and paid ads.", href: "/content-studio/photography" },
  { icon: "✍️", title: "Copywriting & Long-Form Content", desc: "Website copy, SEO blog articles, whitepapers, case studies, email sequences, and LinkedIn thought leadership. Written by senior copywriters trained on conversion principles and SEO.", href: "/content-studio/copywriting" },
  { icon: "🎙️", title: "Podcast Production", desc: "End-to-end podcast production — concept development, recording, editing, audio mastering, show notes, and multi-platform distribution (Spotify, Apple Podcasts, YouTube).", href: "/content-studio/podcast-production" },
  { icon: "📱", title: "Social Media Content", desc: "Platform-native content for Instagram Reels, TikTok, LinkedIn, and YouTube Shorts — built on trend analysis and platform algorithm expertise to maximize organic reach.", href: "/content-studio/social-media-content" },
  { icon: "🖨️", title: "Print & Design Collateral", desc: "Brochures, pitch decks, trade show materials, infographics, and all print collateral. Designed in Figma to brand guidelines, print-ready and optimized for digital delivery.", href: "/content-studio/print-design" },
];

const STATS = [
  { value: 500, suffix: "+", label: "Content Pieces Produced", color: "#8b5cf6" },
  { value: 40, suffix: "+", label: "Brand Partners", color: "#3b82f6" },
  { value: 300, suffix: "%", label: "Avg Engagement Increase", color: "#ec4899" },
  { value: 48, suffix: "hr", label: "Typical Blog Turnaround", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Brand Voice & Brief", desc: "We audit your existing content, study your brand guidelines, and interview key stakeholders to capture your authentic brand voice — before a single word is written.", icon: "📋" },
  { n: 2, title: "Content Strategy & Calendar", desc: "Build a 90-day content calendar mapped to your marketing goals, audience segments, seasonal trends, and keyword opportunities.", icon: "📅" },
  { n: 3, title: "Production", desc: "Our team of senior copywriters, videographers, photographers, and social strategists produces your content to brief — on time, on brand, every time.", icon: "🎨" },
  { n: 4, title: "Review, Publish & Distribute", desc: "Two rounds of revision included. Once approved, we publish and distribute across all your channels — including SEO-optimized upload for videos and posts.", icon: "✅" },
];

const FAQS = [
  { q: "How quickly can HotBot Studios produce content?", a: "Blog articles: 24–48 hours. Social media batches: weekly. Video production: 1–2 weeks from brief to delivery. Podcast episodes: 72 hours post-recording. We maintain quality at speed through our established production workflows." },
  { q: "Does HotBot Studios handle content distribution too?", a: "Yes. As part of a content retainer, we can manage posting, scheduling, and community management across all social platforms. Our digital marketing team can also run paid distribution to amplify top-performing organic content." },
  { q: "Can you match our existing brand voice?", a: "Absolutely. We start every engagement with a brand voice audit — reviewing your existing content, brand guidelines, and competitor analysis. Every creator on your account follows a detailed brand voice guide that we maintain and update quarterly." },
  { q: "What content formats do you specialize in?", a: "Video production, photography, copywriting (blog, website, email, ads), podcast production, social media content (Instagram Reels, TikTok, LinkedIn, YouTube Shorts), and print/design collateral." },
  { q: "How does content production work with digital marketing?", a: "They're deeply integrated. Our digital marketing team uses HotBot Studios content to fuel SEO (blog articles), paid social (video ads), email campaigns, and PR (press releases). Content is the fuel — distribution is the engine. See our digital marketing and PR services." },
];

const RELATED = [
  { title: "Digital Marketing", href: "/digital-marketing", desc: "Distribute your content for maximum paid and organic reach.", icon: "📣" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Beautiful digital environments to showcase your content.", icon: "🎨" },
  { title: "Public Relations", href: "/public-relations", desc: "Get your content featured in Forbes, TechCrunch & major media.", icon: "📰" },
];

export default function ContentStudioPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }]} />

      <PageHeader
        label="Content Production Studio USA"
        title="Content That Captivates, Converts, and Compounds"
        subtitle="Generic content gets scrolled past. HotBot Studios produces brand content — video, copy, and social — that educates your buyers, builds organic authority, and generates qualified leads at scale. 500+ content pieces delivered to 40+ US brands."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Content marketing (definition):</strong> The strategic creation and distribution of valuable, relevant content — blog articles, videos, social posts, podcasts, and infographics — to attract and convert a defined target audience. Effective content marketing in 2026 requires SEO-optimized long-form articles, platform-native short-form video, AI-assisted production workflows, and clear attribution to revenue outcomes via GA4.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Content Format Performance ──────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Content Format Performance for US Brands in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { format: "Short-form Video (Reels/TikTok)", metric: "+300%", stat: "avg engagement vs static posts", color: "#ec4899" },
                  { format: "SEO Blog Articles", metric: "6×", stat: "avg ROI over 12 months", color: "#8b5cf6" },
                  { format: "Email Sequences", metric: "42×", stat: "avg ROI (DMA 2025)", color: "#22c55e" },
                  { format: "Podcast Episodes", metric: "22min", stat: "avg listener engagement time", color: "#3b82f6" },
                  { format: "LinkedIn Long-form", metric: "+180%", stat: "organic reach vs image posts", color: "#f59e0b" },
                  { format: "Video Ads", metric: "2.1×", stat: "higher CTR vs static image ads", color: "#06b6d4" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl text-center" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                    <div className="text-xl font-black mb-1" style={{ color: item.color }}>{item.metric}</div>
                    <div className="text-slate-300 text-xs font-semibold mb-1">{item.format}</div>
                    <div className="text-slate-500 text-[10px]">{item.stat}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-2">Sources: HubSpot State of Marketing 2025, DMA Email Marketing Report 2025, Sprout Social Index 2025</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Content Services We Produce" columns={3} />
      <ServiceStats stats={STATS} title="Content Production Results" />
      <ProcessSteps steps={PROCESS} title="Our Content Production Process" />
      <FAQSection faqs={FAQS} />

      {/* ── Content by Business Goal ──────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-4">The Right Content for Every Stage of Your Funnel</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            Effective content marketing isn&apos;t about producing more content — it&apos;s about producing the right content
            for each stage of your buyer&apos;s journey. HotBot Studios maps every content format to a specific business goal,
            ensuring your production budget compounds into measurable audience growth and lead generation.
          </p>
          <div className="space-y-3">
            {[
              {
                stage: "Top of Funnel — Awareness",
                goal: "Attract new audiences who don't know you yet",
                formats: "SEO blog articles, YouTube videos, TikTok Reels, podcast episodes, LinkedIn thought leadership",
                metric: "Organic traffic, social reach, new subscriber growth",
                color: "#3b82f6",
              },
              {
                stage: "Middle of Funnel — Consideration",
                goal: "Educate prospects already researching your category",
                formats: "Whitepapers, case studies, comparison guides, webinar recordings, email drip sequences",
                metric: "Lead magnet downloads, email list growth, time on page",
                color: "#8b5cf6",
              },
              {
                stage: "Bottom of Funnel — Conversion",
                goal: "Convert warm prospects into paying customers",
                formats: "Customer testimonial videos, product demo videos, detailed case studies, sales deck copy",
                metric: "Demo requests, proposal conversions, sales-qualified leads",
                color: "#22c55e",
              },
              {
                stage: "Post-Purchase — Retention & Advocacy",
                goal: "Retain customers and turn them into brand ambassadors",
                formats: "Onboarding content, tutorial videos, customer success stories, referral program content",
                metric: "Churn reduction, NPS score, referral lead volume",
                color: "#f59e0b",
              },
            ].map((row, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="p-4 rounded-2xl" style={{ background: `${row.color}08`, border: `1px solid ${row.color}20` }}>
                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="md:w-48 shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: row.color }}>{row.stage}</span>
                      <p className="text-slate-400 text-xs mt-1">{row.goal}</p>
                    </div>
                    <div className="flex-1 text-xs text-slate-300">{row.formats}</div>
                    <div className="md:w-48 text-xs text-slate-500 shrink-0">{row.metric}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Content Production for US Brands</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios has produced 500+ content pieces for 40+ US brands across video, copy, photography, and social.",
                "Short-form video (Instagram Reels, TikTok, YouTube Shorts) delivers 300% higher engagement than static posts.",
                "SEO-optimized blog articles deliver an average 6× ROI over 12 months through compounding organic traffic.",
                "All content is built on brand voice guidelines maintained quarterly — consistent across every channel.",
                "Content production integrates with digital marketing campaigns and PR for amplified distribution.",
                "Explore: digital marketing distribution, public relations for media placement, and UI/UX for content presentation.",
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
        title="Let&apos;s Build a Content Engine That Scales"
        subtitle="Tell us your content goals and we'll design a production system that delivers consistently — without sacrificing quality or your brand voice. Free content audit included."
        formType="get-started"
      />
    </>
  );
}
