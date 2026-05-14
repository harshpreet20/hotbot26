import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Marketing Audit & Gap Analysis USA - 360° Marketing Review | HotBot Studios",
  description:
    "HotBot Studios delivers comprehensive 360° marketing audits for US businesses - channels, spend, creative, messaging, tech stack, and attribution reviewed and delivered as a prioritised action plan. Free initial consultation.",
  keywords: [
    "marketing audit USA",
    "marketing gap analysis USA",
    "360 marketing review USA",
    "digital marketing audit USA",
    "marketing performance review USA",
    "marketing consultant audit USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/marketing-consulting/marketing-audit" },
  openGraph: {
    title: "Marketing Audit & Gap Analysis USA | HotBot Studios",
    description: "Comprehensive 360° marketing audits covering channels, spend, creative, messaging, tech stack, and attribution - delivered as a prioritised action plan.",
    url: "https://hotbotstudios.com/marketing-consulting/marketing-audit",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Marketing Audit & Gap Analysis",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Marketing Audit and Gap Analysis Consulting",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Comprehensive 360° marketing audit covering all channels, spend efficiency, creative performance, messaging, tech stack, and attribution - delivered as a prioritised action plan for US businesses.",
  url: "https://hotbotstudios.com/marketing-consulting/marketing-audit",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/marketing-consulting" },
    { "@type": "ListItem", position: 3, name: "Marketing Audit & Gap Analysis", item: "https://hotbotstudios.com/marketing-consulting/marketing-audit" },
  ],
};

const CONTENT = [
  {
    heading: "Why Every Business Needs an External Marketing Audit at Least Every 18 Months",
    body: "Marketing programmes develop blind spots over time. Channel budgets that made sense two years ago continue to be renewed on autopilot even as performance declines. Creative that used to convert stops converting, and the team assumes the market has changed rather than the creative. Attribution models set up during agency onboarding still report last-click conversions on branded search, making every channel look less effective than it is. Technical SEO issues accumulate while the team focuses on content. Ad accounts develop structural problems - excessive audience overlap, campaign cannibalisation, poor Quality Scores - that compound quietly over months. An external audit brings a fresh perspective unconstrained by the politics of what was decided before, the relationships with existing suppliers, or the sunk-cost thinking that preserves underperforming investments. HotBot Studios conducts marketing audits as a standalone engagement - with no interest in selling you the execution services that follow, so our recommendations are genuinely objective.",
    color: "#ec4899",
  },
  {
    heading: "What the 360° Audit Covers: Channels, Spend, Creative, and Attribution",
    body: "A HotBot Studios marketing audit systematically reviews every dimension of your marketing programme. Channel performance: paid search, paid social, organic search, email, content, and any additional channels - with CPL, CAC, ROAS, and conversion rate benchmarked against industry standards for your sector and spend level. Spend efficiency: budget allocation analysis identifying overspend in mature channels, underspend in high-potential channels, and vendor or agency fees that exceed market rates. Creative and messaging: an assessment of your ad creative, landing pages, email sequences, and brand messaging against your target audience's language and the positioning of your category's best performers. Tech stack and attribution: a review of your analytics setup, conversion tracking, UTM hygiene, attribution model, and the accuracy of the data your team makes decisions from. The output is a written audit report with a prioritised action list: quick wins implementable within 30 days, medium-term optimisations for the next quarter, and strategic recommendations for the 12-month horizon.",
    color: "#3b82f6",
  },
  {
    heading: "The Gap Analysis: Where You Are Versus Where You Should Be",
    body: "The gap analysis component compares your marketing programme against three benchmarks: category best practice (what the highest-performing businesses in your market are doing across channels, creative, and positioning), your own historical performance (identifying trend inflections where performance started declining and why), and the performance requirements implied by your growth targets (working backwards from your revenue goal through conversion rates and CAC to determine the volume and efficiency your acquisition programme needs to deliver). This triangulation identifies the specific gaps - in channel mix, creative quality, audience targeting, landing page conversion rate, email sequence performance, or attribution accuracy - that are the highest-leverage opportunities for improvement. The gap analysis is what separates a useful audit from a list of generic best practices: it is specific to your business, your data, and your competitive context.",
    color: "#22c55e",
  },
  {
    heading: "Delivery, Presentation, and Optional Implementation Support",
    body: "The audit is delivered as a written report (typically 40 to 60 pages) with an executive summary suitable for sharing with board members or investors, and a detailed findings section with specific, cited evidence for every recommendation. The report is accompanied by a live presentation session where we walk through the findings, answer questions, and help your team prioritise the action items. Every recommendation includes an effort estimate, an impact estimate, and the rationale - so your team can make informed decisions about sequencing rather than trying to implement everything at once. HotBot Studios also offers optional implementation support following the audit: either through our own execution teams (paid search management, SEO, content, development) or as an advisory retainer where we support your internal team or incumbent agency in implementing the recommended changes. Request a free scoping call below and we will outline the audit scope and timeline for your specific business.",
    color: "#8b5cf6",
  },
];

export default function MarketingAuditPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Marketing Consulting", href: "/marketing-consulting" }, { label: "Marketing Audit" }]} />

      <PageHeader
        label="Marketing Audit & Gap Analysis"
        title="An Honest External Review of Everything Your Marketing Is - and Is Not - Doing"
        subtitle="360° marketing audits covering channels, spend efficiency, creative, messaging, tech stack, and attribution - delivered as a prioritised action plan with quick wins and 12-month strategic recommendations."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Marketing Audit Consultation</h2>
            <p className="text-slate-400">Tell us about your current marketing programme and your biggest performance concerns. We will outline the audit scope and what you can expect to find within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="consultancy-marketing-audit"
            accentColor="#ec4899"
            title="Commission Your Marketing Audit"
            subtitle="No obligation. Share your channels, monthly spend, and key metrics and we will scope the engagement."
          />
        </Reveal>
      </section>
    </>
  );
}
