import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "PPC Management Services for US Businesses, Google Ads Agency | HotBot Studios",
  description: "Google Ads, Meta Ads, and LinkedIn Ads management for US B2B companies. Revenue-focused PPC with full attribution from click to closed deal.",
  keywords: [
    "PPC management agency USA",
    "Google Ads management services",
    "paid search agency United States",
    "B2B PPC agency",
    "LinkedIn Ads management USA",
    "Meta Ads agency for business",
    "Google Ads for B2B companies",
    "paid advertising management USA",
    "SEM agency United States",
    "performance marketing agency USA"
  ],
  openGraph: {
    title: "PPC Management Services for US Businesses, Google Ads Agency | HotBot Studios",
    description: "Google Ads, Meta Ads, and LinkedIn Ads management for US B2B companies. Revenue-focused PPC with full attribution from click to closed deal.",
    url: "https://hotbotstudios.com/digital-marketing/ppc-management",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PPC Management That Turns Ad Spend Into Qualified Pipeline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PPC Management Services for US Businesses, Google Ads Agency | HotBot Studios",
    description: "Google Ads, Meta Ads, and LinkedIn Ads management for US B2B companies. Revenue-focused PPC with full attribution from click to closed deal.",
  },
  alternates: { canonical: "https://hotbotstudios.com/digital-marketing/ppc-management" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "HotBot Studios - PPC Management Services",
  "url": "https://hotbotstudios.com/digital-marketing/ppc-management",
  "description": "Google Ads, Meta Ads, and LinkedIn Ads management for US B2B companies. Revenue-focused PPC with full attribution from click to closed deal.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "serviceType": "Paid Search & Paid Social",
  "priceRange": "$$-$$$",
  "telephone": "+91-9700001534",
  "email": "hello@hotbotstudios.com",
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
      "item": "https://hotbotstudios.com/digital-marketing"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "PPC and Paid Search",
      "item": "https://hotbotstudios.com/digital-marketing/ppc-management"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What PPC platforms do you manage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Google Search Ads, Google Performance Max, Google Display, YouTube Ads, Meta Ads (Facebook and Instagram), LinkedIn Ads, and Microsoft Advertising (Bing). We recommend the right mix based on your buyer type, deal size, and budget. B2B companies with deal sizes above $10K typically see strongest ROI from Google Search and LinkedIn. E-commerce brands generally lead with Meta and Google Shopping."
      }
    },
    {
      "@type": "Question",
      "name": "What budget is required to see results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Minimum effective budgets vary by platform and market. For Google Search in competitive B2B categories, $3,000 to $5,000 per month is typically the minimum to generate statistically meaningful data. LinkedIn Ads require minimum $1,500 per month to exit the learning phase. We will advise on realistic budget expectations before onboarding, not after."
      }
    },
    {
      "@type": "Question",
      "name": "How do you measure PPC ROI beyond clicks and conversions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We integrate GA4 conversion data with your CRM to trace leads from click to qualified opportunity to closed deal. This allows us to calculate true cost per acquisition and pipeline-attributed revenue by campaign, ad group, and keyword. Vanity metrics like impressions and CTR are secondary to business outcomes."
      }
    },
    {
      "@type": "Question",
      "name": "Can you improve existing underperforming campaigns?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Account audits frequently uncover structural issues: poor match type usage, missing negative keywords, landing pages that do not match ad intent, conversion tracking gaps, and budget allocation across campaigns that favors low-performers. Most inherited accounts can be improved materially within 60 days before requiring budget increases."
      }
    }
  ]
};

