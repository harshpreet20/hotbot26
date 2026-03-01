import type { Metadata } from "next";
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
  title: "Visual UI Design & Design Systems USA | Figma Agency | HotBot Studios",
  description:
    "High-fidelity visual UI design and scalable Figma design systems for US businesses. Atomic component libraries, design tokens, dark/light mode, and pixel-perfect developer handoff. Average 65% conversion lift.",
  keywords: [
    "visual UI design agency USA",
    "Figma design system agency",
    "design system USA",
    "UI design services USA",
    "atomic design system",
    "component library design",
    "design tokens USA",
    "SaaS UI design",
    "B2B UI design agency",
    "pixel perfect UI design",
  ],
  openGraph: {
    title: "Visual UI Design & Design Systems USA | HotBot Studios",
    description: "Figma design systems, atomic component libraries, and high-fidelity UI design for US businesses. Pixel-perfect developer handoff included.",
    url: "https://hotbotstudios.com/ui-ux-design/visual-ui-design",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Visual UI Design & Design Systems USA | HotBot Studios", description: "Figma design systems and high-fidelity UI for US products." },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/visual-ui-design" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Visual UI Design & Design Systems",
  description: "High-fidelity visual UI design and scalable Figma design systems including atomic component libraries, design tokens, and pixel-perfect developer handoff for US businesses.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Visual UI Design & Design Systems",
  url: "https://hotbotstudios.com/ui-ux-design/visual-ui-design",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Visual UI Design & Design Systems", item: "https://hotbotstudios.com/ui-ux-design/visual-ui-design" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is a design system and why do we need one?", acceptedAnswer: { "@type": "Answer", text: "A design system is a shared library of reusable UI components, design tokens (colors, typography, spacing), and usage guidelines that ensure visual consistency across every screen of your product. Without a design system, every new feature introduces inconsistency — different button styles, mismatched spacing, conflicting typography — that accumulates into a product that feels fragmented and untrustworthy. A design system is the foundation that makes scaling a product team possible." } },
    { "@type": "Question", name: "What does a Figma design system deliverable include?", acceptedAnswer: { "@type": "Answer", text: "A HotBot Studios Figma design system includes: design token library (colors, typography, spacing, shadows), component library (buttons, inputs, cards, navigation, modals, tables, icons), usage documentation for each component, light and dark mode variants, responsive breakpoint frames, and developer handoff specifications. Storybook integration is available as an add-on." } },
    { "@type": "Question", name: "Can you build on our existing design system?", acceptedAnswer: { "@type": "Answer", text: "Yes — we frequently audit, extend, and improve existing design systems. We identify inconsistencies, missing components, accessibility gaps (color contrast, focus states), and outdated patterns. We then add what's missing, fix what's broken, and document everything to bring the system up to a professional standard without discarding existing work." } },
    { "@type": "Question", name: "How do you ensure designs are pixel-perfectly implemented by developers?", acceptedAnswer: { "@type": "Answer", text: "We use Figma's Dev Mode to expose exact measurements, spacing values, CSS properties, and asset exports directly to developers. We also create annotated handoff specs for complex components, hold a design handoff session with the development team, and offer a QA review against the final build to flag implementation drift before launch." } },
    { "@type": "Question", name: "Do your designs include dark mode?", acceptedAnswer: { "@type": "Answer", text: "Yes — we design light and dark mode variants as standard for all SaaS and app projects. We use Figma's variable system to manage semantic color tokens (background/surface/text/accent) that switch cleanly between modes without creating duplicate component sets. Dark mode is no longer optional for US digital products — it's an expected feature." } },
    { "@type": "Question", name: "How long does visual UI design take for a typical project?", acceptedAnswer: { "@type": "Answer", text: "A typical SaaS dashboard or web app (10–20 key screens) takes 4–8 weeks for high-fidelity visual design. A full design system (components only, no application screens) takes 3–5 weeks. Complex enterprise products with 50+ screens run 10–16 weeks. All timelines assume wireframes are approved before visual design begins." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🎨", title: "High-Fidelity UI Design", desc: "Beautiful, production-ready screen designs in Figma — every state, every breakpoint, every interaction — built for pixel-perfect developer implementation.", href: "/ui-ux-design/visual-ui-design" },
  { icon: "⚛️", title: "Atomic Design System Creation", desc: "From atoms (colors, type, icons) to molecules (inputs, cards) to organisms (navbars, tables) — a complete, documented Figma component library your team can scale with.", href: "/ui-ux-design/visual-ui-design" },
  { icon: "🎨", title: "Design Token Architecture", desc: "Semantic color, typography, spacing, and shadow tokens that enable brand theming, dark mode switching, and design system maintenance at scale.", href: "/ui-ux-design/visual-ui-design" },
  { icon: "🌙", title: "Dark & Light Mode Design", desc: "Full dark/light mode variant design using Figma variables — semantic token architecture that switches cleanly without duplicate component sets or inconsistencies.", href: "/ui-ux-design/visual-ui-design" },
  { icon: "🔍", title: "Design System Audit & Extension", desc: "Audit your existing Figma system for inconsistencies, accessibility failures, and missing components — then extend and document it to a professional standard.", href: "/ui-ux-design/visual-ui-design" },
  { icon: "📤", title: "Developer Handoff (Figma Dev Mode)", desc: "Figma Dev Mode setup with CSS specs, asset exports, spacing annotations, and a structured design handoff session to ensure zero translation gap with engineering.", href: "/ui-ux-design/visual-ui-design" },
];

const STATS = [
  { value: 65, suffix: "%", label: "Avg Conversion Lift from UI Redesign", color: "#8b5cf6" },
  { value: 40, suffix: "%", label: "Faster Dev with a Design System", color: "#8b5cf6" },
  { value: 94, suffix: "%", label: "First Impressions Driven by Design", color: "#8b5cf6" },
  { value: 0.05, suffix: "s", label: "Time to Form a Visual Impression", color: "#8b5cf6" },
};

const PROCESS = [
  { n: 1, title: "Visual Direction & Moodboard", desc: "Define the visual language — typography scale, color palette, corner radius, shadow depth, illustration style — with 2–3 moodboard directions for stakeholder alignment before design begins.", icon: "🎨" },
  { n: 2, title: "Component Library Foundation", desc: "Build the atomic foundation: color tokens, type scale, spacing system, icon set, and core components (buttons, inputs, badges) that all subsequent screens inherit from.", icon: "⚛️" },
  { n: 3, title: "Screen Design", desc: "Apply the component library to all key screens — desktop and mobile breakpoints, empty states, error states, loading states, and every interaction variant documented in Figma.", icon: "🖥️" },
  { n: 4, title: "Handoff & QA", desc: "Figma Dev Mode setup, handoff session with development team, post-build QA review to flag implementation drift, and iteration on any visual inconsistencies before launch.", icon: "📤" },
];

const FAQS = [
  { q: "What is a design system and why do we need one?", a: "A design system is a shared library of reusable UI components, design tokens, and usage guidelines that ensure visual consistency across every screen of your product. Without one, every new feature introduces inconsistency that accumulates into a product that feels fragmented and untrustworthy. A design system makes scaling a product team possible." },
  { q: "What does a Figma design system deliverable include?", a: "A HotBot Studios Figma design system includes: design token library, component library (buttons, inputs, cards, navigation, modals, tables, icons), usage documentation, light and dark mode variants, responsive breakpoint frames, and developer handoff specifications. Storybook integration is available as an add-on." },
  { q: "Can you build on our existing design system?", a: "Yes — we frequently audit, extend, and improve existing design systems. We identify inconsistencies, missing components, accessibility gaps, and outdated patterns. We add what's missing, fix what's broken, and document everything without discarding existing work." },
  { q: "How do you ensure designs are pixel-perfectly implemented by developers?", a: "We use Figma's Dev Mode to expose exact measurements, spacing values, CSS properties, and asset exports directly to developers. We also create annotated handoff specs for complex components, hold a design handoff session, and offer a QA review against the final build to flag implementation drift before launch." },
  { q: "Do your designs include dark mode?", a: "Yes — we design light and dark mode variants as standard for all SaaS and app projects. We use Figma's variable system to manage semantic color tokens that switch cleanly between modes. Dark mode is an expected feature for US digital products in 2026." },
  { q: "How long does visual UI design take for a typical project?", a: "A typical SaaS dashboard (10–20 key screens) takes 4–8 weeks for high-fidelity visual design. A full design system (components only) takes 3–5 weeks. Complex enterprise products with 50+ screens run 10–16 weeks. All timelines assume wireframes are approved before visual design begins." },
];

const RELATED = [
  { title: "Wireframing & Information Architecture", href: "/ui-ux-design/wireframing", desc: "Structural blueprints that visual design is applied on top of.", icon: "📐" },
  { title: "Interactive Prototyping", href: "/ui-ux-design/prototyping", desc: "Make your design system come alive for testing and demos.", icon: "⚡" },
  { title: "Accessibility Design (WCAG 2.2 AA)", href: "/ui-ux-design/accessibility", desc: "Ensure your visual design meets ADA accessibility standards.", icon: "♿" },
];

const designSystemLayers = [
  { layer: "Design Tokens", items: "Colors · Typography · Spacing · Shadows · Border Radius", color: "#8b5cf6" },
  { layer: "Atoms", items: "Buttons · Inputs · Icons · Badges · Labels · Avatars", color: "#3b82f6" },
  { layer: "Molecules", items: "Form Groups · Cards · Alerts · Dropdowns · Tooltips", color: "#06b6d4" },
  { layer: "Organisms", items: "Navigation · Tables · Modals · Sidebars · Data Grids", color: "#22c55e" },
  { layer: "Templates", items: "Dashboard · Auth · Settings · List Views · Detail Pages", color: "#f59e0b" },
  { layer: "Pages", items: "Fully composed screens with real content at every breakpoint", color: "#ec4899" },
];

export default function VisualUIDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Visual UI Design & Design Systems"
        title="Beautiful, Consistent Interfaces That Scale With Your Product"
        subtitle="A design system isn't just a style guide — it's your product's visual foundation. HotBot Studios builds atomic Figma design systems and high-fidelity UI that makes every new feature consistent, every screen trustworthy, and every developer handoff friction-free."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8b5cf6" }}>Definition — Visual UI Design & Design Systems</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Visual UI design</strong> is the creation of high-fidelity screen interfaces — applying typography, color, spacing, and component styling to wireframe structures to produce production-ready designs. A <strong className="text-white">design system</strong> is the reusable, documented component library that ensures visual consistency across all screens, all teams, and all future features. Together, they are the difference between a product that scales and one that becomes a visual mess as it grows.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Atomic Design System — Layer Architecture</h2>
          <div className="space-y-3">
            {designSystemLayers.map((row, i) => (
              <div key={row.layer} className="flex items-center gap-4">
                <span className="text-slate-400 text-xs w-32 shrink-0 text-right hidden md:block font-medium">{row.layer}</span>
                <div className="flex-1 rounded-xl p-3 flex items-center gap-3"
                  style={{ background: `${row.color}10`, border: `1px solid ${row.color}25`, width: `${100 - i * 10}%` }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }}></div>
                  <span className="text-slate-300 text-xs">{row.items}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center mt-4">Every HotBot Studios design system follows Brad Frost&apos;s Atomic Design methodology</p>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Visual UI Design Services" columns={3} />
      <ServiceStats stats={STATS} title="The Business Case for Professional UI Design" />
      <ProcessSteps steps={PROCESS} title="Our Visual UI Design Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Users form a visual impression of your product in 0.05 seconds — first visual impact determines trust",
                "A Figma design system reduces development time by 40% on every subsequent feature built",
                "Atomic design methodology: tokens → atoms → molecules → organisms → templates → pages",
                "Dark and light mode support is standard — built with Figma variables for clean token switching",
                "Figma Dev Mode handoff gives developers exact CSS specs, spacing values, and exportable assets",
                "Design system audit available if you have an existing Figma library that needs professionalization",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                  <span style={{ color: "#22c55e" }} className="mt-0.5 shrink-0">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <RelatedServices services={RELATED} />
      <CTASection
        title="Build Your Product's Visual Foundation"
        subtitle="Whether you need a complete design system from scratch or to professionalize an existing one — HotBot Studios delivers Figma-native, developer-ready visual UI design for US products."
        formType="get-started"
      />
    </>
  );
}
