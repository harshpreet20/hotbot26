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
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Copywriting & Long-Form Content Agency USA - SEO Blogs, Web Copy & Whitepapers | HotBot Studios",
  description:
    "HotBot Studios writes SEO-optimised blog articles, website copy, whitepapers, case studies, email sequences, and LinkedIn thought leadership for US businesses. Senior copywriters trained on conversion and AEO. Free content audit.",
  keywords: [
    "copywriting agency USA",
    "SEO blog writing service USA",
    "website copywriting agency",
    "long-form content agency USA",
    "B2B copywriting agency",
    "whitepaper writing service USA",
    "case study writing agency",
    "email copywriting agency USA",
    "LinkedIn ghostwriting service",
    "thought leadership content USA",
    "content marketing agency USA",
    "conversion copywriting agency",
    "SaaS copywriting agency USA",
    "blog writing services USA",
  ],
  openGraph: {
    title: "Copywriting & Long-Form Content Agency USA | HotBot Studios",
    description: "SEO blogs, website copy, whitepapers, case studies & email sequences for US businesses. Senior conversion copywriters. Free content audit.",
    url: "https://hotbotstudios.com/content-studio/copywriting",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Copywriting Agency USA - HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Copywriting & Long-Form Content Agency USA | HotBot Studios",
    description: "SEO blogs, web copy, whitepapers & email sequences for US businesses. Trained on conversion and AEO.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio/copywriting" },
};

// ── Schema Markup ────────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Copywriting & Long-Form Content Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Copywriting & Content Marketing",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Senior copywriting for US businesses: SEO blog articles, website copy, whitepapers, case studies, email sequences, and LinkedIn thought leadership. Built on conversion principles and AEO optimisation.",
  url: "https://hotbotstudios.com/content-studio/copywriting",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Copywriting & Long-Form Content", item: "https://hotbotstudios.com/content-studio/copywriting" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How quickly does HotBot Studios deliver blog articles?", acceptedAnswer: { "@type": "Answer", text: "Standard SEO blog articles (1,500–2,500 words) are delivered within 48 hours of brief approval. Long-form whitepapers and case studies (3,000–6,000 words) take 3–5 business days. Rush delivery is available for urgent campaigns." } },
    { "@type": "Question", name: "Do your blog articles rank on Google?", acceptedAnswer: { "@type": "Answer", text: "Yes - every article is built on a researched keyword strategy using SEMrush and Ahrefs, with proper heading hierarchy (H1/H2/H3), internal linking, schema markup, meta descriptions, and AEO-optimised FAQ sections. Clients typically see organic traffic growth within 60–90 days of consistent publishing." } },
    { "@type": "Question", name: "Can HotBot Studios write in our brand voice?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. We start every engagement with a Brand Voice Audit - reviewing your existing content, customer language, and competitor positioning. A Brand Voice Guide is maintained for your account and updated quarterly." } },
  ],
};

// ── Content Data ──────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "📝", title: "SEO Blog Articles", desc: "Keyword-researched, long-form blog articles (1,500–3,000 words) written to rank on Google, answer buyer questions at every funnel stage, and compound organic traffic over time. Includes meta, schema, and internal links.", href: "/content-studio/copywriting" },
  { icon: "🌐", title: "Website & Landing Page Copy", desc: "Conversion-focused website copy that communicates your value proposition clearly, addresses objections, and drives visitors to the next step. Home page, service pages, product pages, and high-converting landing pages.", href: "/content-studio/copywriting" },
  { icon: "📄", title: "Whitepapers & Research Reports", desc: "Authoritative long-form content (3,000–8,000 words) that establishes thought leadership, supports enterprise sales cycles, and serves as gated lead magnets. Designed and formatted to publication standard.", href: "/content-studio/copywriting" },
  { icon: "📊", title: "Case Studies", desc: "Structured customer success stories that highlight measurable results, overcome common objections, and provide the social proof that closes deals at the bottom of your funnel. Written, designed, and optimised for web and PDF.", href: "/content-studio/copywriting" },
  { icon: "📧", title: "Email Sequences & Newsletters", desc: "Welcome sequences, nurture drips, re-engagement campaigns, and weekly newsletters - written to drive opens, clicks, and conversions. Average email ROI: 42:1 (DMA 2025). A/B subject line variants included.", href: "/content-studio/copywriting" },
  { icon: "💼", title: "LinkedIn Thought Leadership", desc: "Ghostwritten LinkedIn posts, articles, and newsletters for founders, executives, and subject matter experts. Built to grow personal brand authority, generate inbound leads, and establish category expertise.", href: "/content-studio/copywriting" },
];

