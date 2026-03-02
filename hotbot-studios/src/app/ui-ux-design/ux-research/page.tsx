import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

export const metadata: Metadata = {
  title: "UX Research & User Testing Agency USA — User Interviews, Heatmaps & Usability Testing | HotBot Studios",
  description:
    "HotBot Studios conducts UX research and user testing for US product teams — user interviews, surveys, Hotjar heatmaps, session recordings, and Maze usability tests. Free UX research consultation.",
  keywords: [
    "UX research agency USA",
    "user testing agency USA",
    "usability testing USA",
    "user interview research USA",
    "Hotjar heatmap analysis USA",
    "UX research consultant USA",
    "product user research USA",
    "Maze usability testing USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/ux-research" },
  openGraph: {
    title: "UX Research & User Testing Agency USA | HotBot Studios",
    description: "User interviews, heatmaps, session recordings, and usability tests that reveal what users need before you commit to costly design decisions.",
    url: "https://hotbotstudios.com/ui-ux-design/ux-research",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "UX Research & User Testing",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "UX Research and User Testing",
  areaServed: { "@type": "Country", name: "United States" },
  description: "UX research and user testing for US product teams — user interviews, surveys, Hotjar heatmap analysis, session recordings, and Maze usability tests.",
  url: "https://hotbotstudios.com/ui-ux-design/ux-research",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "UX Research & User Testing", item: "https://hotbotstudios.com/ui-ux-design/ux-research" },
  ],
};

const CONTENT = [
  {
    heading: "The Most Expensive Mistake in Product Design Is Building the Wrong Thing Beautifully",
    body: "Design teams can produce pixel-perfect interfaces that fail to retain users because the feature hierarchy does not match actual user priorities, the navigation assumes a mental model users do not hold, or the onboarding flow asks for information at a stage where users are not ready to provide it. These problems are not visible to the team that built the product because they are too close to it — they know the intended logic, so the interface feels intuitive to them in a way it never will to a first-time user. UX research exists to close this gap: to replace the team's assumptions about user behaviour with direct evidence from the people who will actually use the product. The return on a well-conducted research project is consistently positive — a two-week usability testing sprint that costs $8,000 to $15,000 routinely prevents a three-month development cycle building a feature that users would not adopt. HotBot Studios conducts the research that makes your design decisions defensible.",
    color: "#8b5cf6",
  },
  {
    heading: "Qualitative Research: User Interviews, Contextual Inquiry, and Jobs-to-Be-Done",
    body: "Qualitative UX research is the practice of learning from users in depth rather than at scale. User interviews — 45 to 60-minute conversations with participants who match your target user profile — are the highest-signal research method for understanding user goals, mental models, pain points, and the language users use to describe their problems. Contextual inquiry (observing users in their natural work environment) reveals the workflows, workarounds, and environmental constraints that users never mention in interviews because they are too normal to notice. Jobs-to-Be-Done interviews follow a specific protocol designed to understand the circumstances in which users hire and fire products — the trigger event, the passive and active search for alternatives, the moment of decision, and the first use experience. HotBot Studios recruits research participants, conducts interviews, synthesises findings into insight themes, and delivers a research report with specific, prioritised design implications — not just a list of user quotes.",
    color: "#3b82f6",
  },
  {
    heading: "Quantitative Research: Heatmaps, Session Recordings, Surveys, and Analytics",
    body: "Quantitative UX research tells you what users are doing at scale. Hotjar and FullStory heatmaps show you where users click, scroll, and where their attention drops off on every page of your product or website. Session recordings let you watch real users navigate your interface — revealing rage clicks, form abandonment patterns, and navigation dead ends that analytics alone cannot diagnose. Maze and UserTesting unmoderated usability tests allow you to test specific task completion rates with dozens of participants simultaneously, generating quantitative data on task success rates, time-on-task, and misclick rates. Post-task surveys and in-app feedback tools (Typeform, Hotjar Surveys) capture the subjective experience data that explains the patterns you observe in behavioural data. HotBot Studios combines these methods into a research programme calibrated to your specific questions — using the methods that will produce the highest-quality answers most efficiently given your timeline and participant access.",
    color: "#22c55e",
  },
  {
    heading: "Research Synthesis, Insight Prioritisation, and Design Recommendations",
    body: "Raw research data — interview transcripts, heatmap screenshots, session recording observations, survey responses — is not insight. Insight requires synthesis: identifying the patterns that recur across multiple data sources, separating signal from noise, and translating findings into specific, actionable design recommendations. HotBot Studios delivers research in a format that your design and product teams can act on immediately: an insight report with a clear hierarchy of findings (critical issues that should be addressed before launch vs medium-term improvements vs future research questions), affinity diagrams that visualise the relationship between findings, and a prioritised list of design changes with the research evidence supporting each recommendation. We present findings in a live session with your team and support the handoff to design, ensuring that the research investment is reflected in the decisions your team makes about the product. Request a consultation below and we will scope the right research approach for your product and timeline.",
    color: "#06b6d4",
  },
];

export default function UxResearchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <PageHeader
        label="UX Research & User Testing"
        title="Design Decisions Backed by Evidence, Not Assumptions"
        subtitle="User interviews, heatmap analysis, session recordings, and usability tests that reveal exactly what your users need — before you commit to costly design and development cycles."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free UX Research Consultation</h2>
            <p className="text-slate-400">Tell us about your product and the design decisions you need evidence for. We will recommend the right research approach and scope within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="uiux-ux-research"
            accentColor="#8b5cf6"
            title="Start Your UX Research Project"
            subtitle="No obligation. Share your product, your users, and your key design questions and we will scope the right research."
          />
        </Reveal>
      </section>
    </>
  );
}
