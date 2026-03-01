import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";

export const metadata: Metadata = {
  title: "Press Release Writing & Distribution Agency USA — PR Newswire & Direct Journalist Outreach | HotBot Studios",
  description:
    "HotBot Studios writes compelling press releases and distributes via PR Newswire, BusinessWire, and direct journalist outreach for maximum editorial pickup. Written by former journalists. 48-hour turnaround. Free consultation.",
  keywords: [
    "press release writing service USA",
    "press release distribution USA",
    "PR Newswire distribution agency",
    "BusinessWire press release service",
    "press release agency USA",
    "press release writing agency",
    "newswire distribution service USA",
    "press release for startups USA",
    "corporate press release writing",
    "product launch press release USA",
    "funding announcement press release",
    "SEO press release distribution",
    "B2B press release service USA",
    "press release journalist outreach",
  ],
  openGraph: {
    title: "Press Release Writing & Distribution Agency USA | HotBot Studios",
    description: "Compelling press releases written by former journalists, distributed via PR Newswire, BusinessWire & direct journalist outreach. 48-hour turnaround.",
    url: "https://hotbotstudios.com/public-relations/press-releases",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Press Release Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Press Release Writing & Distribution USA | HotBot Studios",
    description: "Former-journalist written press releases + PR Newswire & direct journalist distribution. 48-hour turnaround.",
  },
  alternates: { canonical: "https://hotbotstudios.com/public-relations/press-releases" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Press Release Writing & Distribution for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Press Release Writing & Distribution",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional press release writing by former journalists and strategic distribution via PR Newswire, BusinessWire, and direct journalist outreach for US businesses. 48-hour turnaround, SEO-optimised, and designed for editorial pickup.",
  url: "https://hotbotstudios.com/public-relations/press-releases",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Press Release Writing & Distribution", item: "https://hotbotstudios.com/public-relations/press-releases" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What makes a press release actually get picked up by journalists?", acceptedAnswer: { "@type": "Answer", text: "A press release that gets covered has a genuinely newsworthy hook (not just a product announcement), a compelling headline that reads like an article title, a strong opening paragraph that contains the entire story, specific data or quotes that a journalist can use directly, and a clear narrative angle that serves the journalist's readers — not just the brand's marketing goals. Most press releases fail because they read as promotional content, not news." } },
    { "@type": "Question", name: "How long does a press release turnaround take?", acceptedAnswer: { "@type": "Answer", text: "Standard press releases are delivered within 48 hours of brief approval. Rush turnaround (same day or overnight) is available for time-sensitive announcements. Distribution begins immediately upon your sign-off — we can have your release on PR Newswire within 24 hours of your approval." } },
    { "@type": "Question", name: "What is the difference between wire distribution and direct journalist outreach?", acceptedAnswer: { "@type": "Answer", text: "Newswire distribution (PR Newswire, BusinessWire) pushes your release to thousands of journalists, newsrooms, and websites simultaneously — generating broad pickup and SEO value from the distribution network's own high-DA domains. Direct journalist outreach is a personalised pitch to specific journalists at target publications, accompanied by the press release as supporting material. Both methods are more effective together — wire distribution for breadth, direct outreach for targeted tier-1 placements." } },
  ],
};

const SUB_SERVICES = [
  { icon: "✍️", title: "Press Release Writing", desc: "Compelling press releases written by former journalists — not marketing copywriters. Written to journalistic AP style, structured for maximum editorial pickup, and reviewed by a senior editor before delivery.", href: "/public-relations/press-releases" },
  { icon: "📡", title: "PR Newswire Distribution", desc: "National and regional distribution via PR Newswire — reaching thousands of journalists, newsrooms, and financial terminals simultaneously. Includes SEO-optimised headline, keyword tagging, and media monitoring for pickup.", href: "/public-relations/press-releases" },
  { icon: "📰", title: "BusinessWire Distribution", desc: "Premium wire distribution via BusinessWire for financial announcements, funding rounds, and executive appointments — preferred by financial journalists and investor relations professionals.", href: "/public-relations/press-releases" },
  { icon: "🎯", title: "Direct Journalist Outreach", desc: "Personal pitch emails to specific journalists at target publications — pairing your press release with a tailored story angle that aligns with each journalist's beat and current editorial interests.", href: "/public-relations/press-releases" },
  { icon: "🔍", title: "SEO-Optimised Press Releases", desc: "Press releases structured for maximum search engine pickup — target keywords in the headline and body, structured data markup, and distribution to high-DA newswire domains that generate lasting search visibility.", href: "/public-relations/press-releases" },
  { icon: "📅", title: "Press Release Retainer", desc: "Monthly press release programmes covering ongoing news — product updates, hiring announcements, partnership news, award wins, and industry commentary — keeping your brand consistently in the news cycle.", href: "/public-relations/press-releases" },
];

