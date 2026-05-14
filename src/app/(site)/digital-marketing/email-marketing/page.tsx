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
  title: "Email Marketing and Automation Services USA | HotBot Studios",
  description: "HubSpot, Klaviyo, and Mailchimp email marketing setup and management for US businesses. Automated sequences, drip campaigns, and behavioral triggers that convert and retain customers.",
  keywords: [
    "email marketing agency USA",
    "HubSpot email marketing setup",
    "Klaviyo email automation",
    "Mailchimp management services",
    "drip campaign setup USA",
    "email automation for B2B",
    "behavioral email triggers",
    "email marketing ROI USA",
    "newsletter marketing services",
    "email list growth strategy USA"
  ],
  openGraph: {
    title: "Email Marketing and Automation Services USA | HotBot Studios",
    description: "HubSpot, Klaviyo, and Mailchimp email marketing setup and management for US businesses. Automated sequences, drip campaigns, and behavioral triggers that convert and retain customers.",
    url: "https://hotbotstudios.com/digital-marketing/email-marketing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Email Marketing and Automation That Converts Leads and Retains Customers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Marketing and Automation Services USA | HotBot Studios",
    description: "HubSpot, Klaviyo, and Mailchimp email marketing setup and management for US businesses. Automated sequences, drip campaigns, and behavioral triggers that convert and retain customers.",
  },
  alternates: { canonical: "https://hotbotstudios.com/digital-marketing/email-marketing" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Email Marketing and Automation That Converts Leads and Retains Customers",
  "description": "HubSpot, Klaviyo, and Mailchimp email marketing setup and management for US businesses. Automated sequences, drip campaigns, and behavioral triggers that convert and retain customers.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "Email Marketing and Automation",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/digital-marketing/email-marketing"
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
      "name": "Email Marketing and Automation",
      "item": "https://hotbotstudios.com/digital-marketing/email-marketing"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which email platform do you work with?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We work with HubSpot, Klaviyo, Mailchimp, ActiveCampaign, Brevo (formerly Sendinblue), and ConvertKit. Platform recommendation depends on your business model: Klaviyo for e-commerce brands, HubSpot for B2B companies with CRM integration requirements, Mailchimp for early-stage businesses with simpler automation needs. We can migrate platforms if your current choice is limiting your program."
      }
    },
    {
      "@type": "Question",
      "name": "How do you improve email deliverability?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Deliverability is determined by three factors: technical authentication (DMARC, DKIM, SPF records), sender reputation (complaint rate and engagement rate history), and list quality (percentage of valid, engaged addresses). We configure authentication on day one, implement list hygiene protocols to remove invalid addresses, and use sunset campaigns to suppress chronically unengaged subscribers before they damage sender score."
      }
    },
    {
      "@type": "Question",
      "name": "Can email marketing work for B2B with long sales cycles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Email is one of the most effective B2B nurture channels precisely because of long sales cycles. A structured 12-week nurture sequence keeps your brand present during the buying process without requiring sales rep touchpoints for every prospect. Behavioral triggers that alert sales when a prospect re-engages with email (opens three emails in one week, clicks a pricing link) convert warm intent signals into timely outreach at exactly the right moment."
      }
    },
    {
      "@type": "Question",
      "name": "How do you grow an email list for a business starting from zero?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "List growth requires a value exchange: a lead magnet, newsletter promise, or gated content that is compelling enough to earn an email address. We develop opt-in strategy, create landing pages for lead magnet delivery, configure opt-in forms optimized for conversion, and integrate list growth across SEO, paid, and social channels. Organic list growth through owned channels produces higher engagement rates than purchased lists, which we never recommend."
      }
    }
  ]
};

const STATS = [
    { value: 36, suffix: "\$", label: "Average Return Per \$1 of Email Spend", color: "#22c55e" },
    { value: 35, suffix: "%+", label: "Target Open Rate on Managed Lists", color: "#3b82f6" },
    { value: 95, suffix: "%+", label: "Inbox Delivery Rate Standard", color: "#8b5cf6" },
    { value: 8, suffix: " weeks", label: "Full Automation Stack Live Timeline", color: "#f59e0b" }
];

