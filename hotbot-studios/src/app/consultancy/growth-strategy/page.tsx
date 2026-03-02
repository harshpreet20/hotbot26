import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Growth Strategy & Marketing Roadmap Consultancy USA | HotBot Studios",
  description:
    "HotBot Studios builds 90-day and 12-month growth roadmaps for US businesses — market analysis, competitive positioning, channel mix strategy, and budget allocation grounded in data. Free strategy consultation.",
  keywords: [
    "growth strategy consultancy USA",
    "marketing roadmap USA",
    "growth consultant USA",
    "marketing strategy agency USA",
    "business growth strategy USA",
    "revenue growth strategy USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/consultancy/growth-strategy" },
  openGraph: {
    title: "Growth Strategy & Marketing Roadmap Consultancy USA | HotBot Studios",
    description: "Data-driven 90-day and 12-month growth roadmaps for US businesses — competitive positioning, channel mix, and budget allocation.",
    url: "https://hotbotstudios.com/consultancy/growth-strategy",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Growth Strategy & Roadmap",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Marketing Growth Strategy Consulting",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Data-driven growth strategy and marketing roadmap development for US businesses — market analysis, competitive positioning, channel mix, and budget allocation.",
  url: "https://hotbotstudios.com/consultancy/growth-strategy",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Growth Strategy & Roadmap", item: "https://hotbotstudios.com/consultancy/growth-strategy" },
  ],
};

const CONTENT = [
  {
    heading: "Why Most Growth Plans Fail Before They Start",
    body: "Most businesses approach growth strategy one of two ways: they copy what they see competitors doing (without knowing whether it is actually working), or they invest heavily in the tactics their agency prefers to sell (without understanding whether those tactics suit their stage, market, or customer behaviour). Both approaches produce the same outcome — budget spent on activity that generates impressions and vanity metrics but does not compound into predictable, measurable revenue growth. A genuine growth strategy starts with an honest assessment of where you are: your current unit economics (CAC, LTV, payback period), which customer segments are most profitable and why, which acquisition channels are already working at what efficiency, and where the constraint in your growth system actually is. Without that diagnostic foundation, a growth plan is just an expense list dressed up as strategy. HotBot Studios builds growth strategies on data, not enthusiasm — and we are direct about what the data says, even when it challenges your assumptions.",
    color: "#3b82f6",
  },
  {
    heading: "The Growth Roadmap: 90 Days, 12 Months, and the Decisions in Between",
    body: "A useful growth roadmap has two horizons. The 90-day horizon is operational: specific, sequenced initiatives with owners, budgets, success metrics, and weekly check-in cadences. These are the actions your team can execute now with the resources you currently have, ordered by the ratio of expected impact to implementation effort. The 12-month horizon is strategic: the bigger bets, the new channel investments, the product or positioning changes that require more lead time to design and test but are necessary to hit your revenue targets for the year. HotBot Studios delivers both in a single strategy engagement: a prioritised 90-day sprint plan that your team can begin executing immediately, and a 12-month roadmap that sequences the strategic decisions you need to make — on channel diversification, pricing, market expansion, or team hiring — before the bottlenecks arrive. Both documents are working tools, not presentations: they live in your project management system and are reviewed and updated fortnightly.",
    color: "#8b5cf6",
  },
  {
    heading: "Market Analysis, Competitive Positioning, and Channel Mix Strategy",
    body: "The analytical foundation of every growth strategy we build covers three areas. Market analysis: addressable market size for your specific product and customer segment (not the inflated TAM figure from a market research report), customer segmentation by profitability and growth potential, and identification of the underserved segments your competitors are missing. Competitive positioning: a systematic review of every major competitor's product positioning, pricing architecture, acquisition channels, and content strategy — identifying where the positioning white space is and where competing head-to-head is expensive and unnecessary. Channel mix strategy: a recommended allocation of budget and effort across acquisition channels (paid search, paid social, SEO, content, partnerships, outbound, product-led growth) based on your customer acquisition cost targets, your current organic presence, and the payback period your business model can sustain. The output is a positioning statement your team can execute against and a channel budget model with clearly stated assumptions.",
    color: "#22c55e",
  },
  {
    heading: "From Strategy to Execution: Retainer Support and Implementation",
    body: "The most common failure mode in strategy consulting is the gap between the strategy document and what actually happens in the business. HotBot Studios closes that gap through optional execution retainers: monthly working sessions with your leadership team to review progress against the roadmap, identify and unblock obstacles, and make the decisions that arise as the market responds to your actions. We also provide hands-on support for the specific execution challenges that arise from the strategy — whether that is helping you evaluate and hire for a critical marketing role, designing an A/B test for a positioning change, structuring a new partnership agreement, or reviewing the performance data from a new channel before you scale the budget. Strategy without implementation support is a document. Strategy with ongoing consultancy support is a growth system. Request a free initial consultation below and we will review your current situation and share our initial diagnostic within 24 hours.",
    color: "#f59e0b",
  },
];

export default function GrowthStrategyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Growth Strategy & Roadmap"
        title="A Growth Plan Built on Data, Not Optimism"
        subtitle="90-day sprint plans and 12-month growth roadmaps for US businesses — market analysis, competitive positioning, channel mix strategy, and budget allocation grounded in your actual unit economics."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Growth Strategy Consultation</h2>
            <p className="text-slate-400">Share your current revenue, growth targets, and biggest obstacle. We will respond with an initial diagnostic and recommended next steps within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="consultancy-growth-strategy"
            accentColor="#3b82f6"
            title="Start Your Growth Strategy Engagement"
            subtitle="No obligation. Share your numbers and goals and we will identify the highest-leverage opportunities."
          />
        </Reveal>
      </section>
    </>
  );
}
