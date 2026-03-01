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
  title: "Wireframing & Information Architecture Services USA | HotBot Studios",
  description:
    "Professional wireframing and information architecture for US digital products. Low and high-fidelity wireframes in Figma, user journey mapping, navigation structure design, and feature prioritization before any visual design begins.",
  keywords: [
    "wireframing services USA",
    "information architecture design USA",
    "UX wireframe agency",
    "Figma wireframing",
    "user journey mapping USA",
    "navigation design UX",
    "low fidelity wireframe",
    "high fidelity wireframe",
    "IA design agency USA",
    "product structure design",
  ],
  openGraph: {
    title: "Wireframing & Information Architecture Services USA | HotBot Studios",
    description: "Low and high-fidelity wireframes, user journey maps, and IA design that give your product a clear structural foundation before visual design begins.",
    url: "https://hotbotstudios.com/ui-ux-design/wireframing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Wireframing & Information Architecture USA | HotBot Studios", description: "Figma wireframes and IA design for US digital products." },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/wireframing" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Wireframing & Information Architecture",
  description: "Low and high-fidelity wireframes, user journey maps, navigation structure design, and feature prioritization that form the structural foundation of great digital products.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Wireframing & Information Architecture",
  url: "https://hotbotstudios.com/ui-ux-design/wireframing",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Wireframing & Information Architecture", item: "https://hotbotstudios.com/ui-ux-design/wireframing" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between low-fidelity and high-fidelity wireframes?", acceptedAnswer: { "@type": "Answer", text: "Low-fidelity wireframes are rough structural sketches, boxes, lines, placeholder text, used early in the process to explore layout options quickly without design investment. High-fidelity wireframes include real content, accurate spacing, and detailed component placement but still lack final visual styling (color, typography, imagery). We typically use lo-fi for discovery alignment and hi-fi for developer handoff preparation." } },
    { "@type": "Question", name: "Why do we need wireframes if we already know what we want to build?", acceptedAnswer: { "@type": "Answer", text: "Wireframes are structural blueprints that reveal navigation logic, feature placement, content hierarchy, and user flow gaps that don't surface in written specifications or stakeholder discussions. Building without wireframes is like constructing a building without architectural drawings, the final result rarely matches the vision, and structural changes mid-build are extremely expensive." } },
    { "@type": "Question", name: "What is information architecture (IA) and why does it matter?", acceptedAnswer: { "@type": "Answer", text: "Information architecture is the organization, labelling, and navigation structure of a digital product, how content is grouped, how menus are structured, and how users move between sections. Poor IA is the leading cause of users failing to find what they need, resulting in frustration, drop-off, and support tickets. Good IA is invisible, users just find things effortlessly." } },
    { "@type": "Question", name: "Do you deliver wireframes in Figma?", acceptedAnswer: { "@type": "Answer", text: "Yes, all wireframes are delivered as Figma files with organized frames, named layers, and component annotations. Figma enables real-time stakeholder comments, easy version control, and seamless handoff to our visual design team or your in-house developers. We also export static PDF versions for stakeholders who don't use Figma." } },
    { "@type": "Question", name: "How many rounds of revisions are included?", acceptedAnswer: { "@type": "Answer", text: "Standard wireframing engagements include two rounds of revisions after the initial delivery. Revisions address structural feedback, layout changes, flow adjustments, content hierarchy shifts. Visual design preferences (colors, fonts) are deferred to the visual UI design phase. Additional revision rounds can be purchased if needed." } },
    { "@type": "Question", name: "Can wireframing be done in isolation or does it need UX research first?", acceptedAnswer: { "@type": "Answer", text: "Wireframing is most effective when informed by UX research, user goals, pain points, and mental models directly shape navigation decisions and feature prioritization. Without research, wireframes reflect the design team's assumptions rather than user needs. We recommend at minimum a 1-week discovery sprint before wireframing begins, even if a full research study isn't feasible." } },
  ],
};

