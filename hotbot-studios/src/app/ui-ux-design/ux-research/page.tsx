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
  title: "UX Research & User Testing Services USA | HotBot Studios",
  description:
    "Professional UX research and user testing for US businesses. User interviews, Maze usability testing, Hotjar heatmaps, and session recordings that uncover exactly why users drop off, before you build the wrong thing.",
  keywords: [
    "UX research agency USA",
    "user testing services USA",
    "usability testing USA",
    "UX research company",
    "user interviews USA",
    "heatmap analysis USA",
    "Maze usability testing",
    "Hotjar analysis",
    "UX audit USA",
    "user experience research USA",
  ],
  openGraph: {
    title: "UX Research & User Testing Services USA | HotBot Studios",
    description: "User interviews, Maze usability testing, Hotjar heatmaps and session recordings. Stop guessing, start knowing what users actually need.",
    url: "https://hotbotstudios.com/ui-ux-design/ux-research",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "UX Research & User Testing USA | HotBot Studios", description: "Usability testing, user interviews, and heatmap analysis for US products." },
  alternates: { canonical: "https://hotbotstudios.com/ui-ux-design/ux-research" },
};

const serviceSchema = {
  "@context": "https://schema.org", "@type": "Service",
  name: "UX Research & User Testing",
  description: "User interviews, Maze usability testing, Hotjar heatmap analysis, and session recordings to uncover user pain points and validate design decisions before development.",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "UX Research & User Testing",
  url: "https://hotbotstudios.com/ui-ux-design/ux-research",
};

const breadcrumbSchema = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "UI/UX Design", item: "https://hotbotstudios.com/ui-ux-design" },
    { "@type": "ListItem", position: 3, name: "UX Research & User Testing", item: "https://hotbotstudios.com/ui-ux-design/ux-research" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What's the difference between UX research and usability testing?", acceptedAnswer: { "@type": "Answer", text: "UX research is the broader discipline, it includes interviews, surveys, competitive analysis, and analytics review to understand user needs, goals, and mental models. Usability testing is a specific method within UX research that tests whether real users can complete tasks in your product without friction. We do both, in the right sequence." } },
    { "@type": "Question", name: "How many users do you need for meaningful usability testing?", acceptedAnswer: { "@type": "Answer", text: "Nielsen Norman Group's research shows 5 users uncover ~85% of usability problems. We recommend 5–8 participants per round for qualitative usability testing. For quantitative studies (statistical significance on conversion rates), we need 300–500 users minimum, typically run via Maze or A/B testing tools." } },
    { "@type": "Question", name: "Do you recruit test participants or use our existing users?", acceptedAnswer: { "@type": "Answer", text: "Both. For products with an existing user base, we recruit from your customers via email surveys or in-app prompts, this gives the most relevant insights. For new products or pre-launch validation, we recruit from our panel of screened US participants matching your ICP demographics and job titles." } },
    { "@type": "Question", name: "What tools do you use for UX research?", acceptedAnswer: { "@type": "Answer", text: "Maze for unmoderated usability testing and first-click tests; Hotjar for heatmaps, session recordings, and on-site surveys; Google Analytics 4 for behavioural funnel analysis; Lookback or Zoom for moderated user interviews; Typeform/Google Forms for screener and satisfaction surveys. All tools are set up and managed by our team." } },
    { "@type": "Question", name: "How long does a UX research engagement take?", acceptedAnswer: { "@type": "Answer", text: "A focused usability test study (recruit + test + report) typically takes 2–3 weeks. A comprehensive discovery UX research engagement (interviews + heatmap analysis + competitive UX audit + synthesis) runs 4–6 weeks. We can run expedited studies in as little as 5 business days for urgent product decisions." } },
    { "@type": "Question", name: "What deliverables do we receive after UX research?", acceptedAnswer: { "@type": "Answer", text: "You receive: a research report with prioritised insights, annotated session recordings highlighting key moments, heatmap screenshots with commentary, a list of ranked UX issues by severity and frequency, recommended design solutions for the top 5 problems, and an executive summary slide deck for stakeholder sharing." } },
  ],
};

