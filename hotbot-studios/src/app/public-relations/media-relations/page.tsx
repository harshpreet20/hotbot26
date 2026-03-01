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
  title: "Media Relations Agency USA — Forbes, TechCrunch & National Press Coverage | HotBot Studios",
  description:
    "HotBot Studios secures earned editorial coverage in Forbes, TechCrunch, WSJ, Inc., Fast Company, and 500+ US publications through active journalist relationships and personalised pitching. 12+ avg placements. Free media audit.",
  keywords: [
    "media relations agency USA",
    "press coverage agency USA",
    "earned media agency USA",
    "Forbes press placement USA",
    "TechCrunch coverage agency",
    "journalist outreach agency USA",
    "B2B media relations USA",
    "startup press coverage USA",
    "national media coverage agency",
    "editorial placement agency USA",
    "media pitch agency USA",
    "brand press coverage USA",
    "business press relations USA",
    "trade press agency USA",
  ],
  openGraph: {
    title: "Media Relations Agency USA — Forbes, TechCrunch & National Press | HotBot Studios",
    description: "Earned editorial coverage in Forbes, TechCrunch, WSJ & 500+ US publications through active journalist relationships. 12+ avg placements.",
    url: "https://hotbotstudios.com/public-relations/media-relations",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Media Relations Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Relations Agency USA | HotBot Studios",
    description: "Earned editorial in Forbes, TechCrunch & 500+ US publications. Personalised pitching, 12+ avg placements.",
  },
  alternates: { canonical: "https://hotbotstudios.com/public-relations/media-relations" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Media Relations Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Media Relations & Earned Media",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Strategic media relations and earned press coverage for US businesses. Active relationships with 500+ journalists at Forbes, TechCrunch, WSJ, Inc., Fast Company, and industry trade publications. Personalised pitching, 12+ average placements per campaign.",
  url: "https://hotbotstudios.com/public-relations/media-relations",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Media Relations", item: "https://hotbotstudios.com/public-relations/media-relations" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How does HotBot Studios get coverage in Forbes and TechCrunch?", acceptedAnswer: { "@type": "Answer", text: "Through genuine, long-term relationships with journalists and editors at these publications — built over years of providing timely, accurate story angles that serve their editorial calendars. We don't use generic press release distribution. Every pitch is personalised to a specific journalist's beat, tailored to their audience, and sent at the right moment in their editorial cycle." } },
    { "@type": "Question", name: "What is the difference between earned media and paid media?", acceptedAnswer: { "@type": "Answer", text: "Earned media is genuine editorial coverage — a journalist or editor independently decides your story is worth covering and publishes it without payment. It is significantly more trusted by readers than paid advertising (74% of consumers trust earned media vs 34% for paid ads). Paid media includes sponsored content, native advertising, and ad placements — clearly disclosed and paid for. HotBot Studios specialises in earned media, which carries greater credibility and SEO value." } },
    { "@type": "Question", name: "How long does media relations take to show results?", acceptedAnswer: { "@type": "Answer", text: "Fast-moving news pitches and data-led stories can generate coverage within 24–72 hours. Feature articles and in-depth profiles at major publications typically take 2–6 weeks from pitch to publication. Building a consistent media presence — where your brand is regularly cited as a source — takes 3–6 months of consistent outreach and relationship development." } },
  ],
};

const SUB_SERVICES = [
  { icon: "📰", title: "National & Tier-1 Media Outreach", desc: "Personalised pitching to journalists at Forbes, TechCrunch, WSJ, Fast Company, Inc., Business Insider, and Entrepreneur — the publications your investors, customers, and competitors actually read.", href: "/public-relations/media-relations" },
  { icon: "🏭", title: "Trade & Industry Press", desc: "Targeted coverage in the trade publications your buyers trust most — industry-specific journals, newsletters, and online media that reach decision-makers in your exact category.", href: "/public-relations/media-relations" },
  { icon: "📡", title: "Wire Distribution & SEO Pickup", desc: "Strategic newswire distribution via PR Newswire and BusinessWire to maximise search engine pickup, automatic republication, and regional press coverage across all 50 US states.", href: "/public-relations/media-relations" },
  { icon: "🎤", title: "Spokesperson & Interview Preparation", desc: "Executive media training, talking point development, and interview preparation so your leaders deliver compelling, on-message responses whether speaking to a journalist, podcast host, or TV producer.", href: "/public-relations/media-relations" },
  { icon: "📊", title: "Data-Led Story Development", desc: "Original research, proprietary data reports, and industry surveys that give journalists an exclusive data angle — the most effective pitch type for Tier-1 editorial placement.", href: "/public-relations/media-relations" },
  { icon: "🔄", title: "Coverage Amplification & Repurposing", desc: "Turn every media placement into owned content — LinkedIn posts, email newsletter features, website press page updates, and paid social proof ads that extend the ROI of every earned media win.", href: "/public-relations/media-relations" },
];

