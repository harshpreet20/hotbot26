import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Instagram Reels & TikTok Video Production USA | HotBot Studios",
  description:
    "HotBot Studios produces hook-first Instagram Reels, TikTok videos, and YouTube Shorts for US brands. 300% more organic reach than static posts. Batch production, platform-native captions, trending audio. Free strategy session.",
  keywords: [
    "Instagram Reels production USA",
    "TikTok video agency USA",
    "short form video production USA",
    "YouTube Shorts production",
    "social media video agency USA",
    "vertical video production USA",
    "Reels content agency USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production/short-form-social" },
  openGraph: {
    title: "Instagram Reels & TikTok Video Production USA | HotBot Studios",
    description: "Hook-first short-form video built for Instagram Reels, TikTok, and YouTube Shorts. 300% more organic reach than static posts.",
    url: "https://hotbotstudios.com/content-studio/video-production/short-form-social",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Short-Form Social Video Production (Reels & TikTok)",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Short-Form Video Production & Social Media Content",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Platform-native vertical video production for Instagram Reels, TikTok, and YouTube Shorts. Hook-first scripting, trending audio, native captions, and algorithm-informed posting guidance.",
  url: "https://hotbotstudios.com/content-studio/video-production/short-form-social",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
    { "@type": "ListItem", position: 4, name: "Short-Form Social", item: "https://hotbotstudios.com/content-studio/video-production/short-form-social" },
  ],
};

const CONTENT = [
  {
    heading: "The Algorithm Advantage of Native Short-Form Video",
    body: "Instagram Reels receive 300% more organic reach than static image posts on the same account - a figure Meta published in 2025 and that our own client data consistently validates. TikTok's recommendation engine surfaces native vertical video to non-followers at a rate no other platform can match, making it the only truly level playing field in social media where a brand with 200 followers can reach 200,000 viewers on a single piece of content. YouTube Shorts, meanwhile, feed directly into YouTube's broader recommendation graph, giving brands a short-form entry point into the world's second-largest search engine. For US businesses trying to grow organic reach without scaling paid spend, short-form vertical video is not optional - it is the most efficient awareness channel available in 2026.",
    color: "#f59e0b",
  },
  {
    heading: "Hook-First Scripting: The First 3 Seconds Determine Everything",
    body: "The stop-scroll rate on short-form video is determined almost entirely by what happens in the first three seconds. If a viewer swipes past your Reel in the first three seconds, the algorithm interprets it as low-quality content and reduces distribution. If a viewer watches past three seconds, the algorithm interprets it as high-quality content and increases distribution - creating a compounding effect that can take a piece of content from 1,000 views to 100,000 views in 48 hours. HotBot Studios builds every Reel and TikTok script hook-first: we start with the most provocative statement, the most surprising statistic, or the most relatable frustration - and only then move into the body of the video. This is a fundamentally different approach from traditional advertising, where the brand message comes first. On short-form platforms, the viewer&apos;s attention comes first.",
    color: "#ec4899",
  },
  {
    heading: "Batch Production: More Content, Less Disruption to Your Team",
    body: "Posting consistently on Reels and TikTok - three to five times per week - is the minimum cadence required to grow organic reach meaningfully. Most brands fail at short-form not because of ideas but because of production throughput: filming one video at a time is unsustainable. HotBot Studios solves this with batch production: a single half-day or full-day shoot generates eight to sixteen pieces of content in one session, giving you two to four weeks of content ready to schedule and publish. We script every piece in advance, plan outfits and locations for visual variety, and deliver all content captioned, audio-synced, formatted for 9:16, and ready to upload directly to TikTok, Instagram, and YouTube Shorts with zero additional editing required from your team.",
    color: "#8b5cf6",
  },
  {
    heading: "Platform Optimisation That Goes Beyond the Video Itself",
    body: "A great video in a poorly optimised post will underperform. HotBot Studios delivers every piece of short-form content with a complete posting brief that includes the hook-driven caption, the hashtag set (optimised for discoverability without triggering spam filters), trending audio recommendations, and the optimal posting time for your audience timezone based on your account analytics. We also provide A/B hook testing guidance - producing two or three variations of the opening three seconds for your highest-priority content, so you can test which hook drives the most watch time and apply that learning to future production. For brands managing paid amplification alongside organic, we deliver a paid-ready version of each Reel with a CTA overlay suitable for Meta Ads Manager or TikTok Ads.",
    color: "#3b82f6",
  },
];

export default function ShortFormSocialPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Video Production", href: "/content-studio/video-production" }, { label: "Short Form Social" }]} />

      <PageHeader
        label="Short-Form Social Video (Reels & TikTok)"
        title="Stop the Scroll. Start the Growth."
        subtitle="Hook-first Instagram Reels, TikTok videos, and YouTube Shorts produced in batches - platform-native, caption-ready, and built to maximise algorithm reach for your US brand."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Short-Form Strategy Session</h2>
            <p className="text-slate-400">Tell us about your brand and target audience. We will respond with a content plan and batch production proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="video-short-form-social"
            accentColor="#f59e0b"
            title="Start Your Reels & TikTok Content Plan"
            subtitle="No obligation. Share your brand goals and current social presence and we will show you what a monthly content batch looks like."
          />
        </Reveal>
      </section>
    </>
  );
}