const SUB_SERVICES = [
  { icon: "✏️", title: "Low-Fidelity Wireframes", desc: "Rapid structural sketches that map layout, content zones, and navigation before design investment, enabling fast stakeholder alignment without visual distraction.", href: "/ui-ux-design/wireframing" },
  { icon: "📐", title: "High-Fidelity Wireframes", desc: "Detailed, annotated wireframes with real content, accurate spacing, and component definitions, ready for developer reference or visual design overlay.", href: "/ui-ux-design/wireframing" },
  { icon: "🗺️", title: "Information Architecture (IA)", desc: "Site maps, menu taxonomy, content grouping, and navigation structure design tested via card sorting and tree testing to ensure users find things naturally.", href: "/ui-ux-design/wireframing" },
  { icon: "🔄", title: "User Journey Mapping", desc: "Visual maps of every step a user takes from awareness to task completion, highlighting touchpoints, emotional states, pain points, and design opportunities.", href: "/ui-ux-design/wireframing" },
  { icon: "⚡", title: "Feature Prioritization (MoSCoW)", desc: "Structured feature prioritization using MoSCoW (Must/Should/Could/Won't) to align stakeholders on what goes in the MVP vs future sprints, preventing scope creep.", href: "/ui-ux-design/wireframing" },
  { icon: "🧭", title: "User Flow Diagrams", desc: "End-to-end flow diagrams for every key user journey, registration, onboarding, purchase, dashboard navigation, that development teams use as implementation blueprints.", href: "/ui-ux-design/wireframing" },
];

const STATS = [
  { value: 60, suffix: "%", label: "Reduction in Design Rework with Wireframes", color: "#3b82f6" },
  { value: 10, suffix: "×", label: "Cheaper to Fix in Wireframe vs Code", color: "#3b82f6" },
  { value: 30, suffix: "%", label: "Faster Dev Velocity with Annotated Wireframes", color: "#3b82f6" },
  { value: 2, suffix: "wk", label: "Typical Wireframing Engagement Duration", color: "#3b82f6" },
];

const PROCESS = [
  { n: 1, title: "Discovery & Content Inventory", desc: "Review existing product, content, user research findings, and business requirements to understand scope, user goals, and structural constraints before the first wireframe is drawn.", icon: "🔍" },
  { n: 2, title: "IA Design & Site Map", desc: "Design the navigation taxonomy, content grouping, and site map structure, validated through card sorting exercises or stakeholder workshops before wireframing begins.", icon: "🗺️" },
  { n: 3, title: "Wireframe Creation", desc: "Produce lo-fi explorations for key screens, iterate to stakeholder alignment, then develop hi-fi annotated wireframes for all core user journeys in Figma.", icon: "📐" },
  { n: 4, title: "Review, Revision & Handoff", desc: "Structured review session with stakeholders, two rounds of revisions included, then Figma file handoff with annotations, component notes, and user flow documentation.", icon: "✅" },
];

const FAQS = [
  { q: "What is the difference between low-fidelity and high-fidelity wireframes?", a: "Low-fidelity wireframes are rough structural sketches, boxes, lines, placeholder text, used early in the process to explore layout options quickly without design investment. High-fidelity wireframes include real content, accurate spacing, and detailed component placement but still lack final visual styling. We use lo-fi for discovery alignment and hi-fi for developer handoff preparation." },
  { q: "Why do we need wireframes if we already know what we want to build?", a: "Wireframes reveal navigation logic, feature placement, content hierarchy, and user flow gaps that don't surface in written specifications. Building without wireframes is like constructing a building without architectural drawings, the final result rarely matches the vision, and structural changes mid-build are extremely expensive." },
  { q: "What is information architecture (IA) and why does it matter?", a: "Information architecture is the organization, labelling, and navigation structure of a digital product, how content is grouped, how menus are structured, and how users move between sections. Poor IA is the leading cause of users failing to find what they need, resulting in frustration, drop-off, and support tickets." },
  { q: "Do you deliver wireframes in Figma?", a: "Yes, all wireframes are delivered as Figma files with organized frames, named layers, and component annotations. Figma enables real-time stakeholder comments, easy version control, and seamless handoff to our visual design team or your in-house developers. We also export static PDF versions for stakeholders who don't use Figma." },
  { q: "How many rounds of revisions are included?", a: "Standard wireframing engagements include two rounds of revisions after the initial delivery. Revisions address structural feedback, layout changes, flow adjustments, content hierarchy shifts. Visual design preferences are deferred to the visual UI design phase. Additional revision rounds can be purchased if needed." },
  { q: "Can wireframing be done in isolation or does it need UX research first?", a: "Wireframing is most effective when informed by UX research. Without research, wireframes reflect the design team's assumptions rather than user needs. We recommend at minimum a 1-week discovery sprint before wireframing begins, even if a full research study isn't feasible." },
];

