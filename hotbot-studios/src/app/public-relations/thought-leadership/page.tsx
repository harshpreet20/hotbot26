import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Thought Leadership & Awards PR USA — Executive Positioning & Speaking Opportunities | HotBot Studios",
  description:
    "HotBot Studios positions US executives as go-to industry experts through thought leadership article placement, industry award submissions, and conference speaking opportunities. Free thought leadership consultation.",
  keywords: [
    "thought leadership PR USA",
    "executive positioning USA",
    "industry awards submissions USA",
    "conference speaking opportunities USA",
    "thought leadership articles USA",
    "executive PR USA",
    "industry expert positioning USA",
    "keynote speaker PR USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/public-relations/thought-leadership" },
  openGraph: {
    title: "Thought Leadership & Awards PR USA — Executive Positioning | HotBot Studios",
    description: "Position your executives as go-to industry experts through thought leadership placement, award submissions, and conference speaking opportunities.",
    url: "https://hotbotstudios.com/public-relations/thought-leadership",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Awards & Thought Leadership PR",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Executive Thought Leadership and Awards PR",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Executive thought leadership positioning through article placement in major publications, industry award submissions, and conference speaking opportunity development for US businesses.",
  url: "https://hotbotstudios.com/public-relations/thought-leadership",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Awards & Thought Leadership", item: "https://hotbotstudios.com/public-relations/thought-leadership" },
  ],
};

const CONTENT = [
  {
    heading: "Why Executive Visibility Is a Business Growth Driver, Not Just a Vanity Metric",
    body: "In B2B markets, buying decisions are influenced as much by who is behind a product as by the product itself. A prospective customer researching your company will look up your CEO and founding team before they schedule a demo — and what they find shapes their confidence in your business before the first conversation. An executive with a track record of published articles in respected industry publications, speaking credits at major conferences, and a LinkedIn profile that reflects genuine expertise and perspective signals something that no amount of product marketing can manufacture: that the people running this business understand the industry at a level worth paying attention to. HotBot Studios builds executive thought leadership programmes that compound over time — each article, award, and speaking credit adds to a public record of expertise that builds credibility with customers, investors, and talent in parallel.",
    color: "#f59e0b",
  },
  {
    heading: "Thought Leadership Article Placement in Major Publications",
    body: "Getting an opinion article or bylined piece placed in Forbes, Harvard Business Review, Fast Company, Entrepreneur, or a respected industry trade publication is fundamentally different from getting a company news story covered — it requires a publication to trust that your executive has a perspective worth giving their platform to. HotBot Studios develops thought leadership content through a structured process: identifying the two or three topics where your executive has a genuinely differentiated point of view (not just received wisdom restated), developing that perspective into a compelling argument supported by data and real-world examples, writing the article in a voice that reflects the executive's authentic way of thinking, and pitching it to the editors of the right publications. We maintain relationships with editors at major publications who accept contributor submissions, and we know the content standards and editorial angle that each publication is looking for — dramatically improving placement rates versus cold outreach.",
    color: "#8b5cf6",
  },
  {
    heading: "Industry Award Submissions: A Systematic Approach to Winning Recognition",
    body: "Industry awards matter for three reasons: they provide third-party validation that your business is a leader in its category, they generate earned media coverage in the trade publications that cover the awards, and they create sales collateral (award logos, winner badges) that builds trust at every stage of the customer journey. Most businesses submit for awards sporadically, writing rushed applications that do not do justice to their actual accomplishments. HotBot Studios maintains a database of 200+ industry, regional, and function-specific awards across the sectors we work in, with submission deadlines, judging criteria, and historical winner profiles. We identify the five to ten awards your business is most likely to win in a given year, write compelling submissions built around the specific criteria judges use to evaluate entries, and manage the submission process end-to-end — including sourcing supporting data, testimonials, and case studies that strengthen each application.",
    color: "#3b82f6",
  },
  {
    heading: "Conference Speaking: Getting Your Executives on the Right Stages",
    body: "A keynote or panel appearance at the right conference puts your executive in front of hundreds of decision-makers from your target market in a context where they are positioned as an expert rather than a vendor. Conference speaking is also the fastest way to build the kind of peer-to-peer credibility among industry insiders that takes years to build through written content alone. HotBot Studios researches the conference landscape for your industry — identifying the events your target customers attend, the speakers who appear on those stages, and the submission processes and selection criteria for each conference — then develops and submits speaker proposals on your behalf. Speaker proposals require a compelling abstract, evidence of the speaker's credibility and media presence, and a clear articulation of what the audience will learn. We develop all of these materials and manage the relationship with conference organisers through to confirmation.",
    color: "#22c55e",
  },
];

export default function ThoughtLeadershipPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Public Relations", href: "/public-relations" }, { label: "Thought Leadership" }]} />

      <PageHeader
        label="Awards & Thought Leadership"
        title="Make Your Executives the Go-To Experts in Your Industry"
        subtitle="Thought leadership article placement, industry award submissions, and conference speaking opportunities that build executive credibility and business authority for US companies."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Thought Leadership Consultation</h2>
            <p className="text-slate-400">Tell us about your executive team and your industry. We will identify the right publications, awards, and conferences for your 12-month visibility programme.</p>
          </div>
          <LeadCaptureForm
            sourceId="pr-thought-leadership"
            accentColor="#f59e0b"
            title="Start Your Thought Leadership Programme"
            subtitle="No obligation. Share your sector and objectives and we will map the right opportunities."
          />
        </Reveal>
      </section>
    </>
  );
}
