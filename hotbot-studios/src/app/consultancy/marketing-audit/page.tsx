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
  title: "Marketing Audit & Gap Analysis USA | 360° Marketing Review | HotBot Studios",
  description:
    "Comprehensive 360° marketing audit for US businesses. Channels, spend, creative, messaging, tech stack, and attribution reviewed, delivered as a prioritized list of quick wins and strategic opportunities.",
  keywords: [
    "marketing audit USA",
    "marketing gap analysis USA",
    "360 marketing review",
    "marketing performance audit",
    "digital marketing audit USA",
    "marketing channel audit",
    "ad spend audit USA",
    "SEO audit USA",
    "marketing attribution audit",
    "marketing ROI audit USA",
  ],
  openGraph: {
    title: "Marketing Audit & Gap Analysis USA | HotBot Studios",
    description: "360° marketing audit covering channels, spend, creative, messaging, tech stack, and attribution. Prioritized quick wins delivered in 4–6 weeks.",
    url: "https://hotbotstudios.com/consultancy/marketing-audit",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Marketing Audit & Gap Analysis USA | HotBot Studios", description: "360° marketing audit for US businesses, channels, spend, and attribution." },
  alternates: { canonical: "https://hotbotstudios.com/consultancy/marketing-audit" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Marketing Audit & Gap Analysis",
  description: "Comprehensive 360° marketing audit covering all channels, spend efficiency, creative effectiveness, messaging, MarTech stack, and attribution accuracy for US businesses.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Marketing Audit & Gap Analysis",
  url: "https://hotbotstudios.com/consultancy/marketing-audit",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Consultancy", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Marketing Audit", item: "https://hotbotstudios.com/consultancy/marketing-audit" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What does a 360° marketing audit cover?", acceptedAnswer: { "@type": "Answer", text: "A HotBot Studios 360° marketing audit covers: paid channel performance (Google Ads, Meta, LinkedIn), ROAS, CPL, quality score; SEO and organic (Ahrefs/SEMrush), rankings, backlink profile, technical health; email marketing, open rates, click rates, list health, automation sequence gaps; social media, engagement, reach, content consistency; website conversion, CRO, landing page effectiveness, funnel drop-off; MarTech stack, tool utilization, integration gaps, data quality; and attribution accuracy, are you correctly crediting the channels that drive revenue?" } },
    { "@type": "Question", name: "How long does a marketing audit take?", acceptedAnswer: { "@type": "Answer", text: "A standard 360° marketing audit takes 4–6 weeks from access provision to final report delivery. The timeline includes: 1 week for access setup and data collection, 2 weeks for deep analysis across all channels, 1 week for report writing and prioritization, and 1 review session with your team. Expedited audits of single channels (e.g., Google Ads only or SEO only) can be completed in 2 weeks." } },
    { "@type": "Question", name: "What access do you need to conduct a marketing audit?", acceptedAnswer: { "@type": "Answer", text: "Read-only access to: Google Analytics 4, Google Ads (if running), Meta Business Manager (if running), LinkedIn Campaign Manager (if running), HubSpot or your CRM (if using), and your email marketing platform. We never need billing access or the ability to make changes, audit access only. We use Ahrefs and SEMrush with our own licensed tools for SEO and competitor analysis." } },
    { "@type": "Question", name: "What is the deliverable format for a marketing audit?", acceptedAnswer: { "@type": "Answer", text: "You receive: a written audit report (20–40 pages) covering findings by channel with supporting data screenshots; an executive summary (2–4 pages) for leadership; a prioritised opportunity matrix ranking all identified issues by impact and effort; a quick-win action list (items executable within 30 days); and a live review session where we walk through findings, answer questions, and align on priorities. All delivered in Google Docs + Slides for easy sharing." } },
    { "@type": "Question", name: "We think our marketing is working, why would we need an audit?", acceptedAnswer: { "@type": "Answer", text: "Even high-performing marketing programs have blind spots. Our audits consistently find: budget being allocated to channels that look good on last-touch attribution but don't actually drive revenue; high-value audience segments being missed entirely; email sequences with 40%+ unsubscribe rates that nobody noticed; SEO content ranking for keywords with zero commercial intent; and CRO opportunities worth 20–30% more revenue from existing traffic. 'Working' and 'optimised' are very different standards." } },
    { "@type": "Question", name: "Does the marketing audit include competitor analysis?", acceptedAnswer: { "@type": "Answer", text: "Yes, competitor analysis is a core component. Using Ahrefs, SEMrush, and Similarweb, we analyse 3–5 of your direct competitors: their traffic volumes, top organic keywords, paid keyword strategy, estimated ad spend, backlink acquisition approach, and content strategy. We identify gaps where competitors have left market positioning uncontested, and opportunities to outrank them with focused investment." } },
  ],
};

