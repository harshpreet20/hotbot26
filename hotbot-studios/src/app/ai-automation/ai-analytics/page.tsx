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
  title: "AI Analytics & Business Intelligence for US Companies — Predictive Dashboards | HotBot Studios",
  description: "HotBot Studios builds AI-powered BI dashboards, predictive forecasting models, and intelligent data pipelines for US businesses. GA4, Looker Studio, BigQuery. Book a free data audit.",
  keywords: [
    "AI analytics for business USA",
    "business intelligence dashboard USA",
    "predictive analytics company USA",
    "AI forecasting models",
    "Looker Studio BI dashboard",
    "BigQuery analytics",
    "GA4 AI analytics",
    "real-time business intelligence",
    "AI data pipeline USA",
    "custom BI dashboard development"
  ],
  openGraph: {
    title: "AI Analytics & Business Intelligence for US Companies — Predictive Dashboards | HotBot Studios",
    description: "HotBot Studios builds AI-powered BI dashboards, predictive forecasting models, and intelligent data pipelines for US businesses. GA4, Looker Studio, BigQuery. Book a free data audit.",
    url: "https://hotbotstudios.com/ai-automation/ai-analytics",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "AI Analytics & BI — Turn Your Data Into Decisions That Drive Revenue" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Analytics & Business Intelligence for US Companies — Predictive Dashboards | HotBot Studios",
    description: "HotBot Studios builds AI-powered BI dashboards, predictive forecasting models, and intelligent data pipelines for US businesses. GA4, Looker Studio, BigQuery. Book a free data audit.",
  },
  alternates: { canonical: "https://hotbotstudios.com/ai-automation/ai-analytics" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AI Analytics \u0026 BI — Turn Your Data Into Decisions That Drive Revenue",
  "description": "HotBot Studios builds AI-powered BI dashboards, predictive forecasting models, and intelligent data pipelines for US businesses. GA4, Looker Studio, BigQuery. Book a free data audit.",
  "provider": {
    "@type": "Organization",
    "name": "HotBot Studios",
    "url": "https://hotbotstudios.com"
  },
  "serviceType": "AI Analytics",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://hotbotstudios.com/ai-automation/ai-analytics"
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
      "name": "AI Analytics \u0026 Business Intelligence",
      "item": "https://hotbotstudios.com/ai-automation/ai-analytics"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do you work with our existing BI tools like Tableau or Power BI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We can build on top of your existing tools (Tableau, Power BI, Looker, Looker Studio) or recommend the right platform based on your team's needs, data volumes, and budget. We're tool-agnostic — the best solution is always the one your team will actually use."
      }
    },
    {
      "@type": "Question",
      "name": "Our data is a mess — can you still help?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Data quality issues are the norm, not the exception. Our process always starts with a data audit and pipeline engineering phase specifically designed to clean, standardise, and de-duplicate your data before it hits any dashboard or model."
      }
    },
    {
      "@type": "Question",
      "name": "What data sources can you integrate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We have pre-built connectors for Google Analytics 4, Google Ads, Meta Ads, HubSpot, Salesforce, Shopify, Stripe, QuickBooks, Klaviyo, Airtable, PostgreSQL, MySQL, and most major SaaS platforms. Custom API integrations are available for any other source."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate are your forecasting models?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Accuracy depends on data quality and volume — typically we achieve 85–95% accuracy (measured by MAPE) for 30-day revenue forecasts when built on 12+ months of clean historical data. We report forecast accuracy transparently and continuously refine models."
      }
    }
  ]
};

const STATS = [
    { value: 87, suffix: "%", label: "of data-driven companies outperform their peers (McKinsey Global Institute)", color: "#3b82f6" },
    { value: 4, suffix: "×", label: "faster decision-making when executives have real-time data vs. weekly reports", color: "#8b5cf6" },
    { value: 30, suffix: "%", label: "average revenue improvement from acting on predictive churn signals (Bain & Company)", color: "#06b6d4" },
    { value: 6, suffix: "wk", label: "average time from data audit to live unified BI dashboard", color: "#f59e0b" }
];

const PROCESS = [
    { n: 1, title: "Data Audit & Architecture Design", desc: "We audit your current data sources, quality issues, and reporting gaps — then design the warehouse architecture, dashboard structure, and model requirements.", icon: "🔭" },
    { n: 2, title: "Pipeline Engineering", desc: "We build ETL/ELT pipelines from every data source into your data warehouse (BigQuery or Snowflake), including data cleaning, deduplication, and schema standardisation.", icon: "🏗️" },
    { n: 3, title: "Dashboard & Model Build", desc: "We build your dashboards, predictive models, and anomaly detection — with visualisations optimised for different audiences (executives, marketers, operators).", icon: "📊" },
    { n: 4, title: "Training, Handover & Ongoing Support", desc: "We train your team to use and interpret dashboards, document every data model, and provide ongoing support for new data sources and business questions.", icon: "🎓" }
];

