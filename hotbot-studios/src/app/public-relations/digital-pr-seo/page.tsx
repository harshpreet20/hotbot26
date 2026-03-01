import { Metadata } from "next";
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
  title: "Digital PR & SEO Link Building Services USA | DA50+ Backlinks | HotBot Studios",
  description:
    "High Domain Authority (DA50+) backlink acquisition through editorial coverage in major US publications. Every media placement improves your Google ranking — PR and SEO working together. HotBot Studios.",
  keywords: [
    "digital PR agency USA",
    "SEO link building services USA",
    "DA50 backlinks USA",
    "editorial link building",
    "digital PR SEO",
    "high authority backlinks",
    "PR link building agency",
    "news PR SEO USA",
    "earned media backlinks",
    "domain authority link building",
  ],
  openGraph: {
    title: "Digital PR & SEO Link Building Services USA | HotBot Studios",
    description:
      "High DA50+ backlink acquisition through editorial coverage in major US publications. PR and SEO working together to boost your Google rankings.",
    url: "https://hotbotstudios.com/public-relations/digital-pr-seo",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital PR & SEO Link Building Services USA | HotBot Studios",
    description:
      "DA50+ editorial backlinks through earned media coverage. PR and SEO working together for US brands.",
  },
  alternates: {
    canonical: "https://hotbotstudios.com/public-relations/digital-pr-seo",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital PR & SEO Link Building",
  description:
    "High Domain Authority (DA50+) backlink acquisition through editorial coverage in major US publications. Every media placement improves your Google ranking — PR and SEO working together.",
  provider: {
    "@type": "Organization",
    name: "HotBot Studios",
    url: "https://hotbotstudios.com",
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  serviceType: "Digital PR & SEO Link Building",
  url: "https://hotbotstudios.com/public-relations/digital-pr-seo",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Public Relations",
      item: "https://hotbotstudios.com/public-relations",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Digital PR & SEO Link Building",
      item: "https://hotbotstudios.com/public-relations/digital-pr-seo",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is digital PR and how does it differ from traditional PR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Digital PR combines traditional media relations with SEO strategy to generate earned editorial coverage that includes do-follow backlinks to your website. Unlike traditional PR which focuses purely on brand visibility, digital PR treats every media placement as a dual win: audience reach plus a high-authority backlink that improves your Google search rankings. It's the only PR discipline where every placement has a measurable, lasting SEO impact.",
      },
    },
    {
      "@type": "Question",
      name: "What domain authority score do your placements typically achieve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We target publications with Domain Authority (DA) scores of 50 and above, which represent the most powerful backlinks for SEO purposes. Our media network includes DA60–DA90+ outlets across business, technology, marketing, finance, and lifestyle verticals. We avoid link farms, low-quality directories, and sponsored link schemes — all placements are genuine editorial coverage earned on journalistic merit.",
      },
    },
    {
      "@type": "Question",
      name: "How many backlinks can we expect per month?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "This depends on campaign scale, budget, and how newsworthy your story angles are. A typical digital PR retainer generates 4–12 high-DA editorial backlinks per month. We prioritise quality over quantity — a single placement in Forbes (DA95) is worth more than 50 placements on low-DA blogs. We report on DA, DR (Domain Rating), anchor text distribution, and referral traffic for every link acquired.",
      },
    },
    {
      "@type": "Question",
      name: "Do digital PR links count as natural links in Google's eyes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — editorial placements earned through genuine journalistic coverage are exactly what Google's link quality guidelines consider natural, high-value backlinks. These are contextually relevant links placed by editors in real articles about real topics, not paid link insertions or PBN schemes. Digital PR links are among the safest and most effective SEO link building strategies available to US brands in 2025.",
      },
    },
    {
      "@type": "Question",
      name: "What types of content generate the most digital PR backlinks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The highest-performing digital PR content types include: original research studies with proprietary data, expert commentary on trending news stories (newsjacking), reactive quotes for breaking industry news, data visualisations that journalists embed, and provocative opinion pieces that challenge conventional wisdom. We specialise in all of these approaches and match strategy to your niche and audience.",
      },
    },
    {
      "@type": "Question",
      name: "How do you report on the SEO impact of digital PR campaigns?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We provide monthly reports covering: total placements secured, DA/DR of each publication, anchor text profile, referral traffic from coverage, Google Search Console ranking improvements for target keywords, and Domain Rating trajectory over the campaign period. We also flag keyword ranking movements that correlate with major link acquisition windows so you can see the direct SEO lift from each campaign.",
      },
    },
  ],
};