const SUB_SERVICES = [
  { icon: "🎤", title: "User Interviews", desc: "1:1 moderated interviews with 5–10 users from your ICP to understand goals, pain points, and mental models, the foundation of evidence-based design.", href: "/ui-ux-design/ux-research" },
  { icon: "🧪", title: "Maze Usability Testing", desc: "Unmoderated task-based usability tests on Figma prototypes or live products. 50–200 participants, with quantitative completion rates and time-on-task data.", href: "/ui-ux-design/ux-research" },
  { icon: "🔥", title: "Hotjar Heatmap & Session Analysis", desc: "Click maps, scroll maps, and session recordings that show where users actually engage, revealing friction, confusion, and conversion drop-off in your live product.", href: "/ui-ux-design/ux-research" },
  { icon: "📋", title: "UX Surveys & Screeners", desc: "Post-task satisfaction surveys, NPS measurements, and screener questionnaires to collect quantitative user sentiment at scale across your entire user base.", href: "/ui-ux-design/ux-research" },
  { icon: "🔍", title: "Competitive UX Audit", desc: "Side-by-side analysis of 3–5 competitor products, UX patterns, navigation conventions, feature discoverability, to identify gaps and opportunities for your product.", href: "/ui-ux-design/ux-research" },
  { icon: "📊", title: "Analytics Funnel Analysis", desc: "GA4 funnel analysis, drop-off mapping, and event tracking audit to identify where users exit your product and quantify the revenue impact of each friction point.", href: "/ui-ux-design/ux-research" },
];

const STATS = [
  { value: 85, suffix: "%", label: "Usability Issues Found with 5 Users", color: "#8b5cf6" },
  { value: 70, suffix: "%", label: "of UX Problems Visible in Heatmaps", color: "#8b5cf6" },
  { value: 5, suffix: "×", label: "ROI on UX Research vs Post-Build Fixes", color: "#8b5cf6" },
  { value: 2, suffix: "wk", label: "Typical Study Turnaround", color: "#8b5cf6" },
];

const PROCESS = [
  { n: 1, title: "Research Planning", desc: "Define research questions, choose methods, write discussion guides and task scripts, set success metrics, and recruit the right participants from your ICP.", icon: "📋" },
  { n: 2, title: "Data Collection", desc: "Run moderated interviews, deploy Maze usability tests, install Hotjar tracking, and gather session recording data across a statistically meaningful participant pool.", icon: "🎤" },
  { n: 3, title: "Analysis & Synthesis", desc: "Affinity mapping, thematic analysis of interview transcripts, heatmap annotation, funnel drop-off quantification, and severity scoring of every identified issue.", icon: "🔬" },
  { n: 4, title: "Research Report & Design Recommendations", desc: "Prioritised findings report, annotated evidence, ranked issue list with recommended design solutions, and executive summary for stakeholder alignment.", icon: "📊" },
];

const FAQS = [
  { q: "What's the difference between UX research and usability testing?", a: "UX research is the broader discipline, it includes interviews, surveys, competitive analysis, and analytics review to understand user needs, goals, and mental models. Usability testing is a specific method within UX research that tests whether real users can complete tasks in your product without friction. We do both, in the right sequence." },
  { q: "How many users do you need for meaningful usability testing?", a: "Nielsen Norman Group's research shows 5 users uncover ~85% of usability problems. We recommend 5–8 participants per round for qualitative usability testing. For quantitative studies, we need 300–500 users minimum, typically run via Maze or A/B testing tools." },
  { q: "Do you recruit test participants or use our existing users?", a: "Both. For products with an existing user base, we recruit from your customers via email surveys or in-app prompts. For new products or pre-launch validation, we recruit from our panel of screened US participants matching your ICP demographics and job titles." },
  { q: "What tools do you use for UX research?", a: "Maze for unmoderated usability testing and first-click tests; Hotjar for heatmaps, session recordings, and on-site surveys; Google Analytics 4 for behavioural funnel analysis; Lookback or Zoom for moderated user interviews; Typeform for screener and satisfaction surveys." },
  { q: "How long does a UX research engagement take?", a: "A focused usability test study (recruit + test + report) typically takes 2–3 weeks. A comprehensive discovery UX research engagement runs 4–6 weeks. We can run expedited studies in as little as 5 business days for urgent product decisions." },
  { q: "What deliverables do we receive after UX research?", a: "A research report with prioritised insights, annotated session recordings, heatmap screenshots with commentary, a ranked UX issue list by severity, recommended design solutions for the top 5 problems, and an executive summary slide deck." },
];

