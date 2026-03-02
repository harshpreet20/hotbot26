import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Brand Film Production USA — Cinematic Brand Stories | HotBot Studios",
  description:
    "HotBot Studios produces cinematic brand films for US businesses. 4K production, original scores, colour-graded to your brand palette. Tell your story — and make buyers believe it. Free brand film consultation.",
  keywords: [
    "brand film production USA",
    "corporate brand film agency",
    "cinematic brand video USA",
    "brand story video production",
    "company culture video USA",
    "brand documentary production",
    "brand film agency USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production/brand-films" },
  openGraph: {
    title: "Brand Film Production USA | HotBot Studios",
    description: "Cinematic brand films that define who you are and why customers should choose you. 4K production, scored and colour-graded to your brand.",
    url: "https://hotbotstudios.com/content-studio/video-production/brand-films",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Brand Film Production",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Brand Film & Corporate Video Production",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Full-service brand film production for US businesses — 4K cinematography, scriptwriting, storyboarding, location shoot, colour grade, original music, and multi-platform delivery.",
  url: "https://hotbotstudios.com/content-studio/video-production/brand-films",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
    { "@type": "ListItem", position: 4, name: "Brand Films", item: "https://hotbotstudios.com/content-studio/video-production/brand-films" },
  ],
};

const CONTENT = [
  {
    heading: "What a Brand Film Actually Does for Your Business",
    body: "A brand film is not a product demo and it is not an ad — it is the definitive answer to the question every potential customer asks before they commit: who are you and why should I trust you? In 2026, buyers research extensively before speaking to sales. Your website is your first impression, and a brand film placed above the fold has been shown to increase average session time by over 60% and reduce bounce rates by up to 35%. When a prospect watches a 90-second film and understands your mission, your people, and your values, they arrive at your sales conversation already warm. That shift in the quality of inbound leads — not just the quantity — is what makes brand film production one of the highest-ROI investments a growing US business can make.",
    color: "#ec4899",
  },
  {
    heading: "How HotBot Studios Produces Brand Films",
    body: "Our process begins with a deep creative brief — we need to understand your audience, your differentiator, and the single feeling you want a viewer to walk away with. From that brief, our creative team develops a script, a storyboard, and a shot list before a single camera is unpacked. On shoot day, our crew arrives with 4K cinema cameras, professional lighting rigs, directional and lavalier audio capture, and a director who has worked with your team in advance to make sure every interview and b-roll moment lands authentically. Post-production includes a professional edit, two rounds of revisions, colour grading to match your brand palette, bespoke or licensed music scoring, sound design, and final delivery in all required formats — 16:9 for YouTube and website embed, 1:1 for social feed, 9:16 for Instagram Stories.",
    color: "#8b5cf6",
  },
  {
    heading: "Where Your Brand Film Lives and How It Performs",
    body: "A brand film is multi-channel content by design. It anchors your homepage and About page, driving the trust that converts first-time visitors. It runs as a YouTube pre-roll ad targeting in-market audiences who are actively researching your category — at a fraction of the cost of equivalent TV spend. It lives on your LinkedIn company page, where video content receives 5× more engagement than text posts. It plays on loop at trade shows and conferences to communicate credibility without requiring a team member to be present. HotBot Studios delivers every brand film with a distribution brief — a one-page strategy for where and how to deploy your film across owned, earned, and paid channels for maximum reach in the first 90 days.",
    color: "#3b82f6",
  },
  {
    heading: "Investment, Timeline, and What to Expect",
    body: "A typical brand film engagement spans three to four weeks from kick-off to final delivery: one week of pre-production (creative brief, script approval, storyboard), one shoot day at your location or a studio, and two weeks of post-production including revisions. HotBot Studios works with US businesses across B2B SaaS, professional services, healthcare, e-commerce, and manufacturing — and we tailor every production to your industry, audience, and brand identity rather than delivering a generic template. If you have an existing brand guidelines document, we work within it. If you are building your brand identity concurrently, our design team can align the film with the visual system we create for you. Request a free consultation below and we will share relevant portfolio examples and a production proposal within 24 hours.",
    color: "#06b6d4",
  },
];

export default function BrandFilmsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Brand Film Production"
        title="The Film That Makes Buyers Believe in You"
        subtitle="Cinematic brand stories — scripted, shot in 4K, colour-graded, and scored — that anchor your homepage, run as pre-roll ads, and give every prospect a reason to choose you."
      />

      {/* Content Paragraphs */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div
                className="w-1 h-10 rounded-full mb-4 shrink-0"
                style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }}
              />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      {/* Lead Capture Form */}
      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Brand Film Consultation</h2>
            <p className="text-slate-400">Share your brief and we will respond with portfolio examples and a production proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="video-brand-films"
            accentColor="#ec4899"
            title="Start Your Brand Film Project"
            subtitle="No obligation. Just a conversation about your brand story and how we can tell it."
          />
        </Reveal>
      </section>
    </>
  );
}