const SUB_SERVICES = [
  {
    icon: "🔗",
    title: "Editorial Link Acquisition",
    desc: "Earn genuine do-follow backlinks from DA50+ US publications through journalistic merit — no link farms, no paid schemes.",
    href: "/public-relations/digital-pr-seo",
  },
  {
    icon: "📊",
    title: "Original Research & Data Studies",
    desc: "Commission and publish proprietary data studies that journalists cite and link to, generating dozens of backlinks from a single piece.",
    href: "/public-relations/digital-pr-seo",
  },
  {
    icon: "⚡",
    title: "Newsjacking & Reactive PR",
    desc: "Rapid-response expert commentary on trending news stories to secure same-day placements when journalists need credible sources.",
    href: "/public-relations/digital-pr-seo",
  },
  {
    icon: "🗞️",
    title: "Expert Source Placement",
    desc: "Register your executives as expert sources for HARO (Help a Reporter Out) and Qwoted — generating consistent citation opportunities.",
    href: "/public-relations/digital-pr-seo",
  },
  {
    icon: "📈",
    title: "Link Profile Auditing",
    desc: "Audit your existing backlink profile, disavow toxic links, and map a strategic acquisition plan targeting your highest-value keyword gaps.",
    href: "/public-relations/digital-pr-seo",
  },
  {
    icon: "📣",
    title: "Brand Mention Conversion",
    desc: "Identify unlinked brand mentions across the web and convert them into active do-follow backlinks through outreach to existing publishers.",
    href: "/public-relations/digital-pr-seo",
  },
];

const STATS = [
  { value: 50, suffix: "+ DA", label: "Minimum Publication Domain Authority", color: "#22c55e" },
  { value: 94, suffix: "%", label: "of Top Google Rankings Have Backlinks", color: "#22c55e" },
  { value: 12, suffix: "×", label: "More Powerful Than Generic Directory Links", color: "#22c55e" },
  { value: 6, suffix: "mo", label: "Average Time to Rank Lift from DA60+ Links", color: "#22c55e" },
];

const PROCESS = [
  {
    n: 1,
    title: "SEO Keyword Gap & Link Audit",
    desc: "We analyse your current backlink profile against competitors, identify the DA targets and anchor text needed to close ranking gaps for your priority keywords.",
    icon: "🔎",
  },
  {
    n: 2,
    title: "Story Angle Development",
    desc: "We ideate 10–15 pitch angles per month — data studies, provocative opinion pieces, expert commentary — and prioritise the ones most likely to earn links in your niche.",
    icon: "💡",
  },
  {
    n: 3,
    title: "Journalist Outreach & Placement",
    desc: "We pitch target journalists at DA50+ publications, manage follow-ups, and secure editorial coverage that includes contextual backlinks to your target pages.",
    icon: "📨",
  },
  {
    n: 4,
    title: "Reporting & Ranking Monitoring",
    desc: "Monthly reports track every link acquired, DA scores, anchor text distribution, referral traffic, and keyword ranking movements attributable to the campaign.",
    icon: "📊",
  },
];

const FAQS = [
  {
    q: "What is digital PR and how does it differ from traditional PR?",
    a: "Digital PR combines traditional media relations with SEO strategy to generate earned editorial coverage that includes do-follow backlinks to your website. Unlike traditional PR which focuses purely on brand visibility, digital PR treats every media placement as a dual win: audience reach plus a high-authority backlink that improves your Google search rankings. It's the only PR discipline where every placement has a measurable, lasting SEO impact.",
  },
  {
    q: "What domain authority score do your placements typically achieve?",
    a: "We target publications with Domain Authority (DA) scores of 50 and above, which represent the most powerful backlinks for SEO purposes. Our media network includes DA60–DA90+ outlets across business, technology, marketing, finance, and lifestyle verticals. We avoid link farms, low-quality directories, and sponsored link schemes — all placements are genuine editorial coverage earned on journalistic merit.",
  },
  {
    q: "How many backlinks can we expect per month?",
    a: "This depends on campaign scale, budget, and how newsworthy your story angles are. A typical digital PR retainer generates 4–12 high-DA editorial backlinks per month. We prioritise quality over quantity — a single placement in Forbes (DA95) is worth more than 50 placements on low-DA blogs. We report on DA, DR (Domain Rating), anchor text distribution, and referral traffic for every link acquired.",
  },
  {
    q: "Do digital PR links count as natural links in Google's eyes?",
    a: "Yes — editorial placements earned through genuine journalistic coverage are exactly what Google's link quality guidelines consider natural, high-value backlinks. These are contextually relevant links placed by editors in real articles about real topics, not paid link insertions or PBN schemes. Digital PR links are among the safest and most effective SEO link building strategies available to US brands in 2025.",
  },
  {
    q: "What types of content generate the most digital PR backlinks?",
    a: "The highest-performing digital PR content types include: original research studies with proprietary data, expert commentary on trending news stories (newsjacking), reactive quotes for breaking industry news, data visualisations that journalists embed, and provocative opinion pieces that challenge conventional wisdom. We specialise in all of these approaches and match strategy to your niche and audience.",
  },
  {
    q: "How do you report on the SEO impact of digital PR campaigns?",
    a: "We provide monthly reports covering: total placements secured, DA/DR of each publication, anchor text profile, referral traffic from coverage, Google Search Console ranking improvements for target keywords, and Domain Rating trajectory over the campaign period. We also flag keyword ranking movements that correlate with major link acquisition windows so you can see the direct SEO lift from each campaign.",
  },
];

