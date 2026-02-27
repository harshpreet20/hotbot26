import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Marketing Consulting for US Businesses — Growth Strategy & Digital Transformation | HotBot Studios",
  description:
    "HotBot Studios provides strategic marketing consulting, growth audits, digital transformation roadmaps, and fractional CMO services for US businesses. 3× average revenue growth. Book your free 30-min strategy call.",
  keywords: [
    "marketing consulting USA",
    "growth strategy consulting USA",
    "digital transformation agency USA",
    "fractional CMO USA",
    "marketing audit services USA",
    "marketing strategy consultant",
    "B2B marketing consulting USA",
    "MarTech stack consulting",
    "go-to-market strategy USA",
    "brand positioning consulting",
    "revenue growth consulting",
    "marketing ROI consulting",
    "scaling US business",
    "strategic marketing advisor",
  ],
  openGraph: {
    title: "Marketing Consulting USA — Growth Strategy & Digital Transformation | HotBot Studios",
    description: "Strategic marketing consulting, digital transformation, and fractional CMO services for US businesses. 3× average revenue growth. Free 30-min strategy call.",
    url: "https://hotbotstudios.com/consultancy",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Marketing Consulting USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing Consulting USA | HotBot Studios",
    description: "Growth strategy, digital transformation & fractional CMO for US businesses. 3× avg revenue growth.",
  },
  alternates: { canonical: "https://hotbotstudios.com/consultancy" },
};

// ── Schema Markup ───────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Marketing Consulting for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Marketing Consulting & Growth Strategy",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Strategic marketing consulting, growth audits, digital transformation roadmaps, MarTech stack design, and fractional CMO services for US businesses. Average 3× revenue growth within 12 months.",
  url: "https://hotbotstudios.com/consultancy",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/consultancy" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What types of businesses does HotBot Studios consult for?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios works with growing US SMBs, scale-ups, and enterprise teams across all industries. The sweet spot is $1M–$50M revenue businesses looking to scale through data-driven marketing strategy and digital transformation." } },
    { "@type": "Question", name: "Is marketing consulting a one-time or ongoing engagement?", acceptedAnswer: { "@type": "Answer", text: "Both. HotBot Studios offers one-off strategy audits (4–6 weeks) and ongoing advisory retainers (monthly) for continued growth support. Many clients start with an audit and transition to a retainer." } },
    { "@type": "Question", name: "How quickly will I see ROI from marketing consulting?", acceptedAnswer: { "@type": "Answer", text: "Most HotBot Studios consulting clients see measurable ROI within 60–90 days through waste elimination and redirected budget toward high-impact channels. We set measurable goals and KPIs from day one." } },
  ],
};

// ── Content Data ─────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🗺️", title: "Growth Strategy & Roadmap", desc: "Build a clear, executable 90-day and 12-month growth roadmap — from market analysis and competitive positioning through to channel mix and budget allocation. Grounded in data, not guesswork.", href: "/consultancy/growth-strategy" },
  { icon: "🔄", title: "Digital Transformation", desc: "Modernize your marketing tech stack (MarTech), automate manual processes, and upskill your team's digital capabilities. We've led digital transformations for companies from $2M to $200M in revenue.", href: "/consultancy/digital-transformation" },
  { icon: "📊", title: "Marketing Audit & Gap Analysis", desc: "A comprehensive 360° review of your current marketing — channels, spend, creative, messaging, tech stack, and attribution. Delivered as a prioritized list of quick wins and strategic opportunities.", href: "/consultancy/marketing-audit" },
  { icon: "🏗️", title: "MarTech Stack Design & Implementation", desc: "Select, configure, and integrate the right CRM (HubSpot, Salesforce), marketing automation (Marketo, ActiveCampaign), and analytics tools for your team size, budget, and goals.", href: "/consultancy/martech-stack" },
  { icon: "👥", title: "Marketing Team Building & Training", desc: "Help you hire, structure, and upskill your in-house marketing team. Includes role scoping, interview frameworks, onboarding plans, and 1:1 coaching for your marketing leaders.", href: "/consultancy/team-building" },
  { icon: "🌍", title: "Go-To-Market & Market Entry", desc: "Research, positioning, messaging, channel strategy, and launch support for entering new US markets, launching new products, or targeting new customer segments.", href: "/consultancy/go-to-market" },
];

