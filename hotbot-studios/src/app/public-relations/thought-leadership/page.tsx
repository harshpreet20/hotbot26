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
  title: "Thought Leadership & Awards PR Agency USA — Speaking, Bylines & Industry Recognition | HotBot Studios",
  description:
    "HotBot Studios builds executive thought leadership for US businesses: conference speaking placements, byline articles in Forbes and Inc., industry award submissions, and LinkedIn authority programmes. Free thought leadership audit.",
  keywords: [
    "thought leadership agency USA",
    "executive thought leadership USA",
    "industry award submission agency",
    "conference speaking placement USA",
    "byline article agency USA",
    "Forbes contributor programme",
    "Inc. magazine byline USA",
    "LinkedIn thought leadership agency",
    "B2B thought leadership USA",
    "executive personal brand USA",
    "industry recognition agency USA",
    "keynote speaker placement USA",
    "expert commentary PR USA",
    "thought leadership content USA",
  ],
  openGraph: {
    title: "Thought Leadership & Awards PR Agency USA | HotBot Studios",
    description: "Conference speaking, Forbes/Inc. bylines, industry awards & LinkedIn authority for US executives. Build category credibility that drives inbound.",
    url: "https://hotbotstudios.com/public-relations/thought-leadership",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Thought Leadership PR Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thought Leadership & Awards PR Agency USA | HotBot Studios",
    description: "Speaking placements, Forbes bylines, industry awards & LinkedIn authority for US executives.",
  },
  alternates: { canonical: "https://hotbotstudios.com/public-relations/thought-leadership" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Thought Leadership & Awards PR for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Thought Leadership & Executive PR",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Executive thought leadership programmes for US businesses: conference speaking placements, byline article ghostwriting for Forbes and Inc., industry award submissions, and LinkedIn personal brand development for founders and executives.",
  url: "https://hotbotstudios.com/public-relations/thought-leadership",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Awards & Thought Leadership", item: "https://hotbotstudios.com/public-relations/thought-leadership" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is thought leadership and why does it matter for B2B sales?", acceptedAnswer: { "@type": "Answer", text: "Thought leadership is the strategic positioning of a company or individual as the go-to expert in a category — through published articles, conference speaking, original research, podcast appearances, and industry recognition. In B2B sales, 55% of decision-makers say thought leadership is one of the most important factors in selecting a vendor. Companies with recognised thought leaders close deals 40% faster and command premium pricing because buyers trust known experts over unknown alternatives." } },
    { "@type": "Question", name: "Can HotBot Studios ghostwrite byline articles for our executives?", acceptedAnswer: { "@type": "Answer", text: "Yes — executive ghostwriting is one of our core thought leadership services. We interview your executive, extract their genuine insights and experiences, and write the byline article in their authentic voice. The article is then placed in their name in target publications such as Forbes, Inc., Entrepreneur, Fast Company, or industry trade journals. This is an industry-standard practice used by the majority of published executives." } },
    { "@type": "Question", name: "What industry awards should we apply for?", acceptedAnswer: { "@type": "Answer", text: "HotBot Studios conducts an awards audit to identify the most credible, competitive, and strategically valuable awards for your industry and stage. We focus on awards with independent judging criteria (not pay-to-play), strong media coverage of winners, and relevance to your target buyer's reference frame. We prepare and submit all application materials, including supporting data, case studies, and executive bios." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🎤", title: "Conference Speaking Placements", desc: "Research, application, and pitch preparation for keynote and panel speaking opportunities at the conferences your customers and investors attend — from industry summits to TEDx stages.", href: "/public-relations/thought-leadership" },
  { icon: "✍️", title: "Byline Article Ghostwriting & Placement", desc: "Ghostwritten byline articles placed in Forbes, Inc., Entrepreneur, Fast Company, and industry-specific trade publications — in your executive's voice, to their byline, building personal authority at scale.", href: "/public-relations/thought-leadership" },
  { icon: "🏆", title: "Industry Award Submissions", desc: "Comprehensive award audit, identification of the most credible and valuable industry awards, and full submission preparation — including supporting data, case studies, impact statements, and executive bios.", href: "/public-relations/thought-leadership" },
  { icon: "💼", title: "LinkedIn Authority Programme", desc: "Systematic LinkedIn personal brand development for founders and executives — content strategy, ghostwritten posts, article publishing, connection strategy, and analytics-driven optimisation to build inbound authority.", href: "/public-relations/thought-leadership" },
  { icon: "🔬", title: "Original Research & Thought Leadership Reports", desc: "Commission and publish proprietary industry research — surveys, data analysis, and trend reports — that positions your brand as the authoritative source in your category and generates sustained earned media coverage.", href: "/public-relations/thought-leadership" },
  { icon: "💬", title: "Expert Commentary & Media Quotes", desc: "Proactive positioning of your executives as available expert commentators for journalists covering your industry — building a regular cadence of media mentions and quoted authority in national and trade publications.", href: "/public-relations/thought-leadership" },
];

const STATS = [
  { value: 55, suffix: "%", label: "of B2B Buyers Choose Vendors with Thought Leaders", color: "#8b5cf6" },
  { value: 40, suffix: "%", label: "Faster Deal Close with Recognised Experts", color: "#3b82f6" },
  { value: 50, suffix: "+", label: "Speaking Placements Secured", color: "#f59e0b" },
  { value: 200, suffix: "+", label: "Byline Articles Placed", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Authority Audit & Strategy", desc: "Map your executive's existing authority — publications, speaking history, LinkedIn presence, and competitor thought leaders. Identify the fastest path to credible category authority in your specific market.", icon: "🔍" },
  { n: 2, title: "Content & Platform Strategy", desc: "Define your executive's 3–5 core thought leadership themes, target publications, target conferences, and LinkedIn content pillars — all aligned to your business development goals.", icon: "📋" },
  { n: 3, title: "Content Creation & Placement", desc: "Ghostwrite byline articles, develop award submissions, prepare conference speaking proposals, and publish LinkedIn content — all in a coordinated programme that builds cumulative authority over time.", icon: "✍️" },
  { n: 4, title: "Amplify & Measure", desc: "Amplify every placement — bylines, speaking appearances, award wins — across LinkedIn, email, and press. Track authority metrics: publication mentions, speaking invitations, LinkedIn follower growth, and inbound leads attributed to thought leadership.", icon: "📊" },
];

const FAQS = [
  { q: "What is thought leadership and why does it matter for B2B sales?", a: "Thought leadership is the strategic positioning of a company or executive as the go-to expert in a category. 55% of B2B decision-makers say thought leadership is one of the most important vendor selection factors. Companies with recognised thought leaders close deals 40% faster and command premium pricing." },
  { q: "Can HotBot Studios ghostwrite byline articles for our executives?", a: "Yes — we interview your executive, extract their genuine insights, and write byline articles in their authentic voice for placement in Forbes, Inc., Entrepreneur, Fast Company, and trade publications. Ghostwriting is industry-standard practice for the majority of published executives." },
  { q: "What industry awards should we apply for?", a: "We conduct an awards audit to identify credible, competitive, and strategically valuable awards — focusing on those with independent judging (not pay-to-play), strong media coverage of winners, and relevance to your target buyer. We prepare and submit all application materials." },
  { q: "How long does it take to build executive thought leadership?", a: "Meaningful thought leadership — where your executive is regularly cited in the press, speaking at conferences, and generating inbound from LinkedIn — typically takes 6–12 months of consistent programme execution. Individual placements can happen within weeks. Sustained authority is a compounding long-term asset." },
  { q: "What is the difference between thought leadership and traditional PR?", a: "Traditional PR focuses on brand-level news: product launches, funding rounds, company milestones. Thought leadership PR focuses on individual executive authority: byline articles in their name, conference speaking in their role, and expert commentary attributed to them. Both build credibility, but thought leadership builds personal authority that persists even if the brand changes direction." },
  { q: "Do you manage LinkedIn content for executives?", a: "Yes — our LinkedIn Authority Programme includes content strategy, ghostwritten posts (typically 3–5 per week), long-form article publishing, strategic engagement, connection and follower growth, and monthly analytics review. Most executive clients see 3–5× follower growth and 10× post engagement within 6 months." },
];

const RELATED = [
  { title: "Media Relations", href: "/public-relations/media-relations", desc: "Pair thought leadership with earned media placements in major press.", icon: "📰" },
  { title: "Podcast & Influencer PR", href: "/public-relations/podcast-pr", desc: "Extend thought leadership with podcast guest appearances.", icon: "🎙️" },
  { title: "Copywriting & Long-Form Content", href: "/content-studio/copywriting", desc: "Expert writers for whitepapers and thought leadership research reports.", icon: "✍️" },
];

export default function ThoughtLeadershipPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Thought Leadership & Awards PR USA"
        title="Become the Go-To Expert in Your Industry"
        subtitle="Buyers choose vendors they trust. HotBot Studios builds executive authority through conference speaking placements, Forbes and Inc. byline articles, industry award programmes, and LinkedIn personal brand development — positioning your leaders as the category experts buyers seek out."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Executive thought leadership (definition):</strong> The strategic positioning of a company founder, executive, or subject matter expert as a recognised authority in their industry — achieved through a sustained programme of published byline articles, conference keynotes, podcast appearances, original research, industry awards, and social media content. Thought leadership is a long-term brand asset: it generates inbound leads, accelerates sales cycles, supports premium pricing, and provides reputational resilience during market downturns or competitive challenges.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Thought Leadership Business Impact ────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">The Measurable Business Impact of Executive Thought Leadership</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { stat: "55%", label: "of B2B decision-makers say thought leadership influences vendor selection (Edelman)", color: "#8b5cf6" },
                  { stat: "40%", label: "faster deal close rate for companies with recognised industry thought leaders", color: "#3b82f6" },
                  { stat: "64%", label: "of C-suite executives say thought leadership is the most credible marketing format", color: "#06b6d4" },
                  { stat: "3×", label: "higher inbound lead volume for executives with active LinkedIn thought leadership", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.stat}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Thought leadership channels by impact */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Thought Leadership Channel Impact on B2B Buyer Trust (Edelman-LinkedIn 2025)</p>
              <div className="space-y-3">
                {[
                  { channel: "Published research / original data reports", impact: 92, color: "#8b5cf6" },
                  { channel: "Conference keynote speaking", impact: 87, color: "#3b82f6" },
                  { channel: "Byline articles in tier-1 publications", impact: 84, color: "#06b6d4" },
                  { channel: "Podcast guest appearances (industry shows)", impact: 76, color: "#22c55e" },
                  { channel: "LinkedIn long-form thought leadership", impact: 68, color: "#f59e0b" },
                  { channel: "Industry award recognition", impact: 61, color: "#ec4899" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-60 shrink-0 text-right hidden md:block">{row.channel}</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${row.impact}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">{row.impact}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Thought Leadership Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Thought Leadership Programme Results" />
      <ProcessSteps steps={PROCESS} title="Our Thought Leadership Programme Process" />

      {/* ── Thought Leadership Pillars ────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Building an Executive Thought Leadership Platform</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: "🎤", title: "Speaking: The Fastest Trust Builder", desc: "A keynote in front of 500 of your target customers delivers more brand trust than 500 cold emails. Conference speaking positions you as a category expert, generates coverage in event recaps, and creates video content repurposed across all channels.", color: "#8b5cf6" },
            { icon: "✍️", title: "Bylines: Authority That Compounds", desc: "A published byline in Forbes or Inc. lives indefinitely — it continues to be discovered via search, shared on LinkedIn, and cited in sales conversations for years after publication. The ROI compounds over time in a way ads cannot.", color: "#3b82f6" },
            { icon: "🏆", title: "Awards: Third-Party Validation", desc: "Industry award recognition is third-party credibility — a signal to buyers, recruits, and investors that your peers and an independent judging body have validated your excellence. One relevant award win generates press, LinkedIn content, and sales collateral.", color: "#f59e0b" },
            { icon: "💼", title: "LinkedIn: The Always-On Platform", desc: "70% of B2B decision-makers say LinkedIn thought leadership is one of the most credible marketing formats. A consistent executive LinkedIn presence generates inbound leads, recruitment interest, and media attention — 24/7.", color: "#22c55e" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
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
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Thought Leadership for US Business Leaders</h2>
            <ul className="space-y-2">
              {[
                "55% of B2B decision-makers say thought leadership influences which vendor they select — it directly drives revenue.",
                "Companies with recognised thought leaders close deals 40% faster and command premium pricing over unknown alternatives.",
                "HotBot Studios has secured 50+ conference speaking placements and placed 200+ byline articles for US executives.",
                "Executive ghostwriting for Forbes, Inc., and trade publications is industry-standard — we write in your authentic voice.",
                "Industry award programmes provide third-party validation that generates earned media, sales collateral, and recruiter interest.",
                "LinkedIn thought leadership generates 3× higher inbound lead volume when maintained consistently by a recognised expert.",
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
        title="Ready to Build Your Expert Reputation?"
        subtitle="Tell us your industry, your expertise, and the audience you want to reach. We'll design a thought leadership programme that positions you as the go-to authority in your category. Free authority audit included."
        formType="strategy-call"
      />
    </>
  );
}
