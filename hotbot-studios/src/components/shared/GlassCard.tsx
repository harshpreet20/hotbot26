"use client";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  dot?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = true,
  onClick,
  dot = false,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl",
        hover &&
          "hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 cursor-pointer",
        "transition-all duration-500",
        className
      )}
    >
      {dot && (
        <div className="absolute top-4 right-4 w-[6px] h-[6px] rounded-full bg-blue-400/40" />
      )}
      {children}
    </div>
  );
}
