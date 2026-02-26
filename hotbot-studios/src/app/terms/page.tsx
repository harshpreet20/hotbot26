import type { Metadata } from "next";
import { ContentBlock, H2, P } from "@/components/shared/ContentBlock";

export const metadata: Metadata = {
  title: "Terms of Service | HotBot Studios",
  description: "HotBot Studios terms of service and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="relative z-10 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
        <p className="text-slate-400">Last updated: January 2025</p>
      </div>
      <ContentBlock className="max-w-3xl mx-auto">
        <H2>1. Acceptance of Terms</H2>
        <P>By accessing or using HotBot Studios&apos; website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</P>

        <H2>2. Services</H2>
        <P>HotBot Studios provides digital marketing, AI automation, content production, software development, public relations, UI/UX design, and consulting services. Specific service terms are outlined in individual service agreements.</P>

        <H2>3. Client Responsibilities</H2>
        <P>Clients are responsible for providing accurate information, timely feedback, necessary access and credentials, and payment as agreed. You are responsible for ensuring you have the rights to any materials you provide to us.</P>

        <H2>4. Intellectual Property</H2>
        <P>Upon full payment, clients receive ownership of all custom deliverables created specifically for their project. HotBot Studios retains rights to pre-existing tools, frameworks, and methodologies used in service delivery.</P>

        <H2>5. Payment Terms</H2>
        <P>Invoices are due within 14 days of issue unless otherwise agreed. Late payments may incur interest at 1.5% per month or the maximum rate permitted by applicable state law.</P>

        <H2>6. Confidentiality</H2>
        <P>Both parties agree to keep confidential any proprietary information shared during the engagement. This obligation survives termination of the agreement for a period of 3 years.</P>

        <H2>7. Limitation of Liability</H2>
        <P>HotBot Studios&apos; liability is limited to the fees paid for the specific service in question. We are not liable for indirect, consequential, or incidental damages. We do not guarantee specific marketing results.</P>

        <H2>8. Termination</H2>
        <P>Either party may terminate a service agreement with 30 days written notice. Clients are responsible for payment of work completed up to the termination date.</P>

        <H2>9. Governing Law</H2>
        <P>These terms are governed by the laws of the State of Delaware, United States. Any disputes shall be subject to the exclusive jurisdiction of the state and federal courts of Delaware.</P>

        <H2>10. Contact</H2>
        <P>For questions about these terms, contact: legal@hotbotstudios.com | HotBot Studios Inc., Delaware, United States.</P>
      </ContentBlock>
    </div>
  );
}