const STATS = [
  { value: 48, suffix: "hr", label: "Standard Turnaround", color: "#3b82f6" },
  { value: 500, suffix: "+", label: "Releases Distributed", color: "#8b5cf6" },
  { value: 300, suffix: "+", label: "Journalist Pickups per Wire", color: "#06b6d4" },
  { value: 90, suffix: "+", label: "DA of Newswire Distribution Sites", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "News Brief & Angle Development", desc: "We interview your team to extract every newsworthy detail, identify the strongest story angle, and plan the structural narrative that will make a journalist stop and read.", icon: "💡" },
  { n: 2, title: "Write, Edit & Review", desc: "A former journalist writes the release in AP style. A senior editor reviews for newsworthiness, clarity, and adherence to distribution guidelines. Two rounds of client revisions included.", icon: "✍️" },
  { n: 3, title: "Distribution Planning", desc: "Select distribution channels — PR Newswire, BusinessWire, regional wires, or direct outreach — based on your target audience, geographic scope, and publication targets.", icon: "📋" },
  { n: 4, title: "Distribute, Monitor & Report", desc: "Release goes live on wire and via direct outreach. Media monitoring tracks every pickup — publication, impressions, backlinks, and referral traffic — delivered in a post-distribution report.", icon: "📊" },
];

const FAQS = [
  { q: "What makes a press release actually get picked up by journalists?", a: "A genuinely newsworthy hook (not just a product announcement), a headline that reads like an article title, a strong opening paragraph containing the whole story, specific data or quotes, and a narrative angle that serves the journalist's readers — not just your marketing goals. Most press releases fail because they read as promotional content, not news." },
  { q: "How long does a press release take?", a: "Standard press releases delivered within 48 hours of brief approval. Rush turnaround (same day or overnight) available for time-sensitive announcements. Distribution begins immediately on your sign-off." },
  { q: "What is the difference between wire distribution and direct journalist outreach?", a: "Wire distribution (PR Newswire, BusinessWire) reaches thousands of journalists simultaneously — broad pickup and SEO value. Direct outreach is a personalised pitch to specific journalists at target publications. Both together maximise coverage: wire for breadth, direct outreach for tier-1 targets." },
  { q: "Does press release distribution help with SEO?", a: "Yes — significantly. PR Newswire (DA92) and BusinessWire (DA90+) generate high-authority backlinks from their own distribution domains. Republications across regional news sites, trade publications, and financial terminals add further link equity. A well-distributed press release can generate 50–300+ backlinks from a single release." },
  { q: "What types of news are newsworthy enough for a press release?", a: "Funding announcements, product launches, major client wins, executive appointments or departures, partnership announcements, proprietary research or data releases, award wins, significant milestones (users, revenue, offices), and timely expert commentary on breaking industry news." },
  { q: "Do you write in our brand voice?", a: "Yes — press releases are written to AP journalistic style (which is industry standard) while incorporating your brand terminology, key messages, and executive quotes reviewed and approved by your team. The goal is to sound like news, not marketing — which is what gets picked up." },
];

const RELATED = [
  { title: "Media Relations", href: "/public-relations/media-relations", desc: "Pair press releases with active journalist relationship management.", icon: "📰" },
  { title: "Digital PR & SEO Link Building", href: "/public-relations/digital-pr-seo", desc: "Maximise the SEO backlink value of every press release.", icon: "🌐" },
  { title: "Copywriting & Long-Form Content", href: "/content-studio/copywriting", desc: "Expert writers for whitepapers, case studies, and thought leadership.", icon: "✍️" },
];

