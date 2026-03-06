"use client";
import { PolicyTabs } from "@/components/shared/PolicyTabs";

function Section({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-bold text-white mt-8 mb-3 border-l-4 border-blue-500 pl-4">
      {title}
    </h2>
  );
}
function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 leading-relaxed mb-4 text-sm">{children}</p>;
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 px-4 py-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
      {children}
    </div>
  );
}

const IndiaPrivacy = (
  <div>
    <Note>
      Governed by the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000. HotBot Studios LLP is the Data Fiduciary.
    </Note>

    <Section title="1. Data Fiduciary" />
    <Body>
      HotBot Studios LLP, incorporated and registered in New Delhi, India, is the Data Fiduciary responsible for the processing of your personal data. All global operations, brand identities, and trade names used internationally are brand names of HotBot Studios LLP. The registered entity remains HotBot Studios LLP for all legal purposes.
    </Body>

    <Section title="2. Data We Collect" />
    <Body>
      We collect personal data you voluntarily provide including: full name, email address, phone number, company name, project details, and any messages submitted via our forms, chatbot, or email. We also automatically collect browser type, IP address, pages visited, session duration, and device identifiers via cookies and analytics tools.
    </Body>

    <Section title="3. Purpose of Processing" />
    <Body>
      Your data is processed for: responding to service enquiries; delivery of contracted services; sending marketing and promotional communications; business analytics and improvement; fraud prevention; and compliance with applicable law. Processing is carried out under the lawful grounds of consent, contract performance, and legitimate business use.
    </Body>

    <Section title="4. Data Sharing &amp; Disclosure — Notice Under DPDP Act 2023" />
    <Body>
      HotBot Studios LLP may share your personal data — without seeking separate individual consent — with the following categories of recipients, on the basis of legitimate business use as recognised under Section 7 of the Digital Personal Data Protection Act, 2023. This Policy constitutes valid and sufficient notice of such sharing:
    </Body>
    <ul className="list-disc list-inside text-slate-400 text-sm mb-4 space-y-1 pl-4">
      <li>Third-party service providers (CRM, cloud, email, analytics platforms) under Data Processing Agreements.</li>
      <li>Business partners, vendors, and affiliated entities engaged for service delivery.</li>
      <li>Brand entities and commercial partners operating under the HotBot Studios trade name globally.</li>
      <li>Marketing and advertising platforms for targeted outreach related to our services.</li>
      <li>Regulators, courts, or law-enforcement agencies when required by law.</li>
    </ul>
    <Note>
      ⚖️ Legal basis: Under the DPDP Act 2023, data may be processed and shared for "legitimate uses" without separate consent when adequate notice is provided. This Policy constitutes that notice. Data is not sold. Sharing is limited to the purposes described herein.
    </Note>

    <Section title="5. Cookies &amp; Tracking" />
    <Body>
      We use cookies, pixels, and similar tracking technologies. By continuing to use our website, you consent to such tracking. You may disable cookies via your browser settings, though some features may not function correctly.
    </Body>

    <Section title="6. Data Retention" />
    <Body>
      Personal data is retained for as long as necessary to fulfil the stated purposes or as required by applicable law. Contact data is typically retained for 3 years post last interaction. Financial records are retained for 7 years per applicable Indian accounting law.
    </Body>

    <Section title="7. Data Principal Rights" />
    <Body>
      As a Data Principal under the DPDP Act, you have the right to: access a summary of your personal data; correct inaccurate data; erase data (subject to legal retention obligations); and nominate a person to exercise rights on your behalf. To exercise these rights, contact: <strong className="text-white">dpo@hotbotstudios.com</strong>
    </Body>

    <Section title="8. Grievance Redressal" />
    <Body>
      Grievances must be submitted in writing to our Grievance Officer: <strong className="text-white">HotBot Studios LLP, New Delhi, India. Email: grievance@hotbotstudios.com</strong>. We will acknowledge within 72 hours and resolve within 30 days. Unresolved complaints may be escalated to the Data Protection Board of India.
    </Body>

    <Section title="9. Cross-Border Transfers" />
    <Body>
      Data may be transferred to and processed in countries outside India (including the USA and UK) for operational purposes. Such transfers are carried out in compliance with applicable Indian data protection law and with appropriate contractual safeguards in place.
    </Body>

    <Section title="10. Changes to This Policy" />
    <Body>
      We may update this Policy periodically. Continued use of our services after changes constitutes acceptance. Last updated: March 2026.
    </Body>
  </div>
);

