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

const IndiaTerms = (
  <div>
    <Note>
      These Terms are governed by the Indian Contract Act, 1872; the Information Technology Act, 2000; the Consumer Protection Act, 2019; and other applicable Indian law. The registered entity is HotBot Studios LLP, New Delhi, India.
    </Note>

    <Section title="1. Parties" />
    <Body>
      These Terms constitute a legally binding agreement between HotBot Studios LLP ("Company", "we", "us") and the client or user ("Client", "you"). By engaging our services or using our website, you agree to be bound by these Terms in full.
    </Body>

    <Section title="2. Brand Identity &amp; Legal Entity" />
    <Body>
      HotBot Studios LLP is the sole registered legal entity. Any other trade names, brand identities, or business names used by us domestically or internationally are brand names operated under HotBot Studios LLP. The official company name, registration, and logo of HotBot Studios LLP are attached to all legal and contractual obligations.
    </Body>

    <Section title="3. Services" />
    <Body>
      We provide digital marketing, AI automation, content production, software development, public relations, UI/UX design, and business consulting. Specific deliverables and timelines are defined in individual Service Agreements or Statements of Work (SOWs) signed between the parties.
    </Body>

    <Section title="4. Payment Terms &amp; Advance" />
    <Body>
      All projects require a minimum advance payment of 25% of the total project value before work commences. The advance is non-refundable under any circumstances. Remaining payments are due per the schedule in the Service Agreement. Default in payment entitles the Company to suspend or terminate services without liability.
    </Body>
    <Note>
      💰 Advance policy: A minimum 25% advance is mandatory for all projects. Work will not commence without clearance of the advance amount. The advance is strictly non-refundable.
    </Note>

    <Section title="5. No Refund Policy" />
    <Body>
      All sales and service engagements are final. HotBot Studios LLP operates a strict no-refund policy. No refunds, credits, or returns will be issued under any circumstances, including but not limited to: dissatisfaction with output, change of business strategy, scope changes, delays attributable to the Client, or early termination.
    </Body>
    <Note>
      ⚠️ Under the Consumer Protection Act, 2019, clients retain the right to file a complaint for deficiency in service before the appropriate Consumer Disputes Redressal Forum. Our no-refund policy does not limit your statutory rights under Indian consumer law. We address all genuine service deficiencies through our internal grievance process before any forum escalation.
    </Note>

    <Section title="6. Client Responsibilities" />
    <Body>
      Clients are responsible for: providing timely, accurate information and materials; granting necessary access and credentials; reviewing and approving deliverables within agreed timelines; ensuring all materials provided are lawfully owned or licensed. Delays caused by the Client do not entitle the Client to a refund or fee reduction.
    </Body>

    <Section title="7. Intellectual Property" />
    <Body>
      Upon receipt of full and final payment, ownership of custom deliverables created specifically for the Client is transferred to the Client. The Company retains all rights to pre-existing methodologies, frameworks, tools, AI models, templates, and code libraries used in delivery. Portfolio use rights are retained by the Company unless explicitly waived in writing.
    </Body>

    <Section title="8. Confidentiality" />
    <Body>
      Both parties agree to maintain the confidentiality of all proprietary and non-public information exchanged during the engagement. This obligation survives termination for a period of 3 years.
    </Body>

    <Section title="9. Limitation of Liability" />
    <Body>
      The Company's aggregate liability shall not exceed the total fees paid for the specific service in dispute. The Company is not liable for indirect, incidental, special, or consequential damages, loss of profits, loss of data, or business interruption. Marketing results are not guaranteed.
    </Body>

    <Section title="10. Termination" />
    <Body>
      Either party may terminate a Service Agreement with 30 days' written notice. The Client remains liable for all fees for work completed or in progress up to the termination date. The advance is non-refundable regardless of termination.
    </Body>

    <Section title="11. Governing Law &amp; Dispute Resolution" />
    <Body>
      These Terms are governed by the laws of India. Any disputes shall first be attempted to be resolved through good-faith negotiation within 30 days. Unresolved disputes shall be subject to arbitration under the Arbitration and Conciliation Act, 1996, in New Delhi, India. Courts in New Delhi shall have exclusive jurisdiction for matters not subject to arbitration.
    </Body>

    <Section title="12. Contact" />
    <Body>
      Legal enquiries: <strong className="text-white">legal@hotbotstudios.com</strong> | HotBot Studios LLP, New Delhi, India.
    </Body>
  </div>
);

