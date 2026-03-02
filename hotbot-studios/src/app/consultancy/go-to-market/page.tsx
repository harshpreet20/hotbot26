import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Go-To-Market Strategy & Market Entry Consulting USA — Product Launch & New Markets | HotBot Studios",
  description:
    "HotBot Studios develops go-to-market strategies for US product launches, new market entry, and customer segment expansion — research, positioning, messaging, channel strategy, and launch support. Free GTM consultation.",
  keywords: [
    "go-to-market strategy USA",
    "GTM strategy consulting USA",
    "market entry strategy USA",
    "product launch strategy USA",
    "go-to-market consultant USA",
    "US market entry consulting",
  ],
  alternates: { canonical: "https://hotbotstudios.com/consultancy/go-to-market" },
  openGraph: {
    title: "Go-To-Market Strategy & Market Entry Consulting USA | HotBot Studios",
    description: "Go-to-market strategies for US product launches and new market entry — research, positioning, messaging, channel strategy, and launch execution support.",
    url: "https://hotbotstudios.com/consultancy/go-to-market",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Go-To-Market & Market Entry Strategy",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Go-To-Market Strategy and Market Entry Consulting",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Go-to-market strategy development for US product launches, new market entry, and customer segment expansion — including research, positioning, messaging architecture, channel strategy, and launch support.",
  url: "https://hotbotstudios.com/consultancy/go-to-market",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Go-To-Market & Market Entry", item: "https://hotbotstudios.com/consultancy/go-to-market" },
  ],
};

const CONTENT = [
  {
    heading: "Why Most Product Launches Underperform — and How to Prevent It",
    body: "The majority of product launches fail not because the product is bad but because the go-to-market strategy is an afterthought. The product team spends twelve months building; the marketing team gets six weeks to prepare a launch. Positioning is defined by committee and reflects the internal team's view of the product rather than the language customers use to describe their problem. The target customer segment is defined too broadly (every business with over 50 employees) rather than precisely enough to be actionable (Series A SaaS companies with a sales team of 5 to 15 in financial services). The channel mix is selected based on what the marketing team is most comfortable with rather than where the target customer's attention actually is. HotBot Studios works with the founding team, product team, and marketing team together — before the launch — to develop a go-to-market strategy that is specific, sequenced, and executable from day one, not a slide deck that gets updated in retrospect.",
    color: "#8b5cf6",
  },
  {
    heading: "Market Research, Customer Segmentation, and Competitive Landscape",
    body: "Every GTM engagement begins with research: primary research (interviews with 10 to 20 people who match your target customer profile) to understand how they currently solve the problem your product addresses, what language they use to describe the problem, what they value in a solution, and what would make them switch from their current approach; secondary research (market sizing, competitor positioning analysis, category keyword research) to understand the landscape your product is entering and where the competitive white space is. From this research, we develop a precise customer segmentation: the specific company sizes, industry verticals, job titles, and behavioural characteristics that define your ideal customer, ranked by ease of acquisition and expected lifetime value. This segmentation drives every subsequent GTM decision — from the channels you prioritise to the messaging hierarchy that speaks to the most important customer motivations.",
    color: "#3b82f6",
  },
  {
    heading: "Positioning, Messaging Architecture, and Launch Narrative",
    body: "Positioning is the strategic decision about which market category you compete in, which customer segment you serve, and what differentiates you from every alternative — including the alternative of doing nothing. A clear positioning statement is not a tagline; it is the internal decision that determines what you say, to whom, in what context, and why a rational customer should prefer you over every other option available to them. HotBot Studios develops your positioning through a structured workshop process, tests it against the research findings from the customer interview programme, and translates it into a messaging architecture: the hierarchy of messages from core value proposition through supporting proof points and objection responses, adapted for each channel and buying stage. The launch narrative — the coherent story about why this product exists, why now, and why you are the team to build it — is the output that drives all marketing communications at launch.",
    color: "#22c55e",
  },
  {
    heading: "Channel Strategy, Launch Plan, and Post-Launch Optimisation",
    body: "With positioning defined and messaging developed, the GTM strategy specifies how you will reach your target customer: which acquisition channels to prioritise in the first 90 days (typically one to three channels where you can learn quickly), what the content and creative strategy looks like for each channel, how the sales motion (inbound, outbound, PLG, partnerships) interacts with the marketing programme, and what the launch sequence looks like week by week from pre-launch awareness building through announcement day through post-launch demand capture. HotBot Studios delivers a detailed 90-day launch plan with resource requirements, budget allocation, KPIs, and decision points. We also provide launch support: reviewing creative before it goes live, troubleshooting performance issues in the first few weeks, and adjusting the channel mix based on early signals. Request a free GTM consultation below and we will review your launch situation and share initial recommendations within 24 hours.",
    color: "#ec4899",
  },
];

export default function GoToMarketPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Go-To-Market & Market Entry"
        title="Launch Right the First Time — Strategy Before Spend"
        subtitle="Go-to-market strategies for US product launches, new market entry, and customer segment expansion — research, positioning, messaging architecture, channel strategy, and 90-day launch plans."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free GTM Consultation</h2>
            <p className="text-slate-400">Tell us about your product, your target customer, and your launch timeline. We will share initial positioning recommendations and a GTM framework within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="consultancy-go-to-market"
            accentColor="#8b5cf6"
            title="Build Your Go-To-Market Strategy"
            subtitle="No obligation. Share your product, market, and launch goals and we will scope the engagement."
          />
        </Reveal>
      </section>
    </>
  );
}