export default function PressReleasesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Press Release Writing & Distribution USA"
        title="Press Releases That Read Like News — Because They Are"
        subtitle="Most press releases get deleted unread. HotBot Studios writes releases in genuine journalistic AP style — by former journalists — and distributes via PR Newswire, BusinessWire, and direct editor outreach so your announcement actually lands."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Press release (definition):</strong> A formal written statement issued by a company to journalists and news organisations to announce newsworthy information — a product launch, funding round, executive appointment, partnership, or industry research. An effective press release is written in AP (Associated Press) journalistic style — inverted pyramid structure, quote-driven, and focused on news value rather than promotional messaging. Distribution via newswires (PR Newswire, BusinessWire) reaches thousands of journalists simultaneously and generates lasting SEO backlinks from the high-DA distribution network.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Distribution Value & Anatomy ──────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">What a Well-Distributed Press Release Delivers</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { stat: "300+", label: "journalist and publication pickups per PR Newswire national distribution", color: "#3b82f6" },
                  { stat: "DA92", label: "PR Newswire's own Domain Authority — every distribution generates a backlink", color: "#8b5cf6" },
                  { stat: "50+", label: "average backlinks generated per press release from republications", color: "#22c55e" },
                  { stat: "48hr", label: "from brief to live distribution — one of the fastest PR turnarounds available", color: "#f59e0b" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.stat}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Press release anatomy */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Anatomy of a Press Release That Gets Picked Up</p>
              <div className="space-y-2">
                {[
                  { element: "Headline", desc: "Reads like a news article title — specific, factual, contains the core news hook", must: "Critical", color: "#3b82f6" },
                  { element: "Dateline & Lead Paragraph", desc: "Who, what, when, where, why — all answered in the first 2 sentences", must: "Critical", color: "#3b82f6" },
                  { element: "Executive Quote", desc: "A genuine, specific quote — not a generic 'we are excited to…' statement", must: "Required", color: "#8b5cf6" },
                  { element: "Supporting Data / Context", desc: "Industry stats, market data, or proprietary research that adds credibility", must: "Strongly advised", color: "#06b6d4" },
                  { element: "Customer / Partner Quote", desc: "Third-party validation that adds social proof and newsworthiness", must: "Optional", color: "#22c55e" },
                  { element: "Boilerplate & Media Contact", desc: "One paragraph company description plus direct journalist contact details", must: "Required", color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${row.color}08`, border: `1px solid ${row.color}18` }}>
                    <div className="w-2 h-full min-h-[8px] rounded-full shrink-0 mt-1" style={{ background: row.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white">{row.element}</span>
                      <span className="text-slate-400 text-xs ml-2">— {row.desc}</span>
                    </div>
                    <div className="text-[10px] shrink-0" style={{ color: row.color }}>{row.must}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Press Release Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Press Release Distribution Results" />
      <ProcessSteps steps={PROCESS} title="Our Press Release Process" />

      {/* ── Newsworthy vs Not Newsworthy ─────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">What Is (and Isn&apos;t) Newsworthy in 2026</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              icon: "✅", title: "Strong Press Release Material", color: "#22c55e",
              items: ["Funding announcements ($1M+ seed, Series A/B)", "Proprietary data or research reports with surprising findings", "Major customer wins or partnerships (named brands)", "Executive hires at C-suite or VP level", "Product launches addressing a clearly defined market need", "Award wins or major industry recognition", "Significant milestones: users, revenue, geographic expansion"],
            },
            {
              icon: "⚠️", title: "Rarely Newsworthy Without a Stronger Angle", color: "#f59e0b",
              items: ["'We are excited to announce our new website' — needs a real story hook", "Minor feature updates without broader market significance", "Generic thought leadership without original data or research", "Awards from pay-to-play or low-credibility award programmes", "Partnership announcements with no-name or unrecognisable brands", "Employee promotions below VP/C-suite level", "Generic 'year in review' without quantified achievement data"],
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                </div>
                <div className="space-y-2">
                  {item.items.map((pt, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5" style={{ color: item.color }}>›</span>
                      <span className="text-slate-400 text-sm">{pt}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="text-slate-500 text-xs text-center mt-6 max-w-xl mx-auto">Not sure if your news is strong enough for a press release? We offer a free newsworthiness consultation — we'll tell you honestly whether it warrants a release and how to strengthen the angle if needed.</p>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Press Release Services for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios press releases are written by former journalists in AP style — designed to read as news, not marketing.",
                "PR Newswire national distribution reaches 300+ journalist pickups and generates the wire's own DA92 backlink.",
                "A single well-distributed press release generates 50+ backlinks from republications across news, trade, and financial sites.",
                "48-hour standard turnaround from approved brief to live distribution — rush same-day delivery available.",
                "Direct journalist outreach pairs with wire distribution to drive tier-1 editorial coverage at target publications.",
                "Monthly press release retainers keep your brand consistently in the news cycle — 4–6 releases per month.",
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
        title="Have News Worth Announcing?"
        subtitle="Tell us what you're announcing and who needs to hear it. We'll write a press release that reads like news, distribute it to the right journalists, and track every pickup. Free newsworthiness consultation included."
        formType="strategy-call"
      />
    </>
  );
}