const USATerms = (
  <div>
    <Note>
      These Terms apply to clients and users in the United States. Governed by applicable federal law and state law. HotBot Studios LLP operates in the USA under its global brand name. For California residents, additional CCPA rights apply (see Privacy Policy).
    </Note>

    <Section title="1. Parties" />
    <Body>
      These Terms form a binding agreement between HotBot Studios LLP ("Company") and the Client ("you"). Engagement of services constitutes acceptance of these Terms.
    </Body>

    <Section title="2. Brand Identity &amp; Legal Entity" />
    <Body>
      HotBot Studios LLP (registered in New Delhi, India) operates in the United States under the HotBot Studios brand name. All trade names and brand identities used in the USA are commercial brands of HotBot Studios LLP. The official registered company name and logo of HotBot Studios LLP govern all legal relationships.
    </Body>

    <Section title="3. Services" />
    <Body>
      We provide digital marketing, AI automation, content production, software development, public relations, UI/UX design, and consulting. Service specifics are defined in individual agreements or Statements of Work.
    </Body>

    <Section title="4. Payment Terms &amp; Advance" />
    <Body>
      All engagements require a minimum non-refundable advance of 25% of the total project value before work commences. Remaining balances are due per the agreed payment schedule. Invoices not paid within 14 days are subject to a late fee of 1.5% per month or the maximum permitted by applicable state law.
    </Body>
    <Note>
      💰 Minimum 25% advance required on all projects. Non-refundable under all circumstances.
    </Note>

    <Section title="5. No Refund Policy" />
    <Body>
      All service engagements are final. HotBot Studios LLP maintains an absolute no-refund policy. No refund, credit, chargeback accommodation, or partial return of fees will be provided under any circumstance, including: dissatisfaction, strategy changes, project cancellation by the Client, or scope modifications.
    </Body>
    <Note>
      ⚠️ This no-refund policy is clearly disclosed prior to engagement and is legally enforceable under applicable US law. Initiating a chargeback contrary to these Terms constitutes a breach of contract. We reserve the right to pursue recovery of disputed amounts plus legal fees.
    </Note>

    <Section title="6. Client Responsibilities" />
    <Body>
      Clients are responsible for providing accurate information, timely approvals, necessary access, and payment as agreed. You warrant that all materials provided to us are lawfully owned or licensed.
    </Body>

    <Section title="7. Intellectual Property" />
    <Body>
      Upon full payment, Clients receive ownership of custom deliverables. The Company retains all rights to pre-existing tools, frameworks, AI models, and methodologies. Portfolio and case study rights are retained by the Company unless waived in writing.
    </Body>

    <Section title="8. Confidentiality" />
    <Body>
      Both parties agree to keep confidential all proprietary information shared during the engagement for a period of 3 years post-termination.
    </Body>

    <Section title="9. Limitation of Liability" />
    <Body>
      Company liability is limited to fees paid for the specific service at issue. We are not liable for indirect, consequential, punitive, or special damages. Marketing results and business outcomes are not guaranteed.
    </Body>

    <Section title="10. Termination" />
    <Body>
      Either party may terminate with 30 days' written notice. Fees for completed and in-progress work remain due. The advance is non-refundable regardless of cause of termination.
    </Body>

    <Section title="11. Governing Law" />
    <Body>
      These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law principles. Disputes shall be resolved by binding arbitration under AAA Commercial Arbitration Rules in Delaware. Class action waiver applies to the fullest extent permitted by law.
    </Body>

    <Section title="12. Contact" />
    <Body>
      <strong className="text-white">legal@hotbotstudios.com</strong> | HotBot Studios LLP (US Operations).
    </Body>
  </div>
);

