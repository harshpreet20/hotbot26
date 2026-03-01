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
  title: "CRO, Conversion Rate Optimization Services USA | HotBot Studios",
  description: "A/B testing, landing page redesigns, heatmap analysis, and UX optimization for US businesses. Turn more of your existing traffic into leads and paying customers without increasing ad spend.",
  keywords: [
    "conversion rate optimization agency USA",
    "CRO services for business",
    "A/B testing services USA",
    "landing page optimization",
    "heatmap analysis services",
    "UX optimization for conversion",
    "website conversion optimization",
    "B2B CRO agency",
    "e-commerce conversion optimization",
    "Hotjar analysis services USA"
  ],
  openGraph: {
    title: "CRO, Conversion Rate Optimization Services USA | HotBot Studios",
    description: "A/B testing, landing page redesigns, heatmap analysis, and UX optimization for US businesses. Turn more of your existing traffic into leads and paying customers without increasing ad spend.",
    url: "https://hotbotstudios.com/marketing-services/cro",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "CRO Services That Turn Existing Traffic Into More Leads and Revenue" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CRO, Conversion Rate Optimization Services USA | HotBot Studios",
    description: "A/B testing, landing page redesigns, heatmap analysis, and UX optimization for US businesses. Turn more of your existing traffic into leads and paying customers without increasing ad spend.",
  },
  alternates: { canonical: "https://hotbotstudios.com/marketing-services/cro" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CRO Services That Turn Existing Traffic Into More Leads and Revenue",
  "description": "A/B testing, landing page redesigns, heatmap analysis, and UX optimization for US businesses. Turn more of your existing traffic into leads and paying customers without increasing ad spend.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "Conversion Rate Optimization",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/marketing-services/cro"
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
      "name": "Conversion Rate Optimization",
      "item": "https://hotbotstudios.com/marketing-services/cro"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much traffic is needed to run meaningful A/B tests?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A minimum of 1,000 sessions per variant per week (2,000 total) is required to reach statistical significance within a reasonable timeframe for most conversion goals. For low-traffic pages or low-frequency conversion actions (like high-ticket purchases), we recommend qualitative research methods, heatmaps, session recordings, user interviews, as the primary optimization input, with A/B testing deployed only where traffic supports it."
      }
    },
    {
      "@type": "Question",
      "name": "What is a realistic CRO improvement to expect?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Initial audits of underoptimized landing pages and checkout flows typically yield 20 to 50% conversion rate improvements within the first 90 days. Mature, already-optimized programs see 5 to 15% incremental gains per quarter. The compounding effect, each improvement becomes the new baseline for the next test, means CRO programs become more valuable over time, not less."
      }
    },
    {
      "@type": "Question",
      "name": "Can CRO work without a high-volume traffic site?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, though the approach differs. For low-traffic sites (fewer than 5,000 sessions per month), we use qualitative research, heatmaps, session recordings, user interviews, and expert UX review, to generate high-confidence hypotheses. These are then implemented as direct changes rather than A/B tests, with before-and-after measurement over 30 to 60 day windows. This approach produces reliable improvements without requiring statistical testing infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "How does CRO interact with SEO and paid advertising?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CRO multiplies the ROI of every other channel. Higher landing page conversion rate means lower CPA from paid search, more leads from the same organic traffic volume, and better email signup rates from the same social following. We typically recommend running a CRO audit alongside any new paid search campaign launch, the average landing page improvement reduces first-quarter CPA by 25 to 40% before bidding optimizations even take effect."
      }
    }
  ]
};

const STATS = [
    { value: 1, suffix: "pp lift", label: "= Same Revenue as 2× Traffic Volume", color: "#f59e0b" },
    { value: 7, suffix: "%", label: "Revenue Lift per 1-Second Speed Improvement", color: "#3b82f6" },
    { value: 95, suffix: "%", label: "Statistical Confidence Before Declaring Winners", color: "#8b5cf6" },
    { value: 60, suffix: " days", label: "Typical Timeline to First Significant Test Result", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "CRO Audit and Research", desc: "Heatmap installation, session recording review, funnel drop-off analysis in GA4, and user behavior pattern identification. Deliver a prioritized list of conversion hypotheses ranked by impact potential and test effort.", icon: "🔍" },
    { n: 2, title: "Hypothesis and Test Design", desc: "For each hypothesis, design the variant (copy, design, or structural change), set the statistical parameters, and configure the test in your testing platform. Minimum traffic threshold calculated before launch.", icon: "✏️" },
    { n: 3, title: "Test Execution and Monitoring", desc: "Launch A/B tests, monitor for sample pollution and external variables, and enforce 95% statistical significance threshold before reading results. Average test runtime: 2 to 4 weeks.", icon: "🧪" },
    { n: 4, title: "Implement and Iterate", desc: "Winners deployed to 100% of traffic. Losing variants analyzed for qualitative insight to inform next hypothesis. Compounding test program builds 3 to 5 validated improvements per quarter.", icon: "📈" }
];