const STATS = [
  { value: 3, suffix: "x", label: "Avg Revenue Multiplier (12mo)", color: "#3b82f6" },
  { value: 50, suffix: "+", label: "Consulting Engagements", color: "#8b5cf6" },
  { value: 12, suffix: "wk", label: "Avg Engagement Length", color: "#22c55e" },
  { value: 100, suffix: "%", label: "Strategic Clarity Post-Audit", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Free Discovery Call", desc: "A 30-minute no-pitch call to understand your business model, revenue goals, current marketing challenges, and growth blockers. Agenda set in advance — no surprises.", icon: "📞" },
  { n: 2, title: "Deep Marketing Audit", desc: "60–90 minute deep-dive audit of your marketing channels, spend, creative, tech stack, and competitive position. Followed by a written findings report.", icon: "🔍" },
  { n: 3, title: "Bespoke Strategy Development", desc: "Build a custom growth strategy with clear priorities, channel recommendations, budget allocation, resource requirements, and 30/60/90-day milestones.", icon: "📐" },
  { n: 4, title: "Implementation Support", desc: "Weekly advisory sessions and hands-on execution support as you implement the strategy. Option to activate HotBot Studios' full-service marketing, AI, and software teams.", icon: "🤝" },
];

const FAQS = [
  { q: "What types of businesses does HotBot Studios consult for?", a: "We work with growing US SMBs, scale-ups, and mid-market companies across all industries. Our sweet spot is $1M–$50M revenue businesses. We've consulted for B2B SaaS, e-commerce, professional services, healthcare, and consumer brands." },
  { q: "Is marketing consulting a one-time engagement or ongoing?", a: "Both. We offer one-off strategy audits (4–6 weeks, fixed fee) and ongoing monthly advisory retainers for continued support. Many clients start with an audit and then transition to an ongoing retainer once they see the value." },
  { q: "How quickly will I see ROI from marketing consulting?", a: "Most clients see measurable ROI within 60–90 days through waste reduction, budget reallocation, and executing on the highest-impact quick wins. We set specific, measurable goals and report on them weekly from day one." },
  { q: "Do you also help with marketing implementation?", a: "Yes — we're different from typical strategy-only consultants. Once strategy is defined, you can activate HotBot Studios' full-service teams for execution: digital marketing, AI automation, content production, software development, and PR." },
  { q: "What is a fractional CMO and do you offer it?", a: "A fractional CMO is a part-time Chief Marketing Officer who leads your marketing strategy and team without the full-time cost. HotBot Studios offers fractional CMO engagements for businesses that need senior marketing leadership but aren't ready to hire full-time." },
];

const RELATED = [
  { title: "Digital Marketing", href: "/marketing-services", desc: "Execute the growth strategy we build together.", icon: "📣" },
  { title: "AI Automation", href: "/ai-automation", desc: "Automate marketing workflows for scale.", icon: "🤖" },
  { title: "Software Development", href: "/software-development", desc: "Build the tools your strategy demands.", icon: "💻" },
];

// ── Who We Help data ─────────────────────────────────────────────────────────
const WHO_WE_HELP = [
  { icon: "🚀", title: "Early-Stage Startups ($500K–$5M)", desc: "You need a go-to-market strategy, your first marketing hire, and the right channel mix to reach product-market fit without burning your runway." },
  { icon: "📈", title: "Growth-Stage SMBs ($5M–$50M)", desc: "Revenue is growing but marketing feels chaotic. You need a system: clear attribution, a scalable MarTech stack, and a team that executes against a unified strategy." },
  { icon: "🏢", title: "Mid-Market Companies ($50M+)", desc: "You're ready for serious digital transformation — modernizing your marketing org, implementing enterprise MarTech, and building the data infrastructure that Fortune 500 companies rely on." },
  { icon: "🔄", title: "Companies Pivoting or Expanding", desc: "New product line, new market, or new customer segment. You need go-to-market strategy, competitive positioning, and a launch plan built on market data." },
];

export default function ConsultancyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Marketing Consulting USA"
        title="Clarity, Strategy, and Execution That Scales"
        subtitle="Most marketing problems aren't strategy problems — they're clarity problems. HotBot Studios delivers honest, data-backed audits of where your growth is stalling and concrete roadmaps to fix it. No retainer pitches. No jargon. Just results."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Marketing consulting (definition):</strong> Strategic advisory that diagnoses the root causes of stalled growth, designs a data-driven marketing strategy, and provides expert guidance on execution. Unlike traditional agencies that sell services, a marketing consultant at HotBot Studios is focused on measurable business outcomes — revenue growth, improved ROAS, lower customer acquisition cost (CAC), and stronger brand positioning.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Who We Help ───────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-12">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Who We Help — Consulting Engagements by Business Stage</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WHO_WE_HELP.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full" hover>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <SubServices services={SUB_SERVICES} title="Marketing Consulting Services" columns={3} />
      <ServiceStats stats={STATS} title="Consulting Outcomes" />
      <ProcessSteps steps={PROCESS} title="Our Consulting Engagement Process" />

      {/* ── Infographic: Growth Strategy Framework ────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">The HotBot Studios Growth Strategy Framework</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="p-6 md:p-8">
              {/* Funnel visualization */}
              <p className="text-slate-500 text-xs text-center mb-6 uppercase tracking-wider font-medium">How We Diagnose and Fix Revenue Leaks</p>
              <div className="space-y-3 max-w-2xl mx-auto">
                {[
                  { stage: "Awareness Gap?", q: "Are the right people finding you?", tool: "SEO audit + competitor analysis", color: "#3b82f6", w: "100%" },
                  { stage: "Engagement Gap?", q: "Is your message resonating?", tool: "Messaging audit + CRO analysis", color: "#8b5cf6", w: "85%" },
                  { stage: "Conversion Gap?", q: "Are leads becoming customers?", tool: "Funnel analysis + attribution review", color: "#06b6d4", w: "70%" },
                  { stage: "Retention Gap?", q: "Are customers coming back?", tool: "LTV analysis + churn modelling", color: "#22c55e", w: "55%" },
                  { stage: "Scale Gap?", q: "Can growth be systematized?", tool: "MarTech + automation strategy", color: "#f59e0b", w: "40%" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1 rounded-xl p-3 flex items-center justify-between"
                      style={{ width: row.w, background: `${row.color}12`, border: `1px solid ${row.color}25` }}>
                      <div>
                        <div className="text-xs font-bold mb-0.5" style={{ color: row.color }}>{row.stage}</div>
                        <div className="text-slate-300 text-xs">{row.q}</div>
                      </div>
                      <div className="text-slate-500 text-[10px] text-right ml-4 hidden md:block">{row.tool}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-6">Every audit uncovers 3–7 revenue leaks. We prioritize by impact and fix them in order.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── What Separates Us ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8 pb-12">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Why US Businesses Choose HotBot Studios for Marketing Consulting</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🎯", title: "Execution-Capable", desc: "Unlike pure consultants who hand you a slide deck, we can activate our full-service teams — digital marketing, AI automation, content, and software — to implement the strategy for you.", color: "#3b82f6" },
            { icon: "📊", title: "Data-First Approach", desc: "Every recommendation is backed by your own data, industry benchmarks, and competitive intelligence — not intuition. We use GA4, SEMrush, Ahrefs, and proprietary analysis tools.", color: "#8b5cf6" },
            { icon: "🤖", title: "AI-Native Thinking", desc: "Our consultants think about AI automation from the start. Where others suggest hiring, we design systems. Where others suggest tools, we build integrations. The result: a more scalable, lower-cost growth engine.", color: "#06b6d4" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-4">Explore our execution services that complement consulting:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { label: "Digital Marketing →", href: "/marketing-services" },
                { label: "AI Automation →", href: "/ai-automation" },
                { label: "Content Production →", href: "/content-studio" },
                { label: "Software Development →", href: "/software-development" },
              ].map((link, i) => (
                <Link key={i} href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-blue-400 transition-all duration-200 hover:bg-blue-500/10"
                  style={{ border: "1px solid rgba(59,130,246,0.25)" }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Marketing Consulting for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios marketing consulting delivers an average 3× revenue multiplier within 12 months.",
                "We identify and fix 3–7 revenue leaks per engagement — from awareness gaps to retention failures.",
                "Fractional CMO services available for US businesses not ready for a full-time marketing leader.",
                "All consulting recommendations are backed by GA4 data, competitor analysis (SEMrush/Ahrefs), and industry benchmarks.",
                "Unlike pure consultants, HotBot Studios can activate full-service execution teams for marketing, AI, content, and software.",
                "Sweet spot: US businesses with $1M–$50M revenue looking for data-driven growth strategy.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Book Your Free 30-Minute Strategy Call"
        subtitle="No pitch deck. No sales pressure. Just an honest, data-backed conversation about where your growth is stalling and what it would take to fix it. HotBot Studios — America's execution-capable marketing consultancy."
        formType="strategy-call"
      />
    </>
  );
}
