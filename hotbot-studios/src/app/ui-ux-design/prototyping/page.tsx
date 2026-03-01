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
  title: "Interactive Prototyping Services USA | Figma Prototypes | HotBot Studios",
  description:
    "Clickable Figma prototypes for user testing, investor demos, and stakeholder sign-off. Catch design problems when fixes take hours, not development sprints. HotBot Studios, interactive prototyping for US digital products.",
  keywords: [
    "interactive prototyping USA",
    "Figma prototype agency USA",
    "clickable prototype design",
    "UX prototype testing USA",
    "investor demo prototype",
    "product prototype USA",
    "high fidelity prototype",
    "prototype usability testing",
    "app prototype design USA",
    "SaaS prototype agency",
  ],
  openGraph: {
    title: "Interactive Prototyping Services USA | HotBot Studios",
    description: "Clickable Figma prototypes for user testing, investor demos, and stakeholder sign-off. Catch problems before development begins.",
    url: "https://hotbotstudios.com/ui-ux-design/prototyping",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Interactive Prototyping USA | HotBot Studios", description: "Figma prototypes for testing, demos, and stakeholder sign-off." },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/prototyping" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Interactive Prototyping",
  description: "Clickable Figma prototypes for user testing, investor demos, and stakeholder sign-off that catch design problems before development begins.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Interactive Prototyping",
  url: "https://hotbotstudios.com/ui-ux-design/prototyping",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Interactive Prototyping", item: "https://hotbotstudios.com/ui-ux-design/prototyping" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is the difference between a wireframe and an interactive prototype?", acceptedAnswer: { "@type": "Answer", text: "A wireframe is a static structural blueprint, it shows layout and content but doesn't respond to clicks. An interactive prototype is a clickable, navigable simulation of the real product, users can tap buttons, fill forms, and navigate screens as if they were using the live app. Prototypes enable meaningful usability testing, investor demos, and stakeholder sign-off before development begins." } },
    { "@type": "Question", name: "Do you build prototypes in Figma or code?", acceptedAnswer: { "@type": "Answer", text: "We build prototypes in Figma for design-validation purposes, it's faster, cheaper, and sufficient for 95% of testing and demo scenarios. For highly complex micro-interaction validation or investor demos requiring near-perfect realism, we can build coded prototypes in React/Next.js, though this is rarely necessary. Figma prototypes are shareable via link with no software installation required." } },
    { "@type": "Question", name: "Can a Figma prototype be used for investor pitches?", acceptedAnswer: { "@type": "Answer", text: "Absolutely, interactive Figma prototypes are standard practice for seed and Series A investor demos. They demonstrate product vision convincingly without requiring development investment. We optimize investor-facing prototypes for the key user flows that matter most to investors: the core value moment, the onboarding flow, and the key feature differentiation. A polished prototype can make or break a funding pitch." } },
    { "@type": "Question", name: "How realistic can a Figma prototype get?", acceptedAnswer: { "@type": "Answer", text: "Figma prototypes can achieve very high realism: hover states, click animations, conditional logic (show/hide elements), component state changes, overlays, scrolling, fixed navigation, micro-animations, and smooth transitions. Where Figma prototypes differ from real products is in data dynamism (no live API calls) and complex custom animations beyond what Figma's animation engine supports." } },
    { "@type": "Question", name: "Can we run usability testing directly on a Figma prototype?", acceptedAnswer: { "@type": "Answer", text: "Yes, Figma prototypes can be loaded directly into Maze for unmoderated usability testing, or shared via link for moderated sessions in Lookback/Zoom. We build prototypes with Maze task flows in mind, ensuring every task start point and success screen is clearly mapped for clean data collection. This is the fastest, most cost-effective way to validate design decisions before a line of code is written." } },
    { "@type": "Question", name: "How quickly can you build an interactive prototype?", acceptedAnswer: { "@type": "Answer", text: "A focused prototype of 5–10 core screens with realistic interactions can be completed in 3–5 business days if wireframes or visual designs already exist. A full-product prototype (20–40 screens, all user journeys) typically takes 2–3 weeks. We can turn around expedited investor demo prototypes in 48–72 hours for urgent fundraising situations." } },
  ],
};

