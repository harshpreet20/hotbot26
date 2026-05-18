import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Highlight } from "@/components/shared/Highlight";
import { ContentBlock } from "@/components/shared/ContentBlock";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";
import { PersonalizationWidget } from "@/components/marketing/PersonalizationWidget";
import { ABTestingWidget } from "@/components/marketing/ABTestingWidget";
import { CollaborationWidget } from "@/components/marketing/CollaborationWidget";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Digital Marketing Services USA - SEO, PPC & Social Media | HotBot Studios",
  description:
    "HotBot Studios delivers ROI-driven digital marketing for US businesses: SEO, Google Ads, Meta Ads, social media marketing, email automation, and CRO. Average 3× ROAS. Free marketing audit - no strings.",
  keywords: [
    "digital marketing agency USA",
    "SEO services for US businesses",
    "PPC management agency USA",
    "Google Ads agency USA",
    "Meta Ads management",
    "social media marketing agency",
    "email marketing automation USA",
    "conversion rate optimization agency",
    "performance marketing agency USA",
    "digital marketing ROI",
    "B2B digital marketing USA",
    "ecommerce marketing agency USA",
    "marketing analytics GA4",
    "HubSpot marketing agency",
  ],
  openGraph: {
    title: "Digital Marketing Agency USA - SEO, PPC & Social Media | HotBot Studios",
    description: "ROI-driven digital marketing for US businesses. SEO, Google Ads, Meta Ads, social media, email automation & CRO. Average 3× ROAS. Free marketing audit.",
    url: "https://hotbotstudios.com/digital-marketing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Digital Marketing Agency USA - HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Marketing Agency USA | HotBot Studios",
    description: "SEO, PPC, social media & email marketing for US businesses. 3× avg ROAS. Free audit.",
  },
  alternates: { canonical: "https://hotbotstudios.com/digital-marketing" },
};

// ── Schema Markup ───────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "HotBot Studios - Digital Marketing Services",
  url: "https://hotbotstudios.com/digital-marketing",
  description: "Full-service digital marketing including SEO, Google Ads, Meta Ads, social media marketing, email automation, and CRO for US businesses. Average 3× ROAS.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Digital Marketing",
  priceRange: "$$-$$$",
  telephone: "+91-9700001534",
  email: "hotbotstudios@gmail.com",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Digital Marketing", item: "https://hotbotstudios.com/digital-marketing" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How long before I see results from digital marketing?", acceptedAnswer: { "@type": "Answer", text: "SEO typically takes 3–6 months for significant organic ranking improvements. Google Ads and Meta Ads can drive qualified leads within 48–72 hours of launch. HotBot Studios sets realistic expectations and KPIs from day one with weekly dashboards." } },
    { "@type": "Question", name: "What is HotBot Studios' minimum digital marketing retainer?", acceptedAnswer: { "@type": "Answer", text: "Digital marketing retainers at HotBot Studios start at $2,500/month. Project-based work is available for one-off campaigns, audits, or website SEO fixes." } },
    { "@type": "Question", name: "How do you measure digital marketing ROI?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios tracks revenue, ROAS (Return on Ad Spend), Cost Per Acquisition (CPA), and lead quality from day one. You get weekly performance dashboards (GA4, Looker Studio) and monthly strategy reviews." } },
  ],
};

// ── Content Data ─────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "🔍", title: "SEO & Content Marketing", desc: "Technical SEO audits, on-page optimization, keyword strategy, and link building that ranks your site for high-value search terms on Google. Includes GA4, Google Search Console, and Core Web Vitals optimization.", href: "/digital-marketing/seo-services" },
  { icon: "📱", title: "Social Media Marketing", desc: "Platform-native strategies for Instagram, LinkedIn, X (Twitter), TikTok, and Facebook that build engaged communities and convert followers into customers. Includes content creation and community management.", href: "/digital-marketing/social-media-marketing" },
  { icon: "💰", title: "PPC & Paid Ads (Google + Meta)", desc: "Google Ads (Search, Display, Shopping, YouTube) and Meta Ads (Facebook, Instagram) campaigns managed for maximum ROAS using AI-powered bidding strategies and continuous A/B testing.", href: "/digital-marketing/ppc-management" },
  { icon: "📧", title: "Email Marketing & Automation", desc: "Automated email sequences, drip campaigns, newsletters, and behavioral triggers via HubSpot, Klaviyo, or Mailchimp. Convert and retain customers at every stage of the funnel.", href: "/digital-marketing/email-marketing" },
  { icon: "📊", title: "Analytics & Attribution (GA4)", desc: "GA4 setup, custom Looker Studio dashboards, and multi-touch attribution modelling to understand exactly which channels drive revenue - and which are wasting budget.", href: "/digital-marketing/marketing-analytics" },
  { icon: "🎯", title: "Conversion Rate Optimization (CRO)", desc: "A/B testing, landing page redesigns, heatmap analysis (Hotjar), and UX improvements that turn more of your existing traffic into leads and paying customers.", href: "/digital-marketing/conversion-rate-optimization" },
];

