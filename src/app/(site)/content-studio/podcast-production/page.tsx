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
  title: "Podcast Production Agency USA - End-to-End Podcast Services | HotBot Studios",
  description:
    "HotBot Studios produces branded podcasts for US businesses: concept development, recording, editing, audio mastering, show notes, and multi-platform distribution on Spotify, Apple Podcasts & YouTube. Free podcast strategy session.",
  keywords: [
    "podcast production agency USA",
    "branded podcast production USA",
    "B2B podcast agency USA",
    "podcast editing service USA",
    "podcast launch agency",
    "Spotify podcast production",
    "Apple Podcasts production agency",
    "YouTube podcast production",
    "corporate podcast agency USA",
    "podcast strategy agency",
    "podcast show notes writing",
    "podcast distribution agency USA",
    "podcast marketing agency USA",
    "executive podcast production",
  ],
  openGraph: {
    title: "Podcast Production Agency USA - Branded Podcasts for Business | HotBot Studios",
    description: "End-to-end podcast production for US businesses: concept, recording, editing, mastering, show notes & multi-platform distribution. Free strategy session.",
    url: "https://hotbotstudios.com/content-studio/podcast-production",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Podcast Production Agency USA - HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast Production Agency USA | HotBot Studios",
    description: "Branded podcast production: concept, editing, mastering & distribution on Spotify, Apple & YouTube.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio/podcast-production" },
};

// ── Schema Markup ────────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Podcast Production Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Podcast Production & Distribution",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Full-service branded podcast production for US businesses: concept development, remote or in-studio recording, professional editing, audio mastering, SEO-optimised show notes, and distribution to Spotify, Apple Podcasts, and YouTube.",
  url: "https://hotbotstudios.com/content-studio/podcast-production",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Podcast Production", item: "https://hotbotstudios.com/content-studio/podcast-production" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How long does it take to launch a branded podcast?", acceptedAnswer: { "@type": "Answer", text: "From brief to first published episode, HotBot Studios delivers podcast launches in 3–4 weeks. This covers concept development, show name, artwork, intro/outro music, recording setup guidance, editing of the pilot episode, and distribution to Spotify, Apple Podcasts, and YouTube." } },
    { "@type": "Question", name: "Do you record remotely or in a studio?", acceptedAnswer: { "@type": "Answer", text: "Both options are available. For remote recording, we provide Riverside.fm or Squadcast sessions for broadcast-quality remote capture. For in-studio production, we can arrange studio time in major US cities. Equipment guidance and setup support are provided for hosts who record from home." } },
    { "@type": "Question", name: "What is included in podcast show notes?", acceptedAnswer: { "@type": "Answer", text: "Our SEO-optimised show notes include a full episode summary (400–600 words), timestamped chapter markers, key quotes, guest bio, links to resources mentioned, and target keywords for search discoverability. Show notes are formatted for your podcast host platform and as a blog post for your website." } },
  ],
};

// ── Content Data ──────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "💡", title: "Podcast Concept & Strategy", desc: "Brand positioning for your podcast: audience definition, episode format, segment structure, show name, tagline, and a 12-episode content calendar aligned to your marketing funnel.", href: "/content-studio/podcast-production" },
  { icon: "🎙️", title: "Recording & Production Setup", desc: "Remote recording sessions via Riverside.fm with broadcast-quality audio capture. Equipment guidance for self-recording hosts. Studio session coordination in major US cities for premium shows.", href: "/content-studio/podcast-production" },
  { icon: "🎚️", title: "Audio Editing & Mastering", desc: "Professional editing: noise removal, level balancing, pacing cuts, filler word removal (optional), and broadcast-standard audio mastering to -16 LUFS for platform compliance. Turnaround: 72 hours post-recording.", href: "/content-studio/podcast-production" },
  { icon: "📝", title: "Show Notes & Transcripts", desc: "SEO-optimised show notes (400–600 words) with chapter markers, key quotes, guest bios, and resource links - formatted for your podcast platform and as a blog post for your website. Full transcripts available.", href: "/content-studio/podcast-production" },
  { icon: "📡", title: "Multi-Platform Distribution", desc: "Distribution to Spotify, Apple Podcasts, Google Podcasts, Amazon Music, and YouTube - using Buzzsprout, Anchor, or your preferred host. RSS feed setup, platform profiles optimised, and episode submissions handled.", href: "/content-studio/podcast-production" },
  { icon: "📣", title: "Podcast Marketing & Growth", desc: "Episode promotion on social media (audiograms, quote cards, YouTube Shorts from episodes), email newsletter integration, guest outreach for audience cross-pollination, and listener growth analytics.", href: "/content-studio/podcast-production" },
];