const SUB_SERVICES = [
  { icon: "⚡", title: "Figma Interactive Prototypes", desc: "Fully clickable, navigable prototypes linking all screens with realistic transitions, hover states, overlays, and conditional logic.", href: "/ui-ux-design/prototyping" },
  { icon: "🧪", title: "Usability Test Prototypes", desc: "Prototypes built specifically for Maze task-based usability testing, optimised task flows, clear start/success states, and realistic interaction fidelity.", href: "/ui-ux-design/prototyping" },
  { icon: "💼", title: "Investor Demo Prototypes", desc: "Polished, high-fidelity prototypes showcasing your core value proposition for seed, Series A, and Series B investor presentations.", href: "/ui-ux-design/prototyping" },
  { icon: "✅", title: "Stakeholder Sign-Off Prototypes", desc: "Interactive prototypes for internal stakeholder reviews, replace lengthy spec documents with a clickable experience that stakeholders can actually use.", href: "/ui-ux-design/prototyping" },
  { icon: "📱", title: "Mobile App Prototypes", desc: "Figma prototypes optimised for iOS and Android preview, swipe gestures, bottom sheet navigation, tab bars, and native mobile interaction patterns.", href: "/ui-ux-design/prototyping" },
  { icon: "🎬", title: "Micro-Interaction Design", desc: "Refined animation and transition design for hover states, loading states, success confirmations, and onboarding flows that make products feel alive and premium.", href: "/ui-ux-design/prototyping" },
];

const STATS = [
  { value: 100, suffix: "×", label: "Cheaper to Fix in Prototype than in Code", color: "#06b6d4" },
  { value: 3, suffix: "wk", label: "Average Prototype Turnaround", color: "#06b6d4" },
  { value: 85, suffix: "%", label: "of Issues Caught Before Development", color: "#06b6d4" },
  { value: 48, suffix: "hr", label: "Expedited Investor Demo Turnaround", color: "#06b6d4" },
];

const PROCESS = [
  { n: 1, title: "Prototype Scope Definition", desc: "Agree on user flows, fidelity level, interaction depth, and use case (user testing, investor demo, stakeholder review), so every interaction decision is purposeful.", icon: "📋" },
  { n: 2, title: "Screen & Flow Linking", desc: "Connect all Figma frames with prototype flows, transitions, overlays, conditional states, back navigation, and error states, building a realistic navigable experience.", icon: "🔗" },
  { n: 3, title: "Interaction & Animation Refinement", desc: "Add hover states, click animations, micro-interactions, loading states, and easing curves that make the prototype feel premium and production-realistic.", icon: "✨" },
  { n: 4, title: "Testing, Review & Delivery", desc: "Internal QA of all flows, shareable link delivery, walkthrough session with stakeholders, and Maze integration setup if usability testing is planned.", icon: "📤" },
];

