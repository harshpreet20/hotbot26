import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Marketing Team Building & Training USA - Hiring, Structure & Leadership Coaching | HotBot Studios",
  description:
    "HotBot Studios helps US businesses hire, structure, and upskill their in-house marketing teams - role scoping, interview frameworks, onboarding plans, and 1:1 coaching for marketing leaders. Free team consultation.",
  keywords: [
    "marketing team building USA",
    "marketing hiring consultant USA",
    "marketing team structure USA",
    "marketing training USA",
    "marketing leader coaching USA",
    "in-house marketing team USA",
    "marketing department setup USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/marketing-consulting/team-building" },
  openGraph: {
    title: "Marketing Team Building & Training USA | HotBot Studios",
    description: "Hire, structure, and upskill your in-house marketing team - role scoping, interview frameworks, onboarding plans, and coaching for US marketing leaders.",
    url: "https://hotbotstudios.com/marketing-consulting/team-building",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Marketing Team Building & Training",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Marketing Team Consulting and Leadership Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Marketing team building and training for US businesses - role design, hiring frameworks, onboarding plans, capability assessment, and 1:1 coaching for marketing leaders.",
  url: "https://hotbotstudios.com/marketing-consulting/team-building",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Marketing Consulting", item: "https://hotbotstudios.com/marketing-consulting" },
    { "@type": "ListItem", position: 3, name: "Marketing Team Building & Training", item: "https://hotbotstudios.com/marketing-consulting/team-building" },
  ],
};

const CONTENT = [
  {
    heading: "The Hidden Cost of Hiring the Wrong Marketing Leader",
    body: "A bad hire at VP of Marketing or Head of Growth costs a US business an average of $250,000 to $400,000 when you account for salary, benefits, recruiting fees, the six months of misdirected strategy, and the time lost rebuilding momentum after the departure. Most of these hires fail not because the candidate was not talented but because the role was incorrectly scoped: a performance marketer hired for a role that actually needed a brand builder; a generalist hired when the business needed a channel specialist; a senior hire made when the team structure that hire would manage did not yet exist. HotBot Studios helps US businesses design marketing roles correctly before they go to market - defining the actual job to be done, the skills and experience required, the management context the hire will operate in, and the success metrics for the first 90 and 180 days. Getting this right before you write the job description is the highest-leverage investment you can make in the hiring process.",
    color: "#22c55e",
  },
  {
    heading: "Team Structure: Building a Marketing Function That Scales",
    body: "There is no single correct marketing team structure - the right structure depends on your business model (B2B vs B2C, product-led vs sales-led), your growth stage, your channel mix, and whether you are building a team to manage agency relationships or to internalise execution. HotBot Studios has designed marketing team structures for businesses from 3-person founding teams to 30-person marketing departments, and we know the patterns that work at each stage. For early-stage businesses ($1M to $5M ARR), we typically recommend a generalist-led structure with specialist agency support for performance marketing and content. For growth-stage businesses ($5M to $30M ARR), the critical hire sequence usually moves through channel specialist, then content lead, then marketing ops as the stack complexity grows. For scale-stage businesses ($30M+), we help design the pod structure, embedded specialist model, or centre-of-excellence architecture that matches the business's operating model. Each engagement produces an org chart, role descriptions for every position, a hiring sequence, and a headcount cost model.",
    color: "#3b82f6",
  },
  {
    heading: "Interview Frameworks and Candidate Assessment: Separating Signal from Story",
    body: "Marketing candidates are, by professional training, good at presenting themselves effectively. Standard interview processes - CV review, competency-based questions, a 30-minute call with the hiring manager - do not reliably distinguish between candidates who have genuinely built the capabilities your business needs and candidates who are skilled at describing capabilities they have observed in others. HotBot Studios designs structured interview processes that include a technical screen appropriate to the role (channel knowledge test for a performance marketer, editorial assessment for a content lead, attribution model question set for a marketing analyst), a case study exercise based on a real challenge your business faces, and a structured reference check process that asks the right questions of previous managers. We also help hiring managers interpret candidate signals - the signs that indicate genuine ownership mindset, creative problem-solving, and the ability to operate in ambiguity - and avoid the common biases that lead to selecting articulate presenters over effective practitioners.",
    color: "#8b5cf6",
  },
  {
    heading: "Onboarding, Coaching, and Ongoing Team Development",
    body: "A new marketing hire's first 90 days are the highest-risk period of their tenure - the time when misaligned expectations crystallise into frustration, when the absence of clear priorities leads to activity without impact, and when the relationship with the broader leadership team is established on terms that are difficult to reset later. HotBot Studios designs structured 90-day onboarding plans for marketing hires that define week-by-week priorities, decision-making authority, stakeholder relationship cadences, and the specific deliverables that constitute a successful first quarter. For marketing leaders (VP, Head of Marketing, CMO), we also offer ongoing 1:1 coaching - monthly sessions that provide an external sounding board for strategy decisions, management challenges, and board or investor communication. This coaching is particularly valuable for first-time marketing leaders who are building their management practice alongside their marketing programme for the first time. Request a consultation below and we will assess your team structure and hiring priorities.",
    color: "#f59e0b",
  },
];

export default function TeamBuildingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Marketing Consulting", href: "/marketing-consulting" }, { label: "Team Building" }]} />

      <PageHeader
        label="Marketing Team Building & Training"
        title="Build the Marketing Team Your Growth Stage Actually Needs"
        subtitle="Role design, hiring frameworks, onboarding plans, and 1:1 coaching for marketing leaders - helping US businesses build and develop in-house marketing functions that perform from day one."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Team Structure Consultation</h2>
            <p className="text-slate-400">Tell us about your current team, your next hire, and your growth targets. We will recommend the right team structure and hiring sequence within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="consultancy-team-building"
            accentColor="#22c55e"
            title="Build Your Marketing Team"
            subtitle="No obligation. Share your team size, growth stage, and biggest capability gap and we will advise on the right structure."
          />
        </Reveal>
      </section>
    </>
  );
}