const UKTerms = (
  <div>
    <Note>
      These Terms apply to clients and users in the United Kingdom. Governed by the laws of England and Wales. HotBot Studios LLP operates in the UK under its global brand name. Consumer rights under the Consumer Rights Act 2015 are preserved where applicable.
    </Note>

    <Section title="1. Parties" />
    <Body>
      These Terms form a legally binding contract between HotBot Studios LLP ("Company") and the Client ("you"). Engaging our services constitutes acceptance of these Terms.
    </Body>

    <Section title="2. Brand Identity &amp; Legal Entity" />
    <Body>
      HotBot Studios LLP (registered in New Delhi, India) operates in the United Kingdom under the HotBot Studios brand name. All UK-facing trade names and identities are commercial brands of HotBot Studios LLP. The registered entity, company name, and logo of HotBot Studios LLP govern all legal and contractual matters.
    </Body>

    <Section title="3. Services" />
    <Body>
      We provide digital marketing, AI automation, content production, software development, public relations, UI/UX design, and business consulting. Specifics are set out in individual Service Agreements or Statements of Work.
    </Body>

    <Section title="4. Payment Terms &amp; Advance" />
    <Body>
      All projects require a minimum advance payment of 25% of the total project value before work commences. This advance is strictly non-refundable. Remaining payments are due per the agreed payment schedule. Late payments may attract interest at 8% above the Bank of England base rate per the Late Payment of Commercial Debts (Interest) Act 1998 for business clients.
    </Body>
    <Note>
      💰 Minimum 25% advance is mandatory on all projects. Non-refundable in all circumstances.
    </Note>

    <Section title="5. No Refund Policy" />
    <Body>
      HotBot Studios LLP operates a strict no-refund policy. Once services have commenced, no refund, credit, or return of fees will be made under any circumstances.
    </Body>
    <Note>
      ⚠️ UK Consumer Rights Act 2015 - Cooling Off Period: For distance contracts with consumers, a 14-day cancellation right may apply. However, where you have explicitly requested that services commence before the end of the 14-day period, and acknowledged in writing that you will lose your right to cancel once services are fully performed, the cancellation right is waived. Business clients (B2B) do not benefit from consumer cooling-off rights. For any partial performance prior to cancellation, a fair and reasonable charge for work completed will apply and no further refund will be issued beyond that deduction. The advance payment is non-refundable in all cases.
    </Note>

    <Section title="6. Client Responsibilities" />
    <Body>
      Clients must provide accurate information, timely feedback and approvals, necessary access and credentials, and payment on time. You warrant ownership or licence of all materials provided to us.
    </Body>

    <Section title="7. Intellectual Property" />
    <Body>
      Upon full and final payment, custom deliverables are assigned to the Client. The Company retains rights to pre-existing tools, AI models, frameworks, and methodologies. Portfolio and case study usage rights are retained by the Company unless waived in writing.
    </Body>

    <Section title="8. Confidentiality" />
    <Body>
      Both parties agree to confidentiality of proprietary information for 3 years post-engagement.
    </Body>

    <Section title="9. Limitation of Liability" />
    <Body>
      The Company's liability is limited to fees paid for the specific service in dispute. We exclude liability for indirect, consequential, or special losses to the fullest extent permitted by English law. Nothing in these Terms excludes liability for death or personal injury caused by negligence, or fraud.
    </Body>

    <Section title="10. Termination" />
    <Body>
      Either party may terminate with 30 days' written notice. All fees for work completed or in progress are due. The advance is non-refundable regardless of termination reason.
    </Body>

    <Section title="11. Governing Law &amp; Jurisdiction" />
    <Body>
      These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. For consumer disputes, the UK Online Dispute Resolution platform and Alternative Dispute Resolution (ADR) schemes may be available.
    </Body>

    <Section title="12. Contact" />
    <Body>
      <strong className="text-white">legal@hotbotstudios.com</strong> | HotBot Studios LLP (UK Operations).
    </Body>
  </div>
);

export default function TermsPage() {
  return (
    <div className="relative z-10 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3">Terms &amp; Conditions</h1>
        <p className="text-slate-400 text-sm">
          Select your jurisdiction below to view applicable Terms &amp; Conditions.
          <br />All Terms are issued by <strong className="text-white">HotBot Studios LLP</strong>, New Delhi, India.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <PolicyTabs india={IndiaTerms} usa={USATerms} uk={UKTerms} />
      </div>
    </div>
  );
}
