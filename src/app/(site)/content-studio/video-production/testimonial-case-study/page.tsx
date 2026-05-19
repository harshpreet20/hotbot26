import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { GlassCard } from "@/components/shared/GlassCard";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export const metadata: Metadata = {
  title: "Testimonial & Case Study Video Production USA | HotBot Studios",
  description:
    "HotBot Studios produces authentic customer testimonial and case study videos for US brands. 89% of buyers say video testimonials influence their final decision. Professional filming, editing, and distribution included.",
  keywords: [
    "testimonial video production USA",
    "case study video agency USA",
    "customer success video production",
    "B2B testimonial video USA",
    "video case study production",
    "client testimonial video agency",
    "social proof video production USA",
  ],
  alternates: { canonical: "https://hotbotstudios.com/content-studio/video-production/testimonial-case-study" },
  openGraph: {
    title: "Testimonial & Case Study Video Production USA | HotBot Studios",
    description: "Real customer success stories - professionally filmed, edited, and distributed. The most trusted content type at the purchase decision stage.",
    url: "https://hotbotstudios.com/content-studio/video-production/testimonial-case-study",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Testimonial & Case Study Video Production",
  provider: { "@type": "Organization", name: "HotBot Studios", url: "https://hotbotstudios.com" },
  serviceType: "Testimonial Video & Case Study Video Production",
  areaServed: { "@type": "Country", name: "United States" },
  description: "Professional testimonial and case study video production for US businesses. Pre-interview coaching, 4K filming, professional edit, and distribution strategy included.",
  url: "https://hotbotstudios.com/content-studio/video-production/testimonial-case-study",
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hotbotstudios.com" },
    { "@type": "ListItem", position: 2, name: "Content Studio", item: "https://hotbotstudios.com/content-studio" },
    { "@type": "ListItem", position: 3, name: "Video Production", item: "https://hotbotstudios.com/content-studio/video-production" },
    { "@type": "ListItem", position: 4, name: "Testimonial & Case Study Videos", item: "https://hotbotstudios.com/content-studio/video-production/testimonial-case-study" },
  ],
};

const CONTENT = [
  {
    heading: "Social Proof is the Strongest Buying Signal in 2026",
    body: "At the final stage of a B2B buying decision, 89% of buyers say that video testimonials and case studies are the most influential content they consume - more than pricing pages, feature comparison tables, or analyst reports. The reason is neurological: hearing a real customer describe a real result activates the same trust mechanisms as a personal recommendation from a colleague. In a market saturated with vendor claims, your happiest customers are your most credible sales team. A professionally produced testimonial video puts that social proof in front of every prospect who visits your website, without requiring your customer to repeat themselves on every sales call. One shoot day with one customer can generate evergreen trust content that converts for years.",
    color: "#22c55e",
  },
  {
    heading: "How We Film Testimonials That Feel Authentic, Not Scripted",
    body: "The single biggest mistake brands make with testimonial videos is scripting what their customers say. Viewers detect rehearsed language immediately - and scripted testimonials backfire by feeling like advertising rather than genuine endorsement. HotBot Studios takes a different approach: we conduct a structured pre-interview with your customer before the shoot, identifying the three or four most compelling moments in their experience with your brand, and coaching them on how to frame those moments naturally on camera. On shoot day, our director conducts a conversational on-camera interview using those moments as anchors - and the result is a testimonial that sounds like your customer talking to a friend, not reading from a script. We capture B-roll of their workspace, product in use, and relevant context footage to enrich the final edit.",
    color: "#ec4899",
  },
  {
    heading: "Case Study Videos: Structure That Tells a Business Story",
    body: "A case study video goes deeper than a testimonial - it walks through the challenge, the solution, and the measurable outcome in a format that resonates with B2B decision makers at the evaluation stage. HotBot Studios structures case study videos in three acts: the problem your customer faced before working with you (told in their own words), the specific ways your product or service addressed that problem, and the concrete business results - revenue growth, cost savings, time saved, or customer retention improvements - with specific numbers wherever possible. This structure mirrors the way B2B buyers think about ROI and directly answers the question that every procurement decision comes down to: has this worked for a business like ours? A strong case study video reduces the length of your sales cycle by giving prospects the evidence they need to build internal consensus.",
    color: "#8b5cf6",
  },
  {
    heading: "Distribution: Where Testimonial Videos Perform Best",
    body: "Testimonial and case study videos are versatile assets that perform across every stage of your marketing funnel. Embedded on your homepage and pricing page, they reduce churn at the consideration stage. In LinkedIn outreach sequences, a video thumbnail of a peer-level testimonial receives 3-4× more engagement than a text message. As YouTube pre-roll ads, testimonials targeted at in-market audiences build credibility before a prospect has ever visited your website. In sales decks and email follow-ups, a single case study video sent after a first meeting accelerates deal velocity. We deliver every testimonial video with a distribution brief that maps each version - the 2-minute full story, the 60-second highlight, and the 15-second quote clip - to the highest-impact placement in your sales and marketing funnel.",
    color: "#3b82f6",
  },
];

export default function TestimonialCaseStudyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <Breadcrumb items={[{ label: "Content Studio", href: "/content-studio" }, { label: "Video Production", href: "/content-studio/video-production" }, { label: "Testimonial Case Study" }]} />

      <PageHeader
        label="Testimonial & Case Study Videos"
        title="Let Your Happiest Customers Close Your Next Deal"
        subtitle="Professionally filmed customer success stories that build trust at the purchase decision stage. The most credible content your brand can produce - in their own words."
      />

      <section className="relative z-10 px-6 max-w-4xl mx-auto py-10 space-y-6">
        {CONTENT.map((block, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <GlassCard className="p-6 md:p-8">
              <div
                className="w-1 h-10 rounded-full mb-4"
                style={{ background: `linear-gradient(180deg, ${block.color}, ${block.color}44)` }}
              />
              <h2 className="text-xl font-bold text-white mb-3">{block.heading}</h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">{block.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="relative z-10 px-6 max-w-2xl mx-auto pb-24">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get a Free Testimonial Video Quote</h2>
            <p className="text-slate-400">Tell us about the customer story you want to tell. We will respond with a production plan and timeline within 24 hours.</p>
          </div>
          <LeadCaptureForm
            sourceId="video-testimonial-case-study"
            accentColor="#22c55e"
            title="Start Your Testimonial Video Project"
            subtitle="No obligation. Share the customer story you want to capture and we will show you how we bring it to life."
          />
        </Reveal>
      </section>
    </>
  );
}
