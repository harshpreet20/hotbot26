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
  title: "SEO Services for US Businesses, Organic Growth Agency | HotBot Studios",
  description: "Technical SEO, content strategy, and link acquisition for US businesses targeting high-intent organic traffic. No vanity metrics. Measurable pipeline growth.",
  keywords: [
    "SEO agency for US businesses",
    "technical SEO services USA",
    "organic search growth agency",
    "B2B SEO strategy",
    "enterprise SEO services United States",
    "local SEO for US companies",
    "content SEO agency",
    "keyword research services USA",
    "on-page SEO optimization",
    "link building services United States"
  ],
  openGraph: {
    title: "SEO Services for US Businesses, Organic Growth Agency | HotBot Studios",
    description: "Technical SEO, content strategy, and link acquisition for US businesses targeting high-intent organic traffic. No vanity metrics. Measurable pipeline growth.",
    url: "https://hotbotstudios.com/digital-marketing/seo-services",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SEO Services That Drive Qualified Organic Traffic for US Businesses" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Services for US Businesses, Organic Growth Agency | HotBot Studios",
    description: "Technical SEO, content strategy, and link acquisition for US businesses targeting high-intent organic traffic. No vanity metrics. Measurable pipeline growth.",
  },
  alternates: { canonical: "https://hotbotstudios.com/digital-marketing/seo-services" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "HotBot Studios - SEO Services",
  "url": "https://hotbotstudios.com/digital-marketing/seo-services",
  "description": "Technical SEO, content strategy, and link acquisition for US businesses targeting high-intent organic traffic. No vanity metrics. Measurable pipeline growth.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "serviceType": "Search Engine Optimization",
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
      "name": "SEO Services",
      "item": "https://hotbotstudios.com/digital-marketing/seo-services"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does SEO take to show results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Technical fixes and quick-win content updates can produce ranking movements within 30 to 90 days. Significant organic traffic growth from competitive keywords typically takes 4 to 9 months. Link acquisition compounds over time. We set realistic timelines based on your current domain authority, competitive landscape, and keyword targets, not promises designed to close the deal."
      }
    },
    {
      "@type": "Question",
      "name": "What makes HotBot Studios SEO different from other agencies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We build SEO programs around revenue attribution, not ranking reports. Every keyword we target is mapped to a buyer intent stage and tied to CRM data so you can see which organic sessions become qualified leads and closed deals. We do not separate SEO from the broader marketing system, content, links, and technical foundations work as one program."
      }
    },
    {
      "@type": "Question",
      "name": "Do you handle both on-page and off-page SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Our program covers technical SEO, on-page optimization, content production, and link acquisition. We treat these as a single coordinated system, not separate services to be bought individually. The ratio of effort between each discipline shifts based on your current baseline and the competitive landscape."
      }
    },
    {
      "@type": "Question",
      "name": "Can SEO work for local US businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Local SEO for US businesses includes Google Business Profile optimization, local citation building, geo-targeted content, and review acquisition strategy. For multi-location businesses, we build centralized programs with location-specific content templates and reporting by market."
      }
    }
  ]
};

const STATS = [
    { value: 68, suffix: "%", label: "of B2B Buyers Start with Search", color: "#3b82f6" },
    { value: 14, suffix: "x", label: "Higher Close Rate vs Outbound", color: "#8b5cf6" },
    { value: 90, suffix: " days", label: "To First Ranking Movements", color: "#06b6d4" },
    { value: 0, suffix: " cost per click", label: "Organic Traffic", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "SEO Audit and Opportunity Mapping", desc: "Full technical audit, competitor gap analysis, keyword opportunity sizing, and content inventory assessment. Delivered as an actionable prioritized roadmap within the first two weeks.", icon: "🔍" },
    { n: 2, title: "Architecture and Foundation", desc: "URL structure, internal linking strategy, schema implementation, and Core Web Vitals remediation. Build the foundation before scaling content or links.", icon: "🏗️" },
    { n: 3, title: "Content and Authority Build", desc: "Topical authority content production and link acquisition running in parallel. Monthly publishing cadence calibrated to competitive intensity and domain authority targets.", icon: "📝" },
    { n: 4, title: "Reporting and Continuous Optimization", desc: "Monthly ranking, traffic, and pipeline attribution reporting. Ongoing keyword expansion, content refresh cycles, and link velocity management.", icon: "📊" }
];

const FAQS = [
    { q: "How long does SEO take to show results?", a: "Technical fixes and quick-win content updates can produce ranking movements within 30 to 90 days. Significant organic traffic growth from competitive keywords typically takes 4 to 9 months. Link acquisition compounds over time. We set realistic timelines based on your current domain authority, competitive landscape, and keyword targets, not promises designed to close the deal." },
    { q: "What makes HotBot Studios SEO different from other agencies?", a: "We build SEO programs around revenue attribution, not ranking reports. Every keyword we target is mapped to a buyer intent stage and tied to CRM data so you can see which organic sessions become qualified leads and closed deals. We do not separate SEO from the broader marketing system, content, links, and technical foundations work as one program." },
    { q: "Do you handle both on-page and off-page SEO?", a: "Yes. Our program covers technical SEO, on-page optimization, content production, and link acquisition. We treat these as a single coordinated system, not separate services to be bought individually. The ratio of effort between each discipline shifts based on your current baseline and the competitive landscape." },
    { q: "Can SEO work for local US businesses?", a: "Yes. Local SEO for US businesses includes Google Business Profile optimization, local citation building, geo-targeted content, and review acquisition strategy. For multi-location businesses, we build centralized programs with location-specific content templates and reporting by market." }
];

