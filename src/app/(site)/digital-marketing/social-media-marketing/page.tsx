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
  title: "Social Media Marketing Services for US Businesses | HotBot Studios",
  description: "Instagram, LinkedIn, TikTok, and X social media management for US businesses. Content strategy, community management, and paid social that builds pipeline, not just followers.",
  keywords: [
    "social media marketing agency USA",
    "LinkedIn marketing for B2B",
    "Instagram marketing services",
    "TikTok marketing for business",
    "social media management USA",
    "B2B social media agency",
    "organic social media growth",
    "social media content strategy",
    "community management services USA",
    "social media ROI for businesses"
  ],
  openGraph: {
    title: "Social Media Marketing Services for US Businesses | HotBot Studios",
    description: "Instagram, LinkedIn, TikTok, and X social media management for US businesses. Content strategy, community management, and paid social that builds pipeline, not just followers.",
    url: "https://hotbotstudios.com/digital-marketing/social-media-marketing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Social Media Marketing That Builds Brand Authority and Drives Leads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Marketing Services for US Businesses | HotBot Studios",
    description: "Instagram, LinkedIn, TikTok, and X social media management for US businesses. Content strategy, community management, and paid social that builds pipeline, not just followers.",
  },
  alternates: { canonical: "https://hotbotstudios.com/digital-marketing/social-media-marketing" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "HotBot Studios - Social Media Marketing",
  "url": "https://hotbotstudios.com/digital-marketing/social-media-marketing",
  "description": "Instagram, LinkedIn, TikTok, and X social media management for US businesses. Content strategy, community management, and paid social that builds pipeline, not just followers.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "serviceType": "Social Media Marketing",
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
      "name": "Social Media Marketing",
      "item": "https://hotbotstudios.com/digital-marketing/social-media-marketing"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which social media platforms should my business prioritize?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Platform selection depends entirely on your buyer type. B2B companies selling to mid-market and enterprise buyers should prioritize LinkedIn. Consumer brands and DTC companies typically see the best ROI from Instagram and TikTok. Professional services firms benefit from LinkedIn and X for thought leadership. We recommend based on ICP research and competitor analysis, not platform trends or personal preference."
      }
    },
    {
      "@type": "Question",
      "name": "How do you measure social media ROI for B2B?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We use UTM-tracked links on every CTA to measure social-attributed website sessions, landing page conversions, and form fills. Where CRM integration is in place, we trace social-sourced leads through the pipeline to closed revenue. Vanity metrics like impressions and follower count are reported but never treated as primary KPIs."
      }
    },
    {
      "@type": "Question",
      "name": "Do you create the content or do we provide it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both models work. We offer full-service content production including copywriting, graphic design, and video scripting. Alternatively, we can provide content briefs and creative direction for your in-house team, with us handling strategy, scheduling, and community management. Most clients start with full-service and transition to hybrid as their team builds capability."
      }
    },
    {
      "@type": "Question",
      "name": "How long before social media produces measurable results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Engagement and reach metrics improve within the first 30 to 60 days as content cadence and platform optimization take effect. LinkedIn thought leadership programs typically produce first inbound inquiry mentions within 60 to 90 days. Pipeline-attributable results from organic social require 3 to 6 months of consistent execution."
      }
    }
  ]
};

