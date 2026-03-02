import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Podcast & Influencer PR Agency USA — Guest Placements & Brand Partnerships | HotBot Studios",
  description:
    "HotBot Studios secures strategic podcast guest placements and influencer partnerships for US B2B and B2C brands. Reach engaged, targeted audiences in the format they trust most. Free podcast PR consultation.",
  keywords: [
    "podcast PR agency USA",
    "podcast guest placement USA",
    "influencer PR USA",
    "B2B podcast PR USA",
    "podcast booking agency USA",
    "influencer partnership management USA",
    "podcast marketing USA",
    "brand podcast placements USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/public-relations/podcast-pr" },
  openGraph: {
    title: "Podcast & Influencer PR Agency USA — Guest Placements & Partnerships | HotBot Studios",
    description: "Strategic podcast guest placements and influencer partnerships for US B2B and B2C brands. Reach the audiences your customers trust most.",
    url: "https://hotbotstudios.com/public-relations/podcast-pr",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Podcast & Influencer PR",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Podcast Guest Placement and Influencer PR",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Strategic podcast guest placement and influencer partnership management for US B2B and B2C brands — reaching engaged, targeted audiences in the media formats they trust most.",
  url: "https://hotbotstudios.com/public-relations/podcast-pr",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Podcast & Influencer PR", item: "https://hotbotstudios.com/public-relations/podcast-pr" },
  ],
};

const CONTENT = [
  {
    heading: "Why Podcasts Are the Highest-Trust Media Format Available to Brands Right Now",
    body: "Podcast listeners are uniquely valuable from a PR perspective: they listen during commutes, workouts, and focused work time — without the constant interruption of notifications and competing content — which means they give their full attention to the conversation for 30, 45, or 60 minutes. An interview on a podcast your target audience subscribes to is the equivalent of a 45-minute sales conversation with a warm prospect who already trusts the host's recommendations. The average podcast listener subscribes to six shows and completes 80% of the episodes they start — a level of sustained attention that no other media format approaches. For B2B brands, podcast appearances on industry-specific shows directly reach decision-makers who match your ideal customer profile. For B2C brands, lifestyle and interest-based podcast placements reach highly segmented, highly engaged audiences at scale. HotBot Studios identifies the specific shows your target customers listen to and secures guest placement for your executives or spokespeople.",
    color: "#06b6d4",
  },
  {
    heading: "Our Podcast Placement Process: Research, Outreach, and Preparation",
    body: "Podcast placement done well requires significantly more than emailing podcast hosts to ask if they accept guests. It requires understanding the host's content interests and audience composition, identifying the specific angle that makes your spokesperson the right guest for that show right now, and crafting a pitch that demonstrates you have listened to the show and can offer something their audience has not heard before. HotBot Studios researches your industry's podcast landscape to build a tiered target list — flagship shows with 50,000+ listeners per episode, emerging shows with highly targeted audiences, and cross-industry shows where your executive's perspective offers a fresh angle. We write personalised pitches for each show, manage the host relationship through booking confirmation, prepare your spokesperson with episode-specific talking points and story structures, and follow up post-episode with the host to build an ongoing relationship that leads to future invitations.",
    color: "#8b5cf6",
  },
  {
    heading: "Influencer Partnerships: B2B LinkedIn Creators and B2C Brand Collaborations",
    body: "Influencer PR for B2B brands is fundamentally different from consumer influencer marketing. B2B influencer partnerships work best with LinkedIn creators who have built credibility in your industry through genuine expertise and consistent, high-quality content — not follower counts. A LinkedIn creator with 50,000 engaged followers in your target industry will drive more pipeline-relevant awareness than a B2C influencer with a million followers in a different demographic. HotBot Studios identifies the B2B creators in your space whose audiences match your ideal customer profile, structures authentic partnership arrangements (co-created content, sponsored posts, product reviews, event appearances) that align with the creator's voice rather than interrupting it, and manages the relationship, briefing, and content approval process end-to-end. For B2C brands, we manage macro and micro influencer campaigns across Instagram, TikTok, and YouTube with full performance reporting on reach, engagement, and attributed conversions.",
    color: "#ec4899",
  },
  {
    heading: "Repurposing Podcast and Influencer Content for Maximum Reach",
    body: "A 45-minute podcast interview is not just a podcast episode — it is a content library. HotBot Studios repurposes every podcast appearance into a suite of additional content assets: a long-form recap article published on your website (which generates SEO value from a keyword-rich, expert-authored piece), a series of short audiogram clips formatted for LinkedIn, Twitter, and Instagram (extending the reach of your best moments to audiences who do not listen to podcasts), a transcript formatted as a LinkedIn article or newsletter issue, and a series of pull-quote graphics for visual social media posts. This repurposing multiplies the return on each placement — a single 45-minute interview can generate 20 to 30 pieces of unique content distributed across multiple channels over the following four to six weeks. Request a consultation below and we will share a podcast target list and influencer shortlist for your industry within 48 hours.",
    color: "#22c55e",
  },
];

export default function PodcastPrPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Podcast & Influencer PR"
        title="Reach Your Audience in the Media Format They Trust Most"
        subtitle="Strategic podcast guest placements and influencer partnerships for US B2B and B2C brands — targeted, high-trust media channels that deliver 45 minutes of focused attention from your ideal customer."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div className="w-1 h-10 rounded-full mb-4" style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }} />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Podcast PR Consultation</h2>
            <p className="text-slate-400">Tell us about your brand and target audience. We will share a curated podcast target list and influencer shortlist within 48 hours — no obligation.</p>
          </div>
          <LeadCaptureForm
            sourceId="pr-podcast-pr"
            accentColor="#06b6d4"
            title="Start Your Podcast & Influencer PR Campaign"
            subtitle="Share your industry, audience, and goals and we will identify the best placement opportunities."
          />
        </Reveal>
      </section>
    </>
  );
}