const RELATED = [
    { title: "PPC and Paid Search", href: "/digital-marketing/ppc", desc: "Paid search complements SEO, capture demand while organic rankings build.", icon: "💰" },
    { title: "Analytics and Attribution", href: "/digital-marketing/analytics", desc: "Connect organic search performance to revenue and pipeline in your CRM.", icon: "📊" },
    { title: "Content Studio", href: "/content-studio", desc: "SEO content production: copywriting, video, and thought leadership at scale.", icon: "✍️" }
];

export default function SeoPage() {
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
          <li className="text-slate-400">SEO Services</li>
        </ol>
      </nav>

      <Breadcrumb items={[{ label: "Digital Marketing", href: "/digital-marketing" }, { label: "Seo Services" }]} />

      <PageHeader
        label="Search Engine Optimization"
        title="SEO Services That Drive Qualified Organic Traffic for US Businesses"
        subtitle="Most SEO agencies chase rankings that do not convert. HotBot Studios builds search programs around buyer intent, connecting your brand to decision-makers at the exact moment they are evaluating solutions. Technical foundations, topical authority content, and authoritative link acquisition working as one system."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#3b82f608", borderColor: "#3b82f620" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">SEO for Business:</strong>{" "}
              Search engine optimization (SEO) for business is the systematic process of improving a website's visibility in organic search results for queries that indicate commercial intent. For US B2B organizations, this means ranking for transactional and informational keywords that decision-makers use during the buying process, not vanity traffic that inflates sessions without influencing revenue.
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
        <div key="Technical SEO Audit and Remediation" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`⚙️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Technical SEO Audit and Remediation`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Crawl architecture, Core Web Vitals, structured data, canonical management, and indexation control. We resolve the technical debt that suppresses rankings before building content or links. Every audit delivers a prioritized remediation roadmap.`}</p>
        </div>
        <div key="Keyword and Intent Architecture" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🗝️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Keyword and Intent Architecture`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Full keyword universe mapped by search intent: informational, navigational, commercial, and transactional. Each keyword cluster assigned to a page owner, content type, and funnel stage. No two pages compete for the same intent.`}</p>
        </div>
        <div key="Topical Authority Content" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📝`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Topical Authority Content`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Pillar pages, cluster articles, and answer-engine-optimized definitions built to capture position zero, featured snippets, and AI-generated search overviews. Content written to consultant-grade quality standards.`}</p>
        </div>
        <div key="Link Acquisition" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Link Acquisition`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Editorial link building through digital PR, resource page outreach, and thought leadership placement. Every link is placed on a topically relevant domain with real traffic. No PBNs, no link farms, no shortcuts.`}</p>
        </div>
        <div key="Local SEO for Multi-Location Businesses" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`📍`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Local SEO for Multi-Location Businesses`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Google Business Profile optimization, local citation management, and geo-targeted content for US businesses with physical locations or service area targeting. Structured for multi-city and franchise deployments.`}</p>
        </div>
        <div key="SEO Reporting and Attribution" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`SEO Reporting and Attribution`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Monthly reporting covering ranking movements, organic traffic, qualified session rate, and pipeline influence. GA4 + CRM integration shows revenue attribution from organic search to closed deals.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="B2B SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#3b82f6" }}>{String.raw`B2B SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Competing against established players with massive content libraries and domain authority accumulated over years.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Topical authority strategy targeting mid-funnel buyer intent keywords where established players have gaps. Cluster content builds authority faster than trying to outrank pillar pages head-on.`}</p>
        </div>
        <div key="Professional Services Firms" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Professional Services Firms`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Generating qualified inbound inquiry without over-reliance on referrals and networking.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Expertise-led content targeting high-intent service queries. FAQ content optimized for AI overviews. Local SEO capturing geographic service area searches.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Thin margins making paid search unsustainable as the primary acquisition channel.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Category page SEO, product schema markup, and buying guide content capturing commercial intent searches with zero per-click cost.`}</p>
        </div>
        <div key="Multi-Location Enterprises" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#22c55e" }}>{String.raw`Multi-Location Enterprises`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Inconsistent local search visibility across locations with siloed marketing teams.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Centralized local SEO program with per-location Google Business Profile optimization, local content templates, and citation management across all US markets.`}</p>
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
            style={{ background: "#3b82f605", borderColor: "#3b82f618" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Organic sessions from target keyword clusters`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Keyword ranking positions for primary commercial terms`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Organic qualified lead rate`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Domain authority growth trajectory`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Core Web Vitals scores (LCP, CLS, INP)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Organic-attributed pipeline revenue`}</li>
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
            <span>{String.raw`SEO built around buyer intent generates leads that close at 14x higher rates than outbound-sourced prospects`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Technical foundations are resolved before content or links, no ranking ceiling from crawl or speed issues`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Topical authority content clusters capture mid-funnel decision-maker queries where competitors have gaps`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Link acquisition is editorial and placement-verified, every link on a real topically relevant domain`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Revenue attribution through GA4 and CRM integration shows organic pipeline contribution, not just sessions`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Programs are calibrated to your competitive landscape and domain authority baseline, not a generic playbook`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Get a Free SEO Opportunity Audit"
        subtitle="We will analyze your current rankings, identify your highest-value keyword gaps, and map out what an organic growth program would produce for your business."
        formType="get-started"
      />
    </>
  );
}
