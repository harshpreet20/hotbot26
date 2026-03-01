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
  title: "Podcast & Influencer PR Services USA | Guest Placements & Partnerships | HotBot Studios",
  description:
    "Strategic podcast guest placements on top US shows + influencer partnership management for B2B and B2C brands. Reach engaged niche audiences through authentic endorsements. HotBot Studios.",
  keywords: [
    "podcast PR services USA",
    "podcast guest placement agency",
    "influencer PR agency USA",
    "B2B podcast marketing",
    "podcast booking agency",
    "influencer partnership management",
    "podcast publicity USA",
    "thought leadership podcast",
    "B2C influencer PR",
    "podcast outreach agency",
  ],
  openGraph: {
    title: "Podcast & Influencer PR Services USA | HotBot Studios",
    description:
      "Strategic podcast guest placements on top US shows + influencer partnership management. Reach engaged audiences through authentic endorsements.",
    url: "https://hotbotstudios.com/public-relations/podcast-pr",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast & Influencer PR Services USA | HotBot Studios",
    description:
      "Strategic podcast guest placements + influencer partnership management for US brands.",
  },
  alternates: {
    canonical: "https://hotbotstudios.com/public-relations/podcast-pr",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Podcast & Influencer PR",
  description:
    "Strategic podcast guest placements on the top shows your target audience listens to, plus influencer partnership management for B2C and B2B brands seeking authentic endorsements.",
  provider: {
    "@type": "Organization",
    name: "HotBot Studios",
    url: "https://hotbotstudios.com",
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  serviceType: "Podcast & Influencer PR",
  url: "https://hotbotstudios.com/public-relations/podcast-pr",
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
      name: "Podcast & Influencer PR",
      item: "https://hotbotstudios.com/public-relations/podcast-pr",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do you select which podcasts to target for guest placements?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We research your ideal customer profile (ICP) and identify shows where your target audience already spends time. We evaluate listener demographics, episode cadence, host engagement quality, and audience size — prioritising relevance and engagement rate over raw download numbers. A niche show with 5,000 highly targeted listeners often outperforms a general show with 50,000 passive ones.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between podcast PR and traditional media PR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Podcast PR targets niche, engaged audio audiences rather than mass broadcast audiences. Podcast listeners consume 60–90 minutes of uninterrupted content per episode, creating deeper brand affinity than a 3-second headline scan. Conversion rates from podcast listeners are significantly higher than traditional media readers because the medium builds trust through long-form conversation.",
      },
    },
    {
      "@type": "Question",
      name: "How do you manage influencer partnerships for B2B brands?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "B2B influencer PR focuses on industry analysts, LinkedIn creators, newsletter authors, and niche YouTubers rather than Instagram lifestyle influencers. We identify voices your target buyers already trust, structure performance-based or fixed-fee partnerships, create content briefs that preserve authentic voice, and track referral traffic, lead attribution, and brand mention lift across the campaign.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to secure a podcast guest placement?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most podcast booking cycles take 4–12 weeks from initial outreach to recorded episode, then an additional 2–8 weeks before the episode publishes. We run ongoing outreach to multiple shows simultaneously so placements arrive on a rolling basis rather than all at once. We typically secure the first confirmed booking within 3–5 weeks of campaign launch.",
      },
    },
    {
      "@type": "Question",
      name: "Can you manage the full process from outreach to episode promotion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — we handle every stage: show research, personalised pitch writing, scheduling coordination, pre-interview briefing, key message preparation, episode monitoring, and post-release amplification. We also create social cut-downs, quote cards, and email newsletter snippets from each episode to maximise reach beyond the podcast audience.",
      },
    },
    {
      "@type": "Question",
      name: "What results can we expect from a podcast PR campaign?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Results vary by niche, brand authority, and campaign duration. Typical outcomes include 3–8 podcast placements per quarter, measurable referral traffic spikes post-episode, direct lead enquiries citing the podcast, and compounding domain authority lift from show notes backlinks. Brands that sustain podcast PR for 6+ months consistently report it as one of their highest-converting lead channels.",
      },
    },
  ],
};