const FAQS = [
    { q: "How much traffic is needed to run meaningful A/B tests?", a: "A minimum of 1,000 sessions per variant per week (2,000 total) is required to reach statistical significance within a reasonable timeframe for most conversion goals. For low-traffic pages or low-frequency conversion actions (like high-ticket purchases), we recommend qualitative research methods, heatmaps, session recordings, user interviews, as the primary optimization input, with A/B testing deployed only where traffic supports it." },
    { q: "What is a realistic CRO improvement to expect?", a: "Initial audits of underoptimized landing pages and checkout flows typically yield 20 to 50% conversion rate improvements within the first 90 days. Mature, already-optimized programs see 5 to 15% incremental gains per quarter. The compounding effect, each improvement becomes the new baseline for the next test, means CRO programs become more valuable over time, not less." },
    { q: "Can CRO work without a high-volume traffic site?", a: "Yes, though the approach differs. For low-traffic sites (fewer than 5,000 sessions per month), we use qualitative research, heatmaps, session recordings, user interviews, and expert UX review, to generate high-confidence hypotheses. These are then implemented as direct changes rather than A/B tests, with before-and-after measurement over 30 to 60 day windows. This approach produces reliable improvements without requiring statistical testing infrastructure." },
    { q: "How does CRO interact with SEO and paid advertising?", a: "CRO multiplies the ROI of every other channel. Higher landing page conversion rate means lower CPA from paid search, more leads from the same organic traffic volume, and better email signup rates from the same social following. We typically recommend running a CRO audit alongside any new paid search campaign launch, the average landing page improvement reduces first-quarter CPA by 25 to 40% before bidding optimizations even take effect." }
];

const RELATED = [
    { title: "PPC and Paid Search", href: "/marketing-services/ppc", desc: "Higher landing page conversion directly lowers your PPC cost per acquisition.", icon: "💰" },
    { title: "Analytics and Attribution", href: "/marketing-services/analytics", desc: "GA4 funnel analysis surfaces the exact drop-off points to test first.", icon: "📊" },
    { title: "UI/UX Design", href: "/ui-ux-design", desc: "UX research and design principles inform every CRO hypothesis we test.", icon: "🎨" }
];

