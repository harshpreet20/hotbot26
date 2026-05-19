import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceStats } from "@/components/sections/ServiceStats";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { Reveal } from "@/components/shared/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mental Wellness Assistant - AI Employee Wellness Tool for US Businesses | HotBot Studios",
  description: "24/7 confidential AI mental health support for your team. CBT-based exercises, mood tracking, burnout indicators, and human escalation. Reduce employee turnover and improve workforce productivity.",
  keywords: [
    "corporate mental health AI platform",
    "employee wellness chatbot USA",
    "AI wellbeing tool for small business teams",
    "CBT chatbot for employee support",
    "confidential employee mental health platform",
    "AI burnout prevention tool for HR",
    "digital mental health support for remote teams",
    "employee assistance program AI USA"
  ],
  openGraph: {
    title: "Mental Wellness Assistant - AI Employee Wellness Tool for US Businesses | HotBot Studios",
    description: "24/7 confidential AI mental health support for your team. CBT-based exercises, mood tracking, burnout indicators, and human escalation. Reduce employee turnover and improve workforce productivity.",
    url: "https://hotbotstudios.com/products/mental-wellness-assistant",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mental Wellness Assistant: 24/7 Confidential AI Mental Health Support for Your Team" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mental Wellness Assistant - AI Employee Wellness Tool for US Businesses | HotBot Studios",
    description: "24/7 confidential AI mental health support for your team. CBT-based exercises, mood tracking, burnout indicators, and human escalation. Reduce employee turnover and improve workforce productivity.",
  },
  alternates: { canonical: "https://hotbotstudios.com/products/mental-wellness-assistant" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mental Wellness Assistant: 24/7 Confidential AI Mental Health Support for Your Team",
  "description": "24/7 confidential AI mental health support for your team. CBT-based exercises, mood tracking, burnout indicators, and human escalation. Reduce employee turnover and improve workforce productivity.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OnlineOnly"
  },
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "url": "https://hotbotstudios.com/products/mental-wellness-assistant",
  "featureList": "CBT-Based Exercise Library, Daily Mood Check-Ins, Burnout Risk Indicators, Full Confidentiality Guarantee, Human Escalation Protocol, HR Dashboard and Reporting"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://hotbotstudios.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "AI Automation",
      "item": "https://hotbotstudios.com/ai-automation"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Mental Wellness Assistant",
      "item": "https://hotbotstudios.com/products/mental-wellness-assistant"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can my company see what individual employees discuss in the assistant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. All individual conversation data is strictly confidential and inaccessible to employers and HR administrators. The company dashboard shows only anonymized aggregate data: team mood trends, engagement rates, and risk indicator levels. Individual employees have full control over their data and can delete their conversation history at any time."
      }
    },
    {
      "@type": "Question",
      "name": "Is the assistant suitable as a replacement for professional therapy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The assistant provides evidence-based support tools including CBT exercises, mood tracking, and stress management resources. It is a supplement to professional mental health care, not a replacement. When clinical intervention is indicated, the assistant provides immediate referral to licensed professionals and crisis resources. It is designed to fill the gap between professional sessions and provide continuous daily support."
      }
    },
    {
      "@type": "Question",
      "name": "How is employee data protected and stored?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All data is encrypted at rest and in transit. Individual conversation data is stored on US-based servers under SOC2-compliant data handling practices. The platform is HIPAA-aware in its data handling policies. A full data processing agreement (DPA) is available for enterprise deployments requiring compliance documentation."
      }
    },
    {
      "@type": "Question",
      "name": "How do you measure the impact on employee wellbeing and retention?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The HR dashboard tracks team-level mood trend data, engagement rates, and burnout risk indicators over time. These are correlated with quarterly employee satisfaction surveys and HR retention data to quantify the impact on team wellbeing and turnover rates. Most clients see measurable mood trend improvements within the first 60 to 90 days of deployment."
      }
    }
  ]
};

const STATS = [
    { value: 24, suffix: "/7", label: "Confidential Support Access", color: "#f59e0b" },
    { value: 33, suffix: "%", label: "Avg Reduction in Burnout Indicators", color: "#3b82f6" },
    { value: 60, suffix: " sec", label: "Daily Mood Check-In Time", color: "#8b5cf6" },
    { value: 125, suffix: "B+", label: "Annual US Burnout Healthcare Cost (McKinsey)", color: "#22c55e" }
];

