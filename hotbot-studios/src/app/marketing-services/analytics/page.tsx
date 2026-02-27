import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Marketing Analytics and Attribution Services USA | HotBot Studios",
  description: "GA4 setup, CRM attribution, and revenue reporting for US businesses. Connect marketing spend to pipeline and closed revenue — not just sessions and conversions.",
  keywords: [
    "marketing analytics agency USA",
    "GA4 setup and configuration",
    "marketing attribution services",
    "revenue attribution for B2B",
    "CRM analytics integration",
    "marketing reporting agency USA",
    "GA4 ecommerce tracking",
    "multi-touch attribution model",
    "marketing data analytics USA",
    "Google Analytics 4 consultant"
  ],
  openGraph: {
    title: "Marketing Analytics and Attribution Services USA | HotBot Studios",
    description: "GA4 setup, CRM attribution, and revenue reporting for US businesses. Connect marketing spend to pipeline and closed revenue — not just sessions and conversions.",
    url: "https://hotbotstudios.com/marketing-services/analytics",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Marketing Analytics That Connect Every Channel to Revenue" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing Analytics and Attribution Services USA | HotBot Studios",
    description: "GA4 setup, CRM attribution, and revenue reporting for US businesses. Connect marketing spend to pipeline and closed revenue — not just sessions and conversions.",
  },
  alternates: { canonical: "https://hotbotstudios.com/marketing-services/analytics" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Marketing Analytics That Connect Every Channel to Revenue",
  "description": "GA4 setup, CRM attribution, and revenue reporting for US businesses. Connect marketing spend to pipeline and closed revenue — not just sessions and conversions.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "Analytics and Attribution",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/marketing-services/analytics"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://hotbotstudios.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Digital Marketing",
      "item": "https://hotbotstudios.com/marketing-services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Analytics and Attribution",
      "item": "https://hotbotstudios.com/marketing-services/analytics"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the difference between GA4 and CRM attribution?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GA4 tracks website behavior — sessions, events, and on-site conversions like form fills. CRM attribution tracks what happens after a lead is created — pipeline stage progression, deal value, and closed revenue. Connecting both systems gives you end-to-end attribution from first website visit to closed deal, which is the only attribution model that actually tells you which marketing activities drive revenue."
      }
    },
    {
      "@type": "Question",
      "name": "How does server-side tracking improve attribution accuracy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Browser-based tracking (via JavaScript tags) is blocked by ad blockers, browser privacy settings, and iOS restrictions. Server-side tracking sends conversion data directly from your server to ad platforms and analytics tools, bypassing client-side blockers. This restores between 20 and 40 percent of conversions that browser tracking typically misses, giving you more accurate ROAS calculations and bidding signals."
      }
    },
    {
      "@type": "Question",
      "name": "How long does analytics implementation take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A standard GA4 setup with event tracking, CRM integration, and Looker Studio dashboard can be completed in 10 to 14 days. Server-side GTM deployment and ad platform integration (Meta CAPI, Google Enhanced Conversions) adds 5 to 7 additional days. Complex implementations with custom data models, API integrations, or BigQuery warehousing take 4 to 6 weeks."
      }
    },
    {
      "@type": "Question",
      "name": "Can you fix an existing GA4 setup that is reporting inaccurately?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. GA4 audit and remediation is one of our most common engagements. Common issues include duplicate event firing, incorrect conversion counting, missing UTM parameters, GA4 and Google Ads link misconfigurations, and session channel grouping errors. We document every issue found, fix it, and QA the corrected tracking against ground truth data before signing off."
      }
    }
  ]
};

