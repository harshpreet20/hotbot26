import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "YouTube Series & Long-Form Video Production USA | HotBot Studios",
  description:
    "HotBot Studios produces YouTube series and long-form video content for US brands. Build authority, grow subscribers, and compound SEO traffic over time. Strategy, scripting, filming, editing, and thumbnail design included.",
  keywords: [
    "YouTube series production USA",
    "long form video production USA",
    "YouTube content agency USA",
    "YouTube marketing agency USA",
    "B2B YouTube content production",
    "YouTube channel management USA",
    "episodic video production USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production/youtube-series" },
  openGraph: {
    title: "YouTube Series & Long-Form Video Production USA | HotBot Studios",
    description: "Episodic YouTube series that build authority, grow subscribers, and compound organic search traffic. Strategy through production included.",
    url: "https://hotbotstudios.com/content-studio/video-production/youtube-series",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "YouTube Series & Long-Form Video Production",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "YouTube Content Production & Video Marketing",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Full-service YouTube series production for US brands — channel strategy, video SEO, scripting, filming, editing, thumbnails, and publishing guidance for episodic long-form content.",
  url: "https://hotbotstudios.com/content-studio/video-production/youtube-series",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
    { "@type": "ListItem", position: 4, name: "YouTube Series & Long-Form", item: "https://hotbotstudios.com/content-studio/video-production/youtube-series" },
  ],
};

const CONTENT = [
  {
    heading: "YouTube Is the Highest-Leverage Owned Media Channel for US Brands",
    body: "YouTube is the second-largest search engine in the world, with over 2.7 billion monthly logged-in users and a content recommendation algorithm that surfaces relevant videos to in-market audiences independently of follower count or paid amplification. Unlike social media posts that have a 24-hour shelf life, a well-produced YouTube video continues to receive search-driven views for months and years after publication — compounding into a library of organic traffic that costs nothing to maintain. For US B2B brands and professional service firms, a YouTube channel built around your category's search queries is one of the few digital marketing assets that appreciates in value over time rather than depreciating. HotBot Studios designs YouTube channel strategies around keyword-validated content pillars that position your brand as the definitive authority in your category.",
    color: "#ef4444",
  },
  {
    heading: "Series Format vs One-Off Videos: Why Episodic Content Wins",
    body: "One-off YouTube videos are difficult to grow a channel with because they give viewers no reason to subscribe. A series — a structured sequence of episodes around a defined topic, format, and release cadence — gives viewers a reason to return, subscribe, and share. The YouTube algorithm rewards watch time and session depth: when a viewer watches one episode of your series and immediately clicks to watch the next, the algorithm interprets that as a quality signal and increases distribution of both videos. HotBot Studios builds series concepts around three criteria: a topic your target audience actively searches for, a format that distinguishes your brand from existing YouTube content in the category, and a production level that you can sustain at monthly cadence without burning out your internal team. We handle the production; you provide the subject matter expertise.",
    color: "#f59e0b",
  },
  {
    heading: "Our End-to-End YouTube Series Production Process",
    body: "The HotBot YouTube series production process begins with a channel audit and keyword research sprint — identifying the ten to fifteen highest-volume, lowest-competition search queries in your category that a well-produced video could rank for within 90 days. From that research, we develop a 12-episode series brief with titles, descriptions, scripting outlines, and thumbnail concepts for each episode. Production cycles in monthly batches: we film two or three episodes per shoot day, edit to a consistent format with branded intro, outro, lower-thirds, and chapter markers, and deliver completed episodes with SEO-optimised titles, descriptions, tags, and thumbnail files. Each episode is also delivered in a short-form edit suitable for YouTube Shorts to maximise cross-platform reach from a single shoot.",
    color: "#8b5cf6",
  },
  {
    heading: "Building a Subscriber Base That Converts to Revenue",
    body: "A YouTube subscriber is not just a metric — it is a person who has voluntarily opted into a regular content relationship with your brand, and the conversion rates of YouTube audiences to sales enquiries are consistently higher than equivalent-size email lists in our client data. The key to subscriber growth is a combination of consistent publishing cadence (at least bi-weekly), thumbnail click-through rate optimisation (thumbnails are the single most important factor in YouTube discovery performance), and end-screen call-to-action strategy that directs viewers to other relevant videos or to your website. HotBot Studios manages the full post-production workflow for YouTube series clients on a monthly retainer basis, handling everything from scripting and filming through publishing and performance reporting — so your team spends its time on subject matter expertise rather than video production logistics.",
    color: "#3b82f6",
  },
];

export default function YoutubeSeriesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="YouTube Series & Long-Form Video"
        title="Build Authority on YouTube That Compounds Over Time"
        subtitle="Episodic YouTube series designed around your category's search queries — strategy, scripting, filming, editing, SEO, and thumbnails included. Turn your expertise into the definitive YouTube channel in your space."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div
                className="w-1 h-10 rounded-full mb-4"
                style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }}
              />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free YouTube Channel Strategy</h2>
            <p className="text-slate-400">Tell us about your brand and your target audience. We will respond with a keyword-validated series concept and production proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="video-youtube-series"
            accentColor="#ef4444"
            title="Start Your YouTube Series"
            subtitle="No obligation. Share your category and goals and we will show you the keyword opportunity and series format that fits."
          />
        </Reveal>
      </section>
    </>
  );
}