const PROCESS = [
    { n: 1, title: "Email Audit and Platform Setup", desc: "Audit existing email program (or configure new platform), verify domain authentication, import and segment existing list, and map automation triggers to customer journey stages.", icon: "🔍" },
    { n: 2, title: "Sequence Architecture and Copywriting", desc: "Design email sequence logic, write all copy, create subject line variants for A/B testing, and develop visual templates aligned with brand guidelines.", icon: "✍️" },
    { n: 3, title: "Build, Test, and Launch", desc: "Build automations in HubSpot, Klaviyo, or Mailchimp. QA test all triggers, links, and personalization tokens. Deliverability test across email clients before launch.", icon: "🚀" },
    { n: 4, title: "Optimization and List Growth", desc: "Monthly performance review: open rates, click rates, conversion rates, and revenue per email. Continuous subject line testing, send time optimization, and list segmentation refinement.", icon: "📈" }
];

const FAQS = [
    { q: "Which email platform do you work with?", a: "We work with HubSpot, Klaviyo, Mailchimp, ActiveCampaign, Brevo (formerly Sendinblue), and ConvertKit. Platform recommendation depends on your business model: Klaviyo for e-commerce brands, HubSpot for B2B companies with CRM integration requirements, Mailchimp for early-stage businesses with simpler automation needs. We can migrate platforms if your current choice is limiting your program." },
    { q: "How do you improve email deliverability?", a: "Deliverability is determined by three factors: technical authentication (DMARC, DKIM, SPF records), sender reputation (complaint rate and engagement rate history), and list quality (percentage of valid, engaged addresses). We configure authentication on day one, implement list hygiene protocols to remove invalid addresses, and use sunset campaigns to suppress chronically unengaged subscribers before they damage sender score." },
    { q: "Can email marketing work for B2B with long sales cycles?", a: "Email is one of the most effective B2B nurture channels precisely because of long sales cycles. A structured 12-week nurture sequence keeps your brand present during the buying process without requiring sales rep touchpoints for every prospect. Behavioral triggers that alert sales when a prospect re-engages with email (opens three emails in one week, clicks a pricing link) convert warm intent signals into timely outreach at exactly the right moment." },
    { q: "How do you grow an email list for a business starting from zero?", a: "List growth requires a value exchange: a lead magnet, newsletter promise, or gated content that is compelling enough to earn an email address. We develop opt-in strategy, create landing pages for lead magnet delivery, configure opt-in forms optimized for conversion, and integrate list growth across SEO, paid, and social channels. Organic list growth through owned channels produces higher engagement rates than purchased lists, which we never recommend." }
];

const RELATED = [
    { title: "SEO Services", href: "/digital-marketing/seo", desc: "SEO drives the organic traffic that feeds your email list with qualified subscribers.", icon: "🔍" },
    { title: "CRO, Conversion Rate Optimization", href: "/digital-marketing/cro", desc: "Higher opt-in page conversion rates grow your list faster from the same traffic.", icon: "🎯" },
    { title: "Analytics and Attribution", href: "/digital-marketing/analytics", desc: "Email revenue attribution in GA4 and CRM to measure full-funnel ROI.", icon: "📊" }
];

