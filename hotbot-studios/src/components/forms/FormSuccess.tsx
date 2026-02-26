"use client";

interface FormSuccessProps {
  onClose: () => void;
  leadId?: string | null;
}

export function FormSuccess({ onClose, leadId }: FormSuccessProps) {
  return (
    <div className="text-center py-8 animate-zoom-in">
      {/* Success icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
      <p className="text-slate-400 text-sm mb-2">
        We&apos;ll get back to you within 24 hours.
      </p>
      {leadId && (
        <p className="text-slate-500 text-xs mb-6">Reference: {leadId}</p>
      )}
      <p className="text-slate-400 text-sm mb-8">
        Our team will also reach out via WhatsApp if you provided your phone number.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Continue Exploring
        </button>
        <a
          href="https://wa.me/919700001534"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-2xl font-semibold text-center border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-all duration-300 block"
        >
          Message on WhatsApp
        </a>
      </div>
    </div>
  );
}
