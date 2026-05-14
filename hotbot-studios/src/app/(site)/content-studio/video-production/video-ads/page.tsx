import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Ad Production for Meta & Google USA | HotBot Studios",
  description:
    "HotBot Studios produces direct-response video ads for Meta (Facebook/Instagram), YouTube, and Google Display. Split-test variants, platform-native formats, CTA-driven scripts. 2.1× higher CTR than static ads. Free ad creative consultation.",
  keywords: [
    "video ad production USA",
    "Meta video ads agency USA",
    "YouTube video ads production",
    "Facebook video ads agency USA",
    "Google video ads production",
    "direct response video ads USA",
    "paid social video creative agency",
  ],
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production/video-ads" },
  openGraph: {
    title: "Video Ad Production for Meta & Google USA | HotBot Studios",
    description: "Direct-response video ads for Meta, YouTube, and Google — with split-test variants, platform-native formats, and CTA-driven scripts that convert.",
    url: "https://hotbotstudios.com/content-studio/video-production/video-ads",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Video Ad Production (Meta & Google)",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Video Advertising Production & Paid Media Creative",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional video ad production for Meta (Facebook/Instagram), YouTube pre-roll, and Google Display. Includes script, filming, editing, split-test hook variants, and platform-specific aspect ratio delivery.",
  url: "https://hotbotstudios.com/content-studio/video-production/video-ads",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
    { "@type": "ListItem", position: 4, name: "Video Ads", item: "https://hotbotstudios.com/content-studio/video-production/video-ads" },
  ],
};

const CONTENT = [
  {
    heading: "Why Video Ads Outperform Static Ads Across Every Platform in 2026",
    body: "Video ads generate 2.1× higher click-through rates than static image ads on Google, 34% lower cost-per-acquisition on Meta, and 3× higher brand recall in YouTube pre-roll placements — according to platform-published benchmarks and our own client campaign data. The mechanism is straightforward: video conveys emotion, movement, and narrative in a way that a static image cannot. When a prospective buyer is scrolling through their Instagram feed or watching a YouTube video, a well-produced video ad earns attention in the first three seconds where a static ad simply occupies space. As paid media costs continue to rise, the quality of your creative is no longer a secondary consideration — it is the primary lever you control for improving return on ad spend. Replacing low-performing static ads with professionally produced video is consistently the single highest-ROI change in our clients&apos; paid media accounts.",
    color: "#3b82f6",
  },
  {
    heading: "Direct-Response Video: Scripts Built to Convert, Not Just to Impress",
    body: "Brand-awareness video and direct-response video ad creative are fundamentally different disciplines. A brand film is designed to build emotional association over multiple impressions. A video ad is designed to generate a click, a sign-up, or a purchase in a single exposure — often from a viewer who has never heard of your brand and has approximately five seconds to decide whether to keep watching. HotBot Studios writes video ad scripts using a direct-response framework: a pattern-interrupting hook in the first three seconds, an identified problem or desire in seconds four through ten, a demonstrated solution in seconds ten through twenty-five, social proof in seconds twenty-five through thirty-five, and a single high-contrast CTA in the final five seconds. Every word is weighted against viewer drop-off data — if it does not serve the conversion, it does not make the script.",
    color: "#ec4899",
  },
  {
    heading: "Split-Test Variants: The Creative Testing Framework That Reduces Wasted Spend",
    body: "Running a single version of a video ad without testing alternatives is the most common and most costly mistake in paid media. Even a 0.5% improvement in click-through rate compounds into significantly lower cost-per-lead when multiplied across thousands of impressions per day. HotBot Studios delivers every video ad campaign with a minimum of three hook variants — the same body and CTA, with three different opening three-second hooks: one curiosity-driven, one pain-point-led, and one benefit-forward. These three variants are launched simultaneously in a structured Meta or Google split test, and the winning hook is identified within seven to fourteen days of campaign launch. We also produce 15-second and 30-second edits of every video ad for platform-specific placement requirements, and deliver all cuts in 16:9, 9:16, and 1:1 aspect ratios ready for Media Buyer upload.",
    color: "#8b5cf6",
  },
  {
    heading: "Platform-Specific Strategy: Meta vs YouTube vs Google Display",
    body: "Each paid video platform has different creative requirements, audience behaviours, and bidding dynamics. On Meta (Facebook and Instagram), the feed is a social context and video ads that blend with organic content — without branded overlays in the first three seconds — consistently outperform obvious advertisements. On YouTube pre-roll, viewers have chosen to be in a content consumption mindset and will watch up to 30 seconds before skipping if the content is genuinely useful; longer-form ads perform better here than on social. On Google Display, video ads reach in-market audiences across the open web — and simpler, cleaner visual treatments with strong CTAs outperform complex narratives. HotBot Studios produces video ads natively for each platform rather than adapting a single creative, and our production team works in close coordination with your media buying team or our own paid media strategists to ensure that creative and targeting are aligned from the outset.",
    color: "#f59e0b",
  },
];

export default function VideoAdsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Video Production", href: "/content-studio/video-production" }, { label: "Video Ads" }]} />

      <PageHeader
        label="Video Ads (Meta & Google)"
        title="Video Creative That Lowers Your Cost Per Lead"
        subtitle="Direct-response video ads for Meta, YouTube, and Google — with split-test hook variants, platform-native formats, and CTA-driven scripts. 2.1× higher CTR than static ads."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Video Ad Creative Consultation</h2>
            <p className="text-slate-400">Tell us about your campaign goals and current ad creative performance. We will respond with a video ad concept and production proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="video-ads-meta-google"
            accentColor="#3b82f6"
            title="Start Your Video Ad Campaign"
            subtitle="No obligation. Share your paid media goals and we will show you the creative approach that fits your budget and target ROAS."
          />
        </Reveal>
      </section>
    </>
  );
}
