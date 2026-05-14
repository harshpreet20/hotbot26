import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Visual UI Design & Design Systems Agency USA — Figma Component Libraries | HotBot Studios",
  description:
    "HotBot Studios creates beautiful, consistent UI designs and Figma design systems for US product teams — design tokens, component libraries, and developer-ready specs for pixel-perfect handoffs. Free design consultation.",
  keywords: [
    "UI design agency USA",
    "visual UI design USA",
    "design system agency USA",
    "Figma design system USA",
    "component library design USA",
    "product UI design USA",
    "UI design consultant USA",
    "atomic design system USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/visual-ui-design" },
  openGraph: {
    title: "Visual UI Design & Design Systems Agency USA | HotBot Studios",
    description: "Beautiful, consistent UI design and Figma design systems with component libraries and developer-ready specs for US product teams.",
    url: "https://hotbotstudios.com/ui-ux-design/visual-ui-design",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Visual UI Design & Design Systems",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Visual UI Design and Design System Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Visual UI design and Figma design system development for US product teams — design tokens, component libraries, responsive layouts, and developer-ready specifications.",
  url: "https://hotbotstudios.com/ui-ux-design/visual-ui-design",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Visual UI Design & Design Systems", item: "https://hotbotstudios.com/ui-ux-design/visual-ui-design" },
  ],
};

const CONTENT = [
  {
    heading: "Visual Design as a Business Asset, Not Just Aesthetic Preference",
    body: "Well-executed visual UI design is not decoration — it is a measurable business asset. Studies consistently show that users judge a product's credibility and quality within the first 50 milliseconds of viewing an interface. A consistent, professionally designed UI reduces cognitive load (how hard the user has to think to navigate the product), increases perceived quality (which directly affects willingness to pay and recommendation behaviour), and reduces support ticket volume (because well-designed interfaces are self-explanatory). For consumer products, visual design quality is a direct conversion rate driver — A/B tests that improve visual hierarchy and button prominence routinely produce 15 to 40% improvements in primary action completion rates. HotBot Studios approaches visual UI design as a function of user psychology and business outcomes, not personal taste — every design decision is grounded in a principle that serves the user's goal and the product's conversion objectives.",
    color: "#ec4899",
  },
  {
    heading: "Design Systems: The Infrastructure That Makes Consistency Scalable",
    body: "A design system is the single source of truth for every visual element in your product — the library of components (buttons, inputs, cards, modals, navigation elements), the design tokens (colour palette, typography scale, spacing system, shadow values, border radii) that define the visual language, and the documentation that specifies how and when each component should be used. Without a design system, visual consistency degrades over time as different designers and developers make slightly different decisions for similar problems — creating a product that looks like it was built by ten different people, because it was. With a design system, every new screen a designer creates and every component a developer builds shares the same visual DNA — ensuring consistency as the product grows and reducing the design-to-development handoff time by 40 to 60%. HotBot Studios builds design systems in Figma using atomic design principles: tokens defined at the foundation level, components built from those tokens, and page templates assembled from components.",
    color: "#8b5cf6",
  },
  {
    heading: "The Design Process: From Brand to Screens to Developer Specs",
    body: "Every visual UI design engagement begins with an audit of your existing brand assets — logo, brand colours, typography, and any existing UI patterns — and a competitive visual analysis of the leading products in your category. From this foundation, HotBot Studios develops the design language: a colour system with accessible combinations for every use case (primary actions, secondary actions, status indicators, backgrounds, text), a typography scale that works across web and mobile viewports, and an iconography and illustration style that complements your brand. These decisions are then applied to a component library in Figma, with each component built in all required states (default, hover, focus, active, disabled, error) and across all required sizes. Final screen designs are delivered in Figma with Inspect mode annotations for developers covering exact spacing values, font specifications, colour hex codes, and responsive behaviour rules at every breakpoint.",
    color: "#3b82f6",
  },
  {
    heading: "Responsive Design, Dark Mode, and Multi-Brand Design Systems",
    body: "Modern product design must work across contexts that were optional three years ago and are now expected: responsive layouts that adapt correctly from mobile (320px) through tablet to widescreen desktop (1920px+), dark mode variants for every component and screen (Apple now requires dark mode support for iOS apps; a significant and growing proportion of web users prefer it), and multi-brand or white-label design token architectures for SaaS products that need to deliver a consistent experience under different client brand identities. HotBot Studios designs all three as standard practice for appropriate products: we build Figma designs using responsive auto-layout that reflects the actual CSS behaviour of the production implementation, we create dark mode variants using Figma's variable system for efficient theme switching, and we structure design token hierarchies that support multi-brand overrides without duplicating the entire component library. Request a design consultation below and we will review your current visual design maturity and recommend the right scope for your needs.",
    color: "#22c55e",
  },
];

export default function VisualUiDesignPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "UI/UX Design", href: "/ui-ux-design" }, { label: "Visual Ui Design" }]} />

      <PageHeader
        label="Visual UI Design & Design Systems"
        title="Beautiful, Consistent Interfaces Built on a System That Scales"
        subtitle="Figma UI design and atomic design systems for US product teams — design tokens, component libraries, dark mode, and developer-ready specifications for pixel-perfect development handoff."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free UI Design Consultation</h2>
            <p className="text-slate-400">Share your product, your brand assets, and your design goals. We will review your current visual design and recommend the right scope and approach within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="uiux-visual-ui"
            accentColor="#ec4899"
            title="Start Your UI Design Project"
            subtitle="No obligation. Share your product brief and existing brand assets and we will scope the design engagement."
          />
        </Reveal>
      </section>
    </>
  );
}
