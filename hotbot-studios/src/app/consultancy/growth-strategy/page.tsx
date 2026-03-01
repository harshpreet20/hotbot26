import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/shared/Reveal";

export const metadata: Metadata = {
  title: "Growth Strategy Consulting USA | 90-Day & 12-Month Roadmaps | HotBot Studios",
  description:
    "Data-driven growth strategy and 12-month revenue roadmaps for US businesses. Market analysis, competitive positioning, channel mix strategy, and budget allocation — grounded in data, not guesswork. HotBot Studios.",
  keywords: [
    "growth strategy consulting USA",
    "revenue growth roadmap USA",
    "business growth strategy consultant",
    "market analysis consulting USA",
    "go-to-market strategy consultant",
    "competitive positioning consulting",
    "channel mix strategy USA",
    "90-day growth plan USA",
    "growth hacking consultant USA",
    "B2B growth strategy consultant",
  ],
  openGraph: {
    title: "Growth Strategy Consulting USA | HotBot Studios",
    description: "90-day and 12-month growth roadmaps for US businesses. Market analysis, competitive positioning, and channel mix strategy — data-driven, not guesswork.",
    url: "https://hotbotstudios.com/consultancy/growth-strategy",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Growth Strategy Consulting USA | HotBot Studios", description: "Data-driven growth roadmaps for US businesses." },
  alternates: { canonical: "https://hotbotstudios.com/consultancy/growth-strategy" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Growth Strategy & Roadmap Consulting",
  description: "Data-driven 90-day and 12-month growth roadmaps for US businesses — market analysis, competitive positioning, channel mix strategy, and budget allocation grounded in data.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Growth Strategy Consulting",
  url: "https://hotbotstudios.com/consultancy/growth-strategy",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Consultancy", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Growth Strategy", item: "https://hotbotstudios.com/consultancy/growth-strategy" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What does a growth strategy engagement with HotBot Studios include?", acceptedAnswer: { "@type": "Answer", text: "A growth strategy engagement includes: a 360° marketing audit of your current channels, spend, and attribution; competitive landscape analysis (SEMrush, Ahrefs, Similarweb); market sizing and ICP validation; channel mix recommendation with budget allocation; a prioritized 90-day action plan with quick wins; and a 12-month growth roadmap with quarterly milestones and KPIs. Delivered as a strategy document, slide deck, and live working session." } },
    { "@type": "Question", name: "How is a growth strategy different from a marketing plan?", acceptedAnswer: { "@type": "Answer", text: "A marketing plan describes what you'll do. A growth strategy explains why you'll do it and what outcome it drives. A growth strategy starts with a revenue goal and works backward — identifying the audience, channels, messaging, and budget mix most likely to achieve that goal given competitive dynamics and your current assets. It's diagnosis before prescription. Most marketing plans skip the diagnosis and go straight to tactics." } },
    { "@type": "Question", name: "How quickly can we see results from a growth strategy?", acceptedAnswer: { "@type": "Answer", text: "The 90-day roadmap is specifically designed for early wins — eliminating wasteful spend, activating underutilized high-ROI channels, and fixing conversion leaks that are losing you revenue today. Most clients see measurable improvement in CAC, ROAS, or conversion rates within 60–90 days of implementation. The 12-month strategy builds the compounding, structural advantage (SEO, brand, retention) that delivers exponential results over time." } },
    { "@type": "Question", name: "Do you work with early-stage startups or only established businesses?", acceptedAnswer: { "@type": "Answer", text: "Both. For early-stage startups ($500K–$5M revenue), growth strategy focuses on validating product-market fit, identifying the first scalable customer acquisition channel, and building a lean marketing engine that doesn't burn runway. For established businesses ($5M–$50M), strategy focuses on channel diversification, attribution modeling, MarTech optimization, and scaling what's already working." } },
    { "@type": "Question", name: "What data do you need from us to build a growth strategy?", acceptedAnswer: { "@type": "Answer", text: "Ideally: read-only access to Google Analytics 4 (or any analytics platform), your current marketing spend breakdown by channel, revenue data (monthly), your customer acquisition cost (CAC) by channel if known, and your best current customers (ICP examples). We can also work with less data — our diagnostic process is designed to surface insights from whatever you have available." } },
    { "@type": "Question", name: "Does the growth strategy include implementation, or is it advisory only?", acceptedAnswer: { "@type": "Answer", text: "The core strategy engagement is advisory — we deliver the roadmap and provide guidance on execution. However, HotBot Studios uniquely offers full implementation: if you choose to activate our digital marketing, AI automation, content, or software development teams to execute the strategy, we can do that within the same engagement. Most clients start with strategy and then activate execution support." } },
  ],
};

const SUB_SERVICES = [
  { icon: "📊", title: "360° Marketing Audit", desc: "Full review of your current channels, spend, attribution, messaging, and competitive position — identifying quick wins and strategic opportunities across your entire marketing system.", href: "/consultancy/growth-strategy" },
  { icon: "🎯", title: "ICP & Market Sizing", desc: "Define your Ideal Customer Profile with precision — job title, company size, pain triggers, buying journey — and quantify the Total Addressable Market (TAM) in the USA.", href: "/consultancy/growth-strategy" },
  { icon: "🗺️", title: "90-Day Growth Roadmap", desc: "A prioritized action plan with quick wins — eliminating waste, activating underutilized channels, and fixing conversion leaks — that delivers early ROI within the first quarter.", href: "/consultancy/growth-strategy" },
  { icon: "📅", title: "12-Month Revenue Roadmap", desc: "A quarterly milestone plan mapping channel investment, expected revenue growth, team requirements, and compounding advantages (SEO, brand authority, retention) over a 12-month horizon.", href: "/consultancy/growth-strategy" },
  { icon: "⚔️", title: "Competitive Positioning Strategy", desc: "Analysis of 3–5 direct competitors using SEMrush, Ahrefs, and Similarweb — identifying positioning gaps, keyword opportunities, and market angles your competitors have left uncontested.", href: "/consultancy/growth-strategy" },
  { icon: "💰", title: "Budget Allocation & Channel Mix", desc: "Data-backed channel mix recommendation with specific budget allocation — balancing short-term paid acquisition with long-term organic compounding channels for sustainable growth.", href: "/consultancy/growth-strategy" },
];

const STATS = [
  { value: 3, suffix: "×", label: "Avg Revenue Multiplier Within 12 Months", color: "#3b82f6" },
  { value: 60, suffix: "d", label: "to First Measurable Results", color: "#3b82f6" },
  { value: 35, suffix: "%", label: "Avg CAC Reduction After Strategy Audit", color: "#3b82f6" },
  { value: 100, suffix: "%", label: "Engagements Include Data-Backed Recommendations", color: "#3b82f6" },
];

const PROCESS = [
  { n: 1, title: "Free 30-Minute Discovery Call", desc: "No-pitch, agenda-set conversation about your revenue goals, current marketing channels, team size, and the 1–3 growth blockers you most need solved. We decide together if there's a fit.", icon: "📞" },
  { n: 2, title: "Deep-Dive Audit (2 weeks)", desc: "360° marketing audit — GA4 funnel analysis, ad account review, SEO position check (Ahrefs), competitive landscape mapping, ICP validation, and messaging effectiveness assessment.", icon: "🔍" },
  { n: 3, title: "Strategy Development (1 week)", desc: "Build the 90-day quick-win plan and 12-month revenue roadmap with specific channel recommendations, budget allocation, KPIs, and quarterly milestones.", icon: "📐" },
  { n: 4, title: "Presentation & Implementation Support", desc: "Live strategy presentation with your leadership team, Q&A session, and optional activation of HotBot Studios execution teams for digital marketing, AI, content, and software implementation.", icon: "🚀" },
];

const FAQS = [
  { q: "What does a growth strategy engagement with HotBot Studios include?", a: "A 360° marketing audit of your channels, spend, and attribution; competitive landscape analysis; market sizing and ICP validation; channel mix recommendation with budget allocation; a prioritized 90-day action plan; and a 12-month growth roadmap with quarterly milestones and KPIs." },
  { q: "How is a growth strategy different from a marketing plan?", a: "A marketing plan describes what you'll do. A growth strategy explains why — starting with a revenue goal and working backward to identify the audience, channels, messaging, and budget mix most likely to achieve that goal given competitive dynamics and your current assets." },
  { q: "How quickly can we see results from a growth strategy?", a: "The 90-day roadmap is designed for early wins — eliminating wasteful spend, activating high-ROI channels, and fixing conversion leaks. Most clients see measurable improvement in CAC, ROAS, or conversion rates within 60–90 days. The 12-month strategy builds compounding advantages over time." },
  { q: "Do you work with early-stage startups or only established businesses?", a: "Both. For startups ($500K–$5M), strategy focuses on validating product-market fit and identifying the first scalable acquisition channel. For established businesses ($5M–$50M), strategy focuses on channel diversification, attribution modeling, MarTech optimization, and scaling what's already working." },
  { q: "What data do you need from us to build a growth strategy?", a: "Ideally: GA4 read-only access, current marketing spend breakdown, monthly revenue data, CAC by channel if known, and ICP examples. We can work with less — our diagnostic process surfaces insights from whatever data you have available." },
  { q: "Does the growth strategy include implementation, or is it advisory only?", a: "The core engagement is advisory. However, HotBot Studios can activate full execution: digital marketing, AI automation, content, and software development teams can implement the strategy within the same engagement. Most clients start with strategy and then activate implementation support." },
];

const RELATED = [
  { title: "Marketing Audit & Gap Analysis", href: "/consultancy/marketing-audit", desc: "Deep-dive audit that feeds directly into the growth strategy.", icon: "🔍" },
  { title: "Digital Transformation", href: "/consultancy/digital-transformation", desc: "Modernize the MarTech stack the strategy depends on.", icon: "🔄" },
  { title: "Go-To-Market & Market Entry", href: "/consultancy/go-to-market", desc: "Strategy for new products, markets, or customer segments.", icon: "🚀" },
];

const revenuePillars = [
  { pillar: "Acquire", desc: "Right channels, right audiences, right CAC", color: "#3b82f6", icon: "🎯" },
  { pillar: "Convert", desc: "Funnel optimization, CRO, pricing clarity", color: "#8b5cf6", icon: "⚡" },
  { pillar: "Retain", desc: "LTV maximization, churn reduction, loyalty", color: "#22c55e", icon: "🔄" },
  { pillar: "Expand", desc: "Upsell, cross-sell, referral and advocacy", color: "#f59e0b", icon: "📈" },
];

export default function GrowthStrategyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Growth Strategy & Roadmap"
        title="A Revenue Roadmap Built on Data, Not Optimism"
        subtitle="Most businesses don't have a marketing problem — they have a clarity problem. HotBot Studios diagnoses exactly where your growth is stalling and builds a 90-day and 12-month roadmap that tells your team precisely what to do, in what order, with what budget."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#3b82f6" }}>Definition — Growth Strategy</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              A <strong className="text-white">growth strategy</strong> is a data-backed plan that identifies the highest-leverage actions a business can take to increase revenue — starting from a target outcome and working backward through channel selection, budget allocation, ICP targeting, and competitive positioning. Unlike a marketing plan (which lists activities), a growth strategy diagnoses the specific constraints limiting revenue growth and prescribes the minimum actions needed to remove those constraints.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">The Four Revenue Growth Pillars</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {revenuePillars.map((item) => (
              <GlassCard key={item.pillar} className="p-5 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-bold mb-1" style={{ color: item.color }}>{item.pillar}</h3>
                <p className="text-slate-400 text-xs leading-snug">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">Every growth strategy addresses all four pillars — acquisition alone is rarely the constraint.</p>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Growth Strategy Services" columns={3} />
      <ServiceStats stats={STATS} title="Growth Strategy Outcomes" />
      <ProcessSteps steps={PROCESS} title="Our Growth Strategy Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Growth strategy starts with a revenue goal and works backward — not forward from a list of tactics",
                "HotBot Studios clients average 3× revenue growth within 12 months of strategy implementation",
                "90-day quick-win plan focuses on eliminating waste and fixing conversion leaks for fast early ROI",
                "Competitive analysis using SEMrush, Ahrefs, and Similarweb identifies uncontested market angles",
                "Budget allocation recommendations are data-driven — channel mix is based on your specific ICP and market",
                "Strategy can activate into full HotBot Studios execution: marketing, AI automation, content, and software",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                  <span style={{ color: "#22c55e" }} className="mt-0.5 shrink-0">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Get Your Free 30-Minute Growth Diagnostic"
        subtitle="No pitch. No sales deck. Just an honest conversation about where your revenue growth is stalling and what a data-backed strategy would look like to fix it."
        formType="strategy-call"
      />
    </>
  );
}