const FAQS = [
  { q: "What is the difference between a wireframe and an interactive prototype?", a: "A wireframe is a static structural blueprint, it shows layout and content but doesn't respond to clicks. An interactive prototype is a clickable, navigable simulation of the real product, users can tap buttons, fill forms, and navigate screens as if they were using the live app. Prototypes enable meaningful usability testing, investor demos, and stakeholder sign-off before development begins." },
  { q: "Do you build prototypes in Figma or code?", a: "We build prototypes in Figma for design-validation purposes, it's faster, cheaper, and sufficient for 95% of testing and demo scenarios. Figma prototypes are shareable via link with no software installation required. For near-perfect realism, coded prototypes in React/Next.js are available as an add-on." },
  { q: "Can a Figma prototype be used for investor pitches?", a: "Absolutely, interactive Figma prototypes are standard practice for seed and Series A investor demos. They demonstrate product vision convincingly without requiring development investment. We optimize investor-facing prototypes for the key user flows that matter most to investors: the core value moment, onboarding flow, and feature differentiation." },
  { q: "How realistic can a Figma prototype get?", a: "Figma prototypes can achieve very high realism: hover states, click animations, conditional logic, component state changes, overlays, scrolling, fixed navigation, micro-animations, and smooth transitions. The main limitation vs live products is data dynamism, no live API calls, and highly custom animations beyond Figma's engine." },
  { q: "Can we run usability testing directly on a Figma prototype?", a: "Yes, Figma prototypes load directly into Maze for unmoderated usability testing, or can be shared via link for moderated sessions. We build prototypes with Maze task flows in mind, ensuring every task start point and success screen is clearly mapped for clean data collection." },
  { q: "How quickly can you build an interactive prototype?", a: "A focused prototype of 5–10 core screens can be completed in 3–5 business days if wireframes or visual designs already exist. A full-product prototype (20–40 screens) takes 2–3 weeks. Expedited investor demo prototypes can be turned around in 48–72 hours for urgent fundraising situations." },
];

const RELATED = [
  { title: "UX Research & User Testing", href: "/ui-ux-design/ux-research", desc: "Test your prototype with real users using Maze and Hotjar.", icon: "🔭" },
  { title: "Visual UI Design & Design Systems", href: "/ui-ux-design/visual-ui-design", desc: "High-fidelity visual design that makes prototypes truly compelling.", icon: "🎨" },
  { title: "Mobile App Design (iOS & Android)", href: "/ui-ux-design/mobile-design", desc: "Mobile-native prototypes following iOS HIG and Material Design 3.", icon: "📱" },
];

const protoUseCases = [
  { use: "User Usability Testing", value: "Catch 85% of usability issues before dev", icon: "🧪" },
  { use: "Investor Demo", value: "Demonstrate product vision without writing code", icon: "💼" },
  { use: "Stakeholder Sign-Off", value: "Replace 40-page spec docs with click-through demos", icon: "✅" },
  { use: "Developer Handoff Reference", value: "Developers interact with intended UX directly", icon: "💻" },
];

export default function PrototypingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Interactive Prototyping"
        title="Catch Every Design Problem Before a Line of Code is Written"
        subtitle="An interactive prototype lets investors feel your vision, lets users reveal your blindspots, and lets stakeholders sign off without misunderstanding. HotBot Studios builds Figma prototypes that make meetings shorter, decisions clearer, and builds faster."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#06b6d4" }}>Definition, Interactive Prototyping</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              An <strong className="text-white">interactive prototype</strong> is a clickable, navigable simulation of a digital product built in Figma, without writing production code. Users can click buttons, navigate screens, interact with overlays, and experience the core flows of a product as if it were live. Prototyping is the critical validation step between design and development, eliminating costly rework by catching UX problems when fixes take hours, not weeks.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Prototype Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {protoUseCases.map((item) => (
              <GlassCard key={item.use} className="p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold mb-1">{item.use}</h3>
                <p className="text-slate-400 text-sm">{item.value}</p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Prototyping Services" columns={3} />
      <ServiceStats stats={STATS} title="Why Prototyping Before Development Matters" />
      <ProcessSteps steps={PROCESS} title="Our Prototyping Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Fixing design problems in a Figma prototype costs 100× less than fixing them in production code",
                "Investor demo prototypes can be ready in 48–72 hours for urgent fundraising situations",
                "Figma prototypes work directly in Maze for task-based usability testing, no code required",
                "We prototype hover states, overlays, conditional logic, scrolling, and mobile swipe gestures",
                "Prototypes link directly to our visual UI design system, every component is production-grade",
                "Stakeholder sign-off via shared Figma link, no meetings, no long spec document reviews",
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
        title="Make Your Product Real Before It's Built"
        subtitle="Share your wireframes or design direction, we'll deliver a clickable Figma prototype your investors, users, and developers can all work from."
        formType="get-started"
      />
    </>
  );
}
