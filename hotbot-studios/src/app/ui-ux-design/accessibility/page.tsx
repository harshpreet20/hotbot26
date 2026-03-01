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
  title: "Accessibility Design (WCAG 2.2 AA) USA | ADA Compliant UI | HotBot Studios",
  description:
    "WCAG 2.2 AA compliant UI/UX design meeting ADA and Section 508 requirements for US businesses. Color contrast, keyboard navigation, screen reader compatibility, and inclusive interaction design built in from the start.",
  keywords: [
    "WCAG 2.2 AA design USA",
    "ADA compliant website design",
    "accessibility design agency USA",
    "Section 508 compliance design",
    "accessible UI design USA",
    "WCAG audit USA",
    "inclusive design agency",
    "screen reader compatible design",
    "keyboard navigation design",
    "color contrast accessibility",
  ],
  openGraph: {
    title: "Accessibility Design (WCAG 2.2 AA) USA | HotBot Studios",
    description: "ADA and WCAG 2.2 AA compliant UI design. Color contrast, keyboard navigation, screen reader support, and inclusive design for US businesses.",
    url: "https://hotbotstudios.com/ui-ux-design/accessibility",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "WCAG 2.2 AA Accessibility Design USA | HotBot Studios", description: "ADA-compliant, WCAG 2.2 AA UI design for US businesses." },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/accessibility" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Accessibility Design (WCAG 2.2 AA)",
  description: "WCAG 2.2 AA compliant UI/UX design meeting ADA and Section 508 requirements, color contrast, keyboard navigation, screen reader compatibility, and inclusive interaction design for US businesses.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Accessibility Design",
  url: "https://hotbotstudios.com/ui-ux-design/accessibility",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Accessibility Design", item: "https://hotbotstudios.com/ui-ux-design/accessibility" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is WCAG 2.2 AA and is it legally required in the USA?", acceptedAnswer: { "@type": "Answer", text: "WCAG 2.2 AA (Web Content Accessibility Guidelines) is the internationally recognized standard for digital accessibility. In the USA, Title III of the Americans with Disabilities Act (ADA) has been interpreted by courts to require WCAG 2.1 AA compliance for websites of businesses open to the public. Section 508 requires compliance for US federal agencies and their contractors. US ADA website lawsuits have increased by over 300% in recent years, compliance is both legally prudent and ethically correct." } },
    { "@type": "Question", name: "What is the minimum color contrast ratio required by WCAG 2.2 AA?", acceptedAnswer: { "@type": "Answer", text: "WCAG 2.2 AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold). For UI components (buttons, form inputs, focus indicators) the minimum ratio is 3:1 against adjacent colors. We test every color combination in our designs using automated contrast checking tools and document pass/fail ratios in our accessibility report." } },
    { "@type": "Question", name: "What does keyboard navigation accessibility mean in UI design?", acceptedAnswer: { "@type": "Answer", text: "Keyboard navigation accessibility means every interactive element in your product (links, buttons, form fields, modals, dropdowns) can be accessed and operated using only a keyboard, no mouse required. This supports users with motor disabilities who rely on keyboards, switch devices, or voice control software. In design, this means specifying focus order, visible focus indicators (focus rings), skip navigation links, and modal trap logic." } },
    { "@type": "Question", name: "How do you test accessibility during the design phase?", acceptedAnswer: { "@type": "Answer", text: "We use multiple methods: automated contrast ratio checking (Figma plugins: Contrast, A11y - Color Contrast Checker), manual design review against WCAG 2.2 success criteria, text scaling tests (200% zoom), and screen reader annotation reviews. We also produce an accessibility annotation layer in Figma, documenting ARIA roles, focus order, alt text guidance, and error message patterns for developer implementation." } },
    { "@type": "Question", name: "Can you audit our existing product for accessibility compliance?", acceptedAnswer: { "@type": "Answer", text: "Yes, we offer full WCAG 2.2 AA accessibility audits of existing live websites and apps. The audit covers color contrast, keyboard operability, focus visibility, form labels, error identification, alt text, heading hierarchy, landmark regions, ARIA usage, and time-based media. Deliverables include a prioritised issue list with screenshots, WCAG criterion references, and recommended fixes for each violation." } },
    { "@type": "Question", name: "Does WCAG accessibility hurt visual design quality?", acceptedAnswer: { "@type": "Answer", text: "No, when accessibility is designed in from the start rather than retrofitted, it enhances rather than restricts visual design. High contrast ratios make designs feel crisp and legible for all users. Clear focus indicators improve navigation for everyone. Logical heading hierarchy improves SEO and readability. Inclusive design consistently produces cleaner, more considered visual systems. The myth that accessibility makes things ugly comes from retrofitting compliance onto designs that weren't built accessibly." } },
  ],
};