export default function CroPage() {
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
          <li className="text-slate-400">Conversion Rate Optimization</li>
        </ol>
      </nav>

      <PageHeader
        label="Conversion Rate Optimization"
        title="CRO Services That Turn Existing Traffic Into More Leads and Revenue"
        subtitle="Every US business spending money on traffic is also losing money to poor conversion rate. A 1-percentage-point improvement in conversion rate produces the same revenue as doubling your traffic, at zero additional acquisition cost. HotBot Studios runs structured A/B testing, heatmap analysis, and landing page redesigns that compound conversion gains month over month."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Conversion Rate Optimization (CRO):</strong>{" "}
              Conversion rate optimization (CRO) is the systematic process of improving the percentage of website visitors who complete a desired action, a form submission, purchase, trial signup, or phone call. CRO combines qualitative user research (heatmaps, session recordings, user interviews) with quantitative A/B testing to identify why visitors leave without converting and to validate improvements before full deployment. For US businesses, effective CRO multiplies the return from every existing traffic source without increasing acquisition spend.
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
        <div key="Heatmap and Session Recording Analysis" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🔥`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Heatmap and Session Recording Analysis`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Hotjar, Microsoft Clarity, and FullStory analysis of user click patterns, scroll depth, and session recordings. Identify exactly where users drop off, which CTAs are ignored, and which page elements create confusion, before writing a single line of test code.`}</p>
        </div>
        <div key="A/B and Multivariate Testing" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🧪`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`A/B and Multivariate Testing`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Hypothesis-driven A/B tests on headlines, CTAs, form layouts, pricing presentation, hero images, and page structure. Statistical significance thresholds enforced (minimum 95% confidence) before declaring winners. Testing via Google Optimize, VWO, or Optimizely.`}</p>
        </div>
        <div key="Landing Page Redesign" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`📄`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Landing Page Redesign`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Full landing page design and copy overhaul based on conversion research. Message-match optimization (ad creative → landing page headline alignment), trust signal placement, social proof positioning, and CTA hierarchy restructuring.`}</p>
        </div>
        <div key="Form and Checkout Optimization" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📋`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Form and Checkout Optimization`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Lead form field reduction, multi-step form conversion, progressive profiling implementation, and checkout flow streamlining. Every additional required field reduces conversion rate, we find the minimum effective field set for your qualification needs.`}</p>
        </div>
        <div key="Mobile Experience Optimization" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`📱`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Mobile Experience Optimization`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Mobile conversion rates typically lag desktop by 40 to 60%. Mobile-specific UX audit covering tap target sizing, load speed, form input friction, and mobile checkout flow. Mobile-first redesign where gaps are significant.`}</p>
        </div>
        <div key="Page Speed and Core Web Vitals" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`🚀`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Page Speed and Core Web Vitals`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`LCP, CLS, and INP optimization through image compression, code splitting, render-blocking elimination, and CDN configuration. A 1-second page speed improvement produces 7% higher conversion rate, measurable and repeatable.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="PPC Advertisers" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`PPC Advertisers`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Rising CPCs make it harder to generate leads within target CPA from Google and Meta ads. Landing page conversion rate is the fastest lever to pull.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Landing page audit identifies message mismatch between ad creative and landing page headline. CTA restructuring, social proof addition, and form simplification validated through A/B test. Average 30 to 50% CPA improvement within 60 days.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#3b82f6" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`High cart abandonment rate (industry average 70%+) and poor mobile checkout conversion draining recoverable revenue.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Checkout flow audit identifies friction points: required account creation, unexpected shipping costs, limited payment options. Mobile checkout redesign, guest checkout implementation, and trust badge optimization validated through split testing.`}</p>
        </div>
        <div key="B2B SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`B2B SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`High-quality traffic from SEO and paid channels not converting to trial signups at a rate that justifies traffic cost.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Pricing page and trial signup form optimization. Value proposition clarity testing, social proof reordering (logos, case study highlights), and CTA copy testing. Pricing page conversion improvements typically contribute \$100K+ incremental ARR at scale.`}</p>
        </div>
        <div key="Lead Generation Businesses" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`Lead Generation Businesses`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Website visitors browsing multiple service pages but not submitting inquiry forms, high engagement but low conversion.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Exit-intent modal testing, chatbot trigger configuration, and form field reduction. Trust signal audit (testimonials, certifications, guarantees) with placement testing. Lead magnet introduction as lower-commitment conversion point for undecided visitors.`}</p>
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
          <li className="text-slate-300 text-sm">{String.raw`Overall website conversion rate (baseline vs. current)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Landing page conversion rate by traffic source`}</li>
          <li className="text-slate-300 text-sm">{String.raw`A/B test win rate and average uplift per test`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Form submission rate and field completion drop-off`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Mobile vs. desktop conversion rate gap`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Revenue per session (e-commerce) or leads per 1,000 sessions (B2B)`}</li>
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
            <span>{String.raw`A 1-percentage-point conversion rate improvement delivers the same revenue impact as doubling traffic, at zero additional acquisition cost`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`CRO multiplies the ROI of every other marketing channel: same traffic, more leads; same ad spend, lower CPA`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Heatmaps and session recordings identify why visitors are not converting before any test code is written, research-first approach prevents wasted test cycles`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Statistical significance gates (95% confidence minimum) ensure only real improvements are deployed, not random variation mistaken for signal`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Mobile conversion optimization is typically the highest-impact opportunity, mobile sessions convert at 40 to 60% below desktop across most industries`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`CRO is a compounding program: 3 to 5 validated improvements per quarter build on each other, accelerating gains over time`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Get a Free CRO Audit"
        subtitle="We will install heatmaps, analyze your highest-traffic pages, and deliver a prioritized list of conversion improvements, specific, actionable, ranked by revenue impact."
        formType="get-started"
      />
    </>
  );
}