const STATS = [
    { value: 4.9, suffix: "B", label: "Social Media Users Worldwide", color: "#ec4899" },
    { value: 77, suffix: "%", label: "of B2B Buyers Research on LinkedIn", color: "#8b5cf6" },
    { value: 3, suffix: "x", label: "Higher Engagement vs Paid-Only Approach", color: "#06b6d4" },
    { value: 6, suffix: " platforms", label: "LinkedIn, Instagram, TikTok, X, Facebook, YouTube", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Platform Audit and Strategy", desc: "Audit existing social presence, benchmark against competitors, and define platform priority based on ICP behavior. Deliver a 90-day content strategy and channel roadmap.", icon: "🔍" },
    { n: 2, title: "Brand Voice and Content System", desc: "Develop brand voice guidelines, content pillars, visual identity templates, and a posting cadence. Create content approval workflow adapted to your team's review speed.", icon: "✍️" },
    { n: 3, title: "Execution and Community Management", desc: "Monthly content calendar execution, post scheduling, community engagement, and DM management. Creative production or creative direction depending on engagement model.", icon: "📱" },
    { n: 4, title: "Analysis and Iteration", desc: "Monthly performance review covering content format winners, best-performing topics, and engagement rate trends. Strategy adjusted quarterly based on algorithm changes and audience data.", icon: "📊" }
];

const FAQS = [
    { q: "Which social media platforms should my business prioritize?", a: "Platform selection depends entirely on your buyer type. B2B companies selling to mid-market and enterprise buyers should prioritize LinkedIn. Consumer brands and DTC companies typically see the best ROI from Instagram and TikTok. Professional services firms benefit from LinkedIn and X for thought leadership. We recommend based on ICP research and competitor analysis, not platform trends or personal preference." },
    { q: "How do you measure social media ROI for B2B?", a: "We use UTM-tracked links on every CTA to measure social-attributed website sessions, landing page conversions, and form fills. Where CRM integration is in place, we trace social-sourced leads through the pipeline to closed revenue. Vanity metrics like impressions and follower count are reported but never treated as primary KPIs." },
    { q: "Do you create the content or do we provide it?", a: "Both models work. We offer full-service content production including copywriting, graphic design, and video scripting. Alternatively, we can provide content briefs and creative direction for your in-house team, with us handling strategy, scheduling, and community management. Most clients start with full-service and transition to hybrid as their team builds capability." },
    { q: "How long before social media produces measurable results?", a: "Engagement and reach metrics improve within the first 30 to 60 days as content cadence and platform optimization take effect. LinkedIn thought leadership programs typically produce first inbound inquiry mentions within 60 to 90 days. Pipeline-attributable results from organic social require 3 to 6 months of consistent execution." }
];

const RELATED = [
    { title: "PPC and Paid Search", href: "/digital-marketing/ppc", desc: "Paid social amplifies top organic content to targeted audiences at scale.", icon: "💰" },
    { title: "Content Studio", href: "/content-studio", desc: "Professional content production for social video, graphics, and copywriting.", icon: "🎬" },
    { title: "Email Marketing", href: "/digital-marketing/email-marketing", desc: "Convert social audiences into email subscribers for owned-channel nurture.", icon: "📧" }
];

export default function SocialMediaPage() {
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
          <li className="text-slate-400">Social Media Marketing</li>
        </ol>
      </nav>

      <Breadcrumb items={[{ label: "Digital Marketing", href: "/digital-marketing" }, { label: "Social Media Marketing" }]} />

      <PageHeader
        label="Social Media Marketing"
        title="Social Media Marketing That Builds Brand Authority and Drives Leads"
        subtitle="Social media managed for vanity metrics is wasted budget. HotBot Studios runs platform-native content programs on LinkedIn, Instagram, TikTok, and X that build genuine audience authority, and ties every activity to pipeline contribution through proper UTM tracking and CRM attribution."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#ec489908", borderColor: "#ec489920" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Social Media Marketing for Business:</strong>{" "}
              Social media marketing for business is the strategic use of social platforms to build brand authority, engage target audiences, and generate qualified leads. For US B2B companies, this primarily means LinkedIn for direct buyer reach and thought leadership. For B2C and DTC brands, Instagram, TikTok, and Facebook drive discovery and purchase intent. Effective social media marketing combines original content, community engagement, and paid amplification, measured against pipeline contribution, not follower count.
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
        <div key="LinkedIn B2B Marketing" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`💼`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`LinkedIn B2B Marketing`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Company page optimization, thought leadership content, employee advocacy programs, and LinkedIn Newsletter strategy targeting decision-makers in your ICP. Organic + paid LinkedIn working as one system for pipeline generation.`}</p>
        </div>
        <div key="Instagram Content and Growth" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`📸`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Instagram Content and Growth`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Visual content strategy, Reels production, Stories sequences, and carousel design built for your brand identity. Hashtag research, posting cadence, and engagement management handled end-to-end.`}</p>
        </div>
        <div key="TikTok and Short-Form Video" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🎵`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`TikTok and Short-Form Video`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Platform-native short-form video strategy, scripting, and production guidance. TikTok algorithm optimization for organic reach in your target category. Trending audio integration with brand-safe creative guardrails.`}</p>
        </div>
        <div key="X (Twitter) Brand Voice" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`🐦`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`X (Twitter) Brand Voice`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Brand voice development, content calendar, thread strategy for thought leadership, and engagement management. X remains the highest-reach platform for real-time industry commentary in B2B verticals.`}</p>
        </div>
        <div key="Community Management" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`🤝`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Community Management`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Inbound comment response, DM management, follower engagement, and community nurturing across all active platforms. Response time SLAs and tone-of-voice guidelines enforced consistently.`}</p>
        </div>
        <div key="Social Analytics and Reporting" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Social Analytics and Reporting`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Monthly reporting covering reach, engagement rate, follower growth, link clicks, UTM-attributed website sessions, and pipeline-influenced revenue. Vanity metrics are secondary to business outcomes.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="B2B SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#ec489908", borderColor: "#ec489920" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#ec4899" }}>{String.raw`B2B SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Building brand awareness and thought leadership with decision-makers without relying entirely on paid search.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`LinkedIn company page + executive personal brand program. Thought leadership articles, original data posts, and case study carousels targeting ICP job titles. Organic reach supplemented with LinkedIn Sponsored Content retargeting website visitors.`}</p>
        </div>
        <div key="DTC and E-Commerce Brands" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`DTC and E-Commerce Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Saturated Instagram and TikTok feeds making organic reach difficult to sustain without constant creative iteration.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`UGC content strategy, Reels-first production cadence, and trending audio integration. A/B testing organic creative before committing paid budget to winners. Creator partnership identification for cost-effective reach expansion.`}</p>
        </div>
        <div key="Professional Services" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`Professional Services`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Converting social followers into qualified service inquiries when the buying process requires trust built over time.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Long-form LinkedIn thought leadership establishing expertise. Case study content in carousel and video format. Lead magnet CTAs in high-performing posts driving warm email opt-ins for nurture sequences.`}</p>
        </div>
        <div key="Local US Businesses" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#22c55e" }}>{String.raw`Local US Businesses`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Competing for local social media attention against larger brands with bigger content budgets.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Hyper-local content strategy emphasizing community involvement, behind-the-scenes culture, and customer stories. Google Business Profile posting integrated with social calendar for local SEO signal reinforcement.`}</p>
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
            style={{ background: "#ec489905", borderColor: "#ec489918" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Engagement rate by platform and content type`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Follower growth rate (qualified audience, not bots)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`UTM-attributed website sessions from social`}</li>
          <li className="text-slate-300 text-sm">{String.raw`LinkedIn Company Page follower growth in ICP job titles`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Social-attributed form fills and lead volume`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Share of voice vs. top 3 competitors`}</li>
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
            <span>{String.raw`Platform selection is driven by ICP behavior data, not trending platform popularity`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`LinkedIn is the highest-ROI social channel for B2B companies targeting mid-market and enterprise decision-makers`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Content performance is measured by UTM-attributed pipeline contribution, not follower count or impressions`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Organic content is tested first, paid amplification scales winners, not experiments`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Community management with sub-24-hour response time is standard, slow response costs followers and credibility`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Strategy adapts quarterly to algorithm changes, what worked six months ago may require a different approach today`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Get a Free Social Media Audit"
        subtitle="We will review your current social presence, benchmark against competitors, and show you exactly which platforms and content types would move the needle for your business."
        formType="get-started"
      />
    </>
  );
}
