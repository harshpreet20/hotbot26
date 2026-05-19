import { Reveal } from "./Reveal";

interface ContentBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentBlock({ children, className = "" }: ContentBlockProps) {
  return (
    <section className={`px-6 max-w-6xl mx-auto py-8 ${className}`}>
      {children}
    </section>
  );
}

interface H2Props {
  children: React.ReactNode;
  className?: string;
}

export function H2({ children, className = "" }: H2Props) {
  return (
    <Reveal>
      <h2
        className={`text-3xl md:text-4xl font-bold text-white mb-4 ${className}`}
      >
        {children}
      </h2>
    </Reveal>
  );
}

interface H3Props {
  children: React.ReactNode;
  className?: string;
}

export function H3({ children, className = "" }: H3Props) {
  return (
    <Reveal>
      <h3
        className={`text-xl md:text-2xl font-semibold text-white mb-3 ${className}`}
      >
        {children}
      </h3>
    </Reveal>
  );
}

interface PProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function P({ children, className = "", delay = 0 }: PProps) {
  return (
    <Reveal delay={delay}>
      <p className={`text-slate-400 leading-relaxed mb-4 ${className}`}>
        {children}
      </p>
    </Reveal>
  );
}
