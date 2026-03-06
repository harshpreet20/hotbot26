import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { ProgressiveBlur } from "@/components/layout/ProgressiveBlur";
import { HotBotChat } from "@/components/chat/HotBotChat";
import { FormModal } from "@/components/forms/FormModal";

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