const RELATED = [
  { title: "UX Research & User Testing", href: "/ui-ux-design/ux-research", desc: "Research-informed wireframes that reflect real user needs.", icon: "🔭" },
  { title: "Visual UI Design & Design Systems", href: "/ui-ux-design/visual-ui-design", desc: "Apply visual polish to the wireframe structure.", icon: "🎨" },
  { title: "Interactive Prototyping", href: "/ui-ux-design/prototyping", desc: "Make wireframes clickable for user testing and demos.", icon: "⚡" },
];

const wireframeTypes = [
  { type: "Sketches (Paper/Digital)", fidelity: "Lo-Fi", best: "Initial concept exploration", speed: "Hours" },
  { type: "Structural Wireframes", fidelity: "Lo-Fi", best: "Layout & flow alignment", speed: "1–2 days/screen" },
  { type: "Annotated Wireframes", fidelity: "Hi-Fi", best: "Developer handoff reference", speed: "3–5 days/screen" },
  { type: "Content Wireframes", fidelity: "Hi-Fi", best: "Copywriter + designer collaboration", speed: "2–3 days/screen" },
];

export default function WireframingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Wireframing & Information Architecture"
        title="The Blueprint Every Great Product Needs Before Visual Design"
        subtitle="Building a digital product without wireframes is like pouring a concrete foundation without a blueprint. HotBot Studios maps every user journey, navigation structure, and screen layout before a single pixel of visual design is committed, so what gets built is right, not just beautiful."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#3b82f6" }}>Definition, Wireframing & Information Architecture</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Wireframing</strong> is the creation of structural layout blueprints for digital screens, defining content placement, navigation, and feature location before visual styling begins. <strong className="text-white">Information Architecture (IA)</strong> is the underlying organizational structure: how content is grouped, labelled, and connected so users can navigate intuitively. Together, they form the structural foundation of any digital product and reduce development rework by up to 60%.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Wireframe Type Comparison</h2>
          <div className="grid grid-cols-1 gap-4">
            {wireframeTypes.map((item) => (
              <GlassCard key={item.type} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">{item.type}</h3>
                  </div>
                  <div className="flex gap-6 flex-wrap">
                    <div className="text-center"><p className="text-xs text-slate-500 mb-0.5">Fidelity</p><p className="text-xs font-bold" style={{ color: "#3b82f6" }}>{item.fidelity}</p></div>
                    <div className="text-center"><p className="text-xs text-slate-500 mb-0.5">Best For</p><p className="text-xs text-white">{item.best}</p></div>
                    <div className="text-center"><p className="text-xs text-slate-500 mb-0.5">Turnaround</p><p className="text-xs font-bold text-slate-300">{item.speed}</p></div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Wireframing & IA Services" columns={3} />
      <ServiceStats stats={STATS} title="The Impact of Wireframing on Product Quality" />
      <ProcessSteps steps={PROCESS} title="Our Wireframing Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Wireframing reduces design rework by 60% and structural code changes by up to 10× in cost savings",
                "Information architecture design prevents the #1 UX failure: users can't find what they need",
                "All wireframes delivered in Figma with named layers, annotations, and stakeholder comment access",
                "Two revision rounds included, structural changes are cheap at wireframe stage, expensive in code",
                "User journey maps and flow diagrams give development teams a clear implementation blueprint",
                "Feature prioritization (MoSCoW) sessions prevent scope creep and keep MVPs lean and shippable",
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
        title="Get Your Product's Blueprint Right Before Building"
        subtitle="Share your product vision, we'll map user flows, IA structure, and wireframes that give your development team a clear, validated blueprint to build from."
        formType="get-started"
      />
    </>
  );
}
