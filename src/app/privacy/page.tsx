import type { Metadata } from "next";
import { ContentBlock, H2, H3, P } from "@/components/shared/ContentBlock";

export const metadata: Metadata = {
  title: "Privacy Policy | HotBot Studios",
  description: "HotBot Studios privacy policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="relative z-10 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400">Last updated: January 2025</p>
      </div>
      <ContentBlock className="max-w-3xl mx-auto">
        <H2>1. Information We Collect</H2>
        <P>We collect information you provide directly to us, such as when you fill in a contact form, use our chatbot, or sign up for our newsletter. This may include your name, email address, phone number, company name, and any messages you send us.</P>

        <H2>2. How We Use Your Information</H2>
        <P>We use the information we collect to respond to your inquiries, provide our services, send marketing communications (with your consent), improve our services, and comply with legal obligations.</P>

        <H2>3. Data Sharing</H2>
        <P>We do not sell your personal data. We may share data with trusted third-party service providers who assist us in operating our business (such as CRM tools, email platforms, and cloud services) under strict data processing agreements.</P>

        <H2>4. Cookies</H2>
        <P>We use cookies and similar tracking technologies to analyze website traffic, remember your preferences, and improve your experience. You can control cookies through your browser settings.</P>

        <H2>5. Data Retention</H2>
        <P>We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Typically, contact form data is retained for 3 years.</P>

        <H2>6. Your Rights (CCPA & US Privacy Law)</H2>
        <P>Under applicable US privacy laws including CCPA, you have the right to know what personal data we collect, request deletion, opt out of sale, and non-discrimination for exercising your rights. To exercise these rights, contact us at privacy@hotbotstudios.com.</P>

        <H2>7. Data Security</H2>
        <P>We implement appropriate technical and organizational measures to protect your personal data against unauthorised access, loss, or destruction. All data is transmitted using SSL/TLS encryption.</P>

        <H2>8. Contact Us</H2>
        <P>If you have questions about this privacy policy or how we handle your data, please contact: HotBot Studios Inc., Delaware, United States. Email: privacy@hotbotstudios.com</P>

        <H3>Data Controller</H3>
        <P>HotBot Studios Inc. is incorporated in Delaware, United States. We comply with applicable federal and state privacy regulations including CCPA and FTC guidelines.</P>
      </ContentBlock>
    </div>
  );
}