const USAPrivacy = (
  <div>
    <Note>
      Governed by applicable US federal and state privacy laws including the California Consumer Privacy Act (CCPA), as amended by CPRA, and other applicable state privacy regulations. HotBot Studios LLP operates in the USA under its global brand name.
    </Note>

    <Section title="1. Business Identity" />
    <Body>
      HotBot Studios LLP (registered in New Delhi, India) operates in the United States under the HotBot Studios brand. For US regulatory purposes, HotBot Studios LLP is the business responsible for this Privacy Policy.
    </Body>

    <Section title="2. Categories of Personal Information Collected" />
    <Body>
      We collect the following categories: Identifiers (name, email, phone, IP address); Commercial information (service enquiries, project scope); Internet or network activity (pages viewed, session data); Professional or employment-related information (company name, role); Inferences drawn from the above for service personalisation.
    </Body>

    <Section title="3. Purposes of Collection" />
    <Body>
      Personal information is used for: providing and improving our services; responding to enquiries and fulfilling contracts; marketing and promotional outreach; analytics and business intelligence; fraud prevention; and legal compliance.
    </Body>

    <Section title="4. Sharing of Personal Information — Business Purposes" />
    <Body>
      We share personal information with third parties for legitimate business purposes as defined under CCPA and applicable state law. Such sharing does not constitute a "sale" of personal information. Recipients include:
    </Body>
    <ul className="list-disc list-inside text-slate-400 text-sm mb-4 space-y-1 pl-4">
      <li>Service providers (analytics, cloud, CRM, email platforms) under service provider agreements.</li>
      <li>Business partners and affiliated entities for service delivery and marketing.</li>
      <li>Global brand entities operating under the HotBot Studios name.</li>
      <li>Advertising networks for interest-based advertising related to our services.</li>
      <li>Law enforcement or government agencies when required by law.</li>
    </ul>
    <Note>
      ⚖️ Under CCPA, sharing with service providers and business partners for defined "business purposes" does not constitute a "sale" and does not require opt-out. This Policy constitutes the required disclosure. We do not sell personal information. You have the right to opt-out of any future sale by contacting us.
    </Note>

    <Section title="5. CCPA / CPRA Rights" />
    <Body>
      California residents have the right to: know what personal information is collected, used, disclosed; request deletion of personal information; correct inaccurate personal information; opt-out of the sale or sharing of personal information; limit use of sensitive personal information; and non-discrimination for exercising these rights. Submit requests to: <strong className="text-white">privacy@hotbotstudios.com</strong>
    </Body>

    <Section title="6. Do Not Sell or Share My Personal Information" />
    <Body>
      We do not sell personal information. We share it only for business purposes as described above. To opt-out of sharing for cross-context behavioural advertising, contact us at privacy@hotbotstudios.com.
    </Body>

    <Section title="7. Cookies &amp; Tracking Technologies" />
    <Body>
      We use cookies, web beacons, and similar technologies for analytics, session management, and marketing. You may opt out via your browser settings or global privacy controls (GPC signals are honoured for California residents).
    </Body>

    <Section title="8. Data Retention" />
    <Body>
      We retain personal information for as long as necessary for the purposes collected or as required by law. Typically, enquiry data is retained for 3 years; financial records for 7 years.
    </Body>

    <Section title="9. Contact" />
    <Body>
      For privacy requests or questions: <strong className="text-white">privacy@hotbotstudios.com</strong> | HotBot Studios LLP (US Operations), New Delhi, India.
    </Body>

    <Section title="10. Updates" />
    <Body>
      This Policy may be updated periodically. Continued use constitutes acceptance. Last updated: March 2026.
    </Body>
  </div>
);

