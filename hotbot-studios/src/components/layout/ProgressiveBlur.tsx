"use client";

export function ProgressiveBlur() {
  return (
    <>
      {/* Top blur */}
      <div
        className="fixed top-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,14,26,0.8) 0%, transparent 100%)",
        }}
      />
      {/* Bottom blur */}
      <div
        className="fixed bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,14,26,0.8) 0%, transparent 100%)",
        }}
      />
    </>
  );
}
