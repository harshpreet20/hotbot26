import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "PR Agency for US Businesses — Forbes, TechCrunch & Major Media Coverage | HotBot Studios",
  description:
    "HotBot Studios secures earned media coverage in Forbes, TechCrunch, Wall Street Journal, Inc., and 500+ US publications for ambitious brands. 12+ avg placements per campaign. 48hr crisis response. Free PR audit.",
  keywords: [
    "PR agency USA",
    "public relations agency USA",
    "media relations agency USA",
    "press release service USA",
    "digital PR agency USA",
    "Forbes PR agency",
    "TechCrunch press placement",
    "B2B PR agency USA",
    "startup PR agency USA",
    "crisis communications agency USA",
    "brand reputation management USA",
    "thought leadership PR USA",
    "podcast PR guest placement",
    "SEO link building PR USA",
    "earned media agency USA",
  ],
  openGraph: {
    title: "PR Agency USA — Forbes, TechCrunch & Major Media Coverage | HotBot Studios",
    description: "Earned media in Forbes, TechCrunch, WSJ & 500+ US publications. 12+ avg placements/campaign. 48hr crisis response. Free PR audit.",
    url: "https://hotbotstudios.com/public-relations",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Public Relations Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PR Agency USA | HotBot Studios",
    description: "Earned media in Forbes, TechCrunch & major US publications. 12+ avg placements per campaign.",
  },
  alternates: { canonical: "https://hotbotstudios.com/public-relations" },
};

// ── Schema Markup ───────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Public Relations Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Public Relations & Media Relations",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Strategic PR campaigns, media outreach, crisis communications, and brand reputation management for US businesses. Average 12+ media placements per campaign across Forbes, TechCrunch, WSJ, and 500+ publications.",
  url: "https://hotbotstudios.com/public-relations",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How quickly can HotBot Studios get media coverage?", acceptedAnswer: { "@type": "Answer", text: "For timely news stories and data-driven pitches, HotBot Studios can place articles within 24–72 hours. Feature articles and magazine profiles typically take 2–6 weeks. We maintain active relationships with journalists at Forbes, TechCrunch, WSJ, Adweek, Fast Company, Inc., and 500+ US trade publications." } },
    { "@type": "Question", name: "What publications does HotBot Studios have relationships with?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios has media relationships with Forbes, TechCrunch, The Wall Street Journal, Adweek, Fast Company, Inc. Magazine, Entrepreneur, Business Insider, and 500+ industry trade publications across every vertical." } },
    { "@type": "Question", name: "How do you measure PR success?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios tracks media impressions, Domain Authority of placements, share of voice vs. competitors, direct referral traffic from coverage (GA4), and backlink value for SEO. Monthly reports delivered with all metrics." } },
  ],
};

// ── Content Data ─────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "📰", title: "Media Relations & Press Coverage", desc: "Active relationships with 500+ US journalists and editors at national and trade publications. Personalized pitches — not spray-and-pray press releases — result in genuine editorial coverage that builds lasting credibility.", href: "/public-relations/media-relations" },
  { icon: "🗞️", title: "Press Release Writing & Distribution", desc: "Compelling press releases written by former journalists. Distributed via PR Newswire, BusinessWire, and direct journalist relationships for maximum pickup in relevant publications.", href: "/public-relations/press-releases" },
  { icon: "🎯", title: "Crisis Communications", desc: "24/7 rapid response PR strategy to protect and restore your brand reputation. Includes media holding statements, spokesperson preparation, and proactive narrative control.", href: "/public-relations/crisis-communications" },
  { icon: "🏆", title: "Awards & Thought Leadership", desc: "Industry award submissions, conference speaking opportunities (keynotes, panels), and thought leadership article placement that positions your executives as go-to experts in your field.", href: "/public-relations/thought-leadership" },
  { icon: "👥", title: "Podcast & Influencer PR", desc: "Strategic guest placements on the top podcasts your target audience listens to. Plus influencer partnership management for B2C and B2B brands seeking authentic endorsements.", href: "/public-relations/podcast-pr" },
  { icon: "🌐", title: "Digital PR & SEO Link Building", desc: "High Domain Authority (DA50+) backlink acquisition through editorial coverage in major publications. Every media placement improves your Google ranking — PR and SEO working together.", href: "/public-relations/digital-pr-seo" },
];

const STATS = [
  { value: 12, suffix: "+", label: "Avg Media Placements / Campaign", color: "#3b82f6" },
  { value: 500, suffix: "+", label: "US Media Contacts", color: "#8b5cf6" },
  { value: 300, suffix: "%", label: "Avg Brand Awareness Increase", color: "#22c55e" },
  { value: 48, suffix: "hr", label: "Crisis Response Time", color: "#f59e0b" },
];