const STATS = [
  { value: 200, suffix: "%", label: "Average Conversion Increase", color: "#3b82f6" },
  { value: 3, suffix: "x", label: "Average ROAS", color: "#8b5cf6" },
  { value: 85, suffix: "%", label: "Client Retention Rate", color: "#22c55e" },
  { value: 150, suffix: "+", label: "Campaigns Managed", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Marketing Audit & Strategy", desc: "Deep-dive into your current marketing performance, competitor landscape, audience segments, and channel mix. Delivered as a prioritized growth roadmap with clear budget recommendations.", icon: "🔍" },
  { n: 2, title: "Channel Selection & Setup", desc: "Identify the highest-ROI channels for your specific business model, audience, and budget. Set up tracking, attribution (GA4 + GTM), and campaign infrastructure.", icon: "📍" },
  { n: 3, title: "Campaign Launch & Testing", desc: "Launch campaigns across all selected channels simultaneously with A/B tests on creative, copy, audiences, and landing pages from week one.", icon: "🚀" },
  { n: 4, title: "Optimize, Scale & Report", desc: "Weekly optimization cycles - cut waste, double down on winners, and scale profitably. Monthly strategy reviews with full attribution reporting.", icon: "📈" },
];

const FAQS = [
  { q: "How long before I see digital marketing results?", a: "SEO takes 3–6 months for significant ranking improvements. Google Ads and Meta Ads drive qualified leads within 48–72 hours of launch. We set realistic KPIs from day one and show you exactly where your budget is going via weekly GA4 dashboards." },
  { q: "Which industries do you specialize in for digital marketing?", a: "We work across B2B SaaS, e-commerce, professional services, healthcare, fintech, and consumer brands. Our team has vertical specialists in each industry who understand the buyer journey and winning channel mix." },
  { q: "What is your minimum monthly retainer for digital marketing?", a: "Our digital marketing retainers start at $2,500/month (not including ad spend). Project-based work is available for one-off campaigns, SEO audits, or landing page optimization." },
  { q: "How do you measure and report digital marketing ROI?", a: "We track revenue, ROAS, Cost Per Acquisition (CPA), and lead quality from day one - not just clicks and impressions. You get a live Looker Studio dashboard and a monthly strategy call to review performance and adjust priorities." },
  { q: "Do you use AI in digital marketing campaigns?", a: "Yes - we use AI for campaign optimization (automated bidding), content generation (ad copy variants), audience segmentation (predictive LTV models), and performance forecasting. Our AI-augmented approach consistently outperforms manual management by 30–50% on ROAS." },
];

const RELATED = [
  { title: "Content Production", href: "/content-studio", desc: "Fuel your marketing with premium video and copy.", icon: "🎬" },
  { title: "AI Automation", href: "/ai-automation", desc: "Automate your marketing workflows with custom AI.", icon: "🤖" },
  { title: "Public Relations", href: "/public-relations", desc: "Amplify your brand with earned media coverage.", icon: "📰" },
];

export default function MarketingServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Digital Marketing", href: "/digital-marketing" }]} />

      <PageHeader
        label="Digital Marketing Agency USA"
        title="Performance Marketing That Actually Performs"
        subtitle="HotBot Studios runs data-driven SEO, Google Ads, Meta Ads, and social media campaigns engineered to turn ad spend into revenue - not just clicks. Average 3× ROAS across 150+ campaigns managed for US businesses."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Digital marketing for US businesses (definition):</strong> The use of digital channels - including Google Search, Meta (Facebook/Instagram), LinkedIn, email, SEO, and content - to attract, convert, and retain customers. Effective digital marketing in 2026 requires AI-augmented campaign management, precise audience targeting, multi-touch attribution via GA4, and continuous creative testing to achieve positive ROAS.
            </p>
          </div>
        </Reveal>
      </section>

      <ContentBlock>
        <Highlight
          icon="📈"
          title="AI-Augmented Marketing (MarTech Approach)"
          text="HotBot Studios pairs deep marketing expertise with AI tools - machine learning for campaign bid optimization, predictive analytics for smarter budget allocation, automated A/B testing at scale, and personalization that speaks to the right buyer at the right moment. Fully tracked in one GA4-connected Looker Studio dashboard. Paired with our AI automation services for complete marketing automation."
          color="#3b82f6"
        />
      </ContentBlock>

      {/* ── Infographic: Digital Marketing ROI by Channel ───────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Average Digital Marketing ROI by Channel - HotBot Studios Client Data</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { channel: "Google Search Ads", roas: "4.2×", color: "#3b82f6" },
                  { channel: "SEO (Organic)", roas: "5.8×", color: "#8b5cf6" },
                  { channel: "Meta Ads", roas: "3.1×", color: "#06b6d4" },
                  { channel: "Email Marketing", roas: "42×", color: "#22c55e" },
                  { channel: "LinkedIn Ads (B2B)", roas: "2.4×", color: "#f59e0b" },
                  { channel: "Content Marketing", roas: "6×", color: "#ec4899" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                    <div className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.roas}</div>
                    <div className="text-slate-400 text-xs font-medium">{item.channel}</div>
                    <div className="text-slate-600 text-[10px] mt-1">avg ROAS</div>
                  </div>
                ))}
              </div>
              {/* Channel mix bar */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Recommended Budget Allocation for US SMBs (Starting Mix)</p>
              <div className="flex h-8 rounded-full overflow-hidden gap-0.5">
                {[
                  { label: "Google Ads", pct: 35, color: "#3b82f6" },
                  { label: "SEO/Content", pct: 25, color: "#8b5cf6" },
                  { label: "Meta Ads", pct: 20, color: "#06b6d4" },
                  { label: "Email", pct: 10, color: "#22c55e" },
                  { label: "Other", pct: 10, color: "#f59e0b" },
                ].map((seg, i) => (
                  <div key={i} className="h-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ width: `${seg.pct}%`, background: seg.color }}
                    title={`${seg.label}: ${seg.pct}%`}>
                    {seg.pct >= 20 ? `${seg.pct}%` : ""}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {[
                  { label: "Google Ads 35%", color: "#3b82f6" },
                  { label: "SEO/Content 25%", color: "#8b5cf6" },
                  { label: "Meta Ads 20%", color: "#06b6d4" },
                  { label: "Email 10%", color: "#22c55e" },
                  { label: "Other 10%", color: "#f59e0b" },
                ].map((l, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <PersonalizationWidget />
      <ABTestingWidget />
      <CollaborationWidget />

      <SubServices services={SUB_SERVICES} title="Digital Marketing Services We Deliver" columns={3} />
      <ServiceStats stats={STATS} title="Our Track Record for US Businesses" />
      <ProcessSteps steps={PROCESS} title="How We Drive Revenue Growth" />

      {/* ── Comparison Table ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">HotBot Studios Digital Marketing vs. Other Options</h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(59,130,246,0.08)" }}>
                  <th className="text-left p-4 text-slate-300 font-semibold">Factor</th>
                  <th className="text-center p-4 text-blue-400 font-semibold">HotBot Studios</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">Freelancer</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">Large Agency</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Full-funnel strategy", "✅ All channels", "⚠️ One channel", "✅ Yes"],
                  ["AI-augmented campaigns", "✅ Built-in", "❌ Manual", "⚠️ Extra cost"],
                  ["Integrated with AI automation", "✅ Native", "❌ No", "❌ No"],
                  ["Real-time dashboards", "✅ Live GA4", "⚠️ Monthly reports", "✅ Yes"],
                  ["Monthly retainer", "$2,500+", "$500–$2,000", "$5,000–$15,000+"],
                  ["Dedicated strategist", "✅ Yes", "⚠️ Yourself", "⚠️ Account manager"],
                ].map(([factor, ours, freelance, agency], i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="p-4 text-slate-300 font-medium">{factor}</td>
                    <td className="p-4 text-center text-blue-300 font-semibold">{ours}</td>
                    <td className="p-4 text-center text-slate-400">{freelance}</td>
                    <td className="p-4 text-center text-slate-400">{agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways - Digital Marketing for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios delivers an average 3× ROAS across Google Ads, Meta Ads, and LinkedIn campaigns.",
                "SEO with technical optimization, content strategy, and link building drives compounding organic traffic growth.",
                "Email marketing consistently delivers the highest ROI of any digital channel - averaging 42× return.",
                "AI-augmented campaign management (automated bidding, predictive LTV) outperforms manual management by 30–50%.",
                "All campaigns are tracked via GA4 with multi-touch attribution so you know exactly which channels drive revenue.",
                "Pair with AI automation and content production for a fully integrated, self-improving growth system.",
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
        title="Ready to Grow Revenue With Digital Marketing?"
        subtitle="Find out exactly where your current marketing is leaking revenue - and what it would take to fix it. Free 30-min audit, no strings attached."
        formType="strategy-call"
      />
    </>
  );
}
