"use client";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}

const transforms: Record<Direction, string> = {
  up: "translateY(36px)",
  down: "translateY(-36px)",
  left: "translateX(36px)",
  right: "translateX(-36px)",
};

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: RevealProps) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate(0)" : transforms[direction],
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
