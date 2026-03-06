import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Product & Explainer Video Production USA | HotBot Studios",
  description:
    "HotBot Studios produces product demo and explainer videos for US SaaS and e-commerce brands. 60–90 second videos that overcome objections and drive purchases. Free video strategy session.",
  keywords: [
    "product video production USA",
    "explainer video agency USA",
    "SaaS explainer video USA",
    "product demo video production",
    "animated explainer video USA",
    "B2B product video agency",
    "ecommerce product video production",
  ],
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production/product-explainer-videos" },
  openGraph: {
    title: "Product & Explainer Video Production USA | HotBot Studios",
    description: "60–90 second product demos and explainer videos that simplify complex ideas and drive conversions. Built for SaaS, e-commerce, and B2B brands.",
    url: "https://hotbotstudios.com/content-studio/video-production/product-explainer-videos",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Product & Explainer Video Production",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Product Video & Explainer Video Production",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional product demo and explainer video production for US B2B SaaS, e-commerce, and service brands. Script, animation or live-action shoot, voiceover, and multi-platform delivery included.",
  url: "https://hotbotstudios.com/content-studio/video-production/product-explainer-videos",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
    { "@type": "ListItem", position: 4, name: "Product & Explainer Videos", item: "https://hotbotstudios.com/content-studio/video-production/product-explainer-videos" },
  ],
};

const CONTENT = [
  {
    heading: "Why Product Videos Are the Highest-Converting Asset in Your Funnel",
    body: "Buyers who watch a product video are 85% more likely to complete a purchase, according to Wyzowl's 2025 State of Video Marketing report. That figure holds across B2B SaaS trials, e-commerce add-to-cart events, and professional services inquiry forms. The reason is simple: a well-produced product video answers every objection in 90 seconds. It shows the product in action, demonstrates the outcome the buyer is paying for, and removes the cognitive friction of imagining how something works. In competitive categories — where every vendor says they are the best — showing is infinitely more persuasive than telling. A product video embedded on your pricing page or landing page works 24 hours a day, converting visitors who would otherwise leave without contacting you.",
    color: "#8b5cf6",
  },
  {
    heading: "The HotBot Approach: Script First, Then Screen",
    body: "Every product video we produce starts with a structured creative brief — your target persona, the single most important objection to overcome, and the one action you want viewers to take. Our scriptwriting team then builds a narrative arc in three acts: the problem your buyer recognises in their own life, the mechanism of how your product solves it, and the outcome they can expect. We do not write scripts that list features — we write scripts that sell transformation. Once the script is approved, we map it to either a live-action screen-recording-and-talking-head format (ideal for SaaS and software), an animated motion-graphics format (ideal for abstract products or complex data workflows), or a hybrid approach that combines both. Every format is completed with professional voiceover, sound design, and on-screen text overlays for captions-on viewing.",
    color: "#ec4899",
  },
  {
    heading: "Where Explainer Videos Fit Across Your Funnel",
    body: "Product and explainer videos do not live in a single place — they are adaptive assets that perform differently depending on where they are placed. On your homepage above the fold, a 60-second explainer increases visitor-to-lead conversion by an average of 20% in our client data. On a product landing page paired with a free-trial CTA, it reduces the cost per trial start by addressing objections before the click. In a cold outbound email sequence, a personalised video thumbnail linked to a product demo receives 3× more replies than a plain-text email. In paid social campaigns on LinkedIn, YouTube, and Meta, product demo videos consistently outperform static image ads on cost-per-click and cost-per-conversion. We help you map the right video format to each stage of your funnel and delivery channel.",
    color: "#3b82f6",
  },
  {
    heading: "Deliverables, Formats, and Timeline",
    body: "A standard product or explainer video engagement delivers your final video in 2–3 weeks: one week for scripting and approval, one week for production and animation or filming, and one week for edit, revisions, voiceover integration, and final delivery. You receive the master file in 16:9 for website and YouTube, a 9:16 cut for Instagram Reels and TikTok, a 1:1 square cut for LinkedIn and social feeds, and an asset package including all thumbnail options. For SaaS products, we can also produce a library of shorter 15–30 second feature-highlight clips from the same shoot day — ideal for product update announcements, onboarding flows, and email sequences. Request a free consultation below and we will share relevant portfolio samples within 24 hours.",
    color: "#06b6d4",
  },
];

export default function ProductExplainerVideosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Video Production", href: "/content-studio/video-production" }, { label: "Product Explainer Videos" }]} />

      <PageHeader
        label="Product & Explainer Videos"
        title="Show Don't Tell — Video That Converts Visitors Into Buyers"
        subtitle="60–90 second product demos and explainer videos that overcome objections, simplify complex ideas, and drive purchases. Script, production, and delivery included."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div
                className="w-1 h-10 rounded-full mb-4"
                style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }}
              />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Explainer Video Proposal</h2>
            <p className="text-slate-400">Tell us about your product and target audience. We will respond with a script outline and production proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="video-product-explainer"
            accentColor="#8b5cf6"
            title="Start Your Product Video Project"
            subtitle="No obligation. Share your product, your audience, and the outcome you want viewers to take action on."
          />
        </Reveal>
      </section>
    </>
  );
}