const SUB_SERVICES = [
  { icon: "💰", title: "Paid Media Audit", desc: "Google Ads, Meta, and LinkedIn campaign analysis, ROAS, CPL, quality scores, audience targeting, creative fatigue, and bid strategy gaps that are quietly wasting budget.", href: "/consultancy/marketing-audit" },
  { icon: "🔍", title: "SEO & Organic Audit", desc: "Full organic health review: keyword rankings, backlink profile quality, technical SEO issues, content gaps, Core Web Vitals, and search visibility vs 3–5 competitors using Ahrefs and SEMrush.", href: "/consultancy/marketing-audit" },
  { icon: "📧", title: "Email Marketing Audit", desc: "List health analysis, deliverability assessment, open/click benchmarking, automation sequence gaps, segmentation quality, and unsubscribe trigger identification across your email programme.", href: "/consultancy/marketing-audit" },
  { icon: "🌐", title: "Website Conversion Audit", desc: "CRO review of key landing pages, funnel drop-off analysis (GA4), page speed and Core Web Vitals, messaging clarity, CTA effectiveness, and trust signal assessment.", href: "/consultancy/marketing-audit" },
  { icon: "📊", title: "Attribution & Analytics Audit", desc: "GA4 implementation quality, conversion tracking accuracy, attribution model assessment, UTM parameter consistency, and data quality review, ensuring your reporting reflects reality.", href: "/consultancy/marketing-audit" },
  { icon: "⚔️", title: "Competitive Gap Analysis", desc: "3–5 competitor analysis using Ahrefs, SEMrush, and Similarweb, identifying keyword gaps, positioning opportunities, backlink targets, and market angles competitors have left uncontested.", href: "/consultancy/marketing-audit" },
];

const STATS = [
  { value: 7, suffix: "+", label: "Revenue Leaks Found Per Engagement", color: "#8b5cf6" },
  { value: 40, suffix: "%", label: "Avg Wasted Budget Found in Paid Audits", color: "#8b5cf6" },
  { value: 4, suffix: "wk", label: "Standard Audit Delivery Timeline", color: "#8b5cf6" },
  { value: 100, suffix: "%", label: "Audits Deliver Actionable Prioritized Findings", color: "#8b5cf6" },
];

const PROCESS = [
  { n: 1, title: "Access Provisioning & Data Collection", desc: "Read-only access setup to GA4, ad accounts, CRM, and email platforms. Data extraction, benchmark comparison, and competitor landscape mapping before analysis begins.", icon: "🔑" },
  { n: 2, title: "Channel-by-Channel Deep Analysis", desc: "Systematic review of each marketing channel against performance benchmarks, competitor positioning, and best-practice standards, documenting findings with supporting data.", icon: "🔬" },
  { n: 3, title: "Synthesis & Prioritization", desc: "All findings synthesised into an impact-effort opportunity matrix, ranking every identified gap by revenue impact and implementation effort to give your team a clear action sequence.", icon: "📊" },
  { n: 4, title: "Report Delivery & Review Session", desc: "Full written report + executive summary + live review session with your team. Q&A, priority alignment, and optional transition into a full growth strategy engagement.", icon: "📋" },
];

const FAQS = [
  { q: "What does a 360° marketing audit cover?", a: "Paid channel performance (ROAS, CPL, quality scores); SEO and organic (rankings, backlink profile, technical health); email marketing (open rates, list health, automation gaps); website conversion (CRO, landing pages, funnel drop-off); MarTech stack (tool utilization, integration gaps); and attribution accuracy." },
  { q: "How long does a marketing audit take?", a: "A standard 360° marketing audit takes 4–6 weeks from access provision to final report delivery. Expedited single-channel audits (e.g., Google Ads only or SEO only) can be completed in 2 weeks." },
  { q: "What access do you need to conduct a marketing audit?", a: "Read-only access to: Google Analytics 4, Google Ads, Meta Business Manager, LinkedIn Campaign Manager, HubSpot or your CRM, and your email marketing platform. We never need billing access or the ability to make changes. We use our own Ahrefs and SEMrush licenses for SEO and competitor analysis." },
  { q: "What is the deliverable format for a marketing audit?", a: "You receive: a written audit report (20–40 pages) with supporting data; an executive summary (2–4 pages); a prioritised opportunity matrix ranking all issues by impact and effort; a quick-win action list (items executable within 30 days); and a live review session." },
  { q: "We think our marketing is working, why would we need an audit?", a: "Even high-performing programs have blind spots. Our audits consistently find budget allocated to channels that look good on last-touch attribution but don't drive revenue; high-value audience segments being missed entirely; email sequences with 40%+ unsubscribe rates; and CRO opportunities worth 20–30% more revenue from existing traffic." },
  { q: "Does the marketing audit include competitor analysis?", a: "Yes, competitor analysis is a core component. Using Ahrefs, SEMrush, and Similarweb, we analyse 3–5 direct competitors: traffic volumes, top organic keywords, paid keyword strategy, estimated ad spend, backlink approach, and content strategy, identifying gaps and positioning opportunities." },
];