const RELATED = [
  {
    title: "Media Relations & Press Coverage",
    href: "/public-relations/media-relations",
    desc: "Earned coverage in top US publications through targeted journalist relationships.",
    icon: "📰",
  },
  {
    title: "Press Release Writing & Distribution",
    href: "/public-relations/press-releases",
    desc: "Newsworthy press releases distributed to 300+ US wire services and newsrooms.",
    icon: "📣",
  },
  {
    title: "SEO & Content Marketing",
    href: "/marketing-services/seo",
    desc: "Full-service SEO strategy: technical audit, on-page, content clusters, and link building.",
    icon: "🔍",
  },
];

const publicationTiers = [
  { tier: "Tier 1 — DA 80–95+", examples: "Forbes, TechCrunch, Business Insider, Wired", seoImpact: "Transformational", color: "#f59e0b" },
  { tier: "Tier 2 — DA 65–79", examples: "Entrepreneur, Inc, Fast Company, VentureBeat", seoImpact: "Very High", color: "#22c55e" },
  { tier: "Tier 3 — DA 50–64", examples: "Niche trade & vertical media, regional business press", seoImpact: "High", color: "#3b82f6" },
  { tier: "Avoid — DA < 50", examples: "Link farms, generic directories, PBNs, sponsored posts", seoImpact: "Neutral / Risk", color: "#ef4444" },
];

const contentTypes = [
  { type: "Original Data Studies", linkPotential: 95, color: "#22c55e" },
  { type: "Expert Newsjacking Quotes", linkPotential: 80, color: "#3b82f6" },
  { type: "Reactive Commentary", linkPotential: 72, color: "#8b5cf6" },
  { type: "Data Visualisations & Infographics", linkPotential: 85, color: "#f59e0b" },
  { type: "Opinion & Thought Leadership", linkPotential: 68, color: "#06b6d4" },
  { type: "Product / Company Announcements", linkPotential: 55, color: "#ec4899" },
];

export default function DigitalPRSEOPage() {
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

      <PageHeader
        label="Digital PR & SEO Link Building"
        title="Every Media Placement a Google Ranking Signal"
        subtitle="High Domain Authority (DA50+) backlink acquisition through genuine editorial coverage in major US publications. We blend journalistic strategy with SEO precision — so every story we place moves your rankings."
      />

      {/* AEO Definition Block */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
              Definition — Digital PR & SEO Link Building
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Digital PR</strong> is the practice of earning editorial coverage in online publications to generate high-authority do-follow backlinks that signal trust to Google&apos;s algorithm.{" "}
              <strong className="text-white">SEO link building</strong> is the strategic acquisition of these backlinks from high Domain Authority (DA50+) sources to improve a website&apos;s position in Google Search results. Digital PR is the most effective, Google-safe method of link building because placements are earned through journalistic merit — making every link both a traffic driver and a permanent ranking asset.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Content Type Link Potential Infographic */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <div
            className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-xl font-bold text-white mb-2">Content Type — Link Acquisition Potential</h2>
            <p className="text-slate-400 text-sm mb-6">
              Relative backlink potential index by content format (editorial PR, not paid placements)
            </p>
            <div className="space-y-4">
              {contentTypes.map((row) => (
                <div key={row.type} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-56 shrink-0 text-right hidden md:block">
                    {row.type}
                  </span>
                  <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${row.linkPotential}%`,
                        background: `linear-gradient(90deg, ${row.color}40, ${row.color})`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-white hidden md:block">
                        {row.linkPotential}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4">
              * Index score out of 100. Based on average backlinks earned per campaign across HotBot Studios client data.
            </p>
          </div>
        </Reveal>
      </section>

      <SubServices
        services={SUB_SERVICES}
        title="Digital PR & SEO Link Building Services"
        columns={3}
      />

      <ServiceStats stats={STATS} title="The SEO Case for Digital PR" />

      <ProcessSteps steps={PROCESS} title="Our Digital PR & Link Building Process" />

      {/* Publication Tier Table */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Publication Tier Strategy
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {publicationTiers.map((item) => (
              <GlassCard key={item.tier} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}
                    >
                      {item.tier}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm">{item.examples}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.color }}
                    >
                      {item.seoImpact}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">
            HotBot Studios exclusively targets Tier 1–3 placements. We never use paid link schemes, PBNs, or low-DA directories.
          </p>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(34,197,94,0.05)",
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "94% of top-ranking Google pages have backlinks — links remain the #1 off-page ranking signal",
                "We exclusively target DA50+ publications: Forbes, TechCrunch, Entrepreneur, and vertical trade media",
                "Original data studies are the highest-converting link bait, earning 40–200 links from a single study",
                "All placements are genuine editorial coverage — zero paid link schemes, PBNs, or directory spam",
                "Newsjacking and reactive PR generate same-day placements when trending stories break in your niche",
                "Monthly reporting covers DA, anchor text, referral traffic, and keyword ranking movement attribution",
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
        title="Start Building DA50+ Backlinks This Month"
        subtitle="Tell us your priority keywords and target pages — we'll design a digital PR campaign that earns editorial links from the US publications Google trusts most."
        formType="get-started"
      />
    </>
  );
}