const STATS = [
  { value: 12, suffix: "+", label: "Avg Placements Per Campaign", color: "#3b82f6" },
  { value: 500, suffix: "+", label: "US Journalist Relationships", color: "#8b5cf6" },
  { value: 72, suffix: "hr", label: "News Pitch Turnaround", color: "#f59e0b" },
  { value: 4.3, suffix: "×", label: "Higher Close Rate with Press Coverage", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Media Audit & Opportunity Map", desc: "Audit your existing media presence, competitive share of voice, and whitespace opportunities. Identify the publications, journalists, and story angles most likely to result in coverage for your brand right now.", icon: "🔍" },
  { n: 2, title: "Story Angle & Pitch Development", desc: "Develop 3–5 pitchable story angles based on your news, data, and brand narrative — each tailored to a specific publication and journalist beat. No generic press releases sent to a spray list.", icon: "✍️" },
  { n: 3, title: "Targeted Journalist Outreach", desc: "Personalised pitches sent to specific journalists at target publications, with follow-up at the right cadence. Every outreach respects the journalist relationship — which is why ours actually get responded to.", icon: "📨" },
  { n: 4, title: "Placement, Monitor & Amplify", desc: "Track placement live, monitor coverage performance (impressions, backlinks, referral traffic), and immediately amplify every win across owned and paid channels to maximise the value of each article.", icon: "📣" },
];

const FAQS = [
  { q: "How does HotBot Studios get coverage in Forbes and TechCrunch?", a: "Through genuine, long-term journalist relationships built over years of providing timely, accurate story angles. Every pitch is personalised to a specific journalist's beat, tailored to their audience, and sent at the right moment in their editorial cycle. We don't use spray-and-pray press release blasts." },
  { q: "What is the difference between earned media and paid media?", a: "Earned media is genuine editorial coverage — a journalist decides your story is worth covering without payment. It's trusted by 74% of consumers vs 34% for paid ads. Paid media is sponsored content or advertising — disclosed and paid for. HotBot Studios specialises in earned media, which carries greater credibility and SEO value." },
  { q: "How long does media relations take to show results?", a: "News pitches and data-led stories can generate coverage within 24–72 hours. Feature articles at major publications take 2–6 weeks from pitch to publication. Building a consistent media presence where your brand is regularly cited takes 3–6 months of sustained outreach." },
  { q: "What story angles are most likely to get covered?", a: "Data-led stories (original research with surprising findings), contrarian expert opinion, David vs Goliath competitive narratives, human impact stories with concrete outcomes, timely newsjacking of breaking industry news, and milestone announcements with compelling context. We develop and pitch all six story types across every campaign." },
  { q: "Can you get coverage in specific publications we target?", a: "Yes — we take on campaigns with specific target publications as part of the brief. We can't guarantee specific placements (no legitimate PR firm can — journalists make independent editorial decisions), but our active relationships at target outlets significantly increase placement probability vs cold outreach." },
  { q: "How does media coverage help with SEO?", a: "Every editorial placement in a high-DA publication generates a backlink that improves your Google rankings. Forbes (DA94), TechCrunch (DA93), and WSJ (DA95) backlinks are among the most valuable in SEO. One earned media campaign can generate 12+ high-authority backlinks — equivalent to months of traditional link building. See our Digital PR & SEO service for the full picture." },
];

const RELATED = [
  { title: "Press Release Writing & Distribution", href: "/public-relations/press-releases", desc: "Compelling press releases that journalists actually read.", icon: "🗞️" },
  { title: "Digital PR & SEO Link Building", href: "/public-relations/digital-pr-seo", desc: "Media coverage that simultaneously builds your Google rankings.", icon: "🌐" },
  { title: "Thought Leadership & Awards", href: "/public-relations/thought-leadership", desc: "Build executive authority alongside media coverage.", icon: "🏆" },
];

export default function MediaRelationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Media Relations Agency USA"
        title="Your Story in the Publications That Move Markets"
        subtitle="HotBot Studios has active relationships with 500+ US journalists. We secure earned editorial coverage in Forbes, TechCrunch, WSJ, and the trade publications your buyers read — through personalised pitching that gets read, not deleted."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Media relations (definition):</strong> The ongoing management of a brand&apos;s relationships with journalists, editors, and media organisations to secure earned editorial coverage — as distinct from paid advertising or sponsored content. Effective media relations in 2026 requires genuine journalist relationships (not a bought media list), a deep understanding of each publication&apos;s editorial calendar and audience, and the ability to develop story angles that serve the journalist&apos;s readers — not just the brand&apos;s marketing goals. Earned media is trusted by 74% of consumers; paid advertising by only 34%.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Media Landscape & Coverage Value ─────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">The Business Value of Earned Media Coverage in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { stat: "74%", label: "of consumers trust earned media — vs 34% for paid advertising", color: "#3b82f6" },
                  { stat: "4.3×", label: "higher sales close rate when a brand has editorial press coverage", color: "#8b5cf6" },
                  { stat: "68%", label: "of B2B buyers research a brand in the press before purchasing", color: "#06b6d4" },
                  { stat: "DA94", label: "Forbes' Domain Authority — every earned backlink lifts your SEO", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.stat}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Publication DA chart */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Domain Authority of Key HotBot Studios Media Targets (SEO Value Per Placement)</p>
              <div className="space-y-2.5 mb-6">
                {[
                  { pub: "WSJ.com", da: 95, color: "#3b82f6" },
                  { pub: "Forbes", da: 94, color: "#f59e0b" },
                  { pub: "Fast Company", da: 92, color: "#8b5cf6" },
                  { pub: "Business Insider", da: 92, color: "#ec4899" },
                  { pub: "TechCrunch", da: 93, color: "#06b6d4" },
                  { pub: "Inc. Magazine", da: 91, color: "#22c55e" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-32 shrink-0 text-right">{row.pub}</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${row.da}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white">DA {row.da}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coverage velocity vs cold outreach */}
              <p className="text-slate-500 text-xs text-center mb-3 uppercase tracking-wider font-medium">Placement Rate: Relationship-Based vs Cold PR Outreach</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { method: "HotBot Studios (Relationship-Based)", rate: "32%", desc: "Average journalist response rate — 8× industry average", color: "#22c55e" },
                  { method: "Generic PR Distribution / Cold Outreach", rate: "4%", desc: "Industry average journalist response rate for press releases", color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl text-center" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <div className="text-3xl font-black mb-1" style={{ color: item.color }}>{item.rate}</div>
                    <div className="text-slate-300 text-xs font-semibold mb-1">{item.method}</div>
                    <div className="text-slate-500 text-[10px]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Media Relations Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Media Relations Results" />
      <ProcessSteps steps={PROCESS} title="Our Media Relations Process" />

      {/* ── Story Type Framework ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">The 6 Story Types That Win Tier-1 Media Coverage</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "📊", type: "Data-Led Stories", desc: "Original research or proprietary data revealing a surprising industry trend. Journalists love exclusive data they can cite — and it positions your brand as the authoritative source.", color: "#3b82f6" },
            { icon: "⚡", type: "Contrarian Expert Opinion", desc: "A well-argued position that challenges conventional wisdom. Forbes and Fast Company actively seek thought leadership that provokes debate and generates reader engagement.", color: "#8b5cf6" },
            { icon: "🏆", type: "David vs Goliath", desc: "A small, innovative brand disrupting a legacy industry or outperforming a much larger competitor. Readers root for the underdog — journalists love the competitive narrative.", color: "#06b6d4" },
            { icon: "❤️", type: "Human Impact Stories", desc: "Real customer outcomes — revenue grown, jobs created, problems solved — that make abstract brand claims credible and emotionally resonant for readers.", color: "#22c55e" },
            { icon: "📰", type: "Timely Newsjacking", desc: "Connecting your executive's expertise to breaking industry news within hours. When a relevant story hits the news cycle, we pitch your leaders as expert commentators immediately.", color: "#f59e0b" },
            { icon: "🚀", type: "Milestone Announcements", desc: "Funding rounds, major wins, product launches — crafted with narrative context so they read as business news, not corporate press releases.", color: "#ec4899" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <GlassCard className="p-5 h-full" hover>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: item.color }}>{item.type}</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Media Relations for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "74% of consumers trust earned media — vs 34% for paid advertising. Editorial coverage is the most credible content type.",
                "HotBot Studios averages 12+ placements per campaign through 500+ active journalist relationships — not press release blasts.",
                "Our journalist response rate is 32% — 8× the industry average for cold outreach — because every pitch is personalised.",
                "Every Forbes or TechCrunch placement generates DA90+ backlinks that directly improve your Google search rankings.",
                "68% of B2B buyers research brands in the press before purchasing — media coverage is a sales conversion tool.",
                "Media coverage is amplified across LinkedIn, email, website, and paid social — extending the ROI of every earned win.",
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
        title="Ready to Get Your Brand in the Press?"
        subtitle="Tell us which publications matter most to your buyers and investors. We'll identify your strongest story angles and design a targeted media outreach plan. Free media audit included."
        formType="strategy-call"
      />
    </>
  );
}
