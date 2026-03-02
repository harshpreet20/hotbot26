import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Interactive Prototyping Agency USA — Figma Clickable Prototypes for Testing & Demos | HotBot Studios",
  description:
    "HotBot Studios builds high-fidelity interactive Figma prototypes for US product teams — user testing, investor demos, and stakeholder sign-off before development begins. Free prototyping consultation.",
  keywords: [
    "interactive prototyping USA",
    "Figma prototype agency USA",
    "clickable prototype USA",
    "product prototype design USA",
    "investor demo prototype USA",
    "UX prototyping USA",
    "usability testing prototype USA",
    "product prototype consultant USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/prototyping" },
  openGraph: {
    title: "Interactive Prototyping Agency USA — Figma Clickable Prototypes | HotBot Studios",
    description: "High-fidelity clickable Figma prototypes for user testing, investor demos, and stakeholder sign-off before development begins.",
    url: "https://hotbotstudios.com/ui-ux-design/prototyping",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Interactive Prototyping",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Interactive UX Prototyping",
  areaServed: { "@type": "Country", name: "United States" },
  description: "High-fidelity interactive Figma prototypes for US product teams — user testing, investor demos, and stakeholder sign-off with clickable prototypes before development begins.",
  url: "https://hotbotstudios.com/ui-ux-design/prototyping",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Interactive Prototyping", item: "https://hotbotstudios.com/ui-ux-design/prototyping" },
  ],
};

const CONTENT = [
  {
    heading: "Catch Problems When They Cost Hours, Not Sprints",
    body: "The cost of fixing a design problem scales dramatically with how late in the process it is discovered. A flow problem caught during prototype review costs two to four hours of design work to fix. The same problem caught during user acceptance testing requires redesigning the component, rebuilding it in code, running regression tests, and redeploying — typically five to fifteen days of combined design and engineering effort. Interactive prototypes compress the timeline between design decision and validation: they allow real users to navigate through your product's core flows before a single line of production code is written, surfacing the navigation assumptions that do not hold, the interaction patterns that confuse users, and the missing states that the design did not account for. HotBot Studios builds prototypes at the fidelity level needed to answer the specific question being tested — from low-fidelity concept tests to production-quality demos used in investor fundraising and enterprise sales contexts.",
    color: "#f59e0b",
  },
  {
    heading: "Figma Prototypes: From User Testing to Investor-Ready Demos",
    body: "Figma is the standard tool for interactive prototyping in 2026 — its prototype mode allows designers to connect screens with interactions, animations, and conditional logic that replicates the experience of a real product with sufficient fidelity for user testing and stakeholder review. HotBot Studios builds Figma prototypes across the full fidelity spectrum. Concept prototypes (used for early-stage user testing or internal stakeholder alignment) focus on core flows with minimal visual polish — fast to build, easy to update based on feedback. Usability test prototypes (used for structured moderated or unmoderated testing) are built to simulate the real product closely enough that users cannot distinguish test behaviour from production behaviour, ensuring that test results reflect real usage patterns. Investor and sales demonstration prototypes are built to production visual quality, with smooth animations, realistic data, and polished micro-interactions — giving potential investors and enterprise buyers the experience of using a finished product before it is built.",
    color: "#8b5cf6",
  },
  {
    heading: "Micro-Interactions, Animations, and the Prototyping Details That Win Stakeholders",
    body: "The difference between a prototype that impresses stakeholders and one that does not is usually in the details that high-quality Figma prototyping adds: hover states that respond correctly before clicks, transitions between screens that match the animation behaviour of the final product (slide, fade, scale), form interactions where inputs respond to typing and show validation feedback, and loading state animations that give the illusion of genuine data fetching. These details matter in investor contexts because they communicate product maturity — a prototype with polished micro-interactions signals that the team has thought through the product experience at a level of detail that correlates with execution quality. They also matter in enterprise sales demos because they allow prospects to experience the product's quality and usability before signing, which reduces the friction in large B2B sales cycles where product experience is a key evaluation criterion. HotBot Studios adds this level of prototyping detail as standard for any engagement where the prototype will be used in a commercial or fundraising context.",
    color: "#3b82f6",
  },
  {
    heading: "Prototype-to-Development Handoff and Feedback Integration",
    body: "Prototypes generate feedback — from users in research sessions, from stakeholders in review meetings, and from the product team in design critiques. The value of a prototyping engagement is fully realised only when that feedback is efficiently incorporated and the final prototype accurately reflects the design decisions your team is committed to building. HotBot Studios structures prototype delivery in review cycles: an initial prototype version, a structured feedback session with all stakeholders, a revision round incorporating the consolidated feedback, and a final version used as the basis for development handoff. The final prototype is linked to the Figma design file so that developers can inspect every screen's exact specifications — spacing, typography, colours, and interaction logic — without ambiguity. We also produce a user flow document that maps every prototype screen to its corresponding development component, giving engineering teams the clarity to scope and estimate the build accurately. Request a prototyping consultation below.",
    color: "#22c55e",
  },
];

export default function PrototypingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Interactive Prototyping"
        title="Test the Experience Before You Build It"
        subtitle="High-fidelity Figma prototypes for user testing, investor demos, and stakeholder sign-off — catch flow problems and validate design decisions before they become expensive development rework."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Prototyping Consultation</h2>
            <p className="text-slate-400">Tell us about your product and what you need to validate or demonstrate. We will recommend the right prototype fidelity and scope within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="uiux-prototyping"
            accentColor="#f59e0b"
            title="Start Your Prototyping Project"
            subtitle="No obligation. Share your product, your audience, and your timeline and we will scope the prototype build."
          />
        </Reveal>
      </section>
    </>
  );
}
