import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Press Release Writing & Distribution USA - PR Newswire & Direct Journalist Placement | HotBot Studios",
  description:
    "HotBot Studios writes and distributes press releases for US businesses - written by former journalists, distributed via PR Newswire, BusinessWire, and direct journalist relationships for maximum editorial pickup.",
  keywords: [
    "press release writing USA",
    "press release distribution USA",
    "PR Newswire distribution USA",
    "BusinessWire press release USA",
    "press release agency USA",
    "professional press release writing",
    "startup press release USA",
    "product launch press release USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/public-relations/press-releases" },
  openGraph: {
    title: "Press Release Writing & Distribution USA | HotBot Studios",
    description: "Press releases written by former journalists and distributed via PR Newswire, BusinessWire, and direct editorial relationships for US businesses.",
    url: "https://hotbotstudios.com/public-relations/press-releases",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Press Release Writing & Distribution",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Press Release Writing and Newswire Distribution",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional press release writing by former journalists and distribution via PR Newswire, BusinessWire, and direct editorial relationships for US businesses.",
  url: "https://hotbotstudios.com/public-relations/press-releases",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Press Release Writing & Distribution", item: "https://hotbotstudios.com/public-relations/press-releases" },
  ],
};

const CONTENT = [
  {
    heading: "What Separates a Press Release That Gets Covered from One That Gets Deleted",
    body: "Most press releases fail at the first sentence. They open with the company name, the product name, and a generic claim about being excited to announce something - which tells a journalist nothing useful in the two seconds they spend scanning before moving to the next email. Journalists are trained to answer one question instantly: why does this matter to my readers today? A press release that cannot answer that question in its headline and first paragraph will not be read past the second sentence. HotBot Studios employs former print and digital journalists who write press releases the way a journalist would write a news story: leading with the most newsworthy element, supporting it with concrete data and named sources, and framing it in the context of a broader trend that makes the story relevant beyond the company's own interests. The result is press releases that journalists can pull quotes from and use as the basis for their own coverage - rather than releases that require complete rewriting to become publishable.",
    color: "#8b5cf6",
  },
  {
    heading: "PR Newswire, BusinessWire, and Direct Editorial Distribution",
    body: "Newswire distribution via PR Newswire or BusinessWire serves a specific purpose: ensuring your announcement appears in Google News, is indexed by financial data terminals, satisfies SEC disclosure requirements for public companies, and is syndicated to the hundreds of regional news sites that republish wire content. This distribution creates a searchable online record of your announcement and drives immediate SEO value from news article backlinks. However, newswire distribution alone rarely produces original editorial coverage in tier-one publications - that requires a separate, personalised outreach campaign to the specific journalists whose beats align with your story. HotBot Studios manages both distribution channels: we submit your release to the appropriate newswire service, optimised with keywords and formatted for maximum syndication, and simultaneously conduct a targeted journalist outreach campaign to the publications where you actually want editorial coverage.",
    color: "#3b82f6",
  },
  {
    heading: "What Events Warrant a Press Release - and How to Time Them",
    body: "Not every company update warrants a press release, and sending releases for every minor announcement trains journalists to ignore your name in their inbox. The announcements that genuinely merit distribution are: significant funding rounds (typically Seed and above), major product launches or pivots, notable partnerships with recognisable brands, executive hires at C-suite or VP level with a strong story angle, acquisition announcements, significant proprietary data or research findings, and responses to major industry events where your company has a credible and timely perspective. Timing matters as much as content: releases sent on Tuesday through Thursday mornings Eastern time receive 30% higher open rates than those sent on Friday afternoon; releases timed to coincide with industry events or news cycles outperform generic timing by a significant margin. HotBot Studios advises on announcement timing, calendaring, and sequencing as part of every engagement.",
    color: "#22c55e",
  },
  {
    heading: "Multimedia Assets, SEO Optimisation, and Post-Distribution Follow-Up",
    body: "A modern press release is not just text - it includes high-resolution images, executive headshots, product screenshots or demo videos, and embedded data visualisations that make it easy for a journalist to illustrate their story without additional asset requests. We produce or source all required multimedia assets and include them in the distribution package and a dedicated press room page on your website. Every release we write is also optimised for search: keyword-rich headlines and subheadings, descriptive alt text on all images, and structured data markup that helps search engines surface your release in news results. After distribution, we conduct personalised follow-up outreach to the journalists most likely to cover your story - a polite, value-adding follow-up that surfaces additional data points or commentary and moves the conversation toward editorial coverage. Request a consultation below and we will review your upcoming announcement and advise on the right distribution approach.",
    color: "#f59e0b",
  },
];

export default function PressReleasesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Public Relations", href: "/public-relations" }, { label: "Press Releases" }]} />

      <PageHeader
        label="Press Release Writing & Distribution"
        title="Press Releases Written Like News - Because That Is What Gets Covered"
        subtitle="Former journalists write your press releases and distribute them via PR Newswire, BusinessWire, and direct editorial outreach to the publications most likely to cover your story."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div className="w-1 h-10 rounded-full mb-4" style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }} />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Press Release Consultation</h2>
            <p className="text-slate-400">Tell us about your upcoming announcement. We will advise on angle, timing, and the right distribution strategy - no obligation.</p>
          </div>
          <LeadCaptureForm
            sourceId="pr-press-releases"
            accentColor="#8b5cf6"
            title="Start Your Press Release Campaign"
            subtitle="Share your announcement details and we will scope the writing and distribution package."
          />
        </Reveal>
      </section>
    </>
  );
}
