import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Media Relations Agency USA - Press Coverage & Journalist Outreach | HotBot Studios",
  description:
    "HotBot Studios secures editorial press coverage for US businesses in national, trade, and digital publications. Personalised journalist pitching, relationship-based media relations, and guaranteed coverage programmes. Free PR consultation.",
  keywords: [
    "media relations agency USA",
    "press coverage agency USA",
    "journalist outreach USA",
    "PR agency USA",
    "earned media agency USA",
    "press coverage for startups USA",
    "trade press coverage USA",
    "national media coverage USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/public-relations/media-relations" },
  openGraph: {
    title: "Media Relations Agency USA - Press Coverage & Journalist Outreach | HotBot Studios",
    description: "Editorial press coverage in national, trade, and digital publications for US businesses. Relationship-based media relations, not spray-and-pray distribution.",
    url: "https://hotbotstudios.com/public-relations/media-relations",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Media Relations & Press Coverage",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Media Relations and Earned Media PR",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Relationship-based media relations and journalist outreach that secures genuine editorial press coverage in national, trade, and digital publications for US businesses.",
  url: "https://hotbotstudios.com/public-relations/media-relations",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Media Relations", item: "https://hotbotstudios.com/public-relations/media-relations" },
  ],
};

const CONTENT = [
  {
    heading: "Why Most Media Outreach Fails - and What Actually Works",
    body: "The standard PR agency playbook - write a press release, blast it to a list of 10,000 journalists via Cision, wait for coverage - produces response rates below 2% and coverage rates closer to 0.1%. Journalists receive hundreds of pitches a day. Generic releases about funding rounds, product launches, and executive hires are filtered out in seconds. What actually produces editorial coverage is a combination of three things: a story angle that is genuinely interesting to the journalist's readership (not just to your marketing team), a personalised pitch that references the journalist's recent work and explains why this story is relevant to their beat right now, and a prior relationship or warm introduction that gets the email read in the first place. HotBot Studios has spent years building genuine relationships with journalists and editors at the publications your target customers read - and we know how to frame your business story in ways that earn coverage rather than purchase it.",
    color: "#3b82f6",
  },
  {
    heading: "500+ Active Journalist Relationships Across National, Trade, and Digital Media",
    body: "Our media relations team maintains active working relationships with journalists and editors at major national publications (Forbes, Inc., Entrepreneur, Fast Company, Wall Street Journal, Business Insider), sector-specific trade publications (TechCrunch, VentureBeat, and vertical-specific trade press for your industry), and high-traffic digital publications that drive referral traffic and SEO value alongside brand credibility. These relationships are built through years of delivering reliable, well-sourced stories - which means our pitches get read, our follow-up calls get returned, and our clients get featured in publications where cold outreach from most agencies goes unanswered. When we pitch your story to a journalist, we are putting our credibility on the line as well as yours - which is why we only pitch stories we genuinely believe will interest their readership.",
    color: "#8b5cf6",
  },
  {
    heading: "Story Development: Turning Your Business into a Coverage-Worthy Narrative",
    body: "Most businesses are more interesting than they realise - but the interesting part is rarely the product announcement or the funding round. It is the founder's contrarian take on a widely-held industry belief, the surprising data point from your customer research, the unexpected use case that illustrates a broader market trend, or the behind-the-scenes story of how you solved a problem everyone in your industry has but nobody has fixed. HotBot Studios works with you in a Story Development session to excavate these angles: we ask the questions journalists ask, identify the two or three narratives that are genuinely compelling, and build the supporting materials - data points, third-party validation, spokesperson quotes, visual assets - that make the story easy for a journalist to write. A well-developed story angle gets covered. A product announcement gets deleted.",
    color: "#22c55e",
  },
  {
    heading: "Coverage Reporting, Media Monitoring, and Ongoing Relationship Management",
    body: "Every piece of coverage we secure is tracked in a real-time media monitoring dashboard - publication name, estimated readership, Domain Authority (for SEO link value), estimated media value, and social share performance. Coverage clips are delivered to you the same day they publish, formatted for sharing with investors, partners, and your sales team. We also monitor your brand and competitors continuously using Mention and Google Alerts, flagging stories where your expert commentary can be inserted and identifying journalists actively writing about topics where you have a credible voice. PR is a long game - individual placements matter, but the compounding effect of consistent coverage in the right publications over twelve months is what builds the kind of media presence that makes customers, investors, and recruits take your brand seriously. Request a consultation below and we will share a media target list for your industry within 24 hours.",
    color: "#06b6d4",
  },
];

export default function MediaRelationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Public Relations", href: "/public-relations" }, { label: "Media Relations" }]} />

      <PageHeader
        label="Media Relations & Press Coverage"
        title="Coverage in the Publications Your Customers Actually Read"
        subtitle="Relationship-based media relations that earns genuine editorial press coverage for US businesses - national publications, trade press, and high-DA digital media. No spray-and-pray blasting."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free PR Consultation</h2>
            <p className="text-slate-400">Tell us about your business and the publications you want to be featured in. We will respond with a media target list and coverage strategy within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="pr-media-relations"
            accentColor="#3b82f6"
            title="Start Your Media Relations Campaign"
            subtitle="No obligation. Share your story and target audience and we will identify the right media opportunities."
          />
        </Reveal>
      </section>
    </>
  );
}