const STATS = [
  { value: 22, suffix: "min", label: "Avg Listener Engagement Time", color: "#3b82f6" },
  { value: 504, suffix: "M+", label: "Podcast Listeners Worldwide (2026)", color: "#8b5cf6" },
  { value: 72, suffix: "hr", label: "Episode Delivery Post-Recording", color: "#f59e0b" },
  { value: 80, suffix: "%", label: "Listeners Complete Full Episode", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Show Concept & Positioning", desc: "We define your podcast's unique positioning, target audience, episode format, and how each episode maps back to your business goals and marketing funnel.", icon: "💡" },
  { n: 2, title: "Pre-Production & Setup", desc: "Show name, artwork, intro/outro music production, recording setup guidance, and Riverside.fm or studio session scheduling. Your first episode brief is drafted and approved.", icon: "🎛️" },
  { n: 3, title: "Record, Edit & Master", desc: "Remote or in-studio recording session. Our editors clean the audio, cut for pacing, master to broadcast standard, and add your branded intro/outro - all within 72 hours.", icon: "🎙️" },
  { n: 4, title: "Distribute, Publish & Promote", desc: "Episode published to Spotify, Apple, Amazon, and YouTube with SEO-optimised show notes, chapter markers, and a social media promotion kit for each episode release.", icon: "📡" },
];

const FAQS = [
  { q: "How long does it take to launch a branded podcast?", a: "From brief to first published episode: 3–4 weeks. This covers concept, show name, artwork, intro/outro music, recording setup, pilot episode editing, and distribution to Spotify, Apple Podcasts, and YouTube." },
  { q: "Do you record remotely or in a studio?", a: "Both. For remote recording, we use Riverside.fm or Squadcast for broadcast-quality capture. Studio sessions can be arranged in major US cities for premium shows. Equipment setup guidance is provided for home-recording hosts." },
  { q: "What is included in podcast show notes?", a: "A full episode summary (400–600 words), timestamped chapter markers, key quotes, guest bio, links to resources mentioned, and target keywords for search discoverability. Formatted for your podcast host and as a website blog post." },
  { q: "Can you clip episodes into social media content?", a: "Yes - this is one of the most powerful content multipliers we offer. Each episode can yield 3–5 audiogram clips for Instagram, YouTube Shorts, TikTok, and LinkedIn, extending the value of every recording session." },
  { q: "How do you help grow podcast listenership?", a: "Listener growth comes from consistent publishing, platform SEO (episode title keywords, show notes), guest cross-promotion (interviewing experts who share to their audiences), social media clips, and email newsletter integration. We manage all of these as part of a growth retainer." },
  { q: "What makes a branded podcast valuable for B2B companies?", a: "Podcasts build trust faster than any written content - 80% of listeners complete a full episode, giving you 20–45 uninterrupted minutes with a decision-maker. For B2B companies, podcasts attract senior buyers, support sales cycles, and establish category authority in a way no blog article can match." },
];

const RELATED = [
  { title: "Copywriting & Long-Form Content", href: "/content-studio/copywriting", desc: "Turn podcast insights into SEO blog articles and whitepapers.", icon: "✍️" },
  { title: "Social Media Content", href: "/content-studio/social-media-content", desc: "Repurpose podcast episodes into social clips and audiograms.", icon: "📱" },
  { title: "Video Production", href: "/content-studio/video-production", desc: "Record your podcast on video for YouTube and LinkedIn.", icon: "🎬" },
];

export default function PodcastProductionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Podcast Production" }]} />

      <PageHeader
        label="Podcast Production Agency USA"
        title="Your Brand's Voice - Heard by Millions on Every Platform"
        subtitle="Podcasts deliver 22 minutes of uninterrupted attention per episode - more than any other content format. HotBot Studios handles concept, recording, editing, mastering, and distribution so your show sounds professional and grows consistently."
      />

      {/* ── Definition Block (AEO) ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Branded podcast production (definition):</strong> The end-to-end creation and distribution of an audio (and/or video) show produced on behalf of a business, brand, or individual expert - covering concept development, recording, professional audio editing, mastering, SEO-optimised show notes, and multi-platform distribution. A branded podcast is a long-form content asset that builds category authority, attracts decision-makers as regular listeners, and supports B2B sales cycles by providing sustained, high-trust engagement over time.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Podcast Industry Stats ─────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Why Branded Podcasts Are B2B&apos;s Most Powerful Content Format in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "504M+", label: "podcast listeners worldwide in 2026 - a 25% increase from 2023", color: "#3b82f6" },
                  { pct: "80%", label: "of listeners complete the full episode - highest engagement of any content", color: "#8b5cf6" },
                  { pct: "22min", label: "average listener engagement per episode vs 2min for social content", color: "#06b6d4" },
                  { pct: "54%", label: "of podcast listeners are more likely to buy from brands they hear advertised", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Content repurposing value chain */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Content Repurposing Value Chain - 1 Podcast Episode → Multiple Assets</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { asset: "Full Episode", platform: "Spotify / Apple", icon: "🎙️", color: "#3b82f6" },
                  { asset: "Video Episode", platform: "YouTube", icon: "▶️", color: "#ec4899" },
                  { asset: "3–5 Audiograms", platform: "Instagram / TikTok", icon: "📱", color: "#8b5cf6" },
                  { asset: "Blog Article", platform: "SEO / Website", icon: "📝", color: "#22c55e" },
                  { asset: "Email Feature", platform: "Newsletter", icon: "📧", color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.asset}</div>
                    <div className="text-slate-500 text-[10px]">{item.platform}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">1 recording session = 5+ content pieces across all your channels</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Podcast Production Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Podcast Industry Benchmarks" />
      <ProcessSteps steps={PROCESS} title="Our Podcast Production Process" />

      {/* ── Podcast Formats by Business Goal ────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">The Right Podcast Format for Your Business Goals</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: "🎤", title: "Interview / Guest Show", goal: "Audience growth & authority", desc: "Bring on industry experts and thought leaders as guests. Their audiences discover your show, growing your listener base and positioning you as a connector and authority in your category.", color: "#3b82f6" },
            { icon: "🧠", title: "Solo Expert Show", goal: "Personal brand & lead gen", desc: "Founders and executives sharing direct expertise and insights. Highest trust format - listeners form a one-to-one relationship with the host. Ideal for consultants, SaaS founders, and B2B executives.", color: "#8b5cf6" },
            { icon: "🗣️", title: "Roundtable / Panel", goal: "Community & thought leadership", desc: "Multiple hosts or recurring guests debating industry topics. Creates a sense of community around your brand and generates strong social media clips from natural, unscripted discussion.", color: "#ec4899" },
            { icon: "📖", title: "Narrative / Storytelling", goal: "Brand awareness & PR", desc: "Serialised documentary-style content that tells your brand's origin story, customer success stories, or industry evolution. High production value - attracts media coverage and awards.", color: "#22c55e" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: item.color }}>Goal: {item.goal}</div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
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
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways - Podcast Production for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "Podcasts deliver 22 minutes of average listener engagement - more than any other content format.",
                "80% of podcast listeners complete full episodes, creating unmatched depth of brand engagement.",
                "One recording session produces 5+ content assets: full episode, YouTube video, social audiograms, blog article, and email feature.",
                "HotBot Studios handles everything from concept to distribution - Spotify, Apple Podcasts, YouTube, and Amazon Music.",
                "Branded podcasts attract senior B2B decision-makers who seek expert content over social media noise.",
                "Podcast production integrates with copywriting (show notes as blog posts) and social media content (audiogram clips).",
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
        title="Ready to Launch Your Brand's Podcast?"
        subtitle="Tell us your industry, audience, and goals. We'll design a podcast format that builds authority, grows listeners, and repurposes into 5+ content assets per episode. Free strategy session included."
        formType="get-started"
      />
    </>
  );
}