const PROCESS = [
    { n: 1, title: "Company Onboarding and Policy Setup", desc: "Configure the assistant for your company: set the confidentiality policy, HR dashboard access permissions, escalation thresholds, and integration with any existing EAP. Setup takes under 2 hours.", icon: "⚙️" },
    { n: 2, title: "Employee Rollout and Onboarding", desc: "Each employee receives an individual access link and a 3-minute onboarding flow explaining the confidentiality guarantee, available features, and how data is and is not shared. Adoption is voluntary.", icon: "👥" },
    { n: 3, title: "Active Monitoring and HR Reporting", desc: "HR receives a monthly dashboard with anonymized team wellbeing indicators. The assistant operates autonomously. No ongoing HR management required after initial setup.", icon: "📊" },
    { n: 4, title: "Escalation and EAP Integration", desc: "When clinical escalation is needed, the assistant refers employees to your EAP, licensed therapist network, or crisis support resources. Escalation events are logged for HR compliance documentation.", icon: "🆘" }
];

const FAQS = [
    { q: "Can my company see what individual employees discuss in the assistant?", a: "No. All individual conversation data is strictly confidential and inaccessible to employers and HR administrators. The company dashboard shows only anonymized aggregate data: team mood trends, engagement rates, and risk indicator levels. Individual employees have full control over their data and can delete their conversation history at any time." },
    { q: "Is the assistant suitable as a replacement for professional therapy?", a: "No. The assistant provides evidence-based support tools including CBT exercises, mood tracking, and stress management resources. It is a supplement to professional mental health care, not a replacement. When clinical intervention is indicated, the assistant provides immediate referral to licensed professionals and crisis resources. It is designed to fill the gap between professional sessions and provide continuous daily support." },
    { q: "How is employee data protected and stored?", a: "All data is encrypted at rest and in transit. Individual conversation data is stored on US-based servers under SOC2-compliant data handling practices. The platform is HIPAA-aware in its data handling policies. A full data processing agreement (DPA) is available for enterprise deployments requiring compliance documentation." },
    { q: "How do you measure the impact on employee wellbeing and retention?", a: "The HR dashboard tracks team-level mood trend data, engagement rates, and burnout risk indicators over time. These are correlated with quarterly employee satisfaction surveys and HR retention data to quantify the impact on team wellbeing and turnover rates. Most clients see measurable mood trend improvements within the first 60 to 90 days of deployment." }
];

const RELATED = [
    { title: "AI Automation Services", href: "/ai-automation", desc: "Full AI automation stack for US businesses including custom agents, chatbots, and workflow tools.", icon: "🤖" },
    { title: "Marketing Consulting", href: "/marketing-consulting", desc: "Strategic growth consulting including team building, HR operations, and organizational effectiveness.", icon: "🗺️" },
    { title: "Software Development", href: "/software-development", desc: "Custom software and SaaS development for HR, operations, and employee experience platforms.", icon: "💻" }
];