const UKPrivacy = (
  <div>
    <Note>
      Governed by the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. HotBot Studios LLP acts as the Data Controller for personal data processed in connection with UK operations.
    </Note>

    <Section title="1. Data Controller" />
    <Body>
      HotBot Studios LLP, New Delhi, India, is the Data Controller. We operate in the UK under the HotBot Studios brand name. For UK data protection purposes, we may appoint a UK Representative as required by UK GDPR Article 27. Contact: <strong className="text-white">privacy@hotbotstudios.com</strong>
    </Body>

    <Section title="2. Personal Data We Collect" />
    <Body>
      We collect: contact details (name, email, phone); company and professional information; website usage data (IP address, browser, pages visited, session data); and project-related information you choose to share.
    </Body>

    <Section title="3. Lawful Basis for Processing" />
    <Body>
      We process personal data under the following lawful bases: Contract performance (Art. 6(1)(b)) — when providing services you have requested; Legitimate Interests (Art. 6(1)(f)) — for business analytics, marketing to existing contacts, data sharing with partners; Consent (Art. 6(1)(a)) — for newsletter subscriptions and cookie placement; Legal obligation (Art. 6(1)(c)) — for regulatory compliance.
    </Body>

    <Section title="4. Data Sharing — Legitimate Interest Basis" />
    <Body>
      Under our Legitimate Interest basis, we share personal data — without obtaining separate consent for each transfer — with the following recipients. A Legitimate Interest Assessment (LIA) has been conducted confirming these transfers do not unduly override individual rights:
    </Body>
    <ul className="list-disc list-inside text-slate-400 text-sm mb-4 space-y-1 pl-4">
      <li>Third-party service providers (cloud hosting, CRM, analytics, email) under Data Processing Agreements (DPAs).</li>
      <li>Business partners, vendors, and affiliates engaged in service delivery.</li>
      <li>Global brand entities operating under the HotBot Studios trade name.</li>
      <li>Marketing and advertising platforms for business-to-business outreach.</li>
      <li>Regulators, courts, or law enforcement when required by law.</li>
    </ul>
    <Note>
      ⚖️ Legal basis: UK GDPR Art. 6(1)(f) — Legitimate Interests. You have the right to object to processing on this basis. Objections will be considered; we will cease processing unless we demonstrate compelling legitimate grounds. Contact: privacy@hotbotstudios.com
    </Note>

    <Section title="5. International Transfers" />
    <Body>
      Your data may be transferred to and processed in India (our headquarters) and other countries outside the UK. Such transfers are made under Standard Contractual Clauses (SCCs) or other appropriate safeguards as recognised under UK GDPR. India does not have an adequacy decision from the UK; SCCs are used to protect your data.
    </Body>

    <Section title="6. Your UK GDPR Rights" />
    <Body>
      You have the right to: access your personal data; rectify inaccurate data; erasure ("right to be forgotten") in certain circumstances; restrict processing; data portability; object to processing based on legitimate interests or for direct marketing; and not be subject to solely automated decision-making. Submit requests to <strong className="text-white">privacy@hotbotstudios.com</strong>. We will respond within 30 days. You may also lodge a complaint with the Information Commissioner's Office (ICO): <strong className="text-white">ico.org.uk</strong>.
    </Body>

    <Section title="7. Cookies" />
    <Body>
      We use cookies that require your consent under UK PECR. A cookie consent banner is presented on first visit. You may withdraw consent or manage cookies at any time via browser settings.
    </Body>

    <Section title="8. Retention" />
    <Body>
      Personal data is retained for as long as necessary for the stated purposes or required by UK law. Enquiry data: 3 years. Financial records: 6 years (per HMRC requirements).
    </Body>

    <Section title="9. Updates" />
    <Body>
      This Policy may be updated. Material changes will be notified. Last updated: March 2026.
    </Body>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="relative z-10 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
        <p className="text-slate-400 text-sm">
          Select your jurisdiction below to view the applicable Privacy Policy.
          <br />All policies are issued by <strong className="text-white">HotBot Studios LLP</strong>, New Delhi, India.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <PolicyTabs india={IndiaPrivacy} usa={USAPrivacy} uk={UKPrivacy} />
      </div>
    </div>
  );
}
