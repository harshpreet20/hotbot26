import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/shared/Reveal";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import Link from "next/link";
import { CompetitorAnalysisTool } from "@/components/sections/CompetitorAnalysisTool";

export const metadata: Metadata = {
  title: "AI Competitor Analysis Tool - SEO & Content Gap Intelligence | HotBot Studios",
  description:
    "Instantly analyze any competitor's SEO strategy, content gaps, keyword opportunities, and backlink profile with AI. Free analysis included. Pro subscription unlocks weekly monitoring, alerts, and AI optimization recommendations.",
  keywords: [
    "competitor SEO analysis tool",
    "AI competitor research",
    "keyword gap analysis",
    "competitor content analysis",
    "SEO competitor monitoring",
    "competitor backlink analysis",
    "AI SEO optimization tool",
    "competitor analysis software USA",
    "programmatic SEO competitor research",
    "organic search competitor intelligence",
  ],
  openGraph: {
    title: "AI Competitor Analysis Tool - SEO & Content Gap Intelligence | HotBot Studios",
    description:
      "Instantly analyze any competitor's SEO strategy, content gaps, and keyword opportunities with AI. Free analysis + Pro subscription with weekly monitoring.",
    url: "https://hotbotstudios.com/products/competitor-analysis",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI Competitor Analysis Tool - HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Competitor Analysis Tool - SEO & Content Gap Intelligence | HotBot Studios",
    description: "Instantly analyze any competitor's SEO strategy with AI. Free analysis included.",
  },
  alternates: { canonical: "https://hotbotstudios.com/products/competitor-analysis" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Competitor Analysis Tool",
  description:
    "AI-powered competitor SEO analysis covering keyword gaps, content opportunities, backlink profile, and on-page optimization strategies. Free analysis + Pro subscription.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      description: "Single competitor analysis on demand",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "49",
      priceCurrency: "USD",
      billingIncrement: "monthly",
      availability: "https://schema.org/OnlineOnly",
      description: "Weekly monitoring for 5 competitors + AI optimization playbook",
    },
  ],
  provider: {
    "@type": "Organization",
    name: "HotBot Studios",
    url: "https://hotbotstudios.com",
  },
  featureList:
    "Keyword gap analysis, Content gap discovery, Backlink profile comparison, SERP position tracking, Weekly competitor monitoring, AI optimization recommendations, Slack & email alerts",
  url: "https://hotbotstudios.com/products/competitor-analysis",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Products", item: "https://hotbotstudios.com/products" },
    { "@type": "ListItem", position: 3, name: "Competitor Analysis", item: "https://hotbotstudios.com/products/competitor-analysis" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What data does the AI competitor analysis cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tool analyzes your competitor's on-page SEO signals (title tags, meta descriptions, heading structure, keyword usage), estimated content strategy (topic clusters, publishing frequency, content depth), SERP positions for shared keywords, and identifies the keyword gaps-terms your competitors rank for that you don't.",
      },
    },
    {
      "@type": "Question",
      name: "Is the free analysis limited?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The free analysis runs a full one-time competitor audit covering keyword gaps, content opportunities, and on-page strategy. The Pro subscription ($49/month) adds continuous weekly monitoring for up to 5 competitors, automated alerts when competitors publish new content or gain/lose rankings, and a monthly AI-generated optimization playbook with prioritized action items.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the AI analysis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The AI is trained on SEO best practices from Google's Search Essentials, E-E-A-T guidelines, and thousands of real-world ranking factors. It provides directional intelligence and prioritized recommendations rather than raw data dumps-think of it as an experienced SEO strategist reviewing your competitor's site.",
      },
    },
    {
      "@type": "Question",
      name: "Does this replace tools like Ahrefs or SEMrush?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It complements them. Ahrefs and SEMrush provide raw data on backlinks and keyword volumes. Our tool interprets that data and generates actionable SEO strategy recommendations specific to your situation-saving 5–10 hours of analysis per week.",
      },
    },
    {
      "@type": "Question",
      name: "Can I analyze competitors in any niche or location?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool works for any publicly accessible website. For local SEO, specify your target location and we'll focus the analysis on geo-specific keyword opportunities and local SERP positioning.",
      },
    },
  ],
};

