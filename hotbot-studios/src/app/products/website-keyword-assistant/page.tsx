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
  title: "Website Keyword Assistant — AI On-Page SEO Intelligence for US Businesses | HotBot Studios",
  description: "Daily AI-powered keyword gap analysis and on-page SEO recommendations using live Google Search Console data. No analyst required. Surfaces the exact content gaps costing you organic traffic.",
  keywords: [
    "on-page SEO analysis tool USA",
    "keyword gap analysis software",
    "AI content recommendations for SEO",
    "Google Search Console automation",
    "automated SEO recommendations",
    "website keyword monitoring tool B2B",
    "SEO intelligence widget for websites",
    "daily keyword ranking tracker USA"
  ],
  openGraph: {
    title: "Website Keyword Assistant — AI On-Page SEO Intelligence for US Businesses | HotBot Studios",
    description: "Daily AI-powered keyword gap analysis and on-page SEO recommendations using live Google Search Console data. No analyst required. Surfaces the exact content gaps costing you organic traffic.",
    url: "https://hotbotstudios.com/products/website-keyword-assistant",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Website Keyword Assistant: Daily AI SEO Intelligence Without the Analyst Overhead" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Keyword Assistant — AI On-Page SEO Intelligence for US Businesses | HotBot Studios",
    description: "Daily AI-powered keyword gap analysis and on-page SEO recommendations using live Google Search Console data. No analyst required. Surfaces the exact content gaps costing you organic traffic.",
  },
  alternates: { canonical: "https://hotbotstudios.com/products/website-keyword-assistant" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Website Keyword Assistant: Daily AI SEO Intelligence Without the Analyst Overhead",
  "description": "Daily AI-powered keyword gap analysis and on-page SEO recommendations using live Google Search Console data. No analyst required. Surfaces the exact content gaps costing you organic traffic.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OnlineOnly"
  },
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "url": "https://hotbotstudios.com/products/website-keyword-assistant",
  "featureList": "Daily Keyword Gap Scan, SERP Position Tracking, On-Page Optimization Queue, Competitor Keyword Monitoring, Weekly Priority Action Queue, Google Search Console Integration"
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
      "name": "AI Automation",
      "item": "https://hotbotstudios.com/ai-automation"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Website Keyword Assistant",
      "item": "https://hotbotstudios.com/products/website-keyword-assistant"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does the Website Keyword Assistant replace tools like SEMrush or Ahrefs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It complements rather than replaces them. Enterprise SEO platforms provide broad keyword research and backlink data. The Website Keyword Assistant is purpose-built for continuous on-page monitoring and weekly actionable recommendations using your first-party Search Console data. It fills the gap between expensive platform subscriptions and day-to-day execution for teams without dedicated SEO analysts."
      }
    },
    {
      "@type": "Question",
      "name": "How does the assistant access my website data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It connects to your Google Search Console account via Google API with read-only permissions. It does not require access to your CMS, codebase, or hosting environment. Setup takes under 5 minutes and requires only a Google account login."
      }
    },
    {
      "@type": "Question",
      "name": "How often does it update its recommendations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Daily scans run every 24 hours and flag new issues as they occur. The weekly priority action queue consolidates daily findings into a single prioritized list delivered every Monday. You receive alerts for significant ranking drops (3 or more positions) within 48 hours of detection."
      }
    },
    {
      "@type": "Question",
      "name": "Can it track multiple websites?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The assistant supports multiple Google Search Console properties, making it suitable for agencies managing multiple client accounts or businesses with multiple web properties. Each property receives its own weekly report and competitor tracking configuration."
      }
    }
  ]
};