const PROCESS = [
  { n: 1, title: "Brand & Media Audit", desc: "Analyze your current media presence, existing coverage, competitor share of voice, and brand narrative gaps to identify the most compelling story angles.", icon: "🔍" },
  { n: 2, title: "Narrative & Message Strategy", desc: "Craft your core brand narrative, executive spokesperson messaging, key talking points, and media pitch angles that journalists will actually want to cover.", icon: "📐" },
  { n: 3, title: "Targeted Media Outreach", desc: "Personalized, journalist-specific pitches sent to our curated media contact lists. No generic press release blasts — every pitch is tailored to the journalist's beat and audience.", icon: "📨" },
  { n: 4, title: "Coverage Amplification", desc: "Repurpose every earned media placement across LinkedIn, email, website, and paid social to maximize reach. Coverage in Forbes becomes 10 pieces of owned and paid content.", icon: "📣" },
];

const FAQS = [
  { q: "How quickly can HotBot Studios get media coverage?", a: "For timely news stories and data-driven pitches, we can place articles within 24–72 hours. Feature articles and magazine profiles take 2–6 weeks to develop and place. We maintain active journalist relationships so pitches get read — not ignored." },
  { q: "Which US publications does HotBot Studios have relationships with?", a: "Forbes, TechCrunch, The Wall Street Journal, Adweek, Fast Company, Inc. Magazine, Entrepreneur, Business Insider, and 500+ industry trade publications across tech, finance, healthcare, retail, and more." },
  { q: "What if we have a PR crisis right now?", a: "We have a 24/7 crisis response team. Call us and we'll have a crisis communications plan in your hands within hours — including a media holding statement, spokesperson briefing, and proactive outreach strategy to control the narrative." },
  { q: "How do you measure PR results?", a: "We track media impressions, Domain Authority of placements, share of voice vs competitors, and direct referral traffic from coverage (via GA4 UTM tagging). Plus the SEO value: high-DA backlinks from Forbes or TechCrunch directly improve your Google rankings. Monthly reports delivered every campaign." },
  { q: "Does PR help with SEO?", a: "Significantly. Every editorial placement in a high-DA publication (Forbes DA94, TechCrunch DA93) creates high-authority backlinks that improve your Google rankings. Digital PR has become one of the most cost-effective SEO strategies available in 2026. See our digital marketing services for the full picture." },
];

const RELATED = [
  { title: "Content Production", href: "/content-studio", desc: "Expert content to support every PR narrative.", icon: "✍️" },
  { title: "Digital Marketing", href: "/digital-marketing", desc: "Amplify PR wins with paid distribution.", icon: "📣" },
  { title: "Marketing Consulting", href: "/marketing-consulting", desc: "Strategic brand positioning before PR launch.", icon: "💡" },
];