const SUB_SERVICES = [
  { icon: "♿", title: "WCAG 2.2 AA Design Compliance", desc: "All new UI designed to WCAG 2.2 AA standard from day one, color contrast, focus states, text scaling, and inclusive interaction patterns built in, not bolted on.", href: "/ui-ux-design/accessibility" },
  { icon: "🔍", title: "Accessibility Design Audit", desc: "Full WCAG 2.2 AA audit of existing live products with prioritised violation list, WCAG criterion references, and recommended design fixes for every identified issue.", href: "/ui-ux-design/accessibility" },
  { icon: "⌨️", title: "Keyboard Navigation Design", desc: "Focus order specification, visible focus ring design, skip navigation links, and modal trap logic, ensuring every user can navigate your product without a mouse.", href: "/ui-ux-design/accessibility" },
  { icon: "🔊", title: "Screen Reader Annotation", desc: "Figma accessibility annotation layer documenting ARIA roles, focus order numbers, alt text guidance, live region flags, and error message patterns for developer implementation.", href: "/ui-ux-design/accessibility" },
  { icon: "🎨", title: "Color Contrast Remediation", desc: "Full color palette audit against 4.5:1 AA text and 3:1 UI component ratios, with alternative accessible color variants that maintain your brand identity.", href: "/ui-ux-design/accessibility" },
  { icon: "📋", title: "ADA Compliance Documentation", desc: "Written accessibility statement, VPAT (Voluntary Product Accessibility Template) documentation, and remediation roadmap for legal and procurement compliance requirements.", href: "/ui-ux-design/accessibility" },
];

const STATS = [
  { value: 26, suffix: "%", label: "of US Adults Have a Disability (CDC)", color: "#22c55e" },
  { value: 4200, suffix: "+", label: "US ADA Website Lawsuits Filed in 2023", color: "#22c55e" },
  { value: 97, suffix: "%", label: "of Top Web Pages Fail WCAG Basics (WebAIM)", color: "#22c55e" },
  { value: 6.9, suffix: "tn", label: "US Disability Market Annual Spending Power ($)", color: "#22c55e" },
];

const PROCESS = [
  { n: 1, title: "Accessibility Audit (Existing Products)", desc: "Automated + manual audit of your current product against WCAG 2.2 AA success criteria, producing a prioritised violation list with screenshots and fix recommendations.", icon: "🔍" },
  { n: 2, title: "Accessible Design System Foundation", desc: "Build color tokens meeting 4.5:1 contrast ratios, design visible focus indicators, specify text scaling behavior, and document keyboard navigation patterns in Figma.", icon: "⚛️" },
  { n: 3, title: "Screen Design with Accessibility Annotations", desc: "Design all screens with an annotation layer documenting ARIA roles, focus order, alt text guidance, form label associations, and error message specifications.", icon: "📐" },
  { n: 4, title: "Developer Handoff & Compliance Review", desc: "Accessibility annotation handoff session with developers, post-build QA accessibility review using automated tools (axe-core) and manual keyboard/screen reader testing.", icon: "✅" },
];