const STATS = [
  { value: 6, suffix: "×", label: "Avg SEO Content ROI (12 months)", color: "#8b5cf6" },
  { value: 42, suffix: ":1", label: "Email Marketing ROI (DMA 2025)", color: "#3b82f6" },
  { value: 48, suffix: "hr", label: "Blog Article Turnaround", color: "#ec4899" },
  { value: 300, suffix: "+", label: "Articles & Copy Projects Delivered", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Brand Voice & Keyword Research", desc: "We audit your existing content, research your target keywords (using SEMrush and Ahrefs), and build a content brief that balances search volume, competition, and brand alignment.", icon: "🔍" },
  { n: 2, title: "Outline & Brief Approval", desc: "Before a word of body copy is written, we share a structured outline covering headline options, H2/H3 structure, key arguments, sources, and CTAs. You approve before we write.", icon: "📋" },
  { n: 3, title: "Expert Copywriting", desc: "Senior copywriters - specialists in your industry - write the content. No generalist AI dumps. Every piece is written to the brief, in your brand voice, and to conversion-first principles.", icon: "✍️" },
  { n: 4, title: "SEO Optimisation & Delivery", desc: "Final copy is optimised for target keywords, heading structure, internal links, meta description, and AEO FAQ sections. Delivered in your preferred format: Google Doc, WordPress draft, or CMS-ready HTML.", icon: "🚀" },
];

const FAQS = [
  { q: "How quickly does HotBot Studios deliver blog articles?", a: "Standard SEO blog articles (1,500–2,500 words) are delivered within 48 hours of brief approval. Long-form whitepapers and case studies (3,000–6,000 words) take 3–5 business days. Rush delivery is available for time-sensitive campaigns." },
  { q: "Do your blog articles rank on Google?", a: "Yes - every article is built on a researched keyword strategy (SEMrush + Ahrefs), proper heading hierarchy, internal linking, schema markup, AEO-optimised FAQ sections, and optimised meta descriptions. Clients typically see organic traffic growth within 60–90 days of consistent publishing." },
  { q: "Can HotBot Studios write in our brand voice?", a: "Absolutely. We conduct a Brand Voice Audit at the start - reviewing your existing content, customer language, and competitor positioning. A Brand Voice Guide is maintained for your account and updated quarterly." },
  { q: "What is AEO and why does it matter for our content?", a: "AEO (Answer Engine Optimisation) is the practice of structuring content to be surfaced by AI-powered search engines like Google's SGE, Perplexity, ChatGPT Search, and Bing Copilot. In 2026, optimising for AI answer boxes is as important as traditional SEO. Every HotBot Studios article includes definition blocks, structured FAQs, and clear answer-first formatting." },
  { q: "Do you use AI to write content?", a: "We use AI as a research and drafting accelerator, but every piece is written, edited, and approved by a senior human copywriter who specialises in your industry. You never receive unedited AI output. Our brand voice guides ensure consistency across every piece regardless of who writes it." },
  { q: "How does copywriting integrate with SEO and digital marketing?", a: "Content and SEO are inseparable at HotBot Studios. Our SEO team informs content briefs with keyword data, our copywriters produce the articles, and our digital marketing team uses high-performing content as fuel for paid promotion and email campaigns. One integrated system." },
];

const RELATED = [
  { title: "SEO & Digital Marketing", href: "/digital-marketing/seo-services", desc: "Drive organic traffic to the content we create for you.", icon: "🔍" },
  { title: "Podcast Production", href: "/content-studio/podcast-production", desc: "Turn your expertise into a branded podcast series.", icon: "🎙️" },
  { title: "Public Relations", href: "/public-relations", desc: "Get your long-form content featured in major publications.", icon: "📰" },
];

export default function CopywritingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Copywriting" }]} />

      <PageHeader
        label="Copywriting & Long-Form Content USA"
        title="Words That Rank, Resonate, and Revenue-Generate"
        subtitle="Generic blog mills produce content that never ranks and nobody reads. HotBot Studios writes expert-led, SEO-optimised articles, website copy, whitepapers, and email sequences that attract qualified buyers and compound in value over time."
      />

      {/* ── Definition Block (AEO) ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Conversion copywriting (definition):</strong> The discipline of writing content - website copy, blog articles, email sequences, and sales materials - that is simultaneously optimised for search engine rankings (SEO), AI answer engines (AEO), and human persuasion psychology. In 2026, effective copywriting must satisfy Google&apos;s E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness), AI search engines&apos; preference for structured, definition-first content, and the reader&apos;s desire for actionable, specific information - not generic filler.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Content ROI by Format ──────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Content ROI: Which Formats Deliver the Most Value in 2026</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { metric: "6×", label: "avg ROI from SEO blog content over 12 months", color: "#8b5cf6" },
                  { metric: "42:1", label: "email marketing ROI - highest of any digital channel (DMA 2025)", color: "#3b82f6" },
                  { metric: "4.7×", label: "more leads from companies that blog 16+ times/month (HubSpot)", color: "#22c55e" },
                  { metric: "67%", label: "of B2B buyers read 3+ pieces of content before talking to sales", color: "#f59e0b" },
                  { metric: "50%", label: "of B2B buyers use whitepapers in purchase decisions (DemandGen)", color: "#06b6d4" },
                  { metric: "97%", label: "more inbound links to websites that publish long-form content", color: "#ec4899" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl text-center" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                    <div className="text-xl md:text-2xl font-black mb-1" style={{ color: item.color }}>{item.metric}</div>
                    <div className="text-slate-400 text-xs leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Content format comparison bars */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Estimated Long-Term Organic Value by Content Type (compounding effect)</p>
              <div className="space-y-3">
                {[
                  { label: "SEO Blog Articles (16+/mo)", value: 95, color: "#8b5cf6" },
                  { label: "Whitepapers / Gated Reports", value: 80, color: "#3b82f6" },
                  { label: "Case Studies", value: 75, color: "#22c55e" },
                  { label: "Email Nurture Sequences", value: 65, color: "#f59e0b" },
                  { label: "LinkedIn Thought Leadership", value: 55, color: "#06b6d4" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-52 shrink-0 text-right hidden md:block">{row.label}</span>
                    <span className="text-slate-400 text-xs shrink-0 md:hidden">{row.value}%</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${row.value}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-bold text-white hidden md:block">{row.value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">Sources: HubSpot State of Marketing 2025, DMA Email Marketing Report 2025, DemandGen Report 2025</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Copywriting & Content Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Content Performance Results" />
      <ProcessSteps steps={PROCESS} title="Our Copywriting Process" />

      {/* ── SEO + AEO Dual Optimisation ─────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-4">SEO + AEO: Optimised for Google and AI Search</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
            In 2026, content must rank on both traditional Google search and AI-powered answer engines - including Google SGE, Perplexity, ChatGPT Search, and Bing Copilot. HotBot Studios applies a dual optimisation framework to every piece of content.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              icon: "🔍", title: "Traditional SEO", color: "#3b82f6",
              points: ["Keyword research via SEMrush & Ahrefs", "Heading hierarchy (H1/H2/H3)", "Internal & external linking strategy", "Meta title & description optimisation", "Core Web Vitals & page speed alignment", "E-E-A-T signals: expertise, authoritativeness, trust"],
            },
            {
              icon: "🤖", title: "AEO (AI Engine Optimisation)", color: "#8b5cf6",
              points: ["Definition-first content structure", "Structured FAQ sections (schema-marked)", "Concise, direct answers to intent questions", "Entity-based content building", "Featured snippet optimisation", "Perplexity & ChatGPT citation structure"],
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-3 text-lg">{item.title}</h3>
                <div className="space-y-2">
                  {item.points.map((point, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5" style={{ color: item.color }}>✓</span>
                      <span className="text-slate-400 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways - Copywriting & Content for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "SEO blog content delivers an average 6× ROI over 12 months through compounding organic traffic.",
                "Email marketing averages 42:1 ROI - the highest return of any digital marketing channel.",
                "Every HotBot Studios article is dual-optimised: traditional Google SEO and AI engine optimisation (AEO).",
                "67% of B2B buyers consume 3+ pieces of content before speaking to sales - content is your pre-sales team.",
                "Senior human copywriters - not unedited AI - write every piece, in your brand voice, to a researched brief.",
                "Copywriting integrates with SEO, digital marketing, and PR for maximum organic reach and content amplification.",
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
        title="Ready to Build a Content Engine That Compounds?"
        subtitle="Tell us your content goals - traffic, leads, or authority - and we'll design a copywriting strategy that delivers consistent, measurable results. Free content audit and keyword gap analysis included."
        formType="get-started"
      />
    </>
  );
}