const RELATED = [
  { title: "Growth Strategy & Roadmap", href: "/consultancy/growth-strategy", desc: "Turn audit findings into a 90-day and 12-month revenue roadmap.", icon: "🗺️" },
  { title: "Digital Transformation", href: "/consultancy/digital-transformation", desc: "Fix the MarTech gaps the audit uncovers.", icon: "🔄" },
  { title: "Digital Marketing Execution", href: "/marketing-services", desc: "Execute on audit recommendations with our full-service team.", icon: "📣" },
];

const auditAreas = [
  { area: "Paid Media", signals: "ROAS · CPL · Quality Score · Audience Overlap", risk: "High", color: "#ec4899" },
  { area: "SEO & Organic", signals: "Rankings · Backlinks · Technical Health · Content Gaps", risk: "High", color: "#f59e0b" },
  { area: "Email Marketing", signals: "Deliverability · Open Rate · List Health · Automation", risk: "Medium", color: "#8b5cf6" },
  { area: "Website & CRO", signals: "Conversion Rate · Page Speed · Funnel Drop-off", risk: "High", color: "#3b82f6" },
  { area: "Analytics & Attribution", signals: "GA4 Quality · UTM Consistency · Model Accuracy", risk: "Medium", color: "#06b6d4" },
  { area: "Competitive Landscape", signals: "Market Share · Keyword Gaps · Positioning Gaps", risk: "Medium", color: "#22c55e" },
];

export default function MarketingAuditPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Marketing Audit & Gap Analysis"
        title="Find Out Exactly Where Your Marketing Budget Is Being Wasted"
        subtitle="Most businesses are leaking revenue in 5–7 places simultaneously, and can't see it because they're looking at the wrong metrics. HotBot Studios conducts rigorous 360° marketing audits that find the leaks, quantify their impact, and deliver a prioritized fix list your team can act on immediately."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8b5cf6" }}>Definition, Marketing Audit</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              A <strong className="text-white">marketing audit</strong> is a systematic, objective assessment of your entire marketing programme, every channel, every dollar of spend, every tool in your stack, and every piece of content, evaluated against performance benchmarks, competitive standards, and strategic best practices. Unlike internal reviews (which are biased toward confirming existing decisions), an independent marketing audit surfaces uncomfortable truths that internal teams are too close to see, and quantifies the revenue impact of fixing them.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">360° Audit Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditAreas.map((item) => (
              <GlassCard key={item.area} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white text-sm">{item.area}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${item.color}20`, color: item.color }}>
                    {item.risk} Impact
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{item.signals}</p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Marketing Audit Services" columns={3} />
      <ServiceStats stats={STATS} title="What Our Audits Typically Uncover" />
      <ProcessSteps steps={PROCESS} title="Our Marketing Audit Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Every HotBot Studios marketing audit finds 5–7 revenue leaks, most businesses are surprised by all of them",
                "Paid media audits typically find 40% of budget wasted on mis-targeted audiences or low-ROI keywords",
                "All findings delivered with supporting data, not opinions, not guesswork",
                "Prioritised opportunity matrix ranks every issue by revenue impact and implementation effort",
                "Read-only access only, we never touch your accounts, only analyse them",
                "Audit findings flow directly into a growth strategy engagement if you choose to take the next step",
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
        title="Find Out Where Your Marketing Budget Is Going"
        subtitle="Book a discovery call and we'll scope a 360° marketing audit that identifies every revenue leak in your current programme, delivered with data, prioritized by impact."
        formType="strategy-call"
      />
    </>
  );
}