const FAQS = [
  { q: "What is WCAG 2.2 AA and is it legally required in the USA?", a: "WCAG 2.2 AA is the internationally recognized standard for digital accessibility. In the USA, Title III of the ADA has been interpreted by courts to require WCAG 2.1 AA compliance for websites of businesses open to the public. Section 508 requires compliance for US federal agencies and contractors. US ADA website lawsuits have increased by over 300% in recent years." },
  { q: "What is the minimum color contrast ratio required by WCAG 2.2 AA?", a: "WCAG 2.2 AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold). For UI components (buttons, form inputs, focus indicators), the minimum is 3:1 against adjacent colors. We test every color combination and document pass/fail ratios in our accessibility report." },
  { q: "What does keyboard navigation accessibility mean in UI design?", a: "Keyboard navigation means every interactive element, links, buttons, form fields, modals, dropdowns, can be accessed using only a keyboard. In design, this means specifying focus order, visible focus indicators (focus rings), skip navigation links, and modal trap logic." },
  { q: "How do you test accessibility during the design phase?", a: "We use automated contrast checking (Figma plugins), manual design review against WCAG 2.2 success criteria, text scaling tests at 200% zoom, and screen reader annotation reviews. We produce an accessibility annotation layer in Figma documenting ARIA roles, focus order, alt text guidance, and error message patterns." },
  { q: "Can you audit our existing product for accessibility compliance?", a: "Yes, we offer full WCAG 2.2 AA accessibility audits covering color contrast, keyboard operability, focus visibility, form labels, error identification, alt text, heading hierarchy, landmark regions, ARIA usage, and time-based media. Deliverables include a prioritised issue list with screenshots and WCAG criterion references." },
  { q: "Does WCAG accessibility hurt visual design quality?", a: "No, when designed in from the start, accessibility enhances visual design. High contrast ratios make designs feel crisp and legible for all users. Clear focus indicators improve navigation for everyone. Logical heading hierarchy improves SEO. The myth that accessibility makes things ugly comes from retrofitting compliance onto non-accessible designs." },
];

const RELATED = [
  { title: "Visual UI Design & Design Systems", href: "/ui-ux-design/visual-ui-design", desc: "Accessible design systems built on WCAG-compliant color tokens.", icon: "🎨" },
  { title: "UX Research & User Testing", href: "/ui-ux-design/ux-research", desc: "Test accessibility with users who rely on assistive technology.", icon: "🔭" },
  { title: "UI/UX Design", href: "/ui-ux-design", desc: "Full UI/UX design service overview for US businesses.", icon: "✏️" },
];

const wcagPrinciples = [
  { principle: "Perceivable", desc: "Information and UI components must be presentable to users in ways they can perceive, color contrast, alt text, captions", color: "#22c55e", icon: "👁️" },
  { principle: "Operable", desc: "UI components and navigation must be operable, keyboard accessible, no keyboard traps, sufficient time limits", color: "#3b82f6", icon: "⌨️" },
  { principle: "Understandable", desc: "Information and operation of the UI must be understandable, readable text, predictable navigation, error identification", color: "#8b5cf6", icon: "🧠" },
  { principle: "Robust", desc: "Content must be robust enough to be interpreted by assistive technologies, valid ARIA, semantic HTML, future-compatible", color: "#f59e0b", icon: "🔧" },
];

export default function AccessibilityPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Accessibility Design (WCAG 2.2 AA)"
        title="Build Products Every American Can Use, and That Comply With ADA"
        subtitle="26% of US adults have a disability. 97% of top websites fail basic WCAG accessibility checks. ADA lawsuits against non-compliant websites exceeded 4,200 in 2023. HotBot Studios designs accessibility in from day one, not as an afterthought, not as a retrofit."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>Definition, WCAG 2.2 AA Accessibility Design</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">WCAG 2.2 AA</strong> (Web Content Accessibility Guidelines, Level AA) is the internationally recognised standard that defines how to make digital content accessible to people with visual, auditory, motor, and cognitive disabilities. In the USA, WCAG 2.1 AA compliance is the benchmark for ADA Title III website compliance and Section 508 federal requirements. Designing to WCAG standards expands your accessible market to 61 million US adults with a disability, and protects your business from legal liability.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">The Four WCAG Principles (POUR)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {wcagPrinciples.map((item) => (
              <GlassCard key={item.principle} className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-white font-bold" style={{ color: item.color }}>{item.principle}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Accessibility Design Services" columns={3} />
      <ServiceStats stats={STATS} title="The Accessibility Business Case" />
      <ProcessSteps steps={PROCESS} title="Our Accessibility Design Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "26% of US adults have a disability, inaccessible products exclude 61 million potential customers",
                "ADA Title III applies to commercial websites, WCAG 2.1 AA is the legal benchmark for US compliance",
                "4.5:1 color contrast ratio for normal text; 3:1 for large text and UI components",
                "Keyboard navigation, visible focus indicators, and ARIA annotations designed in from day one",
                "Accessibility annotations delivered in a separate Figma layer, giving developers exact implementation specs",
                "Accessibility audit available for existing products with prioritised fix list and WCAG criterion references",
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
        title="Make Your Product Accessible and ADA Compliant"
        subtitle="Book an accessibility audit or start a new design project with WCAG 2.2 AA compliance built in from day one, protecting your business and opening your product to every American."
        formType="get-started"
      />
    </>
  );
}
