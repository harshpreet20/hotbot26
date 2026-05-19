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
function RedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 px-4 py-3 rounded-xl bg-red-500/[0.07] border border-red-500/20 text-red-300 text-xs leading-relaxed">
      {children}
    </div>
  );
}

const IndiaRefund = (
  <div>
    <Note>
      Governed by the Indian Contract Act, 1872 and the Consumer Protection Act, 2019. Applicable to all clients and users engaging HotBot Studios LLP from India.
    </Note>

    <RedNote>
      🚫 NO REFUNDS: HotBot Studios LLP operates a strict no-refund, no-return policy across all services. No exceptions apply. Please read this policy carefully before engaging our services.
    </RedNote>

    <Section title="1. Advance Payment Requirement" />
    <Body>
      All projects and service engagements require a minimum advance payment of <strong className="text-white">25% of the total agreed project value</strong> before any work commences. This advance is strictly non-refundable in all circumstances, including but not limited to: project cancellation by the Client, change of business direction, dissatisfaction with proposals, or disputes regarding scope.
    </Body>

    <Section title="2. No Refund Policy - Absolute" />
    <Body>
      HotBot Studios LLP does not offer refunds, returns, credits, or any form of monetary reimbursement for any services rendered or in progress. This policy is absolute and applies to:
    </Body>
    <ul className="list-disc list-inside text-slate-400 text-sm mb-4 space-y-1 pl-4">
      <li>Advance payments (25% or more)</li>
      <li>Milestone payments made during project execution</li>
      <li>Full project payments</li>
      <li>Retainer fees</li>
      <li>Subscription-based service fees</li>
      <li>Any other amounts paid to HotBot Studios LLP</li>
    </ul>
    <Body>
      This policy applies regardless of the reason, including: dissatisfaction with deliverables, change of business priorities, dispute over project scope, delays attributable to the Client, force majeure events, or early termination by either party.
    </Body>

    <Section title="3. Consumer Statutory Rights (India)" />
    <Note>
      ⚖️ Under the Consumer Protection Act, 2019, consumers retain the right to approach the appropriate Consumer Disputes Redressal Commission for claims of deficiency in service. Our no-refund policy does not waive your statutory rights under Indian consumer law. Before approaching any forum, we request that all concerns be raised through our internal Grievance Redressal process: <strong>grievance@hotbotstudios.com</strong>. We are committed to addressing genuine service deficiencies promptly.
    </Note>

    <Section title="4. Project Termination by Client" />
    <Body>
      If a Client terminates a project or engagement at any stage, all fees paid up to the termination date are forfeited. The advance and any milestone payments are non-refundable. Outstanding invoices for work completed or in progress remain payable in full.
    </Body>

    <Section title="5. Project Termination by HotBot Studios LLP" />
    <Body>
      In the event that HotBot Studios LLP terminates a project due to the Client's breach of the Service Agreement (including non-payment, non-cooperation, or provision of illegal or harmful content), no refund shall be issued for any amounts paid. If HotBot Studios LLP terminates for reasons solely within its control and not related to Client breach, the Company will offer a credit note for unused services (at its sole discretion). Credits are not redeemable for cash.
    </Body>

    <Section title="6. Scope Changes" />
    <Body>
      Changes to project scope requested by the Client after work has commenced are subject to additional charges. Scope reductions do not entitle the Client to a refund of amounts already paid or invoiced.
    </Body>

    <Section title="7. Dispute Resolution" />
    <Body>
      All disputes regarding payments or refunds are to be first raised via our internal grievance process at <strong className="text-white">grievance@hotbotstudios.com</strong>. Unresolved disputes shall be subject to arbitration in New Delhi, India under the Arbitration and Conciliation Act, 1996.
    </Body>

    <Section title="8. Contact" />
    <Body>
      For billing or refund queries: <strong className="text-white">billing@hotbotstudios.com</strong> | HotBot Studios LLP, New Delhi, India.
    </Body>
  </div>
);

