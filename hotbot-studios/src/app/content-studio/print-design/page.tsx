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
  title: "Print Design & Brand Collateral Agency USA — Brochures, Pitch Decks & Trade Show Materials | HotBot Studios",
  description:
    "HotBot Studios designs print-ready brand collateral for US businesses: brochures, pitch decks, infographics, trade show materials, and all print design. Figma-designed, brand-consistent, and print-ready. Free design brief.",
  keywords: [
    "print design agency USA",
    "brand collateral design USA",
    "brochure design agency USA",
    "pitch deck design agency",
    "trade show materials design USA",
    "infographic design agency USA",
    "brand identity collateral USA",
    "corporate print design USA",
    "Figma design agency USA",
    "sales collateral design",
    "marketing materials design USA",
    "print-ready design agency",
    "one-pager design USA",
    "event materials design USA",
  ],
  openGraph: {
    title: "Print Design & Brand Collateral Agency USA | HotBot Studios",
    description: "Print-ready brand collateral for US businesses: brochures, pitch decks, infographics, trade show materials. Figma-designed to brand guidelines.",
    url: "https://hotbotstudios.com/content-studio/print-design",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Print Design Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Print Design & Brand Collateral Agency USA | HotBot Studios",
    description: "Brochures, pitch decks, infographics & trade show materials for US brands. Figma-designed, print-ready.",
  },
  alternates: { canonical: "https://hotbotstudios.com/content-studio/print-design" },
};

// ── Schema Markup ────────────────────────────────────────────────────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Print Design & Brand Collateral Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Print Design & Brand Collateral",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional print design and brand collateral for US businesses: brochures, pitch decks, infographics, trade show materials, one-pagers, and all print assets. Designed in Figma to brand guidelines, print-ready and optimised for digital delivery.",
  url: "https://hotbotstudios.com/content-studio/print-design",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Print Design & Collateral", item: "https://hotbotstudios.com/content-studio/print-design" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What file formats do you deliver for print design projects?", acceptedAnswer: { "@type": "Answer", text: "We deliver print-ready PDF files with correct bleed, trim marks, CMYK colour profiles, and embedded fonts — ready to send directly to any commercial printer. We also provide screen-optimised PDF and PNG versions for digital distribution, plus the source Figma file for your records." } },
    { "@type": "Question", name: "How long does a brochure or pitch deck take to design?", acceptedAnswer: { "@type": "Answer", text: "A standard 4–6 page brochure takes 3–5 business days from approved brief to final file delivery. A pitch deck (10–15 slides) takes 5–7 business days. Rush delivery (48 hours) is available for urgent projects at a premium." } },
    { "@type": "Question", name: "Do you follow our existing brand guidelines?", acceptedAnswer: { "@type": "Answer", text: "Yes — we work within your existing brand guidelines document: applying your brand fonts, colour palette, logo usage rules, and graphic language. If you don't have a brand guidelines document, we can create one as part of the project." } },
  ],
};

// ── Content Data ──────────────────────────────────────────────────────────────
const SUB_SERVICES = [
  { icon: "📄", title: "Brochures & Capability Documents", desc: "Multi-page brand brochures, capability statements, service guides, and company profiles — designed to brand standards, print-ready and delivered as interactive digital PDFs for email distribution.", href: "/content-studio/print-design" },
  { icon: "📊", title: "Pitch Decks & Investor Presentations", desc: "Investor-ready pitch decks and sales presentations designed in Figma to communicate your value proposition, traction metrics, and market opportunity with the visual clarity that raises rounds and closes deals.", href: "/content-studio/print-design" },
  { icon: "📐", title: "Infographics & Data Visualisation", desc: "Complex data, processes, and research transformed into visually compelling, shareable infographics. Designed for blog use, press releases, whitepapers, and social media — driving 3× more shares than text content.", href: "/content-studio/print-design" },
  { icon: "🎪", title: "Trade Show & Event Materials", desc: "Booth displays, pull-up banners, pop-up stands, event programmes, name badges, and all trade show collateral — designed for maximum brand impact on the show floor and delivered print-ready.", href: "/content-studio/print-design" },
  { icon: "📋", title: "One-Pagers & Sales Sheets", desc: "Single-page product or service summaries, proposal leave-behinds, and sales one-pagers designed for visual impact in a digital-first world — clear hierarchy, compelling data, and a strong call-to-action.", href: "/content-studio/print-design" },
  { icon: "📦", title: "Packaging & Label Design", desc: "Product packaging design, label artwork, and unboxing experience design for DTC and retail brands. Printed on premium materials — from kraft paper to rigid boxes — with dieline templates and pre-press checks included.", href: "/content-studio/print-design" },
];

