import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Digital PR & SEO Link Building Agency USA — DA50+ Backlinks from Editorial Coverage | HotBot Studios",
  description:
    "HotBot Studios builds high Domain Authority backlinks through editorial press coverage in major US publications. Digital PR that improves Google rankings and drives referral traffic simultaneously. Free Digital PR audit.",
  keywords: [
    "digital PR agency USA",
    "SEO link building agency USA",
    "editorial backlink building USA",
    "digital PR SEO USA",
    "high DA backlinks USA",
    "PR link building USA",
    "editorial coverage SEO USA",
    "authority link building USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/public-relations/digital-pr-seo" },
  openGraph: {
    title: "Digital PR & SEO Link Building Agency USA | HotBot Studios",
    description: "High DA editorial backlinks from major US publications that improve Google rankings and build brand credibility simultaneously.",
    url: "https://hotbotstudios.com/public-relations/digital-pr-seo",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital PR & SEO Link Building",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Digital PR and Editorial SEO Link Building",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Editorial digital PR campaigns that secure high Domain Authority backlinks from major US publications, improving Google rankings while building genuine brand credibility.",
  url: "https://hotbotstudios.com/public-relations/digital-pr-seo",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Public Relations", item: "https://hotbotstudios.com/public-relations" },
    { "@type": "ListItem", position: 3, name: "Digital PR & SEO Link Building", item: "https://hotbotstudios.com/public-relations/digital-pr-seo" },
  ],
};

const CONTENT = [
  {
    heading: "Why Editorial Backlinks Outperform Every Other Link Building Strategy",
    body: "Google's core ranking algorithm has been directionally consistent for two decades: links from authoritative, editorially independent sources are the strongest positive ranking signal that exists. A single editorial mention with a followed backlink from Forbes (DA 95), Inc. Magazine (DA 93), or TechCrunch (DA 94) is worth more to your organic search rankings than hundreds of links from guest posts, directories, or link exchanges — because it is the kind of link that Google's quality raters are instructed to consider as genuine evidence of credibility. Traditional SEO link building attempts to manufacture this signal through schemes that Google's algorithms are continuously updated to detect and discount. Digital PR earns the same links legitimately, through genuine editorial coverage — which means the links are permanent, carry full ranking benefit, and come with the additional benefit of real human readers clicking through to your website. HotBot Studios runs digital PR campaigns that systematically generate DA50+ editorial backlinks alongside genuine brand coverage.",
    color: "#22c55e",
  },
  {
    heading: "The Digital PR Playbook: Data-Led Stories and Reactive Newsjacking",
    body: "The two most reliable digital PR link acquisition strategies are data-led content and reactive newsjacking. Data-led campaigns involve commissioning or mining original research — a survey of your target audience, an analysis of your proprietary data set, or a Freedom of Information request to government agencies — and using the findings to pitch a story that publications want to cover because it is genuinely new information. Journalists consistently cite exclusive data as the pitch element most likely to result in coverage and a backlink. Reactive newsjacking involves monitoring news cycles for stories where your organisation or an executive can add credible, timely expert commentary — using tools like HARO (Help a Reporter Out), Qwoted, and journalist Twitter monitoring to identify and respond to the right opportunities within hours. HotBot Studios runs both strategies in parallel, delivering a predictable monthly volume of high-DA backlinks while also capitalising on breaking news opportunities as they arise.",
    color: "#3b82f6",
  },
  {
    heading: "Coverage in Major Publications: Forbes, Business Insider, and Trade Press",
    body: "The publications where digital PR backlinks carry the most SEO weight are also the publications where editorial standards are the highest — which is exactly why the links are so valuable. HotBot Studios has established contributor relationships and editorial contacts at major national publications (Forbes, Business Insider, Entrepreneur, Inc., Fast Company), high-DA news aggregators (MSN, Yahoo News, AP News), and the leading trade publications in over 20 industry verticals. These relationships were built through consistently delivering accurate, well-sourced, genuinely interesting stories — which means our pitches get prioritised and our clients get covered in publications that would ignore a cold outreach email from most agencies. Every campaign we run produces a detailed coverage report showing publication name, URL, Domain Authority, estimated monthly traffic, anchor text, and the SEO value of each link based on current keyword difficulty for your target terms.",
    color: "#8b5cf6",
  },
  {
    heading: "Measuring the SEO Impact: Rankings, Traffic, and Domain Authority Growth",
    body: "Digital PR's impact on organic search rankings is real and measurable — but it compounds over time rather than delivering instant results. A single high-DA backlink from Forbes may not visibly move a keyword ranking, but twelve months of consistent editorial link acquisition from DA50+ sources will produce meaningful Domain Authority growth for your website, improved rankings for your target keywords, and increased organic search traffic. HotBot Studios tracks your domain's backlink profile monthly using Ahrefs and SEMrush, monitoring Domain Authority trajectory, the growth of your referring domain count, changes in your target keyword rankings, and the organic traffic attributed to digital PR activity. We also identify competitor link gaps — high-DA sites that link to your competitors but not to you — and develop targeted campaigns to close those gaps. Request a free digital PR audit below and we will analyse your current backlink profile and identify the highest-impact opportunities available for your website.",
    color: "#06b6d4",
  },
];

export default function DigitalPrSeoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Digital PR & SEO Link Building"
        title="Editorial Coverage That Builds Rankings and Brand Credibility Simultaneously"
        subtitle="High DA editorial backlinks from major US publications — Forbes, Business Insider, trade press, and 500+ editorial outlets — that improve Google rankings and drive real referral traffic."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Digital PR & Backlink Audit</h2>
            <p className="text-slate-400">Share your website URL and target keywords. We will analyse your backlink profile and identify the highest-impact editorial link opportunities within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="pr-digital-pr-seo"
            accentColor="#22c55e"
            title="Start Your Digital PR Campaign"
            subtitle="No obligation. Share your domain, target keywords, and competitors and we will build a campaign strategy."
          />
        </Reveal>
      </section>
    </>
  );
}