const USARefund = (
  <div>
    <Note>
      Applicable to all clients engaging HotBot Studios LLP (operating as HotBot Studios) from the United States. Governed by applicable federal and state law.
    </Note>

    <RedNote>
      🚫 NO REFUNDS: HotBot Studios LLP operates a strict no-refund, no-return policy. No exceptions apply under any circumstances.
    </RedNote>

    <Section title="1. Advance Payment Requirement" />
    <Body>
      All service engagements require a minimum non-refundable advance of <strong className="text-white">25% of the total agreed project value</strong> prior to commencement of work. Payment of the advance constitutes acceptance of these Terms, including this Refund Policy.
    </Body>

    <Section title="2. Absolute No-Refund Policy" />
    <Body>
      All fees paid to HotBot Studios LLP are final and non-refundable. No refunds, credits, or returns of any kind will be issued under any circumstance, including:
    </Body>
    <ul className="list-disc list-inside text-slate-400 text-sm mb-4 space-y-1 pl-4">
      <li>Advance payments (25% or more)</li>
      <li>Milestone or phase payments</li>
      <li>Full project payments</li>
      <li>Retainer or subscription fees</li>
      <li>Payments for cancelled or terminated projects</li>
    </ul>
    <Body>
      This no-refund policy is binding regardless of the reason for any request, including dissatisfaction with output, strategy changes, failure to use services, or early termination.
    </Body>
    <Note>
      ⚠️ Chargeback Policy: Initiating a credit card or bank chargeback contrary to this Policy constitutes a breach of contract. HotBot Studios LLP reserves the right to dispute all chargebacks and to pursue legal recovery of amounts charged back, plus legal fees and costs, to the fullest extent permitted by law.
    </Note>

    <Section title="3. Project Termination" />
    <Body>
      Client-initiated termination at any stage results in forfeiture of all amounts paid. Outstanding fees for work completed or in progress remain payable. HotBot Studios LLP-initiated termination due to Client breach similarly results in no refund; HotBot Studios LLP may, at its sole discretion, issue a credit note for unused work in the event of termination for non-Client-related reasons.
    </Body>

    <Section title="4. Scope Changes" />
    <Body>
      Client-requested scope reductions post-commencement do not entitle the Client to any refund. Scope additions are subject to additional charges.
    </Body>

    <Section title="5. Dispute Resolution" />
    <Body>
      Billing disputes must be raised in writing to <strong className="text-white">billing@hotbotstudios.com</strong> within 14 days of invoice. Unresolved disputes shall be submitted to binding arbitration under AAA Commercial Rules, seated in Delaware, USA.
    </Body>

    <Section title="6. Contact" />
    <Body>
      <strong className="text-white">billing@hotbotstudios.com</strong> | HotBot Studios LLP (US Operations).
    </Body>
  </div>
);

const UKRefund = (
  <div>
    <Note>
      Applicable to clients engaging HotBot Studios LLP (operating as HotBot Studios) from the United Kingdom. Governed by the laws of England and Wales, including the Consumer Rights Act 2015 where applicable.
    </Note>

    <RedNote>
      🚫 NO REFUNDS: HotBot Studios LLP operates a strict no-refund policy once services have commenced. Please read the statutory rights section below carefully.
    </RedNote>

    <Section title="1. Advance Payment Requirement" />
    <Body>
      All projects require a minimum non-refundable advance payment of <strong className="text-white">25% of the total agreed project value</strong> before work commences. Payment of the advance constitutes acceptance of these Terms, including the waiver of cooling-off rights where applicable.
    </Body>

    <Section title="2. No Refund Policy - Post-Commencement" />
    <Body>
      Once services have commenced, no refunds, credits, or returns of any fees will be made. This applies to advance payments, milestone payments, retainer fees, and all other amounts paid.
    </Body>

    <Section title="3. UK Consumer Rights - Cooling-Off Period" />
    <Note>
      ⚖️ UK Consumer Rights Act 2015 &amp; Consumer Contracts Regulations 2013: Where you are a consumer (not a business) contracting at a distance, you ordinarily have a 14-day right to cancel. However, by expressly requesting that services commence before the end of the 14-day cooling-off period - which you do by making your advance payment and instructing work to begin - you acknowledge and agree that:
      <br /><br />
      (a) you waive your right to cancel once services are fully performed; and
      <br />
      (b) if you cancel before full performance, you will be liable to pay a proportionate amount for services delivered up to cancellation.
      <br /><br />
      In all such cases, the advance payment (minimum 25%) is non-refundable and serves as the minimum proportionate charge. Business (B2B) clients have no cooling-off rights.
    </Note>

    <Section title="4. Project Termination by Client" />
    <Body>
      Client-initiated termination at any stage results in forfeiture of all amounts paid to date. Outstanding invoices for completed or in-progress work remain payable. The advance is non-refundable in all circumstances.
    </Body>

    <Section title="5. Project Termination by HotBot Studios LLP" />
    <Body>
      If we terminate due to Client breach, no refund is issued. If we terminate for reasons solely within our control and unrelated to Client conduct, consumer clients will receive a fair and proportionate credit for unperformed work (non-cash). Business clients will receive no refund in such cases unless expressly agreed in the Service Agreement.
    </Body>

    <Section title="6. Scope Changes" />
    <Body>
      Reductions in project scope post-commencement do not entitle the Client to any refund. Additional scope is charged separately.
    </Body>

    <Section title="7. Alternative Dispute Resolution" />
    <Body>
      Billing disputes must be raised in writing to <strong className="text-white">billing@hotbotstudios.com</strong> within 14 days of invoice. Consumer clients in the UK may also refer unresolved disputes to a certified ADR provider or the UK Online Dispute Resolution (ODR) platform. Disputes are ultimately governed by the courts of England and Wales.
    </Body>

    <Section title="8. Contact" />
    <Body>
      <strong className="text-white">billing@hotbotstudios.com</strong> | HotBot Studios LLP (UK Operations).
    </Body>
  </div>
);

export default function RefundPage() {
  return (
    <div className="relative z-10 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3">Refund Policy</h1>
        <p className="text-slate-400 text-sm">
          Select your jurisdiction below. All engagements require a minimum 25% advance.
          <br />All policies are issued by <strong className="text-white">HotBot Studios LLP</strong>, New Delhi, India.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <PolicyTabs india={IndiaRefund} usa={USARefund} uk={UKRefund} />
      </div>
    </div>
  );
}