const STATS = [
  { value: 3, suffix: "×", label: "More Shares for Infographic Content", color: "#f59e0b" },
  { value: 200, suffix: "+", label: "Collateral Projects Delivered", color: "#8b5cf6" },
  { value: 5, suffix: "days", label: "Standard Brochure Turnaround", color: "#3b82f6" },
  { value: 48, suffix: "hr", label: "Rush Delivery Available", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Creative Brief & Brand Audit", desc: "We review your brand guidelines, existing collateral, and content requirements. A detailed design brief is agreed before any design work begins — covering format, content hierarchy, and intended use.", icon: "📋" },
  { n: 2, title: "Copywriting & Content Structure", desc: "Working with your team or our copywriters, we establish the content architecture — what goes where, in what order, and at what hierarchy level. Good print design starts with good content structure.", icon: "✍️" },
  { n: 3, title: "Design & Visual Development", desc: "Our designers create initial concepts in Figma applying your brand typography, colour system, and graphic language. Initial draft for review within the agreed timeline.", icon: "🎨" },
  { n: 4, title: "Revision & Print-Ready Delivery", desc: "Two rounds of revision included. Final files delivered as print-ready PDF (CMYK, bleed, embedded fonts), screen-optimised PDF, and Figma source file — ready for your printer or digital distribution.", icon: "✅" },
];

const FAQS = [
  { q: "What file formats do you deliver for print design projects?", a: "Print-ready PDF with correct bleed, trim marks, CMYK colour profiles, and embedded fonts — ready to send to any commercial printer. Plus screen-optimised PDF and PNG for digital distribution, and the source Figma file." },
  { q: "How long does a brochure or pitch deck take to design?", a: "A standard 4–6 page brochure takes 3–5 business days from approved brief. A pitch deck (10–15 slides) takes 5–7 business days. Rush delivery (48 hours) is available for urgent projects." },
  { q: "Do you follow our existing brand guidelines?", a: "Yes — we work within your existing brand guidelines: applying your fonts, colour palette, logo usage rules, and graphic language. If you don't have a brand guidelines document, we can create one as part of the project." },
  { q: "Can you design infographics for use on social media and in press releases?", a: "Yes — infographics are one of our most requested assets because they serve multiple distribution channels simultaneously: embedded in blog posts, shared on LinkedIn and Instagram, included in press releases and whitepapers, and downloaded as gated lead magnets." },
  { q: "Do you work with printers on our behalf?", a: "Yes — we can manage the full print production process on your behalf: selecting the right printer, specifying paper stock and finishes (matte, gloss, soft-touch laminate), submitting print-ready files, and quality-checking proofs before your materials go to press." },
  { q: "How does print design connect to HotBot Studios' other services?", a: "Print and digital design are unified under our brand system. Infographics designed for print are repurposed as social media carousel content and blog embeds. Pitch decks feed into PR media kits and investor communications. Every piece of collateral is designed to work in print and on screen — maximising your design investment." },
];

const RELATED = [
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Extend brand design into your digital products and website.", icon: "🎨" },
  { title: "Copywriting & Long-Form Content", href: "/content-studio/copywriting", desc: "Expert copy to fill your brochures, pitch decks and one-pagers.", icon: "✍️" },
  { title: "Public Relations", href: "/public-relations", desc: "Put your polished collateral in front of press and analysts.", icon: "📰" },
];

export default function PrintDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Print Design" }]} />

      <PageHeader
        label="Print Design & Brand Collateral USA"
        title="Design That Looks as Good on Paper as It Does on Screen"
        subtitle="HotBot Studios designs brand collateral — brochures, pitch decks, infographics, trade show materials, and print assets — in Figma to your brand guidelines, delivered print-ready and optimised for digital distribution."
      />

      {/* ── Definition Block (AEO) ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Brand collateral design (definition):</strong> The design and production of physical and digital marketing materials — brochures, pitch decks, one-pagers, infographics, trade show displays, and packaging — that communicate a brand&apos;s value proposition in sales, marketing, and event contexts. In 2026, effective brand collateral must serve dual purpose: print-ready for physical distribution and screen-optimised for email, PDF, and social media use — requiring a unified brand design system applied consistently across all touchpoints.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: Collateral Impact on Sales ──────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">How Professional Brand Collateral Impacts Sales & Marketing Outcomes</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { pct: "3×", label: "more social shares for infographic content vs plain text articles", color: "#f59e0b" },
                  { pct: "76%", label: "of B2B buyers say printed or designed materials influence their purchase decision", color: "#8b5cf6" },
                  { pct: "40%", label: "higher meeting-to-proposal conversion when pitch decks are professionally designed", color: "#3b82f6" },
                  { pct: "65%", label: "of people are visual learners — design is comprehension, not decoration", color: "#22c55e" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: stat.color }}>{stat.pct}</div>
                    <div className="text-slate-400 text-xs leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Collateral by sales stage */}
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">Recommended Collateral by Sales & Marketing Stage</p>
              <div className="space-y-3">
                {[
                  { stage: "Awareness & Outbound", collateral: "One-pagers, infographics, branded social graphics", priority: "High reach, shareable", color: "#3b82f6", width: 90 },
                  { stage: "Lead Nurture", collateral: "Brochures, capability documents, case study PDFs", priority: "Builds credibility", color: "#8b5cf6", width: 75 },
                  { stage: "Sales Meetings", collateral: "Pitch decks, product sheets, ROI calculators", priority: "Drives decisions", color: "#f59e0b", width: 85 },
                  { stage: "Trade Shows & Events", collateral: "Pull-up banners, booths, event programmes, swag", priority: "Physical brand presence", color: "#ec4899", width: 70 },
                  { stage: "Post-Sale & Retention", collateral: "Onboarding guides, product manuals, thank-you packaging", priority: "Reduces churn", color: "#22c55e", width: 60 },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-40 shrink-0 text-right hidden md:block">{row.stage}</span>
                    <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center px-3"
                        style={{ width: `${row.width}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                        <span className="text-[10px] font-medium text-white truncate hidden md:block">{row.collateral}</span>
                      </div>
                    </div>
                    <span className="text-slate-500 text-[10px] w-24 shrink-0 hidden md:block">{row.priority}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">Sources: Content Marketing Institute B2B Report 2025, Nielsen Visual Learning Study, Venngage Infographic Report 2025</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Print Design & Collateral Services We Offer" columns={3} />
      <ServiceStats stats={STATS} title="Design & Collateral Results" />
      <ProcessSteps steps={PROCESS} title="Our Print Design Process" />

      {/* ── Design System Principles ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Why Every Piece of Collateral We Design Works in Print and On Screen</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: "🎨",
              title: "Brand System First",
              desc: "Every project starts from your brand guidelines — or we create them. Typography, colour, spacing, and graphic language are applied consistently so that your brochure, pitch deck, and infographic feel like one brand, not three different designers.",
              color: "#f59e0b",
            },
            {
              icon: "🖨️",
              title: "Print-Ready by Default",
              desc: "All files are designed with correct bleed (3mm), trim marks, CMYK colour profiles, and 300dpi resolution — ready to send to any commercial printer without pre-press corrections. No surprises when the materials arrive.",
              color: "#8b5cf6",
            },
            {
              icon: "📲",
              title: "Screen-Optimised for Digital",
              desc: "The same design is delivered in screen-optimised PDF and PNG format — correct RGB colour profile, compressed file size for email, and interactive hyperlinks for digital pitch decks. One design, every format.",
              color: "#3b82f6",
            },
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

      {/* ── Collateral Comparison Table ──────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-10">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">HotBot Studios Design vs. Freelancer vs. DIY Tools</h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(245,158,11,0.08)" }}>
                  <th className="text-left p-4 text-slate-300 font-semibold">Factor</th>
                  <th className="text-center p-4 text-amber-400 font-semibold">HotBot Studios</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">Freelance Designer</th>
                  <th className="text-center p-4 text-slate-400 font-semibold">Canva / DIY</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Brand guidelines adherence", "✅ Strict", "⚠️ Variable", "❌ Template-limited"],
                  ["Print-ready file delivery", "✅ Always", "✅ Usually", "⚠️ Often incorrect"],
                  ["Copywriting included", "✅ Optional", "❌ Separate hire", "❌ You write it"],
                  ["Revision rounds", "2 included", "Varies (often paid)", "Unlimited (self)"],
                  ["Turnaround", "3–7 days", "1–4 weeks", "Hours (quality varies)"],
                  ["Integration with campaigns", "✅ Full stack", "❌ Siloed", "❌ Siloed"],
                ].map(([factor, ours, freelancer, diy], i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="p-4 text-slate-300 font-medium">{factor}</td>
                    <td className="p-4 text-center text-amber-300 font-semibold">{ours}</td>
                    <td className="p-4 text-center text-slate-400">{freelancer}</td>
                    <td className="p-4 text-center text-slate-400">{diy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — Print Design & Collateral for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "Professional pitch decks increase meeting-to-proposal conversion by 40% — design is a revenue-generating function.",
                "Infographic content generates 3× more social shares than plain text, making it one of the highest-ROI content investments.",
                "HotBot Studios delivers every project print-ready (CMYK, bleed, 300dpi) and screen-optimised (RGB, compressed) in a single delivery.",
                "All design work is executed in Figma and adheres strictly to your brand guidelines — or we create guidelines as part of the project.",
                "200+ collateral projects delivered for US businesses across brochures, pitch decks, trade show materials, and infographics.",
                "Print design integrates with copywriting (content), UI/UX (digital brand consistency), and PR (press kit and media materials).",
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
        title="Ready to Elevate Your Brand's Physical and Digital Presence?"
        subtitle="Share your collateral needs — a pitch deck, trade show booth, or brochure — and we'll deliver professionally designed, print-ready assets that represent your brand at its best. Free design brief consultation included."
        formType="get-started"
      />
    </>
  );
}