export default function EmailMarketingPage() {
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
          <li className="text-slate-400">Email Marketing and Automation</li>
        </ol>
      </nav>

      <Breadcrumb items={[{ label: "Digital Marketing", href: "/digital-marketing" }, { label: "Email Marketing" }]} />

      <PageHeader
        label="Email Marketing and Automation"
        title="Email Marketing and Automation That Converts Leads and Retains Customers"
        subtitle="Email delivers an average \$36 for every \$1 spent, but only when sequences are built around buyer behavior, not generic blast cadences. HotBot Studios designs, builds, and manages email programs across HubSpot, Klaviyo, and Mailchimp that move leads through the funnel and retain customers past first purchase."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#22c55e08", borderColor: "#22c55e20" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Email Marketing Automation:</strong>{" "}
              Email marketing automation is the process of sending behavior-triggered or time-based email sequences to prospects and customers automatically, without manual sending. For US businesses, effective email automation means the right message reaches the right person at the right moment in their buying journey: from initial lead magnet welcome sequences through post-purchase retention flows. Automated email consistently outperforms broadcast campaigns on open rate, click rate, and revenue per recipient.
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
        <div key="Welcome and Onboarding Sequences" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`🔄`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Welcome and Onboarding Sequences`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`First-impression email sequences triggered on signup, trial start, or purchase. Structured to deliver immediate value, establish trust, and guide new subscribers toward their first meaningful product interaction or purchase decision.`}</p>
        </div>
        <div key="Behavioral Trigger Campaigns" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🎯`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Behavioral Trigger Campaigns`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Emails triggered by specific website actions: page visits, content downloads, pricing page views, abandoned carts, and form partial completions. Behavioral triggers convert 3 to 5x better than time-based sequences alone.`}</p>
        </div>
        <div key="Lead Nurture Drip Campaigns" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`💧`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Lead Nurture Drip Campaigns`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Multi-touch email sequences educating prospects through the buying journey. Content mapped to funnel stage: awareness (educational), consideration (comparison), and decision (proof and offer). Average 8 to 12 email sequence per funnel stage.`}</p>
        </div>
        <div key="Abandoned Cart and Winback Flows" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🛒`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Abandoned Cart and Winback Flows`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Revenue recovery sequences for e-commerce: abandoned cart (3-email sequence at 1h, 24h, 72h), browse abandonment, post-purchase upsell, and winback campaigns for lapsed customers. Average 15 to 25% revenue recovery rate.`}</p>
        </div>
        <div key="Newsletter and Broadcast Strategy" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📰`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Newsletter and Broadcast Strategy`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Weekly or bi-weekly newsletters positioned as genuine business intelligence resources, not promotional blasts. Subject line A/B testing, send time optimization, and segment-based personalization for consistent open rates above 35%.`}</p>
        </div>
        <div key="Deliverability and List Health" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Deliverability and List Health`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Domain authentication (DMARC, DKIM, SPF), list hygiene protocols, suppression list management, and sender reputation monitoring. Deliverability above 95% inbox placement rate maintained as a baseline standard.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="B2B SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#22c55e" }}>{String.raw`B2B SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Free trial users not converting to paid because there is no structured onboarding or activation email sequence.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Trial activation sequence: feature spotlight emails timed to in-app behavior, milestone celebration triggers (first project created, first team member invited), and conversion nudge sequence in final 72 hours of trial. Integrated with product analytics for behavior-based branching.`}</p>
        </div>
        <div key="E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#3b82f6" }}>{String.raw`E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`One-time buyers not returning, high acquisition cost not justified without repeat purchase.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Post-purchase sequence with product education, related product recommendation (day 7 and day 21), and loyalty offer (day 45). Winback sequence at 90-day inactivity with progressive discount offer. Average 20 to 30% repeat purchase rate improvement.`}</p>
        </div>
        <div key="Professional Services Firms" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`Professional Services Firms`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Long sales cycles mean leads go cold between initial inquiry and decision, no structured nurture program keeps them warm.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Inquiry response sequence with case study delivery, thought leadership content drip, and soft CTA check-in at day 14 and day 30. Behavioral triggers detect re-engagement (email opens, website return visits) and alert sales for follow-up.`}</p>
        </div>
        <div key="Content and Media Brands" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`Content and Media Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Newsletter subscriber growth has plateaued and open rates are declining due to list age and topic fatigue.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`List re-engagement campaign, segment migration to interest-based sublists, and newsletter repositioning with new content format. Inactive subscribers managed through sunset protocol to protect deliverability.`}</p>
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
            style={{ background: "#22c55e05", borderColor: "#22c55e18" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Open rate by sequence and email (target: 35%+)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Click-through rate by email and CTA`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Email-attributed conversion rate and revenue`}</li>
          <li className="text-slate-300 text-sm">{String.raw`List growth rate (new subscribers per month)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Unsubscribe and spam complaint rate`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Inbox deliverability rate (target: 95%+)`}</li>
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
            <span>{String.raw`Email delivers \$36 return per \$1 spent, the highest ROI of any digital marketing channel when managed with proper segmentation and automation`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Behavioral triggers (website visits, in-app actions, cart abandonment) outperform time-based sequences by 3 to 5x on conversion rate`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Deliverability is configured from day one, domain authentication and list hygiene prevent inbox placement from degrading over time`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Platform choice is matched to business model, Klaviyo for e-commerce, HubSpot for B2B CRM integration, Mailchimp for early-stage simplicity`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`B2B nurture sequences keep prospects engaged across 60 to 180-day buying cycles without requiring constant sales rep involvement`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`List growth is built through owned channels and value exchange, purchased lists destroy deliverability and are never used`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Get a Free Email Marketing Audit"
        subtitle="We will review your current email program, identify gaps in your automation stack, and show you the revenue your sequences are leaving on the table."
        formType="get-started"
      />
    </>
  );
}
