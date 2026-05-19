interface PageIllustrationProps {
  type?: string;
}

export function PageIllustration({ type = "default" }: PageIllustrationProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto my-12 opacity-70">
      <div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: "rgba(15,20,40,0.8)" }}
      >
        <svg
          viewBox="0 0 600 300"
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="600" height="300" fill={`url(#grad-${type})`} />
          {/* Simple abstract illustration */}
          <circle cx="300" cy="150" r="80" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="300" cy="150" r="50" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="300" cy="150" r="20" fill="#3b82f6" fillOpacity="0.2" />
          {/* Connection lines */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 300 + 120 * Math.cos(rad);
            const y2 = 150 + 120 * Math.sin(rad);
            return (
              <line
                key={i}
                x1="300"
                y1="150"
                x2={x2}
                y2={y2}
                stroke="#3b82f6"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
