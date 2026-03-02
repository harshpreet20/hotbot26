import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Wireframing & Information Architecture Design USA — Figma Wireframes & User Flows | HotBot Studios",
  description:
    "HotBot Studios delivers low and high-fidelity wireframes and information architecture for US product teams — user journeys, navigation structures, and feature prioritisation before final UI design. Free design consultation.",
  keywords: [
    "wireframing agency USA",
    "information architecture design USA",
    "UX wireframes USA",
    "Figma wireframing USA",
    "user flow design USA",
    "product wireframe design USA",
    "low fidelity wireframes USA",
    "high fidelity wireframes USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/wireframing" },
  openGraph: {
    title: "Wireframing & Information Architecture Design USA | HotBot Studios",
    description: "Low and high-fidelity wireframes and information architecture that define your user flows and navigation structure before visual design begins.",
    url: "https://hotbotstudios.com/ui-ux-design/wireframing",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Wireframing & Information Architecture",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "UX Wireframing and Information Architecture Design",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Low and high-fidelity wireframes and information architecture design for US product teams — user journeys, navigation structures, and feature prioritisation delivered in Figma.",
  url: "https://hotbotstudios.com/ui-ux-design/wireframing",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "Wireframing & Information Architecture", item: "https://hotbotstudios.com/ui-ux-design/wireframing" },
  ],
};

const CONTENT = [
  {
    heading: "Why Skipping Wireframes Is the Most Expensive Shortcut in Product Design",
    body: "The temptation to skip wireframing and go straight to high-fidelity visual design is understandable — wireframes look unfinished, stakeholders find them hard to evaluate, and the visual design phase is where the product starts to feel real. But the cost of discovering structural problems (wrong navigation hierarchy, missing user flows, incorrect feature prioritisation) during the visual design or development phase is orders of magnitude higher than discovering them in wireframes. A navigation architecture problem found during wireframing takes two days to fix. The same problem found during development requires redesigning the component library, rewriting routing logic, and re-testing the user flows — typically two to four weeks of wasted effort. HotBot Studios treats wireframing as the most important phase of the design process: the moment when user research insights become concrete structural decisions, before those decisions have been made expensive by the investment of visual design and development effort.",
    color: "#3b82f6",
  },
  {
    heading: "Information Architecture: The Navigation Structure Users Actually Find Intuitive",
    body: "Information architecture (IA) is the practice of organising the content, features, and navigation of a product in a structure that matches users' mental models — the way they naturally think about the problem your product solves. Good IA is invisible: users find what they need without consciously thinking about how they navigated there. Bad IA is immediately apparent: users ask where things are, navigation labels require explanations, and users cannot predict which section of the product contains the feature they need. HotBot Studios develops information architecture through card sorting (having representative users group and label features) and tree testing (having users navigate a navigation-only prototype to find specific items) — empirical methods that produce IA decisions based on how your specific users think, not how your team assumes they think. The output is a site map or app structure that has been tested and validated before a single wireframe screen is drawn.",
    color: "#8b5cf6",
  },
  {
    heading: "Low to High Fidelity: From Concept to Development-Ready Wireframes",
    body: "Wireframing moves through fidelity levels, each serving a different purpose. Low-fidelity sketches (hand-drawn or rough Figma boxes) are the fastest way to explore multiple structural approaches in parallel — the goal is to generate and eliminate options quickly, not to communicate a finished design. Mid-fidelity wireframes define the layout, content hierarchy, and interaction patterns for each screen with enough detail to make structural decisions and begin usability testing. High-fidelity wireframes are the transition to visual design: every element placed with precise dimensions, content replaced with realistic data, and annotations added for the developer who will build each component. HotBot Studios delivers wireframes in Figma across all fidelity levels, with each screen annotated with interaction notes, responsive behaviour specifications, and the UX reasoning behind key design decisions — giving developers everything they need to build the product without interpretation errors.",
    color: "#22c55e",
  },
  {
    heading: "User Flows, Edge Cases, and the States That Development Teams Need",
    body: "A common gap between design delivery and development reality is the treatment of edge cases and UI states. Wireframes that show only the happy path — the ideal user journey with valid data, no errors, and a full account — leave development teams making ad-hoc design decisions for every exception: empty states (what does the dashboard look like before any data has been added?), error states (what happens when an API call fails?), loading states (what does the user see while data is being fetched?), and permission states (what does a read-only user see instead of the edit button?). HotBot Studios maps every user flow in full — including onboarding, primary task completion, error recovery, and edge cases — and wireframes every state that development needs. This completeness is what separates wireframes that accelerate development from wireframes that generate a constant stream of design questions during the build sprint. Request a consultation below and we will scope the wireframing engagement for your product.",
    color: "#f59e0b",
  },
];

export default function WireframingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="Wireframing & Information Architecture"
        title="The Structural Foundation That Makes Everything Else Work"
        subtitle="Low and high-fidelity wireframes and information architecture that map user journeys, navigation structures, and feature priorities — delivered in Figma before visual design begins."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Design Consultation</h2>
            <p className="text-slate-400">Tell us about your product, your users, and your development timeline. We will scope the wireframing engagement and recommend the right level of fidelity within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="uiux-wireframing"
            accentColor="#3b82f6"
            title="Start Your Wireframing Project"
            subtitle="No obligation. Share your product brief and we will scope the information architecture and wireframing approach."
          />
        </Reveal>
      </section>
    </>
  );
}
