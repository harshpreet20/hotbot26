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
  title: "Go-To-Market Strategy & Market Entry USA | Launch Consulting | HotBot Studios",
  description:
    "Go-to-market strategy and US market entry consulting. Research, positioning, messaging, channel strategy, and launch support for new products, new markets, and new customer segments. HotBot Studios.",
  keywords: [
    "go-to-market strategy USA",
    "market entry consulting USA",
    "GTM strategy agency USA",
    "product launch strategy USA",
    "US market entry consulting",
    "new market expansion USA",
    "product positioning consulting",
    "launch strategy consulting",
    "B2B GTM strategy USA",
    "SaaS go-to-market USA",
  ],
  openGraph: {
    title: "Go-To-Market Strategy & Market Entry USA | HotBot Studios",
    description: "Research, positioning, channel strategy, and launch support for entering new US markets, launching new products, or targeting new customer segments.",
    url: "https://hotbotstudios.com/consultancy/go-to-market",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Go-To-Market Strategy USA | HotBot Studios", description: "GTM strategy and market entry consulting for US businesses." },
  alternates: { canonical: "https://hotbotstudios.com/consultancy/go-to-market" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Go-To-Market & Market Entry Strategy",
  description: "Research, positioning, messaging, channel strategy, and launch support for entering new US markets, launching new products, or targeting new customer segments.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Go-To-Market Strategy",
  url: "https://hotbotstudios.com/consultancy/go-to-market",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Consultancy", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Go-To-Market", item: "https://hotbotstudios.com/consultancy/go-to-market" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is a go-to-market strategy and what does it include?", acceptedAnswer: { "@type": "Answer", text: "A go-to-market (GTM) strategy is a plan that defines how you will launch a product, enter a new market, or reach a new customer segment — with enough specificity to execute. A HotBot Studios GTM strategy includes: market sizing and ICP definition; competitive landscape analysis; positioning and messaging architecture; channel strategy with budget allocation; pricing strategy validation; launch timeline and milestone plan; and success metrics (how we know the launch worked)." } },
    { "@type": "Question", name: "How long does it take to develop a go-to-market strategy?", acceptedAnswer: { "@type": "Answer", text: "A focused GTM strategy for a single product or market takes 4–8 weeks to develop: 2 weeks of market research and ICP interviews, 2 weeks of positioning and messaging development, 2 weeks of channel strategy and launch plan. GTM strategies for complex enterprise market entries or multi-segment launches take 8–16 weeks. We work backward from your launch date to ensure the strategy is ready when you need it." } },
    { "@type": "Question", name: "We're entering the US market from outside the US — what do we need to know?", acceptedAnswer: { "@type": "Answer", text: "The US market has distinct regional, cultural, and competitive characteristics that differ significantly from European, Asian, or Australian markets. Key considerations: the US is 50 state-sized markets, not one — geographic segmentation matters. US buyers respond to social proof (case studies, testimonials, reviews) more than features. Pricing expectations, buying cycle lengths, and decision-maker titles differ by industry. We conduct US-specific ICP research and competitive analysis to ensure your GTM is calibrated for the US context, not just translated from your home market." } },
    { "@type": "Question", name: "What's the difference between a GTM strategy and a marketing plan?", acceptedAnswer: { "@type": "Answer", text: "A GTM strategy is launch-specific and time-bounded — it answers: who exactly are we targeting, what are we saying to them, through which channels, in what sequence, and how will we know it worked? A marketing plan is ongoing — it describes the ongoing activity calendar. GTM strategy comes first and informs the marketing plan. You should never build a marketing plan for a new product without a validated GTM strategy underneath it." } },
    { "@type": "Question", name: "Do you provide launch execution support, or is the GTM engagement advisory only?", acceptedAnswer: { "@type": "Answer", text: "The GTM strategy development is advisory — we produce the plan and provide guidance. However, HotBot Studios uniquely can also execute the launch: our digital marketing team can run paid acquisition, our content team can produce launch assets, our software team can build landing pages, and our AI automation team can set up lead nurture sequences. Most clients who engage us for GTM strategy also activate execution support." } },
    { "@type": "Question", name: "How do you validate positioning and messaging before launch?", acceptedAnswer: { "@type": "Answer", text: "We validate positioning and messaging through: 5–10 ICP interviews using Jobs-to-be-Done methodology (understanding buyer language, motivations, and alternatives considered); A/B testing of value proposition variants in landing page copy; small-scale paid acquisition tests using different messaging angles; and internal stakeholder reviews with your sales team (they talk to buyers daily and know what resonates). We never launch with untested messaging if we can avoid it." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🔭", title: "Market Research & ICP Definition", desc: "Quantitative market sizing (TAM/SAM/SOM) and qualitative ICP research — 5–10 buyer interviews using Jobs-to-be-Done methodology to understand buying triggers, language, and alternatives.", href: "/consultancy/go-to-market" },
  { icon: "🎯", title: "Positioning & Messaging Architecture", desc: "Define your unique value proposition, competitive differentiation, and messaging hierarchy — from category definition through to taglines and objection handling frameworks.", href: "/consultancy/go-to-market" },
  { icon: "💰", title: "Pricing Strategy Validation", desc: "Competitive pricing analysis, willingness-to-pay research, pricing model selection (subscription, usage, seats), and pricing page copy that reduces friction at the bottom of the funnel.", href: "/consultancy/go-to-market" },
  { icon: "📣", title: "Channel Strategy & Budget Allocation", desc: "Identify the 2–3 highest-ROI customer acquisition channels for your specific ICP and market — with launch-phase budget allocation that generates early signals without burning runway.", href: "/consultancy/go-to-market" },
  { icon: "🚀", title: "Launch Plan & Timeline", desc: "A milestone-driven launch plan with pre-launch (build, seed), launch (activate), and post-launch (optimize) phases — aligned to your team capacity and external launch commitments.", href: "/consultancy/go-to-market" },
  { icon: "📊", title: "Launch Performance & Iteration", desc: "Define success metrics before launch, implement tracking, review early signals at 30/60/90 days, and iterate positioning, messaging, and channel mix based on real market response data.", href: "/consultancy/go-to-market" },
];

const STATS = [
  { value: 70, suffix: "%", label: "of New Products Fail Due to Positioning Problems", color: "#22c55e" },
  { value: 4, suffix: "wk", label: "Avg GTM Strategy Development Time", color: "#22c55e" },
  { value: 3, suffix: "×", label: "Faster to First $1M ARR with Research-Backed GTM", color: "#22c55e" },
  { value: 90, suffix: "d", label: "to First Performance Signals Post-Launch", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Market Research & ICP Interviews", desc: "Quantitative market sizing using industry data + 5–10 qualitative ICP interviews using Jobs-to-be-Done methodology — understanding buyer language, motivations, and current alternatives.", icon: "🔬" },
  { n: 2, title: "Competitive Landscape Analysis", desc: "Map 5–10 competitors across positioning, pricing, messaging, channels, and customer reviews — identifying uncontested positioning angles and market gaps.", icon: "⚔️" },
  { n: 3, title: "Positioning, Messaging & Channel Strategy", desc: "Develop positioning architecture, core messaging framework, pricing recommendation, and channel strategy — validated through small-scale tests before full launch investment.", icon: "🎯" },
  { n: 4, title: "Launch Plan & Execution Support", desc: "Pre-launch/launch/post-launch milestone plan, team briefing, launch asset production support, and 90-day performance review with iteration recommendations.", icon: "🚀" },
];

const FAQS = [
  { q: "What is a go-to-market strategy and what does it include?", a: "A GTM strategy defines how you will launch a product, enter a new market, or reach a new customer segment. It includes market sizing and ICP definition; competitive landscape analysis; positioning and messaging architecture; channel strategy with budget allocation; pricing strategy validation; launch timeline and milestone plan; and success metrics." },
  { q: "How long does it take to develop a go-to-market strategy?", a: "A focused GTM strategy for a single product or market takes 4–8 weeks: 2 weeks of market research and ICP interviews, 2 weeks of positioning and messaging development, 2 weeks of channel strategy and launch plan. Complex enterprise market entries take 8–16 weeks." },
  { q: "We're entering the US market from outside the US — what do we need to know?", a: "The US is 50 state-sized markets with distinct regional characteristics. US buyers respond strongly to social proof (case studies, reviews) over features. Pricing expectations, buying cycles, and decision-maker titles differ by industry. We conduct US-specific ICP research calibrated to the US context, not just translated from your home market." },
  { q: "What's the difference between a GTM strategy and a marketing plan?", a: "A GTM strategy is launch-specific and time-bounded — it answers: who exactly are we targeting, what are we saying, through which channels, in what sequence, and how will we know it worked? A marketing plan is ongoing activity management. GTM strategy comes first and informs the marketing plan." },
  { q: "Do you provide launch execution support, or is the GTM engagement advisory only?", a: "GTM strategy development is advisory — we produce the plan. However, HotBot Studios can also execute the launch: our digital marketing team runs paid acquisition, our content team produces launch assets, our software team builds landing pages, and our AI automation team sets up lead nurture sequences." },
  { q: "How do you validate positioning and messaging before launch?", a: "Through: 5–10 ICP interviews using Jobs-to-be-Done methodology; A/B testing of value proposition variants on landing pages; small-scale paid acquisition tests using different messaging angles; and internal reviews with your sales team. We never launch with untested messaging if we can avoid it." },
];

const RELATED = [
  { title: "Growth Strategy & Roadmap", href: "/consultancy/growth-strategy", desc: "Ongoing growth strategy after the initial market entry.", icon: "🗺️" },
  { title: "Digital Marketing Execution", href: "/marketing-services", desc: "Execute the GTM launch plan with our full-service team.", icon: "📣" },
  { title: "Marketing Audit & Gap Analysis", href: "/consultancy/marketing-audit", desc: "Post-launch audit to optimize performance after 90 days.", icon: "🔍" },
];

const gtmComponents = [
  { component: "Market Sizing", output: "TAM · SAM · SOM quantification", icon: "📊" },
  { component: "ICP Definition", output: "Buyer personas with Jobs-to-be-Done", icon: "👤" },
  { component: "Competitive Positioning", output: "Differentiation matrix + white space map", icon: "⚔️" },
  { component: "Messaging Architecture", output: "Value prop · Tagline · Objection handling", icon: "💬" },
  { component: "Pricing Strategy", output: "Model selection + price point + page copy", icon: "💰" },
  { component: "Channel Strategy", output: "2–3 priority channels + budget split", icon: "📣" },
  { component: "Launch Timeline", output: "Pre/launch/post milestone Gantt", icon: "🚀" },
  { component: "Success Metrics", output: "KPIs + targets + measurement plan", icon: "🎯" },
];

export default function GoToMarketPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Go-To-Market & Market Entry Strategy"
        title="Launch Into New Markets With a Plan That Actually Works"
        subtitle="70% of new products fail not because of what they do, but because of how they're positioned, priced, and launched. HotBot Studios builds research-backed go-to-market strategies — grounded in real buyer interviews, competitive data, and channel testing — that give new launches the best possible chance of gaining traction."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>Definition — Go-To-Market Strategy</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              A <strong className="text-white">go-to-market (GTM) strategy</strong> is the operational plan that defines exactly how a product, feature, or company will reach its target customers — specifying the who (ICP), what (positioning and messaging), where (channels), how much (pricing), and when (launch timeline). Unlike a marketing plan (which manages ongoing activity), a GTM strategy is specifically designed for the launch phase — when every positioning decision and channel dollar has outsized impact on long-term market position.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Complete GTM Strategy — 8 Components</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gtmComponents.map((item, i) => (
              <GlassCard key={item.component} className="p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-xs font-bold text-white mb-1">{item.component}</div>
                <div className="text-[10px] text-slate-400 leading-snug">{item.output}</div>
                <div className="mt-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>{i + 1}</div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Go-To-Market Services" columns={3} />
      <ServiceStats stats={STATS} title="Why GTM Strategy Determines Launch Success" />
      <ProcessSteps steps={PROCESS} title="Our GTM Strategy Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "70% of product launches fail due to positioning and messaging problems — not product quality",
                "GTM strategy is time-bounded and launch-specific — it is not the same as an ongoing marketing plan",
                "ICP interviews using Jobs-to-be-Done methodology uncover buyer language that outperforms internal assumptions",
                "Validate messaging with small-scale paid tests before committing full launch budget",
                "US market entry requires US-specific research — European or Australian GTM assumptions will misfire",
                "HotBot Studios can move from GTM strategy into full launch execution — digital marketing, content, and tech all under one roof",
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
        title="Launch Into Your New Market With Confidence"
        subtitle="Share your product, target market, and launch timeline — we'll build the research-backed GTM strategy that gives your launch the best possible chance of gaining traction fast."
        formType="strategy-call"
      />
    </>
  );
}