const SUB_SERVICES = [
  {
    icon: "🎙️",
    title: "Podcast Guest Placement",
    desc: "Research, pitch, and book guest appearances on the top US shows your ideal customers listen to — from industry niche to mainstream business.",
    href: "/public-relations/podcast-pr",
  },
  {
    icon: "🤝",
    title: "Influencer Partnership Management",
    desc: "Identify, negotiate, and manage relationships with B2B or B2C influencers aligned with your brand values and buyer personas.",
    href: "/public-relations/podcast-pr",
  },
  {
    icon: "✍️",
    title: "Pitch & Message Strategy",
    desc: "Craft compelling story angles, talking points, and pitch decks that get accepted — then prepare you to deliver a memorable, on-brand interview.",
    href: "/public-relations/podcast-pr",
  },
  {
    icon: "📊",
    title: "Campaign Tracking & Attribution",
    desc: "UTM links, referral traffic monitoring, mention tracking, and lead source attribution so every placement proves its ROI.",
    href: "/public-relations/podcast-pr",
  },
  {
    icon: "🎬",
    title: "Episode Content Repurposing",
    desc: "Turn each podcast appearance into social clips, quote graphics, blog posts, email snippets, and LinkedIn carousels for maximum audience reach.",
    href: "/public-relations/podcast-pr",
  },
  {
    icon: "🌐",
    title: "Creator & Newsletter Partnerships",
    desc: "Extend beyond audio into sponsored newsletter placements and YouTube creator partnerships where niche B2B and B2C audiences are highly engaged.",
    href: "/public-relations/podcast-pr",
  },
];

const STATS = [
  { value: 504, suffix: "M+", label: "Monthly US Podcast Listeners", color: "#f59e0b" },
  { value: 7, suffix: "×", label: "Higher Conversion vs Display Ads", color: "#f59e0b" },
  { value: 80, suffix: "%", label: "Listeners Act on Host Recommendations", color: "#f59e0b" },
  { value: 60, suffix: "min", label: "Average Episode Attention Span", color: "#f59e0b" },
];

const PROCESS = [
  {
    n: 1,
    title: "Audience & Show Research",
    desc: "We map your ICP to shows they actively consume — analysing listener demographics, episode quality, host credibility, and brand fit before any outreach begins.",
    icon: "🔍",
  },
  {
    n: 2,
    title: "Personalised Pitch & Booking",
    desc: "We craft story-first pitches tailored to each host's audience and format, then manage the entire booking calendar, contracts, and pre-interview briefing.",
    icon: "📨",
  },
  {
    n: 3,
    title: "Recording & Key Message Delivery",
    desc: "We brief you with key messages, story frameworks, and memorable soundbites so your episode leaves a lasting impression and drives listener action.",
    icon: "🎙️",
  },
  {
    n: 4,
    title: "Amplification & ROI Reporting",
    desc: "Post-publication, we repurpose content across your channels, track referral traffic and leads, and report placement impact against campaign KPIs.",
    icon: "📈",
  },
];

const FAQS = [
  {
    q: "How do you select which podcasts to target for guest placements?",
    a: "We research your ideal customer profile (ICP) and identify shows where your target audience already spends time. We evaluate listener demographics, episode cadence, host engagement quality, and audience size — prioritising relevance and engagement rate over raw download numbers. A niche show with 5,000 highly targeted listeners often outperforms a general show with 50,000 passive ones.",
  },
  {
    q: "What's the difference between podcast PR and traditional media PR?",
    a: "Podcast PR targets niche, engaged audio audiences rather than mass broadcast audiences. Podcast listeners consume 60–90 minutes of uninterrupted content per episode, creating deeper brand affinity than a 3-second headline scan. Conversion rates from podcast listeners are significantly higher than traditional media readers because the medium builds trust through long-form conversation.",
  },
  {
    q: "How do you manage influencer partnerships for B2B brands?",
    a: "B2B influencer PR focuses on industry analysts, LinkedIn creators, newsletter authors, and niche YouTubers rather than Instagram lifestyle influencers. We identify voices your target buyers already trust, structure performance-based or fixed-fee partnerships, create content briefs that preserve authentic voice, and track referral traffic, lead attribution, and brand mention lift across the campaign.",
  },
  {
    q: "How long does it take to secure a podcast guest placement?",
    a: "Most podcast booking cycles take 4–12 weeks from initial outreach to recorded episode, then an additional 2–8 weeks before the episode publishes. We run ongoing outreach to multiple shows simultaneously so placements arrive on a rolling basis rather than all at once. We typically secure the first confirmed booking within 3–5 weeks of campaign launch.",
  },
  {
    q: "Can you manage the full process from outreach to episode promotion?",
    a: "Yes — we handle every stage: show research, personalised pitch writing, scheduling coordination, pre-interview briefing, key message preparation, episode monitoring, and post-release amplification. We also create social cut-downs, quote cards, and email newsletter snippets from each episode to maximise reach beyond the podcast audience.",
  },
  {
    q: "What results can we expect from a podcast PR campaign?",
    a: "Results vary by niche, brand authority, and campaign duration. Typical outcomes include 3–8 podcast placements per quarter, measurable referral traffic spikes post-episode, direct lead enquiries citing the podcast, and compounding domain authority lift from show notes backlinks. Brands that sustain podcast PR for 6+ months consistently report it as one of their highest-converting lead channels.",
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
    title: "Thought Leadership",
    href: "/public-relations/thought-leadership",
    desc: "Executive positioning through speaking, bylines, and industry awards.",
    icon: "🏆",
  },
  {
    title: "Digital PR & SEO Link Building",
    href: "/public-relations/digital-pr-seo",
    desc: "DA50+ backlinks from editorial coverage that boost your Google rankings.",
    icon: "🔗",
  },
];

