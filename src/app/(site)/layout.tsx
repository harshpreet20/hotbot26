import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { ProgressiveBlur } from "@/components/layout/ProgressiveBlur";

const HotBotChat = dynamic(
  () => import("@/components/chat/HotBotChat").then((m) => m.HotBotChat),
  { ssr: false },
);

const FormModal = dynamic(
  () => import("@/components/forms/FormModal").then((m) => m.FormModal),
  { ssr: false },
);

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <AnimatedGrid />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <ProgressiveBlur />
      <FormModal />
      <HotBotChat />
    </div>
  );
}