const RELATED = [
  { title: "Wireframing & Information Architecture", href: "/ui-ux-design/wireframing", desc: "Turn research insights into structured user flows and wireframes.", icon: "📐" },
  { title: "Visual UI Design & Design Systems", href: "/ui-ux-design/visual-ui-design", desc: "High-fidelity Figma UI built on atomic design systems.", icon: "🎨" },
  { title: "Interactive Prototyping", href: "/ui-ux-design/prototyping", desc: "Clickable prototypes for testing before development begins.", icon: "⚡" },
];

const researchMethods = [
  { method: "User Interviews (Moderated)", insight: "Goals & mental models", effort: 90, color: "#8b5cf6" },
  { method: "Maze Usability Testing", insight: "Task success & friction", effort: 85, color: "#3b82f6" },
  { method: "Hotjar Heatmaps", insight: "Click & scroll behaviour", effort: 78, color: "#06b6d4" },
  { method: "Session Recordings", insight: "Real navigation paths", effort: 82, color: "#ec4899" },
  { method: "Analytics Funnel Analysis", insight: "Drop-off quantification", effort: 75, color: "#22c55e" },
  { method: "Competitive UX Audit", insight: "Benchmark & gaps", effort: 68, color: "#f59e0b" },
];

export default function UXResearchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        label="UX Research & User Testing"
        title="Stop Guessing. Start Knowing What Users Actually Need."
        subtitle="Bad UX costs US businesses billions in lost conversions every year, and most of it is invisible until you watch real users try to use your product. HotBot Studios runs rigorous UX research so you build the right solution, not just a polished one."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8b5cf6" }}>Definition, UX Research</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">UX Research</strong> is the systematic study of users, their goals, behaviours, and pain points, using methods like interviews, usability tests, and heatmap analysis. It replaces assumption-driven design with evidence-based decisions, reducing costly post-launch fixes and increasing product-market fit. Research conducted before design begins delivers 5× greater ROI than fixing usability problems after development.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-2">Research Method, Insight Depth Index</h2>
            <p className="text-slate-400 text-sm mb-6">Relative depth of actionable insight generated per research method</p>
            <div className="space-y-4">
              {researchMethods.map((row) => (
                <div key={row.method} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-52 shrink-0 text-right hidden md:block">{row.method}</span>
                  <div className="flex-1 rounded-full h-5 bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${row.effort}%`, background: `linear-gradient(90deg, ${row.color}40, ${row.color})` }}>
                      <span className="text-[10px] font-bold text-white hidden md:block">{row.effort}</span>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs w-36 shrink-0 hidden md:block">{row.insight}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <SubServices services={SUB_SERVICES} title="UX Research Services" columns={3} />
      <ServiceStats stats={STATS} title="Why UX Research Pays for Itself" />
      <ProcessSteps steps={PROCESS} title="Our UX Research Process" />

      <section className="relative z-10 px-6 max-w-5xl mx-auto py-8">
        <Reveal>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">When to Run UX Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { trigger: "Before Design Begins", why: "Validate assumptions about user needs before investing design and dev time in the wrong direction.", icon: "🔭" },
              { trigger: "Before Development Starts", why: "Test wireframes and prototypes with real users, fixes cost hours at this stage, not weeks of rework.", icon: "🏗️" },
              { trigger: "After Launch (Low Conversion)", why: "Heatmaps and session recordings reveal exactly where and why users are abandoning your funnel.", icon: "📉" },
              { trigger: "Before a Major Redesign", why: "Know which parts of your product users love (keep) vs hate (fix), not just what stakeholders think.", icon: "🔄" },
            ].map((item) => (
              <GlassCard key={item.trigger} className="p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold mb-2">{item.trigger}</h3>
                <p className="text-slate-400 text-sm">{item.why}</p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <FAQSection faqs={FAQS} />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-8">
        <Reveal>
          <div className="rounded-xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "5 users in usability testing uncover ~85% of critical usability issues, you don't need a huge sample",
                "UX research before design saves 5× the cost of fixing usability problems post-development",
                "Hotjar heatmaps + session recordings reveal invisible conversion killers in live products",
                "Maze enables unmoderated usability testing at scale on Figma prototypes, no dev required",
                "Every engagement delivers a prioritised, severity-ranked issue list with recommended design fixes",
                "We recruit participants from your existing users or our screened US ICP panel",
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
        title="Find Out Exactly Why Users Drop Off"
        subtitle="Book a UX research audit, we'll identify the top 5 usability problems costing you conversions, with evidence and recommended fixes delivered in 2 weeks."
        formType="get-started"
      />
    </>
  );
}
