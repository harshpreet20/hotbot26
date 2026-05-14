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
  title: "Brand Photography Agency USA — Product, Lifestyle & Visual Assets | HotBot Studios",
  description:
    "HotBot Studios shoots professional product photography, brand lifestyle shoots, executive portraits, and event coverage for US businesses. Visual assets built for social media, website, and paid ads. Free photography brief.",
  keywords: [
    "brand photography agency USA",
    "product photography agency USA",
    "lifestyle photography for brands",
    "executive portrait photography",
    "commercial photography USA",
    "e-commerce product photography",
    "social media photography agency",
    "visual content agency USA",
    "event photography agency USA",
    "brand visual assets USA",
    "Instagram photography agency",
    "stock asset library production",
    "corporate photography USA",
    "advertising photography USA",
  ],
  openGraph: {
    title: "Brand Photography Agency USA — Product, Lifestyle & Visual Assets | HotBot Studios",
    description: "Product photography, brand lifestyle shoots, executive portraits & event coverage for US businesses. Built for social, web, and paid ads.",
    url: "https://hotbotstudios.com/content-studio/photography",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Brand Photography Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand Photography Agency USA | HotBot Studios",
    description: "Product photography, lifestyle shoots, executive portraits & visual assets for US brands.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio/photography" },
};

// ── Schema Markup ────────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Brand Photography Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Commercial Photography & Visual Asset Production",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional brand photography for US businesses: product photography, lifestyle brand shoots, executive portraits, event coverage, and bespoke stock asset libraries — all shot for digital-first use.",
  url: "https://hotbotstudios.com/content-studio/photography",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Photography & Visual Assets", item: "https://hotbotstudios.com/content-studio/photography" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How many photos do we receive from a brand shoot?", acceptedAnswer: { "@type": "Answer", text: "A half-day lifestyle shoot typically yields 50–80 edited, retouched images. A full product photography session produces 20–40 hero and lifestyle images per SKU. All images are delivered in high-resolution for print and web-optimised versions for digital use." } },
    { "@type": "Question", name: "Do you shoot on location or in a studio?", acceptedAnswer: { "@type": "Answer", text: "Both. We can shoot on location anywhere in the US or in our studio setup with full lighting rigs. Location choice depends on your brand aesthetic — lifestyle brands typically benefit from on-location shoots; product photography is often shot in studio for consistency." } },
    { "@type": "Question", name: "What file formats and sizes do you deliver?", acceptedAnswer: { "@type": "Answer", text: "We deliver edited RAW-derived TIFFs for print, JPEG/WebP at multiple resolutions for web and social, and pre-cropped variants for platform-specific formats (Instagram square, Stories 9:16, LinkedIn banner, etc.)." } },
  ],
};

// ── Content Data ──────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "📦", title: "Product Photography", desc: "Studio and lifestyle product photography for e-commerce, DTC brands, and B2B SaaS. Clean white-background shots for Amazon/Shopify plus editorial lifestyle images for social and paid ads — all retouched to commercial standards.", href: "/content-studio/photography" },
  { icon: "🌅", title: "Brand Lifestyle Shoots", desc: "Environmental lifestyle photography that tells your brand's story — people, culture, workspace, or product in context. The hero imagery that powers your homepage, about page, and social feed.", href: "/content-studio/photography" },
  { icon: "👔", title: "Executive & Team Portraits", desc: "Professional executive headshots and team portraits for LinkedIn, press kits, investor decks, and About pages. Consistent lighting, backdrop, and retouching across your entire leadership team.", href: "/content-studio/photography" },
  { icon: "🎪", title: "Event Photography", desc: "Full event coverage for conferences, product launches, trade shows, and company retreats. Fast turnaround delivery of edited selects within 24 hours of the event.", href: "/content-studio/photography" },
  { icon: "🖼️", title: "Custom Stock Asset Libraries", desc: "Bespoke brand photography libraries that replace generic stock with authentic, on-brand imagery. Built as a one-time shoot and licensed exclusively for your brand — no more recognisable stock models.", href: "/content-studio/photography" },
  { icon: "📐", title: "Visual Asset Optimisation", desc: "Existing photo libraries re-edited, retouched, resized, and optimised for every platform — correct aspect ratios, file sizes, colour profiles, and metadata for web performance and SEO.", href: "/content-studio/photography" },
];

