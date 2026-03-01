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
  title: "Marketing Team Building & Training USA | Fractional CMO | HotBot Studios",
  description:
    "Marketing team building, role design, hiring frameworks, and leadership coaching for US businesses. Build, structure, and upskill your in-house marketing team with HotBot Studios consulting.",
  keywords: [
    "marketing team building USA",
    "fractional CMO USA",
    "marketing hiring consulting USA",
    "marketing team structure USA",
    "marketing leadership coaching",
    "CMO consulting USA",
    "marketing training USA",
    "build marketing team USA",
    "marketing org design",
    "marketing manager coaching USA",
  ],
  openGraph: {
    title: "Marketing Team Building & Training USA | HotBot Studios",
    description: "Build, structure, and upskill your in-house marketing team. Role design, hiring frameworks, leadership coaching, and fractional CMO services for US businesses.",
    url: "https://hotbotstudios.com/consultancy/team-building",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Marketing Team Building & Training USA | HotBot Studios", description: "Marketing team design, hiring, and leadership coaching for US businesses." },
  alternates: { canonical: "https://hotbotstudios.com/consultancy/team-building" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "Marketing Team Building & Training",
  description: "Help US businesses hire, structure, and upskill in-house marketing teams — including role scoping, interview frameworks, onboarding plans, and 1:1 coaching for marketing leaders.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Marketing Team Building & Training",
  url: "https://hotbotstudios.com/consultancy/team-building",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Consultancy", item: "https://hotbotstudios.com/consultancy" },
    { "@type": "ListItem", position: 3, name: "Team Building", item: "https://hotbotstudios.com/consultancy/team-building" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is a fractional CMO and when should we hire one?", acceptedAnswer: { "@type": "Answer", text: "A fractional CMO is a part-time Chief Marketing Officer who provides senior marketing leadership — strategy, team management, and executive decision-making — without the full-time cost ($250,000–$400,000/year for a quality CMO). A fractional CMO from HotBot Studios is appropriate when you have a marketing team (or are building one) but lack a senior leader to set direction, prioritize, and hold the team accountable to results. Typically a $2M–$20M revenue company scenario." } },
    { "@type": "Question", name: "What is the first marketing hire a growing US business should make?", acceptedAnswer: { "@type": "Answer", text: "The first marketing hire depends on your current business model and growth stage. For most B2B companies, the first hire should be a Marketing Manager / Growth Lead — a generalist who can own strategy and execute across 2–3 channels simultaneously. The mistake most founders make is hiring a channel specialist first (e.g., an SEO Manager or a Paid Ads Manager) before they have strategic direction — resulting in isolated tactics without a coherent growth strategy." } },
    { "@type": "Question", name: "How do you structure a marketing team for a $5M–$20M B2B company?", acceptedAnswer: { "@type": "Answer", text: "For a $5M–$20M B2B company, the optimal in-house team is typically: 1 Marketing Manager/Director (strategy, oversight, reporting), 1 Content/SEO specialist (organic growth, thought leadership), 1 Paid Media specialist (Google/LinkedIn/Meta ads), and 1 Marketing Operations person (CRM, automation, analytics). This team of 4, supported by an agency or specialist contractors for design and PR, can execute a comprehensive growth programme without the overhead of a large department." } },
    { "@type": "Question", name: "How do you help us hire good marketing candidates?", acceptedAnswer: { "@type": "Answer", text: "We help with three critical hiring problems: writing the right job description (most JDs describe activities, not outcomes — we fix that), designing a practical skills assessment (instead of just interview questions), and structuring the interview process to evaluate marketing judgment rather than marketing vocabulary. We've helped clients hire from junior coordinator to VP-level and know the difference between a candidate who sounds good and one who will actually drive results." } },
    { "@type": "Question", name: "Can you help upskill an existing marketing team that's underperforming?", acceptedAnswer: { "@type": "Answer", text: "Yes — team upskilling is one of the highest-ROI consulting engagements we offer. We audit existing team capabilities and performance, identify skill gaps vs current role requirements, design a training programme (mix of workshops, 1:1 coaching, and self-directed learning), and work with marketing leaders on management practices that actually develop team performance over time. Most teams are underperforming because of unclear priorities and poor feedback, not lack of talent." } },
    { "@type": "Question", name: "What does fractional CMO engagement look like in practice?", acceptedAnswer: { "@type": "Answer", text: "A HotBot Studios fractional CMO engagement typically involves: 2–4 days/month of your fractional CMO's time; weekly leadership team check-in; monthly all-hands marketing meeting; monthly performance reporting to the CEO/founders; priority-setting and accountability for the in-house team; vendor and agency management; hiring decisions; and board/investor marketing updates. Most engagements run 6–18 months and transition to a full-time CMO hire once the team and strategy are stable." } },
  ],
};

const SUB_SERVICES = [
  { icon: "👔", title: "Fractional CMO Services", desc: "Senior marketing leadership on a part-time basis — strategy, team management, executive reporting, and board/investor updates without a $300K full-time CMO salary.", href: "/consultancy/team-building" },
  { icon: "🏗️", title: "Marketing Org Design", desc: "Design the right team structure for your current revenue stage — role definitions, reporting lines, specialist vs generalist balance, and in-house vs agency mix decisions.", href: "/consultancy/team-building" },
  { icon: "🎯", title: "First Marketing Hire Strategy", desc: "Define the right first hire for your business model — generalist vs specialist, role scope, compensation benchmarks, and what 'good' looks like so you don't waste an expensive hire.", href: "/consultancy/team-building" },
  { icon: "📋", title: "Hiring Frameworks & Assessments", desc: "Job description writing, practical skills assessment design, interview question frameworks, and scoring rubrics that identify candidates who will actually perform — not just interview well.", href: "/consultancy/team-building" },
  { icon: "📈", title: "Marketing Leadership Coaching", desc: "1:1 coaching for VP Marketing, Directors, and Marketing Managers on strategy, team management, executive communication, and the transition from individual contributor to team leader.", href: "/consultancy/team-building" },
  { icon: "🎓", title: "Team Training & Capability Building", desc: "Structured training programmes for in-house marketing teams — channel skills workshops, data literacy, MarTech proficiency, and the mental models that separate good marketers from great ones.", href: "/consultancy/team-building" },
];

const STATS = [
  { value: 300, suffix: "K", label: "Avg Full-Time CMO Cost to Replace a Fractional CMO", color: "#ec4899" },
  { value: 6, suffix: "mo", label: "Avg Time to Recover a Bad Senior Marketing Hire", color: "#ec4899" },
  { value: 40, suffix: "%", label: "Marketing Hires Underperform Due to Wrong Role Design", color: "#ec4899" },
  { value: 4, suffix: "×", label: "Team Output Increase with Clear Priorities & Accountability", color: "#ec4899" },
];

const PROCESS = [
  { n: 1, title: "Team Capability Audit", desc: "Assess current team skills, role clarity, performance metrics, management practices, and strategic alignment — diagnosing whether the team problem is a people problem, a priorities problem, or a leadership problem.", icon: "🔍" },
  { n: 2, title: "Org Design & Hiring Plan", desc: "Design the right team structure for your revenue stage, write role definitions and outcome-based job descriptions, and build a phased hiring roadmap with realistic timelines and budget.", icon: "🗺️" },
  { n: 3, title: "Hiring Execution Support", desc: "Job description publishing guidance, candidate assessment design, interview process setup, candidate evaluation, and final hire recommendation — so you make confident, evidence-based hiring decisions.", icon: "🤝" },
  { n: 4, title: "Onboarding, Training & Coaching", desc: "Structured 30/60/90-day onboarding plans for new hires, skills training programme for existing team, and ongoing 1:1 coaching for marketing leaders throughout the engagement.", icon: "🎓" },
];

const FAQS = [
  { q: "What is a fractional CMO and when should we hire one?", a: "A fractional CMO is a part-time Chief Marketing Officer providing senior marketing leadership without the full-time cost ($250,000–$400,000/year). Appropriate when you have a marketing team but lack a senior leader to set direction, prioritize, and hold the team accountable. Typically a $2M–$20M revenue company scenario." },
  { q: "What is the first marketing hire a growing US business should make?", a: "For most B2B companies, the first hire should be a Marketing Manager / Growth Lead — a generalist who can own strategy and execute across 2–3 channels simultaneously. The mistake most founders make is hiring a channel specialist first before they have strategic direction — resulting in isolated tactics without a coherent growth strategy." },
  { q: "How do you structure a marketing team for a $5M–$20M B2B company?", a: "Typically: 1 Marketing Manager/Director, 1 Content/SEO specialist, 1 Paid Media specialist, and 1 Marketing Operations person. This team of 4, supported by an agency for design and PR, can execute a comprehensive growth programme without large-department overhead." },
  { q: "How do you help us hire good marketing candidates?", a: "We fix three hiring problems: writing JDs that describe outcomes (not just activities); designing practical skills assessments; and structuring interview processes to evaluate marketing judgment rather than marketing vocabulary. We've helped hire from junior coordinator to VP-level." },
  { q: "Can you help upskill an existing marketing team that's underperforming?", a: "Yes — team upskilling is one of the highest-ROI engagements we offer. We audit capabilities and performance, identify skill gaps, design a training programme, and work with leaders on management practices that develop team performance. Most teams underperform because of unclear priorities and poor feedback, not lack of talent." },
  { q: "What does fractional CMO engagement look like in practice?", a: "Typically 2–4 days/month of fractional CMO time; weekly leadership check-in; monthly all-hands marketing meeting; monthly performance reporting to CEO/founders; priority-setting and accountability for the in-house team; and board/investor marketing updates. Most engagements run 6–18 months." },
];

const RELATED = [
  { title: "Growth Strategy & Roadmap", href: "/consultancy/growth-strategy", desc: "Strategy that gives your new team a clear direction to execute.", icon: "🗺️" },
  { title: "Marketing Audit & Gap Analysis", href: "/consultancy/marketing-audit", desc: "Audit your current team's marketing performance before rebuilding.", icon: "🔍" },
  { title: "Digital Marketing Execution", href: "/marketing-services", desc: "Full-service marketing execution while your team is being built.", icon: "📣" },
];

const teamSizes = [
  { stage: "Seed / Early Stage ($500K–$2M)", team: "Founder-led + 1 Marketing Generalist", focus: "PMF validation + first acquisition channel", color: "#8b5cf6" },
  { stage: "Growth Stage ($2M–$10M)", team: "Marketing Manager + 2 Specialists", focus: "Channel scaling + content engine", color: "#3b82f6" },
  { stage: "Scale Stage ($10M–$50M)", team: "VP Marketing + 4–6 Specialists", focus: "Multi-channel + marketing ops + brand", color: "#22c55e" },
  { stage: "Mid-Market ($50M+)", team: "CMO + Full Department (10–30)", focus: "Enterprise ABM + brand + global", color: "#f59e0b" },
];

export default function TeamBuildingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="Marketing Team Building & Training"
        title="Build a Marketing Team That Actually Executes Strategy"
        subtitle="Most marketing team problems aren't talent problems — they're structure problems. Wrong roles, unclear priorities, and no accountability system. HotBot Studios designs, hires, and develops marketing teams that execute with precision — or provides fractional CMO leadership while you build toward that."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#ec4899" }}>Definition — Fractional CMO</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              A <strong className="text-white">fractional CMO</strong> is a senior marketing executive who works part-time across multiple companies, providing the strategic leadership and team management of a full-time CMO at a fraction of the cost. For US businesses with $1M–$20M in revenue that aren&apos;t ready for a $300K full-time hire, a fractional CMO bridges the leadership gap — setting strategy, managing the team, and reporting to the CEO — while building toward a permanent leadership hire.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Right Team Size by Revenue Stage</h2>
          <div className="space-y-4">
            {teamSizes.map((item) => (
              <GlassCard key={item.stage} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.stage}</span>
                    <p className="text-white font-semibold mt-1">{item.team}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-slate-400 text-sm">{item.focus}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="Team Building & Training Services" columns={3} />
      <ServiceStats stats={STATS} title="The True Cost of Getting Team Building Wrong" />
      <ProcessSteps steps={PROCESS} title="Our Team Building Process" />
      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Fractional CMO costs 80–90% less than a full-time CMO — with the same strategic value for $2M–$20M companies",
                "The first marketing hire should be a generalist Growth Lead, not a channel specialist — strategy before tactics",
                "40% of marketing hires underperform because the role was designed around activities, not outcomes",
                "A team of 4 (Manager + Content/SEO + Paid Media + Ops) can execute enterprise-quality marketing at $5M–$20M",
                "Interview processes should evaluate judgment and thinking, not channel knowledge — we design assessments that test this",
                "Most underperforming teams need clearer priorities and better feedback, not new people",
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
        title="Build or Fix Your Marketing Team the Right Way"
        subtitle="Whether you need a fractional CMO for strategic leadership, help hiring your first marketer, or a programme to develop your existing team — book a free discovery call and we'll design the right solution."
        formType="strategy-call"
      />
    </>
  );
}
