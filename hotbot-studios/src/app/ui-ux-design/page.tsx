import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SubServices } from "@/components/sections/SubServices";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UI/UX Design Agency USA — User-Centered Design That Converts | HotBot Studios",
  description:
    "HotBot Studios designs conversion-optimized UI/UX for US businesses. Figma design systems, wireframing, prototyping, UX research, mobile design & WCAG 2.2 AA accessibility. 65% avg conversion increase. Free UX audit.",
  keywords: [
    "UI UX design agency USA",
    "UX design services USA",
    "product design agency USA",
    "user experience design company USA",
    "Figma design agency",
    "conversion rate optimization design",
    "mobile app design agency USA",
    "SaaS UX design agency",
    "design system agency USA",
    "WCAG accessibility design USA",
    "wireframing prototyping agency",
    "user research agency USA",
    "web design agency USA",
    "B2B UX design agency",
  ],
  openGraph: {
    title: "UI/UX Design Agency USA — Designs That Convert | HotBot Studios",
    description: "User-centered UI/UX for US businesses. Figma design systems, wireframing & UX research. 65% avg conversion increase. Free UX audit.",
    url: "https://hotbotstudios.com/ui-ux-design",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "UI/UX Design Agency USA — HotBot Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UI/UX Design Agency USA | HotBot Studios",
    description: "Conversion-optimized UI/UX design for US businesses. 65% avg conversion increase. Free UX audit.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "UI/UX Design Services for US Businesses",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "UI/UX Design & Product Design",
  areaServed: { "@type": "Country", name: "United States" },
  description: "User-centered UI/UX design including UX research, wireframing, Figma design systems, interactive prototyping, and WCAG 2.2 AA accessibility for US businesses. 65% average conversion increase.",
  url: "https://hotbotstudios.com/ui-ux-design",
  offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What design tools does HotBot Studios use for UI/UX?", acceptedAnswer: { "@type": "Answer", text: "Figma is HotBot Studios' primary design tool for wireframes, high-fidelity UI, design systems, and interactive prototypes. We also use Maze for usability testing, Hotjar for heatmap analysis, and deliver Storybook component libraries for development handoff." } },
    { "@type": "Question", name: "How does HotBot Studios measure design success?", acceptedAnswer: { "@type": "Answer", text: "We track task completion rates, conversion rates (GA4 + Hotjar), time-on-task, NPS scores, and before/after comparisons. Our designs have achieved an average 65% conversion increase across 40+ US products." } },
    { "@type": "Question", name: "Can HotBot Studios work with an existing design system?", acceptedAnswer: { "@type": "Answer", text: "Yes. HotBot Studios frequently audits, extends, and improves existing Figma design systems — building on established patterns rather than starting from scratch. We deliver design tokens and component documentation for seamless developer handoff." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🔭", title: "UX Research & User Testing", desc: "User interviews, surveys, heatmap analysis (Hotjar), session recordings, and Maze usability tests to understand exactly what users need — before making costly design decisions." },
  { icon: "📐", title: "Wireframing & Information Architecture", desc: "Low and high-fidelity wireframes that map user journeys, navigation structures, and feature priorities before any final UI is designed. The structural foundation of great products." },
  { icon: "🎨", title: "Visual UI Design & Design Systems", desc: "Beautiful, consistent interfaces built on atomic design systems in Figma — design tokens, component libraries, and detailed specs that enable pixel-perfect development handoff." },
  { icon: "⚡", title: "Interactive Prototyping", desc: "Clickable Figma prototypes for user testing, investor demos, and stakeholder sign-off before development begins. Catch problems when fixes cost hours, not sprints." },
  { icon: "📱", title: "Mobile App Design (iOS & Android)", desc: "Native iOS (Human Interface Guidelines) and Android (Material Design 3) design patterns. Responsive layouts that feel intuitive on every screen size, designed mobile-first." },
  { icon: "♿", title: "Accessibility Design (WCAG 2.2 AA)", desc: "WCAG 2.2 AA compliant designs meeting ADA and Section 508 requirements. Color contrast, keyboard navigation, screen reader compatibility, and inclusive interaction design built in from the start." },
];

const STATS = [
  { value: 65, suffix: "%", label: "Avg Conversion Increase", color: "#8b5cf6" },
  { value: 40, suffix: "+", label: "Products Designed", color: "#3b82f6" },
  { value: 95, suffix: "%", label: "User Satisfaction Score", color: "#22c55e" },
  { value: 3, suffix: "x", label: "Faster Task Completion", color: "#ec4899" },
];

const PROCESS = [
  { n: 1, title: "Discovery & Research", desc: "User interviews, competitive UX analysis, heatmap review, and stakeholder workshops to define the design problem — not just the design brief. Insights that prevent expensive pivots.", icon: "🔍" },
  { n: 2, title: "Define & Architect", desc: "User personas, journey maps, information architecture, and design principles that align the entire product team on the north star before any visual work begins.", icon: "📋" },
  { n: 3, title: "Design & Prototype", desc: "Wireframes → high-fidelity Figma UI → interactive prototype → design system. Two rounds of client revision included before development handoff.", icon: "🎨" },
  { n: 4, title: "Test, Measure & Iterate", desc: "Usability testing (Maze), A/B test implementation, post-launch heatmap analysis, and iterative improvements based on real user behavior and conversion data.", icon: "🧪" },
];

const FAQS = [
  { q: "Does HotBot Studios design for both web and mobile?", a: "Yes. We design responsive web interfaces for desktop, tablet, and mobile — plus native mobile apps for iOS (Human Interface Guidelines) and Android (Material Design 3). Everything is designed mobile-first in 2026." },
  { q: "What tools does HotBot Studios use for UI/UX design?", a: "Figma for all UI/UX work — wireframes, high-fidelity designs, interactive prototypes, and design systems. Maze for usability testing, Hotjar for heatmaps, and Storybook component documentation for developer handoff." },
  { q: "Can you work with our existing design system?", a: "Absolutely. We frequently audit, extend, and improve existing Figma design systems. We add missing components, fix inconsistencies, and improve accessibility — building on your brand's established visual language." },
  { q: "How do you measure the success of UI/UX design?", a: "Task completion rates, conversion rates (GA4 + Hotjar), time-on-task, NPS scores, and direct before/after comparison of key business metrics. Our designs have delivered an average 65% conversion increase across 40+ US products." },
  { q: "Does design work with development at HotBot Studios?", a: "Yes — a key differentiator. Our design and software development teams are under one roof, working in the same sprints. No translation friction. What gets designed gets built pixel-perfect. See our software development services for the full story." },
];

const RELATED = [
  { title: "Software Development", href: "/software-development", desc: "We build what we design — pixel-perfect.", icon: "💻" },
  { title: "AI Automation", href: "/ai-automation", desc: "Beautiful UI for AI-powered products.", icon: "🤖" },
  { title: "Digital Marketing", href: "/marketing-services", desc: "Drive traffic to your newly optimized product.", icon: "📣" },
];

export default function UIUXDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="UI/UX Design Agency USA"
        title="Designs That Convert, Not Just Impress"
        subtitle="A confusing product loses customers before it ever gets a chance to keep them. HotBot Studios designs user-centered interfaces — web apps, mobile apps, SaaS dashboards — that guide users to their goals and your business to higher conversion metrics."
      />

      {/* ── Definition Block (AEO) ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pt-4 pb-2">
        <Reveal>
          <div className="p-5 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">UI/UX design (definition):</strong> User Interface (UI) design covers the visual layer — typography, color systems, layout, and component design. User Experience (UX) design covers the functional layer — navigation flows, task completion, and how easily users achieve their goals. In 2026, great UI/UX means mobile-first, WCAG 2.2 AA accessibility compliance, and Figma design systems that scale with your engineering team.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Infographic: UX Impact ────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white text-center mb-6">The Business Impact of Investing in UI/UX Design</h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { stat: "$100", label: "returned per $1 invested in UX (Forrester Research)", color: "#8b5cf6" },
                  { stat: "65%", label: "avg conversion increase — HotBot Studios clients", color: "#3b82f6" },
                  { stat: "88%", label: "of users won't return after a bad website experience", color: "#ec4899" },
                  { stat: "3×", label: "faster user task completion after UX redesign", color: "#22c55e" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                    <div className="text-xl md:text-2xl font-black mb-1" style={{ color: item.color }}>{item.stat}</div>
                    <div className="text-slate-400 text-xs leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center mb-4 uppercase tracking-wider font-medium">UX Maturity Ladder — Where Does Your Product Sit?</p>
              <div className="space-y-2 max-w-2xl mx-auto">
                {[
                  { level: "Level 5: AI-Adaptive UX", desc: "Personalizes in real-time per user behavior", color: "#8b5cf6" },
                  { level: "Level 4: Data-Driven CRO", desc: "A/B tested, measurable conversion optimization", color: "#3b82f6" },
                  { level: "Level 3: Accessible & Inclusive", desc: "WCAG 2.2 AA, mobile-first, keyboard navigation", color: "#06b6d4" },
                  { level: "Level 2: Consistent Design System", desc: "Component library, atomic design, brand tokens", color: "#22c55e" },
                  { level: "Level 1: Functional", desc: "Users can complete core tasks without friction", color: "#f59e0b" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl p-2.5 flex items-center justify-between"
                      style={{ background: `${row.color}12`, border: `1px solid ${row.color}25` }}>
                      <span className="text-xs font-bold" style={{ color: row.color }}>{row.level}</span>
                      <span className="text-slate-500 text-[10px] ml-3 hidden md:block">{row.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="UI/UX Design Services" columns={3} />
      <ServiceStats stats={STATS} title="Design Impact for US Products" />
      <ProcessSteps steps={PROCESS} title="Our Design Process" />

      {/* ── Internal Link: Design + Dev ──────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-6">
        <Reveal>
          <div className="p-6 rounded-2xl flex items-start gap-4"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="text-3xl shrink-0">💻</div>
            <div>
              <h3 className="font-bold text-white mb-1">Design + Development Under One Roof</h3>
              <p className="text-slate-400 text-sm mb-3">HotBot Studios design and software development teams work in the same sprints. No handoff friction. What gets designed gets built pixel-perfect — in React, Next.js, or any modern framework.</p>
              <Link href="/software-development" className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
                Explore Software Development Services →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      {/* ── Key Takeaways (AEO) ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto pb-8">
        <Reveal>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Key Takeaways — UI/UX Design for US Businesses</h2>
            <ul className="space-y-2">
              {[
                "HotBot Studios has designed 40+ digital products for US businesses with an average 65% conversion rate increase.",
                "Every $1 invested in UX returns $100 in value (Forrester) — one of the highest ROI investments available.",
                "Design and software development are integrated at HotBot Studios — no translation friction, pixel-perfect builds.",
                "All deliverables in Figma: wireframes, high-fidelity UI, design systems, component libraries, and developer docs.",
                "WCAG 2.2 AA accessibility compliance included as standard — meeting ADA and Section 508 requirements.",
                "Pair with AI automation for intelligent, adaptive product experiences. Pair with digital marketing to drive qualified traffic.",
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
        title="Ready to Transform Your Product?"
        subtitle="Get a free UX audit that identifies the exact design changes that will increase your conversion rate. HotBot Studios — UI/UX design built for US businesses that want measurable outcomes."
        formType="consultation"
      />
    </>
  );
}