const podcastGenres = [
  { genre: "Business & Entrepreneurship", reach: 92, color: "#f59e0b" },
  { genre: "Technology & SaaS", reach: 85, color: "#3b82f6" },
  { genre: "Marketing & Growth", reach: 78, color: "#8b5cf6" },
  { genre: "Finance & Investment", reach: 71, color: "#22c55e" },
  { genre: "Health & Wellness (B2C)", reach: 88, color: "#ec4899" },
  { genre: "Leadership & Management", reach: 65, color: "#06b6d4" },
];

const influencerTypes = [
  {
    type: "LinkedIn Creators",
    audience: "B2B Decision Makers",
    avgEngagement: "5.8%",
    bestFor: "SaaS, Professional Services",
    icon: "💼",
  },
  {
    type: "Industry Newsletter Authors",
    audience: "Niche Practitioners",
    avgEngagement: "38% open rate",
    bestFor: "DevTools, Fintech, HR Tech",
    icon: "📧",
  },
  {
    type: "YouTube Educators",
    audience: "Skill-Seekers & Buyers",
    avgEngagement: "12% watch-through",
    bestFor: "Software, Courses, Tools",
    icon: "▶️",
  },
  {
    type: "Instagram / TikTok Creators",
    audience: "Consumer & Lifestyle",
    avgEngagement: "4.2%",
    bestFor: "CPG, Fashion, Health, D2C",
    icon: "📱",
  },
];

export default function PodcastPRPage() {
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
        label="Podcast & Influencer PR"
        title="Reach Niche US Audiences Through Authentic Voice"
        subtitle="Strategic podcast guest placements on the top shows your buyers tune into — plus influencer partnership management for B2B and B2C brands. We handle booking, briefing, and amplification from start to finish."
      />

      {/* AEO Definition Block */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#f59e0b" }}>
              Definition — Podcast & Influencer PR
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Podcast PR</strong> is the practice of securing strategic guest appearances on podcasts where a brand&apos;s ideal customers are regular listeners, using long-form conversation to build trust, demonstrate expertise, and generate referral leads.{" "}
              <strong className="text-white">Influencer PR</strong> extends this to partnerships with content creators, newsletter authors, and social media personalities who have earned authority with specific niche audiences — enabling authentic third-party endorsement at scale.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Podcast Genre Reach Infographic */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <div
            className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-xl font-bold text-white mb-2">US Podcast Audience Reach by Genre</h2>
            <p className="text-slate-400 text-sm mb-6">Audience penetration index among US adults 18–54 (source: Edison Research, Spotify trends)</p>
            <div className="space-y-4">
              {podcastGenres.map((row) => (
                <div key={row.genre} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-56 shrink-0 text-right hidden md:block">
                    {row.genre}
                  </span>
                  <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${row.reach}%`,
                        background: `linear-gradient(90deg, ${row.color}40, ${row.color})`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-white hidden md:block">
                        {row.reach}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4">
              * Score out of 100 represents relative audience penetration index among US adults 18–54
            </p>
          </div>
        </Reveal>
      </section>

      <SubServices
        services={SUB_SERVICES}
        title="Podcast & Influencer PR Services"
        columns={3}
      />

      <ServiceStats stats={STATS} title="Why Podcast & Influencer PR Delivers" />

      <ProcessSteps steps={PROCESS} title="Our Podcast & Influencer PR Process" />

      {/* Influencer Type Comparison */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Influencer Type Selection Matrix
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {influencerTypes.map((item) => (
              <GlassCard key={item.type} className="p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{item.type}</h3>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Audience</span>
                    <span className="text-white font-medium">{item.audience}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Avg Engagement</span>
                    <span style={{ color: "#f59e0b" }} className="font-bold">{item.avgEngagement}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Best For</span>
                    <span className="text-white text-right">{item.bestFor}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "504M+ monthly US podcast listeners — the largest captive, engaged audience in media",
                "Podcast listeners convert at 7× higher rates than display ad audiences on average",
                "80% of podcast listeners report acting on a host recommendation at least once",
                "B2B influencer PR works through LinkedIn creators, newsletters, and niche YouTube — not Instagram",
                "Full-service management: research → pitch → booking → briefing → amplification → reporting",
                "Every episode generates repurposable content: social clips, quotes, blog posts, email snippets",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                  <span style={{ color: "#f59e0b" }} className="mt-0.5 shrink-0">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />

      <CTASection
        title="Ready to Land Your First Podcast Placement?"
        subtitle="Tell us about your brand and target audience — we'll identify the top 10 shows your buyers already listen to and pitch you within 30 days."
        formType="get-started"
      />
    </>
  );
}