export default function PublicRelationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Public Relations", href: "/public-relations" }]} />

      <PageHeader
        label="PR Agency USA"
        title="Put Your Brand in the Headlines"
        subtitle="When your buyers Google your company name, what do they find? HotBot Studios secures earned media coverage in Forbes, TechCrunch, WSJ, and the publications your customers actually read — building instant credibility that closes deals."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Public relations (PR) for US businesses (definition):</strong> The strategic management of your brand&apos;s relationship with the media, customers, and the public. In 2026, effective PR combines earned media (editorial placements), thought leadership (speaking, bylines, podcasts), crisis communications, and Digital PR — which simultaneously builds brand awareness and high-authority SEO backlinks from publications like Forbes (DA94) and TechCrunch (DA93).
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: PR Impact ────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">The Business Impact of Strategic PR for US Brands</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { stat: "68%", label: "of buyers research a brand in press before purchasing (B2B)", color: "#3b82f6" },
                  { stat: "DA94", label: "Forbes Domain Authority — one backlink raises your rankings", color: "#8b5cf6" },
                  { stat: "4.3×", label: "higher close rate when brand has earned media coverage", color: "#06b6d4" },
                  { stat: "300%", label: "average brand awareness increase per HotBot Studios PR campaign", color: "#22c55e" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                    <div className="text-xl md:text-2xl font-black mb-1" style={{ color: item.color }}>{item.stat}</div>
                    <div className="text-slate-400 text-xs leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>
              {/* Publication DA chart */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Domain Authority of Key US Publications (SEO Value of Each Placement)</p>
              <div className="space-y-2">
                {[
                  { pub: "Forbes", da: 94, color: "#f59e0b" },
                  { pub: "TechCrunch", da: 93, color: "#3b82f6" },
                  { pub: "WSJ.com", da: 95, color: "#8b5cf6" },
                  { pub: "Inc. Magazine", da: 91, color: "#22c55e" },
                  { pub: "Fast Company", da: 92, color: "#06b6d4" },
                  { pub: "Business Insider", da: 92, color: "#ec4899" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-28 shrink-0 text-right">{row.pub}</span>
                    <div className="flex-1 rounded-full h-4 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${row.da}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white">DA{row.da}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="PR Services We Deliver" columns={3} />
      <ServiceStats stats={STATS} title="PR Campaign Results" />
      <ProcessSteps steps={PROCESS} title="Our PR Campaign Process" />

      {/* ── Internal Link: Content for PR ───────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-6">
        <Reveal>
          <div className="p-6 rounded-2xl flex items-start gap-4"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="text-3xl shrink-0">✍️</div>
            <div>
              <h3 className="font-bold text-white mb-1">Need Content to Support Your PR Campaign?</h3>
              <p className="text-slate-400 text-sm mb-3">Every PR campaign is more powerful when backed by expert content — thought leadership articles, case studies, and whitepapers that journalists can reference and your brand can own. Our content production team works alongside PR to build your authority.</p>
              <Link href="/content-studio" className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
                Explore Content Production Studio →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Types of PR Stories That Win Coverage ────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-4">What Makes a Story Journalists Actually Want to Cover?</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            Journalists aren&apos;t looking for press releases about your product launch — they&apos;re looking for stories their
            readers will share. HotBot Studios has placed 500+ earned media stories by mastering the six story types that US
            journalists consistently cover. Every PR campaign we run is built around one or more of these proven angles.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                type: "Data-Led Stories",
                desc: "Original research, surveys, and proprietary data that reveals a surprising trend in your industry. Journalists love exclusive data they can't get elsewhere — and it positions your brand as an authoritative source.",
                example: "\"New survey: 68% of US SMBs waste $3,000+/month on redundant SaaS tools\"",
                color: "#3b82f6",
              },
              {
                type: "Contrarian Takes",
                desc: "A well-argued position that challenges conventional wisdom in your industry. Editors at Forbes and Fast Company actively look for thought leadership that provokes debate and generates reader engagement.",
                example: "\"Why hiring more salespeople is the wrong fix for your conversion problem\"",
                color: "#8b5cf6",
              },
              {
                type: "David vs Goliath",
                desc: "The story of how a small, innovative company is disrupting a legacy industry or outperforming a much larger competitor. Readers root for the underdog, and journalists love a compelling competitive narrative.",
                example: "\"How this $2M AI startup is replacing a $50M call center operation\"",
                color: "#06b6d4",
              },
              {
                type: "Human Impact Stories",
                desc: "Real customer stories that show how your product or service transformed a business or improved lives. Concrete outcomes — revenue grown, jobs created, problems solved — make abstract claims credible.",
                example: "\"How a Denver restaurant used AI to cut food waste by 40% and save $80K\"",
                color: "#22c55e",
              },
              {
                type: "Timely Newsjacking",
                desc: "Connecting your brand's expertise to a breaking news story or major industry trend. When a relevant story hits the news cycle, HotBot Studios pitches your executives as expert commentators within hours.",
                example: "Rapid-response commentary tied to AI regulation news or FTC rulings",
                color: "#f59e0b",
              },
              {
                type: "Milestone Announcements",
                desc: "Funding rounds, major client wins, product launches, and expansion announcements — crafted with compelling narrative context so they read as business news, not corporate press releases.",
                example: "\"HotBot Studios-backed startup hits $10M ARR, opens second US office\"",
                color: "#ec4899",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="p-5 rounded-2xl h-full" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: item.color }}>{item.type}</div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">{item.desc}</p>
                  <p className="text-slate-600 text-xs italic">{item.example}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — PR Agency Services for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios averages 12+ media placements per PR campaign across Forbes, TechCrunch, WSJ, and 500+ publications.",
                "Digital PR placements in high-DA publications create high-authority backlinks that directly improve Google rankings.",
                "68% of B2B buyers research brands in the press before purchasing — PR directly influences sales conversion.",
                "24/7 crisis communications team with a 48-hour rapid response guarantee.",
                "Thought leadership programs (speaking, podcast placements, bylines) build long-term authority in your industry.",
                "PR works best as part of an integrated strategy — pair with content production, digital marketing, and consulting.",
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
        title="Ready for Your Brand Moment?"
        subtitle="Every business has a story worth telling. Let HotBot Studios get yours in front of the journalists, investors, and customers who need to hear it. Free PR audit and media opportunity report included."
        formType="strategy-call"
      />
    </>
  );
}