const STATS = [
    { value: 67, suffix: "%", label: "of Marketers Lack Revenue Attribution", color: "#06b6d4" },
    { value: 30, suffix: "%", label: "Average Budget Saved by Cutting Low-ROI Channels", color: "#3b82f6" },
    { value: 14, suffix: " days", label: "Full GA4 + CRM Setup Timeline", color: "#8b5cf6" },
    { value: 100, suffix: "%", label: "First-Party Data Owned by You", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Analytics Audit and Gap Analysis", desc: "Audit existing GA4 configuration, conversion tracking, UTM consistency, and CRM data quality. Identify every attribution blind spot that is causing inaccurate reporting.", icon: "🔍" },
    { n: 2, title: "Tracking Architecture and Implementation", desc: "Deploy server-side GTM, configure GA4 events, set up ad platform integrations, and implement CRM closed-loop reporting. Full QA testing before going live.", icon: "🏗️" },
    { n: 3, title: "Dashboard and Reporting Build", desc: "Custom Looker Studio dashboards configured for your specific KPIs, reporting cadence, and audience (CMO, board, or operations team). Automated data refresh with manual commentary layer.", icon: "📊" },
    { n: 4, title: "Ongoing Analysis and Optimization", desc: "Monthly attribution analysis, anomaly investigation, and budget reallocation recommendations. Quarterly reporting model review to ensure attribution logic stays aligned with your evolving channel mix.", icon: "🔄" }
];

const FAQS = [
    { q: "What is the difference between GA4 and CRM attribution?", a: "GA4 tracks website behavior — sessions, events, and on-site conversions like form fills. CRM attribution tracks what happens after a lead is created — pipeline stage progression, deal value, and closed revenue. Connecting both systems gives you end-to-end attribution from first website visit to closed deal, which is the only attribution model that actually tells you which marketing activities drive revenue." },
    { q: "How does server-side tracking improve attribution accuracy?", a: "Browser-based tracking (via JavaScript tags) is blocked by ad blockers, browser privacy settings, and iOS restrictions. Server-side tracking sends conversion data directly from your server to ad platforms and analytics tools, bypassing client-side blockers. This restores between 20 and 40 percent of conversions that browser tracking typically misses, giving you more accurate ROAS calculations and bidding signals." },
    { q: "How long does analytics implementation take?", a: "A standard GA4 setup with event tracking, CRM integration, and Looker Studio dashboard can be completed in 10 to 14 days. Server-side GTM deployment and ad platform integration (Meta CAPI, Google Enhanced Conversions) adds 5 to 7 additional days. Complex implementations with custom data models, API integrations, or BigQuery warehousing take 4 to 6 weeks." },
    { q: "Can you fix an existing GA4 setup that is reporting inaccurately?", a: "Yes. GA4 audit and remediation is one of our most common engagements. Common issues include duplicate event firing, incorrect conversion counting, missing UTM parameters, GA4 and Google Ads link misconfigurations, and session channel grouping errors. We document every issue found, fix it, and QA the corrected tracking against ground truth data before signing off." }
];

const RELATED = [
    { title: "SEO Services", href: "/marketing-services/seo", desc: "Measure organic search contribution accurately with proper attribution.", icon: "🔍" },
    { title: "PPC and Paid Search", href: "/marketing-services/ppc", desc: "Connect ad spend to pipeline revenue with closed-loop CRM attribution.", icon: "💰" },
    { title: "AI Automation", href: "/ai-automation", desc: "AI analytics dashboards and predictive BI for enterprise reporting.", icon: "🤖" }
];

export default function AnalyticsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-24 pb-0 px-6 max-w-5xl mx-auto">
        <ol className="flex items-center gap-2 text-xs text-slate-500">
          <li><Link href="/" className="hover:text-slate-300 transition-colors">Home</Link></li>
          <li className="text-slate-700">/</li>
          <li><Link href="/marketing-services" className="hover:text-slate-300 transition-colors">Digital Marketing</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">Analytics and Attribution</li>
        </ol>
      </nav>

      <PageHeader
        label="Analytics and Attribution"
        title="Marketing Analytics That Connect Every Channel to Revenue"
        subtitle="Most US businesses cannot answer one question: which marketing channels are driving closed revenue? Not sessions. Not leads. Revenue. HotBot Studios builds attribution infrastructure that traces every deal back to its source — giving your team the data to allocate budget with confidence."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#06b6d408", borderColor: "#06b6d420" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Marketing Attribution:</strong>{" "}
              Marketing attribution is the process of identifying which marketing channels, campaigns, and touchpoints contributed to a conversion or closed sale. For US B2B organizations, proper attribution requires connecting website analytics (GA4), paid media platforms (Google Ads, Meta, LinkedIn), and CRM data (HubSpot, Salesforce) into a single reporting system that shows which activities generate qualified pipeline — not just traffic or form fills.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">What We Deliver</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div key="GA4 Implementation and Configuration" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`GA4 Implementation and Configuration`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Full GA4 property setup, event tracking configuration, conversion action mapping, and Looker Studio dashboard build. Includes e-commerce tracking, form submission events, scroll depth, video engagement, and custom parameter capture for your specific business needs.`}</p>
        </div>
        <div key="CRM and Ad Platform Integration" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`CRM and Ad Platform Integration`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`HubSpot, Salesforce, and Pipedrive connected to GA4 and paid media platforms for closed-loop attribution. Offline conversion imports, lead scoring data passed to Google Ads, and CRM pipeline data available in reporting dashboards.`}</p>
        </div>
        <div key="Multi-Touch Attribution Modeling" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🗺️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Multi-Touch Attribution Modeling`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`First-touch, last-touch, linear, time-decay, and data-driven attribution models configured to reflect your actual sales cycle length and channel mix. Understand how different channels assist conversion rather than taking single-touch credit.`}</p>
        </div>
        <div key="Revenue Reporting Dashboards" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`📈`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Revenue Reporting Dashboards`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Custom Looker Studio dashboards showing channel-attributed revenue, customer acquisition cost by source, pipeline velocity by lead origin, and marketing-influenced revenue per period. Built for CMOs and revenue teams — not just digital analysts.`}</p>
        </div>
        <div key="Server-Side Tracking and Privacy Compliance" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🔒`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Server-Side Tracking and Privacy Compliance`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Server-side GTM setup, Meta Conversions API, Google Enhanced Conversions, and first-party data strategies that restore signal accuracy in a privacy-first tracking environment. Compliant with GDPR and CCPA where applicable.`}</p>
        </div>
        <div key="AI-Powered Insights and Anomaly Detection" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`🤖`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`AI-Powered Insights and Anomaly Detection`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Automated anomaly detection alerts when traffic, conversion, or revenue metrics deviate from expected ranges. AI-assisted analysis identifies pattern breaks, seasonal shifts, and channel performance changes before they impact quarterly targets.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="B2B SaaS with Long Sales Cycles" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`B2B SaaS with Long Sales Cycles`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Multiple touchpoints across 60 to 180-day cycles make it impossible to understand which early-funnel activities ultimately drive closed revenue.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`CRM integration maps every marketing touchpoint — content download, webinar attendance, paid click, organic search visit — to the eventual closed deal. Time-decay attribution gives appropriate credit to early-funnel awareness activities.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#3b82f6" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`iOS tracking changes and GA4 migration gaps have created blind spots in conversion data, making ROAS calculations unreliable.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Server-side GTM and Meta Conversions API restore conversion signal. Enhanced e-commerce tracking captures product-level revenue data. First-party data strategy reduces dependency on third-party cookie tracking.`}</p>
        </div>
        <div key="Multi-Channel Advertisers" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Multi-Channel Advertisers`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Running SEO, PPC, email, and social simultaneously with no unified view of which channel combinations drive acquisition.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Unified reporting dashboard aggregates all channel data with consistent attribution logic. Channel overlap analysis identifies which combinations produce the highest-LTV customers.`}</p>
        </div>
        <div key="Revenue Operations Teams" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#22c55e" }}>{String.raw`Revenue Operations Teams`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Reporting to board and investors requires marketing-attributed revenue numbers that can be tied to specific activities and justified.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Board-ready reporting templates with marketing-influenced pipeline, marketing-sourced revenue, and channel ROI metrics. Monthly executive dashboard updated automatically from live data sources.`}</p>
        </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="Our Engagement Process" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Report On</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "#06b6d405", borderColor: "#06b6d418" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Marketing-sourced pipeline revenue by channel`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Customer acquisition cost (CAC) by source`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Marketing-influenced closed revenue`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Conversion tracking accuracy rate (vs. platform reported)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Lead-to-SQL conversion rate by traffic source`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Dashboard data freshness and automation rate`}</li>
            </ul>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Key Takeaways</h2>
          <ul className="space-y-4">
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Revenue attribution connects marketing spend to pipeline and closed revenue — not just sessions and form fills`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`GA4 and CRM integration is the minimum required infrastructure for accurate B2B marketing ROI reporting`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Server-side tracking restores 20 to 40 percent of conversions lost to browser privacy restrictions`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Multi-touch attribution models reflect the reality of complex B2B buying journeys across 60 to 180-day cycles`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Custom Looker Studio dashboards deliver board-ready marketing performance reporting automatically`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`First-party data infrastructure is owned entirely by your organization — not locked in a vendor platform`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Get a Free Analytics Audit"
        subtitle="We will review your current tracking setup, identify attribution gaps, and show you what accurate revenue reporting would look like for your business."
        formType="get-started"
      />
    </>
  );
}