const STATS = [
    { value: 200, suffix: "%", label: "Average First-Quarter ROAS Improvement", color: "#f59e0b" },
    { value: 35, suffix: "%", label: "Average CPA Reduction After Audit", color: "#3b82f6" },
    { value: 4, suffix: " platforms", label: "Google, Meta, LinkedIn, Display", color: "#8b5cf6" },
    { value: 100, suffix: "%", label: "Revenue-Attributed Reporting", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Account Audit and Strategy", desc: "Full audit of existing campaigns (if applicable), competitive landscape analysis, keyword opportunity mapping, and audience strategy. Delivered as a paid media strategy document before any spend is committed.", icon: "🔍" },
    { n: 2, title: "Campaign Build and Tracking Setup", desc: "Campaign architecture, ad copy, landing pages, GA4 event tracking, CRM integration, and call tracking configured. Zero wasted spend from day one with proper negative keyword lists and audience exclusions.", icon: "🏗️" },
    { n: 3, title: "Launch and Learning Phase", desc: "Initial 30-day learning period with daily monitoring. Budget, bids, and targeting adjusted based on early performance data. Weekly reporting covers spend, impressions, clicks, conversions, and lead quality.", icon: "🚀" },
    { n: 4, title: "Optimization and Scale", desc: "Monthly optimization cycles covering bid strategy, ad copy testing, audience expansion, and landing page iteration. Scale winners and kill underperformers with data, not intuition.", icon: "📈" }
];

const FAQS = [
    { q: "What PPC platforms do you manage?", a: "Google Search Ads, Google Performance Max, Google Display, YouTube Ads, Meta Ads (Facebook and Instagram), LinkedIn Ads, and Microsoft Advertising (Bing). We recommend the right mix based on your buyer type, deal size, and budget. B2B companies with deal sizes above \$10K typically see strongest ROI from Google Search and LinkedIn. E-commerce brands generally lead with Meta and Google Shopping." },
    { q: "What budget is required to see results?", a: "Minimum effective budgets vary by platform and market. For Google Search in competitive B2B categories, \$3,000 to \$5,000 per month is typically the minimum to generate statistically meaningful data. LinkedIn Ads require minimum \$1,500 per month to exit the learning phase. We will advise on realistic budget expectations before onboarding, not after." },
    { q: "How do you measure PPC ROI beyond clicks and conversions?", a: "We integrate GA4 conversion data with your CRM to trace leads from click to qualified opportunity to closed deal. This allows us to calculate true cost per acquisition and pipeline-attributed revenue by campaign, ad group, and keyword. Vanity metrics like impressions and CTR are secondary to business outcomes." },
    { q: "Can you improve existing underperforming campaigns?", a: "Yes. Account audits frequently uncover structural issues: poor match type usage, missing negative keywords, landing pages that do not match ad intent, conversion tracking gaps, and budget allocation across campaigns that favors low-performers. Most inherited accounts can be improved materially within 60 days before requiring budget increases." }
];

const RELATED = [
    { title: "SEO Services", href: "/digital-marketing/seo", desc: "Organic traffic builds the long-term channel while paid generates immediate pipeline.", icon: "🔍" },
    { title: "Analytics and Attribution", href: "/digital-marketing/analytics", desc: "Revenue attribution connecting PPC spend to pipeline and closed revenue.", icon: "📊" },
    { title: "CRO, Conversion Rate Optimization", href: "/digital-marketing/cro", desc: "Higher landing page conversion rates reduce CPA without increasing budget.", icon: "🎯" }
];

export default function PpcPage() {
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
          <li><Link href="/digital-marketing" className="hover:text-slate-300 transition-colors">Digital Marketing</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">PPC and Paid Search</li>
        </ol>
      </nav>

      <Breadcrumb items={[{ label: "Digital Marketing", href: "/digital-marketing" }, { label: "Ppc Management" }]} />

      <PageHeader
        label="Paid Search & Paid Social"
        title="PPC Management That Turns Ad Spend Into Qualified Pipeline"
        subtitle="Paid search without attribution is burning budget. HotBot Studios manages Google Ads, Meta Ads, and LinkedIn Ads with full-funnel tracking from click to closed revenue. Every campaign is built around your actual cost-per-acquisition target, not impressions or click-through rate."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">PPC (Pay-Per-Click) Management:</strong>{" "}
              PPC management is the ongoing process of planning, building, optimizing, and measuring paid advertising campaigns across search engines and social platforms. For US B2B organizations, effective PPC management means placing ads in front of high-intent buyers at exactly the right moment, with bidding, copy, landing pages, and attribution all optimized together to reduce cost per acquisition and increase qualified lead volume.
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
        <div key="Google Search Ads" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🔍`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Google Search Ads`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Keyword research, match type strategy, ad copy testing, and Quality Score optimization. Every campaign structured around commercial intent keywords that signal active buying. Negative keyword management prevents wasted spend on irrelevant queries.`}</p>
        </div>
        <div key="Meta Ads (Facebook and Instagram)" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`📱`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Meta Ads (Facebook and Instagram)`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Audience architecture, creative testing frameworks, and funnel stage sequencing for Meta platforms. Cold audience prospecting, retargeting sequences, and lookalike expansion built around your highest-LTV customer segments.`}</p>
        </div>
        <div key="LinkedIn Ads for B2B" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`💼`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`LinkedIn Ads for B2B`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Sponsored content, message ads, and conversation ads targeting decision-makers by job title, industry, company size, and seniority. LinkedIn's account-based targeting makes it the most precise B2B paid channel available.`}</p>
        </div>
        <div key="Landing Page Conversion Optimization" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🎯`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Landing Page Conversion Optimization`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`PPC performance is capped by landing page conversion rate. We audit, redesign, and A/B test landing pages to maximize lead capture from every dollar of ad spend. Variant testing with statistical significance gates.`}</p>
        </div>
        <div key="Full Attribution and Reporting" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Full Attribution and Reporting`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`GA4 event tracking, CRM integration, and call tracking ensure every conversion traces back to the specific campaign, ad group, and keyword that generated it. Weekly performance reports cover spend, CPA, lead quality, and pipeline contribution.`}</p>
        </div>
        <div key="Retargeting and Remarketing" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`🔄`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Retargeting and Remarketing`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Audience segmentation by page visited, time on site, and funnel stage. Sequential retargeting that delivers progressively stronger offers as prospects move closer to decision. Cross-platform retargeting across Google Display, Meta, and LinkedIn.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="B2B SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`B2B SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Long sales cycles make it hard to justify paid spend when conversion to revenue takes 60 to 180 days.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Pipeline-stage attribution model traces PPC spend to SQL and closed revenue, not just lead volume. Bidding strategies optimize toward lead quality signals from CRM, not raw conversion count.`}</p>
        </div>
        <div key="Professional Services" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#3b82f6" }}>{String.raw`Professional Services`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`High CPCs in competitive service categories make cost-per-lead from search unsustainable without strong conversion optimization.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Landing page conversion audit and redesign reduces CPA before scaling budget. Quality Score improvements from tighter ad groups reduce average CPC.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`ROAS targets are difficult to maintain as CPCs rise and tracking accuracy degrades from iOS privacy changes.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Server-side conversion tracking, first-party data activation, and Meta Conversions API restore signal accuracy. Performance Max campaigns structured with proper asset segmentation to avoid budget waste.`}</p>
        </div>
        <div key="Local Service Businesses" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`Local Service Businesses`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Google Local Services Ads and search campaigns targeting specific US cities have high intent but require constant bid and budget management.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Geo-targeted campaign structure with dayparting, device bid adjustments, and call tracking to optimize spend by time of day and location for maximum qualified call volume.`}</p>
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
            style={{ background: "#f59e0b05", borderColor: "#f59e0b18" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Cost per qualified lead (not cost per click)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Lead-to-pipeline conversion rate by campaign`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Return on ad spend (ROAS) by channel`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Quality Score average across Google campaigns`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Landing page conversion rate by offer`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Organic vs. paid pipeline contribution ratio`}</li>
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
            <span>{String.raw`PPC campaigns are structured around your target cost-per-acquisition, not platform metrics like clicks or impressions`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Full attribution from click to CRM closes the loop between ad spend and revenue contribution`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Landing page conversion rate is addressed before scaling spend, higher conversion rate reduces CPA immediately`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`B2B campaigns leverage LinkedIn account-based targeting for decision-maker precision that search alone cannot match`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Retargeting sequences re-engage high-intent visitors across Google, Meta, and LinkedIn simultaneously`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Weekly reporting covers spend efficiency and pipeline contribution, not just traffic and clicks`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Get a Free PPC Account Audit"
        subtitle="We will audit your current campaigns, identify structural inefficiencies, and show you exactly how much pipeline you are leaving on the table."
        formType="get-started"
      />
    </>
  );
}