const FAQS = [
    { q: "Do you work with our existing BI tools like Tableau or Power BI?", a: "Yes. We can build on top of your existing tools (Tableau, Power BI, Looker, Looker Studio) or recommend the right platform based on your team's needs, data volumes, and budget. We're tool-agnostic — the best solution is always the one your team will actually use." },
    { q: "Our data is a mess — can you still help?", a: "Data quality issues are the norm, not the exception. Our process always starts with a data audit and pipeline engineering phase specifically designed to clean, standardise, and de-duplicate your data before it hits any dashboard or model." },
    { q: "What data sources can you integrate?", a: "We have pre-built connectors for Google Analytics 4, Google Ads, Meta Ads, HubSpot, Salesforce, Shopify, Stripe, QuickBooks, Klaviyo, Airtable, PostgreSQL, MySQL, and most major SaaS platforms. Custom API integrations are available for any other source." },
    { q: "How accurate are your forecasting models?", a: "Accuracy depends on data quality and volume — typically we achieve 85–95% accuracy (measured by MAPE) for 30-day revenue forecasts when built on 12+ months of clean historical data. We report forecast accuracy transparently and continuously refine models." }
];

const RELATED = [
    { title: "Custom AI Agents", href: "/ai-automation/custom-ai-agents", desc: "Autonomous agents that act on your analytics insights — rebalancing budgets, flagging risks, and updating records automatically.", icon: "🤖" },
    { title: "n8n Workflow Automation", href: "/ai-automation/n8n-workflow-automation", desc: "Automate the actions that follow your analytics insights — alert routing, report distribution, and data syncing.", icon: "⚙️" },
    { title: "SEO & Content Marketing", href: "/marketing-services/seo", desc: "Data-driven SEO strategy backed by the same analytics rigor applied to your paid channels.", icon: "🔍" }
];