const STATS = [
  { value: 94, suffix: "%", label: "Buyers Judge Brands on Visuals", color: "#06b6d4" },
  { value: 80, suffix: "+", label: "Brand Shoots Delivered", color: "#8b5cf6" },
  { value: 48, suffix: "hr", label: "Event Photo Turnaround", color: "#3b82f6" },
  { value: 30, suffix: "%", label: "Avg Conversion Lift from Pro Photos", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Creative Brief & Moodboard", desc: "We capture your aesthetic vision, brand guidelines, target audience, and intended use cases. A detailed moodboard is shared for alignment before any equipment is packed.", icon: "🎨" },
  { n: 2, title: "Pre-Production & Styling", desc: "Location scouting or studio prep, prop sourcing, model casting (if needed), shot list development, and styling guide — every detail planned to maximise shoot efficiency.", icon: "📋" },
  { n: 3, title: "Shoot Day", desc: "Our photographer and crew capture every planned shot plus creative variations. Multiple setups, lighting scenarios, and hero-plus-lifestyle ratios in a structured shoot day.", icon: "📸" },
  { n: 4, title: "Editing, Retouching & Delivery", desc: "Professional culling, colour grading, retouching, and delivery in all required formats — high-res for print, web-optimised for digital, and platform-cropped for social.", icon: "✅" },
];

const FAQS = [
  { q: "How many photos do we receive from a brand shoot?", a: "A half-day lifestyle shoot yields 50–80 edited, retouched images. A full product photography session produces 20–40 hero and lifestyle images per SKU. All images are delivered in high-resolution (for print) and web-optimised versions (for digital)." },
  { q: "Do you shoot on location or in a studio?", a: "Both. We can shoot on location anywhere in the US or in studio with full lighting rigs. Lifestyle brands typically benefit from on-location shoots; product photography is often shot in studio for consistency and controlled lighting." },
  { q: "What file formats and sizes do you deliver?", a: "Edited TIFF/JPEG at full resolution for print, WebP/JPEG at multiple resolutions for web and social, and pre-cropped variants for Instagram square, Stories 9:16, LinkedIn banner, and Facebook ad specifications." },
  { q: "Can you shoot for both e-commerce and social media in the same session?", a: "Yes — this is our recommended approach. A single shoot day captures white-background product shots (for Amazon, Shopify, your website) and lifestyle editorial shots (for Instagram, paid ads, email). Maximum value per shoot day." },
  { q: "How far in advance do we need to book a shoot?", a: "We recommend booking 2–3 weeks in advance for a standard shoot. Rush shoots (within 1 week) are available at a premium. Event photography requires a minimum 1 week lead time to ensure availability." },
  { q: "How do visual assets connect to the rest of HotBot Studios' services?", a: "Photography seamlessly feeds into all our other services — social media content uses brand photos for feed posts and Stories, paid media uses lifestyle images as ad creatives, copywriting uses brand photography for blog hero images, and PR teams use executive portraits in press kits." },
];

const RELATED = [
  { title: "Video Production", href: "/content-studio/video-production", desc: "Pair brand photography with cinematic brand films.", icon: "🎬" },
  { title: "Social Media Content", href: "/content-studio/social-media-content", desc: "Put your brand photography to work on social channels.", icon: "📱" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Integrate brand photography into your website and app design.", icon: "🎨" },
];

export default function PhotographyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Photography" }]} />

      <PageHeader
        label="Brand Photography Agency USA"
        title="Visuals That Make Buyers Trust Before They Read a Word"
        subtitle="94% of first impressions are design-driven. HotBot Studios produces brand photography — product shots, lifestyle imagery, executive portraits, and custom stock libraries — that makes your brand instantly credible and scroll-stopping."
      />

      {/* ── Definition Block (AEO) ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Brand photography (definition):</strong> The strategic creation of professional photographic assets — product images, lifestyle imagery, executive portraits, and brand environments — that visually communicate a brand&apos;s identity, values, and quality. In 2026, brand photography must serve multiple formats simultaneously: square for Instagram feed, 9:16 for Stories and Reels covers, 16:9 for websites and YouTube thumbnails, and white-background cutouts for e-commerce and paid ads.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Visual Impact on Brand Performance ──────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">How Professional Photography Impacts Brand Performance</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "94%", label: "of first impressions are design and visual driven (Stanford HCI)", color: "#06b6d4" },
                  { pct: "30%", label: "avg conversion rate increase with professional product photography", color: "#8b5cf6" },
                  { pct: "67%", label: "of buyers say image quality is 'very important' in purchase decisions", color: "#3b82f6" },
                  { pct: "3×", label: "more engagement on social posts with professional vs user-generated photography", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Platform requirements visual */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Visual Asset Format Requirements by Platform</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { platform: "Instagram Feed", ratio: "1:1 / 4:5", use: "Brand lifestyle & product", color: "#ec4899" },
                  { platform: "Instagram Stories", ratio: "9:16", use: "Behind-the-scenes, promos", color: "#8b5cf6" },
                  { platform: "LinkedIn", ratio: "1200×627px", use: "Executive portraits, brand", color: "#3b82f6" },
                  { platform: "E-commerce / Ads", ratio: "White BG cutout", use: "Product hero shots", color: "#06b6d4" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <div className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.platform}</div>
                    <div className="text-slate-400 text-[10px] font-mono mb-1">{item.ratio}</div>
                    <div className="text-slate-500 text-[10px]">{item.use}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">All formats delivered in a single shoot day — no re-shoots required.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Photography Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Visual Asset Results" />
      <ProcessSteps steps={PROCESS} title="Our Photography Process" />

      {/* ── Photography Use Cases ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Where Your Brand Photography Works Hardest</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🌐", title: "Website & Landing Pages", desc: "Hero imagery, team photos, and product shots that reduce bounce rate and increase time on page. The visual quality of your website is the single biggest trust signal for new visitors.", color: "#06b6d4" },
            { icon: "📱", title: "Social Media Feed & Ads", desc: "Thumb-stopping lifestyle imagery for Instagram, LinkedIn, and Facebook — both organic feed posts and paid ad creatives that achieve lower CPMs and higher ROAS.", color: "#ec4899" },
            { icon: "📊", title: "Pitch Decks & Investor Materials", desc: "Professional brand photography in investor decks, partnership proposals, and press kits signals maturity and credibility — directly influencing how VCs and partners perceive your brand.", color: "#8b5cf6" },
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

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Brand Photography for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "94% of first impressions are visual — professional brand photography is non-negotiable for US brands competing online.",
                "Professional product photography drives an average 30% increase in e-commerce conversion rates.",
                "HotBot Studios delivers all platform formats from a single shoot: Instagram, LinkedIn, e-commerce, web, and ads.",
                "Brand lifestyle shoots replace generic stock imagery with authentic, exclusive brand assets.",
                "Executive portraits and team photography build trust on LinkedIn, investor decks, and press materials.",
                "Photography integrates with video production, social media, and paid ad campaigns for maximum asset utility.",
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
        title="Ready to Upgrade Your Brand's Visual Identity?"
        subtitle="Tell us what you want to shoot and where your images will live. We'll design a photography brief that captures everything you need in a single shoot day — maximising your budget and your brand asset library."
        formType="get-started"
      />
    </>
  );
}