const PRO_FEATURES = [
  { icon: "📊", title: "Weekly Competitor Monitoring", desc: "Automatic weekly scans on up to 5 competitors. Get notified instantly when they publish new content, gain rankings, or launch new pages." },
  { icon: "🎯", title: "Keyword Gap Alerts", desc: "Get alerted the moment a competitor starts ranking for a keyword that you should own. Never miss a ranking opportunity again." },
  { icon: "🤖", title: "AI Optimization Playbook", desc: "Monthly AI-generated playbook with a prioritized list of content to create, pages to optimize, and keywords to target-based on live competitor data." },
  { icon: "🔗", title: "Backlink Gap Analysis", desc: "Identify the high-authority domains linking to your competitors but not you. Export a prioritized outreach list every month." },
  { icon: "📈", title: "Share-of-Voice Tracking", desc: "Track your organic visibility vs. top 5 competitors over time. Visualize whether you're gaining or losing market share." },
  { icon: "🔔", title: "Slack & Email Alerts", desc: "Deliver competitive intelligence directly to your Slack channel or inbox. No dashboards to check-insights come to you." },
];

export default function CompetitorAnalysisPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb
        items={[
          { label: "Products", href: "/products" },
          { label: "Competitor Analysis" },
        ]}
      />

      <PageHeader
        label="AI Competitor Analysis"
        title="See Exactly What Your Competitors Are Doing in Search"
        subtitle="Instant AI analysis of any competitor's SEO strategy-keyword gaps, content opportunities, on-page signals, and backlink profile. Free on-demand analysis. Pro unlocks weekly monitoring and AI optimization playbooks."
        gradient="Competitors"
      />

      {/* Live analysis tool */}
      <CompetitorAnalysisTool />

      {/* Free vs Pro */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Free Analysis vs. Pro Subscription
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-14">
            Run a free competitor audit anytime. Upgrade to Pro for continuous monitoring and
            AI-powered strategy recommendations.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free card */}
          <Reveal>
            <div
              className="rounded-3xl p-8 flex flex-col h-full"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Free</div>
                <div className="text-4xl font-black text-white">$0</div>
                <div className="text-slate-500 text-sm mt-1">On-demand, no account required</div>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  "Single competitor audit",
                  "Keyword gap overview",
                  "Content strategy snapshot",
                  "On-page SEO signal check",
                  "Top 10 quick-win recommendations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
                {[
                  "Weekly monitoring",
                  "Backlink gap analysis",
                  "Automated alerts",
                  "AI optimization playbook",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 flex-shrink-0">–</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="#analyze"
                  className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white border border-slate-600 hover:border-slate-400 transition-all duration-200"
                >
                  Run Free Analysis ↓
                </a>
              </div>
            </div>
          </Reveal>

          {/* Pro card */}
          <Reveal delay={0.1}>
            <div
              className="rounded-3xl p-8 flex flex-col h-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 100%)",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Most Popular
              </div>
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Pro</div>
                <div className="text-4xl font-black text-white">$49<span className="text-xl font-normal text-slate-400">/mo</span></div>
                <div className="text-slate-400 text-sm mt-1">Monitor up to 5 competitors</div>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  "Everything in Free",
                  "Weekly competitor monitoring (5 sites)",
                  "Keyword gap alerts in real time",
                  "Monthly AI optimization playbook",
                  "Backlink gap analysis & outreach list",
                  "Share-of-voice tracking dashboard",
                  "Slack & email alerts",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                >
                  Start Pro - $49/month →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pro features detail */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/50">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            What Pro Members Get Every Week
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRO_FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection
        faqs={faqSchema.mainEntity.map((e) => ({ q: e.name, a: e.acceptedAnswer.text }))}
        title="Competitor Analysis - FAQs"
      />

      <CTASection
        title="Stop Flying Blind. Know Your Competitors."
        subtitle="Run your first free AI competitor analysis in 60 seconds. No account required."
        primaryCTA="Run Free Analysis"
        secondaryCTA="Get Pro Access"
      />
    </>
  );
}