export default function AiAnalyticsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
          <li className="text-slate-400">AI Analytics & Business Intelligence</li>
        </ol>
      </nav>

      <PageHeader
        label="AI Analytics"
        title="AI Analytics & BI — Turn Your Data Into Decisions That Drive Revenue"
        subtitle="Intelligent data pipelines, predictive forecasting, and real-time dashboards that give you the insight to act before your competitors see the opportunity."
      />

      {/* AEO Definition Block */}
      <Reveal>
        <section className="relative z-10 py-8 px-6 max-w-3xl mx-auto">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: "#3b82f608", borderColor: "#3b82f620" }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">AI-Powered Business Intelligence:</strong>{" "}
              AI-powered business intelligence combines traditional data warehousing and dashboarding with machine learning models and large language models to do things conventional BI cannot: predict future outcomes, identify anomalies automatically, answer natural-language data questions, and surface insights proactively rather than waiting for a human to run a query.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <ServiceStats stats={STATS} title="By the Numbers" />

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">What We Deliver</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div key="Real-Time Executive Dashboards" className="p-5 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f625" }}>
          <div className="text-2xl mb-3">{String.raw`📊`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Real-Time Executive Dashboards`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Unified dashboards in Looker Studio, Tableau, or custom React apps — pulling from GA4, your CRM, ad platforms, and databases into a single source of truth, updated in real time.`}</p>
        </div>
        <div key="Predictive Forecasting Models" className="p-5 rounded-2xl border" style={{ background: "#8b5cf610", borderColor: "#8b5cf625" }}>
          <div className="text-2xl mb-3">{String.raw`🔮`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Predictive Forecasting Models`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`ML models that forecast revenue, churn, demand, and campaign performance 30–90 days ahead — built on your own historical data and updated automatically as new data arrives.`}</p>
        </div>
        <div key="Anomaly Detection & Alerts" className="p-5 rounded-2xl border" style={{ background: "#06b6d410", borderColor: "#06b6d425" }}>
          <div className="text-2xl mb-3">{String.raw`🚨`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Anomaly Detection & Alerts`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`AI monitors your KPIs continuously and alerts you the moment something unexpected happens — a traffic spike, a conversion rate drop, or a revenue anomaly — before it compounds.`}</p>
        </div>
        <div key="Natural Language Data Queries" className="p-5 rounded-2xl border" style={{ background: "#10b98110", borderColor: "#10b98125" }}>
          <div className="text-2xl mb-3">{String.raw`💬`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Natural Language Data Queries`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Ask your data questions in plain English: 'What drove the revenue increase in Q3?' or 'Which marketing channel has the highest LTV customers?' — powered by GPT-4o data analyst agents.`}</p>
        </div>
        <div key="Data Pipeline Engineering" className="p-5 rounded-2xl border" style={{ background: "#f59e0b10", borderColor: "#f59e0b25" }}>
          <div className="text-2xl mb-3">{String.raw`🏗️`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Data Pipeline Engineering`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Clean, reliable data pipelines from every source (ad platforms, CRM, payment processors, databases) into BigQuery or Snowflake — so your dashboards are built on accurate, fresh data.`}</p>
        </div>
        <div key="Cross-Channel Attribution" className="p-5 rounded-2xl border" style={{ background: "#ec489910", borderColor: "#ec489925" }}>
          <div className="text-2xl mb-3">{String.raw`🔗`}</div>
          <h3 className="font-semibold text-white text-sm mb-2">{String.raw`Cross-Channel Attribution`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">{String.raw`Multi-touch attribution models that correctly assign revenue credit across Google Ads, Meta, email, SEO, and direct — giving you the true ROI of every channel.`}</p>
        </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Who This Is For</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div key="E-Commerce & DTC Brands" className="p-6 rounded-2xl border" style={{ background: "#3b82f608", borderColor: "#3b82f620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#3b82f6" }}>{String.raw`E-Commerce & DTC Brands`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Revenue data in Shopify, ad data in Meta/Google, email data in Klaviyo — no unified view and no ability to forecast next month's revenue confidently`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Unified BigQuery data warehouse feeding a real-time Looker Studio dashboard with revenue forecasts and channel attribution — board-ready in 30 seconds`}</p>
        </div>
        <div key="SaaS Companies" className="p-6 rounded-2xl border" style={{ background: "#8b5cf608", borderColor: "#8b5cf620" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#8b5cf6" }}>{String.raw`SaaS Companies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Churn is rising but nobody can identify which cohorts are at risk until it's too late to act`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`ML churn prediction model scoring every customer weekly — at-risk accounts flagged in HubSpot for proactive success outreach 60 days before churn`}</p>
        </div>
        <div key="Retail & Franchise Operators" className="p-6 rounded-2xl border" style={{ background: "#06b6d408", borderColor: "#06b6d420" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#06b6d4" }}>{String.raw`Retail & Franchise Operators`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Inventory and sales data across 20+ locations not available in real time, requiring weekly manual reports`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Real-time multi-location dashboard with anomaly detection — stock-out alerts, underperforming SKU flags, and location comparison scorecards`}</p>
        </div>
        <div key="Marketing Agencies" className="p-6 rounded-2xl border" style={{ background: "#f59e0b08", borderColor: "#f59e0b20" }}>
          <h3 className="font-semibold mb-2 text-sm" style={{ color: "#f59e0b" }}>{String.raw`Marketing Agencies`}</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3"><strong className="text-slate-300">Challenge:</strong> {String.raw`Client reporting taking 4–6 hours per client per week, pulling data manually from 5+ platforms`}</p>
          <p className="text-slate-400 text-xs leading-relaxed"><strong className="text-slate-300">Solution:</strong> {String.raw`Automated client BI dashboards with white-label branding — clients access real-time performance data self-serve, agencies focus on strategy`}</p>
        </div>
        </div>
      </section>

      {/* Process */}
      <ProcessSteps steps={PROCESS} title="Our Engagement Process" />

      {/* KPIs */}
      <Reveal>
        <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">KPIs We Report On</h2>
          <div
            className="p-8 rounded-2xl border"
            style={{ background: "#3b82f605", borderColor: "#3b82f618" }}
          >
            <ul className="space-y-3 list-none">
          <li className="text-slate-300 text-sm">{String.raw`Dashboard data freshness (time lag from source to dashboard)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Forecast accuracy (MAPE % for revenue and demand models)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Anomaly detection response time (time from anomaly to alert)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Data quality score (% of records meeting completeness and accuracy standards)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Report generation time (hours saved per week on manual reporting)`}</li>
          <li className="text-slate-300 text-sm">{String.raw`Decision velocity (time from question to data-backed answer)`}</li>
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
            <span>{String.raw`A single source of truth — one dashboard everyone trusts — eliminates the endless debates about whose numbers are right in leadership meetings`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Predictive models that act on leading indicators (early churn signals, demand patterns) always outperform reactive reporting on lagging indicators`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Data quality engineering is 70% of the work in a successful BI project — investing in clean pipelines is what makes dashboards trustworthy`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Natural language querying (ask your data a question in English) democratises data access for non-technical leaders — no SQL required`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Anomaly detection that proactively alerts your team is more valuable than any static dashboard — you learn about problems before they compound`}</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300 text-sm">
            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{String.raw`Real-time attribution across channels is the foundation of smart budget allocation — without it, you are making million-dollar decisions with incomplete information`}</span>
          </li>
          </ul>
        </section>
      </Reveal>

      {/* Related Services */}
      <RelatedServices services={RELATED} />

      {/* CTA */}
      <CTASection
        title="Stop Guessing — Start Knowing"
        subtitle="Book a free data audit. We'll identify your biggest data gaps, the quickest wins, and show you what a unified dashboard would look like for your business."
        formType="contact"
      />
    </>
  );
}
