import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Enterprise Software Development USA — Custom CRM, ERP & Portals | HotBot Studios",
  description:
    "HotBot Studios builds custom enterprise software for US organisations — CRM systems, ERP integrations, internal portals, and compliance-grade workflow tools. SSO, SAML, and SOC 2 alignment included. Free enterprise scoping call.",
  keywords: [
    "enterprise software development USA",
    "custom CRM development USA",
    "ERP integration development USA",
    "enterprise portal development USA",
    "SSO SAML enterprise software USA",
    "enterprise workflow software USA",
    "custom enterprise application USA",
    "internal tool development USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/software-development/enterprise-software" },
  openGraph: {
    title: "Enterprise Software Development USA — Custom CRM, ERP & Portals | HotBot Studios",
    description: "Custom enterprise software for US organisations — CRM systems, ERP integrations, internal portals with SSO/SAML and compliance-grade security.",
    url: "https://hotbotstudios.com/software-development/enterprise-software",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Enterprise Software Development",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Enterprise Application Development",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Custom enterprise software development for US organisations — CRM systems, ERP integrations, internal portals, and compliance-grade workflow automation with SSO/SAML and role-based access control.",
  url: "https://hotbotstudios.com/software-development/enterprise-software",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Software Development", item: "https://hotbotstudios.com/software-development" },
    { "@type": "ListItem", position: 3, name: "Enterprise Systems & Portals", item: "https://hotbotstudios.com/software-development/enterprise-software" },
  ],
};

const CONTENT = [
  {
    heading: "When Enterprise Teams Outgrow Commercial SaaS Tools",
    body: "Enterprise organisations reach a point where the commercial SaaS tools they adopted during growth become operational constraints. Salesforce becomes a system your team works around rather than with — because your sales process does not map to Salesforce's data model. Your ERP cannot surface the operational data your management team needs without a week's worth of manual extraction and formatting. Your client-facing portal is a collection of email threads and shared drives because no off-the-shelf portal product supports your specific workflow. At this point, the build-vs-buy calculation has shifted: a custom-built system designed around your exact processes, your exact user roles, and your exact reporting requirements will reduce operational friction, reduce errors, and reduce the cost of the workarounds your team performs every day. HotBot Studios specialises in building the enterprise software that replaces the patchwork of SaaS tools and manual processes that slow down US organisations at scale.",
    color: "#3b82f6",
  },
  {
    heading: "CRM, ERP, and Portal Development with Enterprise-Grade Security",
    body: "Custom CRM development for enterprise clients means building around your specific sales methodology, pipeline stages, custom fields, approval workflows, and reporting requirements — not adapting your process to Salesforce's object model. Custom ERP integration means building the data pipelines and UI layers that surface your ERP data (inventory, production, procurement, financials) to the teams that need it in the format they can act on, without requiring an ERP consultant to run every report. Custom portals — client portals, vendor portals, partner portals, employee self-service portals — give your external stakeholders a branded, permission-controlled interface to the data and workflows they need without the overhead of a human intermediary. Every enterprise system we build includes role-based access control (RBAC) with granular permissions, full audit logging for every data change, and encryption at rest and in transit for all sensitive data.",
    color: "#8b5cf6",
  },
  {
    heading: "SSO, SAML, and Compliance: Meeting Your Organisation's Security Requirements",
    body: "Enterprise software deployments must integrate with your organisation's identity provider — whether that is Okta, Microsoft Azure AD, Google Workspace, or a custom SAML IdP — so that employees access the system with their existing corporate credentials and IT retains centralised control over access provisioning and deprovisioning. HotBot Studios implements SAML 2.0 and OIDC/OAuth 2.0 SSO integrations as a standard component of every enterprise engagement, because the alternative — managing a separate credential system alongside your corporate IdP — is both an operational burden and a security risk. For organisations with SOC 2, HIPAA, or FedRAMP compliance requirements, we align our development practices and infrastructure configuration to those frameworks from the start, reducing the gap between your software deployment and your compliance audit.",
    color: "#22c55e",
  },
  {
    heading: "Legacy System Integration, Data Migration, and Change Management",
    body: "Enterprise software projects almost always involve legacy systems that cannot simply be switched off. HotBot Studios has experience integrating with and migrating data from legacy applications built on Oracle, SAP, Microsoft Dynamics, IBM AS/400, and bespoke in-house systems built on technologies that predate modern web standards. Our approach to legacy integration is pragmatic: we build an API adapter layer that translates between the legacy system's data format and the new application's data model, allowing both systems to run in parallel during the transition period. Data migration projects include a discovery phase to map the source schema, a transformation and validation pipeline that flags data quality issues before migration, a dry-run migration in a staging environment, and a production cutover plan with a rollback procedure. We also support the change management process with documentation, administrator training, and a hypercare support period after go-live.",
    color: "#ec4899",
  },
];

export default function EnterpriseSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Software Development", href: "/software-development" }, { label: "Enterprise Software" }]} />

      <PageHeader
        label="Enterprise Systems & Portals"
        title="Custom Software Built for How Your Organisation Actually Works"
        subtitle="Custom CRM systems, ERP integrations, internal portals, and enterprise workflow tools for US organisations — SSO/SAML, compliance-grade security, and legacy system integration included."
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
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Enterprise Software Consultation</h2>
            <p className="text-slate-400">Describe the system you need to build or replace. We will respond with an honest assessment and a scoping proposal within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="software-enterprise"
            accentColor="#3b82f6"
            title="Start Your Enterprise Software Project"
            subtitle="No obligation. Share your current systems, your pain points, and your compliance requirements and we will scope the solution."
          />
        </Reveal>
      </section>
    </>
  );
}
