import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Accessibility Design Agency USA — WCAG 2.2 AA, ADA & Section 508 Compliance | HotBot Studios",
  description:
    "HotBot Studios designs WCAG 2.2 AA compliant interfaces for US businesses — colour contrast, keyboard navigation, screen reader compatibility, and ADA/Section 508 audit reports. Free accessibility consultation.",
  keywords: [
    "accessibility design agency USA",
    "WCAG 2.2 AA design USA",
    "ADA compliance design USA",
    "Section 508 compliance USA",
    "accessible UI design USA",
    "accessibility audit USA",
    "screen reader design USA",
    "inclusive design agency USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/accessibility" },
  openGraph: {
    title: "Accessibility Design Agency USA — WCAG 2.2 AA & ADA Compliance | HotBot Studios",
    description: "WCAG 2.2 AA compliant UI design, ADA and Section 508 accessibility audits, and inclusive design for US businesses.",
    url: "https://hotbotstudios.com/ui-ux-design/accessibility",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Accessibility Design (WCAG 2.2 AA)",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Accessibility Design and WCAG Compliance",
  areaServed: { "@type": "Country", name: "United States" },
  description: "WCAG 2.2 AA compliant UI design and accessibility auditing for US businesses — colour contrast, keyboard navigation, screen reader compatibility, ADA and Section 508 compliance.",
  url: "https://hotbotstudios.com/ui-ux-design/accessibility",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Accessibility Design (WCAG 2.2 AA)", item: "https://hotbotstudios.com/ui-ux-design/accessibility" },
  ],
};

const CONTENT = [
  {
    heading: "Accessibility Is a Legal Requirement and a Competitive Advantage",
    body: "In the United States, the Americans with Disabilities Act (ADA) and Section 508 of the Rehabilitation Act require that digital products used by the public or government agencies be accessible to people with disabilities. ADA web accessibility lawsuits reached over 4,600 filings in 2023 — up 300% from 2018 — with the average settlement costing $25,000 to $100,000 excluding legal fees, and enterprise cases reaching into the millions. Beyond legal compliance, accessible design is good design: the improvements that benefit users with disabilities (sufficient colour contrast, logical keyboard navigation, descriptive link text, video captions) consistently improve the experience for all users — including those on slow connections, users in bright sunlight, older users with degraded vision, and users who simply prefer keyboard navigation to mouse interaction. HotBot Studios designs accessibility in from the start — not as a compliance retrofit after the fact, which is consistently more expensive and less effective.",
    color: "#22c55e",
  },
  {
    heading: "WCAG 2.2 AA: What Compliance Actually Requires",
    body: "The Web Content Accessibility Guidelines (WCAG) 2.2 AA is the standard referenced in most US legal accessibility requirements. It covers four principles — Perceivable, Operable, Understandable, and Robust — across 50 success criteria at the AA level. The most commonly violated criteria in practice are: colour contrast (text must achieve a minimum 4.5:1 contrast ratio against its background for normal text, 3:1 for large text — a requirement that fails in most brand palettes without deliberate adjustment), keyboard accessibility (every interactive element must be reachable and operable using a keyboard alone, in a logical tab order), focus indicators (keyboard focus must be visually visible with a clear, high-contrast outline), alternative text for images (all meaningful images must have descriptive alt text; decorative images must have empty alt attributes), and form label association (every form input must have a programmatically associated label). HotBot Studios audits against all 50 AA criteria and designs to meet each one, with specific design decisions documented and justified in the handoff specification.",
    color: "#3b82f6",
  },
  {
    heading: "Screen Reader Compatibility, Keyboard Navigation, and Inclusive Interaction Design",
    body: "Designing for screen reader compatibility requires design decisions that are invisible to sighted users but critical to the 7.6 million Americans who use assistive technology. Semantic heading hierarchy (H1 through H6 used in logical order, not for visual style) ensures screen reader users can navigate the page structure. ARIA labels and roles communicate the purpose of interactive elements that have no visible text equivalent. Modal dialogs must trap keyboard focus within the modal while open and return focus to the trigger element when closed. Dynamic content updates (success messages, error states, live data) must be announced to screen reader users via ARIA live regions. HotBot Studios produces designs that specify all required ARIA attributes, landmark regions, and live region announcements — giving developers the information they need to implement screen reader compatibility correctly without accessibility expertise on the engineering team. We also conduct screen reader testing on both VoiceOver (iOS/macOS) and NVDA (Windows) as part of our QA process.",
    color: "#8b5cf6",
  },
  {
    heading: "Accessibility Audits, Remediation Plans, and Ongoing Compliance",
    body: "For businesses with existing products that need to achieve compliance, HotBot Studios conducts accessibility audits that combine automated scanning (using Axe, Lighthouse, and WAVE) with manual expert review against all WCAG 2.2 AA success criteria. Automated tools catch approximately 30 to 40% of accessibility issues — the remaining 60 to 70% require a trained human evaluator to identify and assess. The audit report categorises every issue by WCAG criterion, severity (critical blocker, major issue, minor issue), and the effort required to remediate. Each issue includes a specific remediation recommendation — the design change or code change required to resolve it — making the report immediately actionable for your design and engineering teams. We also offer ongoing accessibility compliance monitoring: regular audits after major releases to catch accessibility regressions before they accumulate, and a design review process that evaluates new features for accessibility before they enter development. Request a free consultation below.",
    color: "#f59e0b",
  },
];

export default function AccessibilityPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Accessibility Design (WCAG 2.2 AA)"
        title="Inclusive Design That Meets ADA Requirements and Serves Every User"
        subtitle="WCAG 2.2 AA compliant UI design and accessibility audits for US businesses — colour contrast, keyboard navigation, screen reader compatibility, and ADA/Section 508 compliance built in from the start."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Accessibility Consultation</h2>
            <p className="text-slate-400">Share your product URL or design files and your compliance requirements. We will assess your accessibility baseline and recommend the right audit or design approach within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="uiux-accessibility"
            accentColor="#22c55e"
            title="Start Your Accessibility Project"
            subtitle="No obligation. Share your product and compliance requirements and we will scope the audit or design engagement."
          />
        </Reveal>
      </section>
    </>
  );
}