const STATS = [
    { value: 24, suffix: "hr", label: "Scan Frequency", color: "#8b5cf6" },
    { value: 80, suffix: "%", label: "Reduction in Manual SEO Audit Time", color: "#3b82f6" },
    { value: 5, suffix: " sites", label: "Competitor Domains Tracked Simultaneously", color: "#06b6d4" },
    { value: 10, suffix: " actions", label: "Weekly Priority Recommendations Delivered", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Google Search Console Connection", desc: "Connect your Google Search Console account in under 5 minutes. The assistant begins pulling your historical impression, click, and ranking data immediately.", icon: "🔗" },
    { n: 2, title: "Baseline Audit and Competitor Setup", desc: "The system runs an initial full-site audit within 24 hours. You configure up to 5 competitor domains to track. Baseline rankings and gap analysis are delivered as your first weekly report.", icon: "📊" },
    { n: 3, title: "Daily Monitoring Activated", desc: "Daily scans begin automatically. The assistant monitors ranking movements, new competitor content, and on-page signal changes across your entire indexed URL set.", icon: "⚙️" },
    { n: 4, title: "Weekly Action Queue Delivery", desc: "Every Monday, you receive a prioritized action list with specific page URLs, recommended changes, and estimated traffic impact. Assign items directly to your team or marketing agency.", icon: "📬" }
];

const FAQS = [
    { q: "Does the Website Keyword Assistant replace tools like SEMrush or Ahrefs?", a: "It complements rather than replaces them. Enterprise SEO platforms provide broad keyword research and backlink data. The Website Keyword Assistant is purpose-built for continuous on-page monitoring and weekly actionable recommendations using your first-party Search Console data. It fills the gap between expensive platform subscriptions and day-to-day execution for teams without dedicated SEO analysts." },
    { q: "How does the assistant access my website data?", a: "It connects to your Google Search Console account via Google API with read-only permissions. It does not require access to your CMS, codebase, or hosting environment. Setup takes under 5 minutes and requires only a Google account login." },
    { q: "How often does it update its recommendations?", a: "Daily scans run every 24 hours and flag new issues as they occur. The weekly priority action queue consolidates daily findings into a single prioritized list delivered every Monday. You receive alerts for significant ranking drops (3 or more positions) within 48 hours of detection." },
    { q: "Can it track multiple websites?", a: "Yes. The assistant supports multiple Google Search Console properties, making it suitable for agencies managing multiple client accounts or businesses with multiple web properties. Each property receives its own weekly report and competitor tracking configuration." }
];

const RELATED = [
    { title: "Telegram SEO Assistant", href: "/products/telegram-seo-assistant", desc: "Daily SEO ranking briefings delivered directly to Telegram. No dashboards to check.", icon: "📱" },
    { title: "SEO Services", href: "/digital-marketing/seo-services", desc: "Full-service technical and content SEO strategy for US B2B businesses.", icon: "🔎" },
    { title: "GA4 Analytics", href: "/digital-marketing/marketing-analytics", desc: "Attribution setup and reporting to connect SEO performance to revenue outcomes.", icon: "📊" }
];

export default function WebsiteKeywordAssistantPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
          <li><Link href="/ai-automation" className="hover:text-slate-300 transition-colors">AI Automation</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">Website Keyword Assistant</li>
        </ol>
      </nav>

      <PageHeader
        label="AI SEO Tool"
        title="Website Keyword Assistant: Daily AI SEO Intelligence Without the Analyst Overhead"
        subtitle="Your website is losing organic traffic to keyword gaps you have not identified yet. The Website Keyword Assistant runs a daily scan against live Google Search Console data, surfaces the exact pages and phrases losing ranking ground, and delivers a prioritized action list your team can execute without an SEO analyst. No tool subscriptions to manage. No weekly audits to schedule. The intelligence comes to you every morning."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Website Keyword Assistant:</strong>{" "}
              The Website Keyword Assistant is an AI-powered SEO analysis tool that continuously monitors your website for keyword ranking opportunities, content gaps, and on-page optimization deficiencies. It runs automated daily scans using live Google Search Console data and surfaces actionable recommendations ranked by estimated traffic and revenue impact, designed for US B2B businesses that need SEO performance visibility without dedicated analyst resources.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Core Capabilities</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div key="Daily Keyword Gap Scan" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🔍`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Daily Keyword Gap Scan`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Compares your current content against top-ranking competitors for every target keyword in your market. Surfaces gaps between your existing pages and what Google rewards in your niche. Updated every 24 hours using live SERP data.`}</p>
        </div>
        <div key="SERP Position Tracking" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`📈`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`SERP Position Tracking`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Monitors keyword rankings across Google US results daily. Flags positions that dropped more than 3 spots since the prior week and identifies pages gaining momentum that warrant additional internal link support.`}</p>
        </div>
        <div key="On-Page Optimization Queue" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🎯`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`On-Page Optimization Queue`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Analyzes title tags, meta descriptions, H1 structure, semantic keyword density, and internal anchor text across your site. Delivers a prioritized fix list ranked by estimated click-through improvement per change.`}</p>
        </div>
        <div key="Competitor Keyword Monitoring" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`👁️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Competitor Keyword Monitoring`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Tracks up to 5 competitor domains and alerts you when they publish new content targeting your primary keywords or gain significant ranking ground in your target categories. Know before your traffic drops.`}</p>
        </div>
        <div key="Weekly Priority Action Queue" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`📋`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Weekly Priority Action Queue`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Consolidates daily scan findings into a weekly priority list of the 10 highest-impact actions ranked by estimated traffic recovery. Delivered to your inbox every Monday morning, ready to assign.`}</p>
        </div>
        <div key="Google Search Console Integration" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Google Search Console Integration`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Connects directly to your Google Search Console account for first-party impression and click data. All recommendations are based on your actual Google performance data, not third-party approximations.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Industry Use Cases</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="B2B SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#8b5cf6" }}>{String.raw`B2B SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Organic search is a primary acquisition channel but internal teams lack time for weekly SEO audits across a growing content library.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Daily scans surface the highest-impact keyword gaps and declining pages. Engineering and marketing teams receive a single prioritized list each week rather than managing SEO tools manually.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#3b82f6" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Product and category pages lose rankings to competitors who update content faster and build more relevant internal link structures.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`The assistant identifies which product pages are losing ground, which competitor pages outrank them, and the exact on-page changes needed to close the gap.`}</p>
        </div>
        <div key="Professional Services Firms" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#06b6d4" }}>{String.raw`Professional Services Firms`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Website content ages quickly in fast-moving sectors. Service pages that ranked 12 months ago now appear on page 2 or 3 without obvious explanation.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Daily monitoring detects ranking declines within 48 hours of occurrence. Recommendations include semantic content additions that match current SERP intent signals.`}</p>
        </div>
        <div key="Marketing Agencies" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#22c55e" }}>{String.raw`Marketing Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Managing SEO performance reporting across multiple client accounts requires significant analyst time each week.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Connect multiple client Google Search Console accounts. Generate per-client priority reports automatically. Reduce time spent on SEO reporting by an estimated 4 to 6 hours per client per month.`}</p>
        </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="How We Deploy" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Track</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Number of keyword gaps identified per audit cycle`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Pages recovered from position decline per month`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Organic click-through rate improvement on optimized pages`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Competitor ranking gap reduction over 90 days`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Time saved on weekly SEO reporting (hours per month)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Organic traffic growth attributed to assistant recommendations`}</li>
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
            <span>{String.raw`Daily scans using your actual Google Search Console data surface keyword gaps and ranking declines within 48 hours`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Weekly priority action queues replace manual SEO audits and reduce analyst overhead by an estimated 80 percent`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Competitor monitoring tracks up to 5 domains and alerts you to new content targeting your keywords`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`On-page optimization recommendations cover title tags, meta descriptions, H1 structure, and internal anchor text`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Setup requires only a Google Search Console connection and takes under 5 minutes`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Suitable for single-site teams and agencies managing multiple client properties`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="See What Your Site Is Missing"
        subtitle="Connect your Google Search Console account and receive your first keyword gap report within 24 hours. No credit card required for the initial audit."
        formType="get-started"
      />
    </>
  );
}