export default function MentalWellnessAssistantPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-24 pb-0 px-6 max-w-5xl mx-auto">
        <ol className="flex items-center gap-2 text-xs text-slate-500">
          <li><Link href="/" className="hover:text-slate-300 transition-colors">Home</Link></li>
          <li className="text-slate-700">/</li>
          <li><Link href="/ai-automation" className="hover:text-slate-300 transition-colors">AI Automation</Link></li>
          <li className="text-slate-700">/</li>
          <li className="text-slate-400">Mental Wellness Assistant</li>
        </ol>
      </nav>

      <PageHeader
        label="Employee Wellness AI"
        title="Mental Wellness Assistant: 24/7 Confidential AI Mental Health Support for Your Team"
        subtitle="Employee burnout costs US businesses an estimated 125 to 190 billion dollars in healthcare spending annually. The Mental Wellness Assistant provides every team member with confidential, 24/7 access to AI-guided mental health support: CBT-based exercises, mood tracking, stress management techniques, and escalation to human support when professional intervention is needed. Designed for HR managers and employers who need a scalable, documented wellness benefit that demonstrably reduces burnout and improves retention."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.15)" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Mental Wellness Assistant:</strong>{" "}
              The Mental Wellness Assistant is a confidential AI wellness platform that provides employees with 24/7 access to cognitive behavioral therapy (CBT) guided exercises, mood check-ins, stress management tools, and crisis escalation protocols. Designed for US employers seeking to reduce workforce burnout rates, improve retention, and provide documented mental health support resources as part of a measurable employee benefits strategy.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Core Capabilities</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div key="CBT-Based Exercise Library" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🧠`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`CBT-Based Exercise Library`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Guided cognitive behavioral therapy exercises for managing work stress, anxiety, and burnout symptoms. Exercises are structured for 5 to 15 minute sessions employees can complete during breaks. Based on established CBT frameworks validated in clinical research.`}</p>
        </div>
        <div key="Daily Mood Check-Ins" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Daily Mood Check-Ins`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Employees complete a daily 60-second mood check-in that tracks stress, energy, and wellbeing indicators over time. Trends are surfaced to the individual in weekly personal reports. Aggregate anonymized team data is available to HR.`}</p>
        </div>
        <div key="Burnout Risk Indicators" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🔔`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Burnout Risk Indicators`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`The assistant identifies patterns that precede burnout: declining mood trends over 2 to 3 weeks, reduced check-in completion rates, and elevated stress indicators. HR receives an anonymized alert when team burnout risk crosses a threshold.`}</p>
        </div>
        <div key="Full Confidentiality Guarantee" className="p-5 rounded-2xl border" style={{ background: "#22c55e10", borderColor: "#22c55e25" }}>
          <div className="text-2xl mb-3">{String.raw`🔒`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Full Confidentiality Guarantee`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`All individual conversation data is confidential and never shared with employers. Only anonymized and aggregated team-level wellbeing scores are visible to HR administrators. Employees control what they share and can opt out at any time.`}</p>
        </div>
        <div key="Human Escalation Protocol" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`🆘`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Human Escalation Protocol`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`When the assistant detects signals indicating crisis or the need for professional clinical support, it provides immediate referral to licensed therapists, crisis lines, and the employee assistance program (EAP) if one is in place.`}</p>
        </div>
        <div key="HR Dashboard and Reporting" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`📋`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`HR Dashboard and Reporting`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`HR administrators receive a monthly team wellbeing dashboard: aggregate mood trends, engagement rates, exercise completion, and anonymized burnout risk indicators. Documentation suitable for employee benefits reporting and HR compliance purposes.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Industry Use Cases</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="HR Managers at US Mid-Market Companies" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#f59e0b" }}>{String.raw`HR Managers at US Mid-Market Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Employee turnover is increasing. Exit interview data points to burnout and stress as primary drivers, but the company lacks a scalable, affordable mental health support program.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Deploy the assistant as an always-available support channel between EAP sessions. Demonstrate measurable investment in employee wellbeing. Track engagement and mood trends to identify at-risk employees before they resign.`}</p>
        </div>
        <div key="Remote and Distributed Teams" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#3b82f6" }}>{String.raw`Remote and Distributed Teams`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Remote employees report higher isolation and burnout rates than in-office staff. Existing wellness programs require in-person participation or scheduled appointments that remote workers do not use.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`24/7 access from any device means remote employees engage with wellness support during their working day, not in scheduled wellness hours. Mood tracking captures stress patterns across time zones.`}</p>
        </div>
        <div key="High-Growth Startups" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#8b5cf6" }}>{String.raw`High-Growth Startups`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Startup culture creates intense pressure that leads to high burnout rates among early employees. Founders cannot offer comprehensive benefits packages but need to demonstrate care for team wellbeing.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Provide a low-cost, credible wellness benefit that requires no HR infrastructure to manage. Signal commitment to team mental health during a high-pressure growth period.`}</p>
        </div>
        <div key="Healthcare and Social Services Organizations" className="p-6 rounded-2xl border" style={{ background: "#22c55e08", borderColor: "#22c55e20" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#22c55e" }}>{String.raw`Healthcare and Social Services Organizations`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Frontline healthcare workers and social service staff experience disproportionately high burnout and secondary trauma rates with limited access to timely support.`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`24/7 access to CBT exercises and stress management tools during shift breaks. Confidential check-ins enable healthcare workers to process emotional load without stigma or scheduling barriers.`}</p>
        </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="How We Deploy" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Track</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Employee engagement rate with wellness platform (target: 60 percent or above)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Monthly mood check-in completion rate`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Burnout risk indicator trend over 90 days`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Employee retention rate change year over year`}</li>
          <li className="text-slate-300 text-sm">{String.raw`HR escalation response time (target: under 24 hours)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Employee satisfaction score on benefits package (quarterly survey)`}</li>
            </ul>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <FAQSection faqs={FAQS} />

      {/* Key Takeaways */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Key Takeaways</h2>
          <ul className="space-y-4">
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Provides 24/7 confidential access to CBT-based mental health support for every team member`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Individual conversation data is never shared with employers or HR; only anonymized aggregate trends are visible`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Burnout risk indicators alert HR to team-level stress patterns before they lead to resignations`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Human escalation protocol refers employees to licensed professionals when clinical support is needed`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`HR dashboard provides monthly wellbeing reporting suitable for benefits documentation and compliance`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Deploys in under 2 hours with no ongoing HR management required after initial employee onboarding`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Start a 30-Day Team Wellness Trial"
        subtitle="Deploy the Mental Wellness Assistant for your team for 30 days. Measure engagement rates, mood trends, and burnout indicators before committing to a full rollout."
        formType="get-started"
      />
    </>
  );
}
