import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── HOOKS ───
function useInView(opts = {}) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold: 0.12, ...opts });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let s = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => { s += step; if (s >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [inView, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, v] = useInView();
  const t = { up: "translateY(36px)", down: "translateY(-36px)", left: "translateX(36px)", right: "translateX(-36px)" };
  return (
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "translate(0)" : t[direction], transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── ANIMATED GRID BACKGROUND (crisp header, dim body) ───
function AnimatedGrid() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  // Grid opacity: 0.18 at top → 0.015 after 800px scroll
  const gridOp = Math.max(0.015, 0.18 - scrollY * 0.00022);
  // Dots opacity: 0.3 at top → 0.02
  const dotsOp = Math.max(0.02, 0.3 - scrollY * 0.00038);
  // Scanline opacity: 0.25 at top → 0.03
  const scanOp = Math.max(0.03, 0.25 - scrollY * 0.0003);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0e1a]" />
      <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] rounded-full bg-blue-600/[0.07] blur-[150px] animate-glowDrift1" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.05] blur-[120px] animate-glowDrift2" />
      <div className="absolute top-[40%] left-[50%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[100px] animate-glowDrift3" />
      {/* Grid — crisp at top, fades with scroll */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: gridOp, transition: "opacity 0.15s" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="0.6" />
          </pattern>
          <pattern id="gridLg" width="300" height="300" patternUnits="userSpaceOnUse">
            <path d="M 300 0 L 0 0 0 300" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
          </pattern>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="8%" stopColor="white" stopOpacity="1" />
            <stop offset="40%" stopColor="white" stopOpacity="0.7" />
            <stop offset="70%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="gridMask"><rect width="100%" height="100%" fill="url(#gridFade)" /></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridLg)" mask="url(#gridMask)" />
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>
      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: scanOp, transition: "opacity 0.15s" }}>
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-scanline" />
      </div>
      {/* Intersection dots — crisp at top */}
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: dotsOp, transition: "opacity 0.15s" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-blue-400"
            style={{
              left: `${(i % 5) * 20 + 10}%`,
              top: `${Math.floor(i / 5) * 20 + 5}%`,
              animation: `dotPulse ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              boxShadow: "0 0 6px rgba(59,130,246,0.4)",
            }} />
        ))}
      </div>
    </div>
  );
}

// ─── GLASS CARD ───
function GlassCard({ children, className = "", hover = true, onClick, dot = false }) {
  return (
    <div onClick={onClick}
      className={`relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl ${hover ? "hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 cursor-pointer" : ""} transition-all duration-500 ${className}`}>
      {dot && <div className="absolute top-4 right-4 w-[6px] h-[6px] rounded-full bg-blue-400/40" />}
      {children}
    </div>
  );
}

// ─── LEADS DATABASE (persistent storage) ───
const LeadsDB = {
  async save(lead) {
    try {
      const existing = await LeadsDB.getAll();
      const entry = { ...lead, id: `lead_${Date.now()}`, ts: new Date().toISOString(), status: "new" };
      existing.unshift(entry);
      await window.storage.set("hotbot-leads", JSON.stringify(existing));
      return entry;
    } catch { return null; }
  },
  async getAll() {
    try {
      const r = await window.storage.get("hotbot-leads");
      return r ? JSON.parse(r.value) : [];
    } catch { return []; }
  },
  async updateStatus(id, status) {
    try {
      const all = await LeadsDB.getAll();
      const i = all.findIndex(l => l.id === id);
      if (i > -1) { all[i].status = status; await window.storage.set("hotbot-leads", JSON.stringify(all)); }
    } catch {}
  },
  async getStats() {
    const all = await LeadsDB.getAll();
    return {
      total: all.length,
      new: all.filter(l => l.status === "new").length,
      contacted: all.filter(l => l.status === "contacted").length,
      converted: all.filter(l => l.status === "converted").length,
    };
  },
};

// ─── FORM MODAL (glassmorphism, attached to all CTAs) ───
function FormModal({ isOpen, onClose, formType = "get-started" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", service: "", budget: "", message: "" });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1); setDone(false); setSubmitting(false);
      setForm({ name: "", email: "", phone: "", company: "", service: "", budget: "", message: "" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const titles = { "get-started": "Start Your Project", "contact-sales": "Talk to Sales", "strategy-call": "Book Strategy Call", "consultation": "Free Consultation" };
  const subs = { "get-started": "Tell us about your project and we'll get back within 24 hours.", "contact-sales": "Our sales team will reach out with a tailored proposal.", "strategy-call": "Book a free 30-minute strategy session with our experts.", "consultation": "Get a no-obligation consultation for your UK business." };
  const services = ["Digital Marketing", "AI Automation", "Content Production", "Software Development", "Public Relations", "UI/UX Design", "Marketing Consulting", "Not sure yet"];
  const budgets = ["Under £5,000", "£5,000 – £15,000", "£15,000 – £50,000", "£50,000+", "Let's discuss"];
  const handleSubmit = async () => { setSubmitting(true); await LeadsDB.save({ ...form, formType, source: formType }); setTimeout(() => { setSubmitting(false); setDone(true); }, 800); };
  const valid1 = form.name.trim() && form.email.trim();
  const valid2 = form.service;

  const inp = (k, t, l, p) => (
    <div key={k} style={{ marginBottom: 2 }}>
      <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{l}</label>
      <input type={t} value={form[k]} onChange={e => setForm(pr => ({ ...pr, [k]: e.target.value }))}
        style={{ width: "100%", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", background: "#111730", border: `1px solid ${form[k] ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)"}`, transition: "border-color 0.2s", boxSizing: "border-box", fontFamily: "inherit" }}
        onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
        onBlur={e => e.target.style.borderColor = form[k] ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)"}
        placeholder={p} />
    </div>
  );

  const chip = (label, sel, fn) => (
    <button key={label} onClick={fn} style={{
      textAlign: "left", fontSize: 12, borderRadius: 12, padding: "10px 14px", cursor: "pointer",
      background: sel ? "#162044" : "#111730", border: `1px solid ${sel ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
      color: sel ? "#93c5fd" : "#94a3b8", transition: "all 0.2s", boxShadow: sel ? "0 0 12px rgba(59,130,246,0.1)" : "none", fontFamily: "inherit",
    }}>{label}</button>
  );

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", opacity: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: "100%", maxWidth: 500, zIndex: 2, borderRadius: 24, overflow: "hidden",
        background: "#0c1021", border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 50px 120px rgba(0,0,0,0.8), 0 0 80px rgba(59,130,246,0.12)",
        opacity: 1, transform: "translateY(0) scale(1)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} />
        <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, background: "rgba(59,130,246,0.06)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, zIndex: 20, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1a2240"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div style={{ position: "relative", padding: "32px 36px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d2618", border: "1px solid rgba(34,197,94,0.35)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>You're all set!</h3>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>We'll get back to you within 24 hours.</p>
              <button onClick={onClose} style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa", background: "transparent", border: "none", cursor: "pointer" }}>Close</button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 20, background: "#111d3a", border: "1px solid rgba(59,130,246,0.2)", marginBottom: 16 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: "#3b82f6" }} />
                  <span style={{ color: "#60a5fa", fontSize: 12, fontWeight: 500 }}>Step {step} of 3</span>
                </div>
                <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "0 0 4px 0" }}>{titles[formType]}</h2>
                <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>{subs[formType]}</p>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: "#111730", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: s <= step ? "100%" : "0%", background: "linear-gradient(90deg, #3b82f6, #06b6d4)", transition: "width 0.4s ease" }} />
                  </div>
                ))}
              </div>
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {inp("name", "text", "Full Name", "John Smith")}
                  {inp("email", "email", "Work Email", "john@company.co.uk")}
                  {inp("phone", "tel", "Phone (optional)", "+44 7700 900000")}
                  {inp("company", "text", "Company", "Your company name")}
                  <button onClick={() => setStep(2)} disabled={!valid1} style={{
                    width: "100%", marginTop: 8, padding: "14px 0", borderRadius: 12, border: "none", cursor: valid1 ? "pointer" : "default", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit",
                    background: valid1 ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#111730", opacity: valid1 ? 1 : 0.4,
                    boxShadow: valid1 ? "0 8px 24px rgba(59,130,246,0.25)" : "none", transition: "all 0.3s",
                  }}>Continue →</button>
                </div>
              )}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>What service are you interested in?</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{services.map(s => chip(s, form.service === s, () => setForm(p => ({ ...p, service: s }))))}</div>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Budget range</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{budgets.map(b => chip(b, form.budget === b, () => setForm(p => ({ ...p, budget: b }))))}</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#94a3b8", background: "#111730", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                    <button onClick={() => setStep(3)} disabled={!valid2} style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: valid2 ? "pointer" : "default", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit",
                      background: valid2 ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#111730", opacity: valid2 ? 1 : 0.4,
                      boxShadow: valid2 ? "0 8px 24px rgba(59,130,246,0.25)" : "none", transition: "all 0.3s",
                    }}>Continue →</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Tell us about your project</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4}
                      style={{ width: "100%", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", resize: "none", background: "#111730", border: "1px solid rgba(255,255,255,0.1)", transition: "border-color 0.2s", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      placeholder="Goals, requirements, timeline..." />
                  </div>
                  <div style={{ borderRadius: 12, padding: 16, background: "#0e1533", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, margin: "0 0 8px 0" }}>SUMMARY</p>
                    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "6px 0", fontSize: 12 }}>
                      <span style={{ color: "#475569" }}>Name</span><span style={{ color: "#cbd5e1" }}>{form.name || "—"}</span>
                      <span style={{ color: "#475569" }}>Email</span><span style={{ color: "#cbd5e1" }}>{form.email || "—"}</span>
                      <span style={{ color: "#475569" }}>Company</span><span style={{ color: "#cbd5e1" }}>{form.company || "—"}</span>
                      <span style={{ color: "#475569" }}>Service</span><span style={{ color: "#60a5fa" }}>{form.service || "—"}</span>
                      <span style={{ color: "#475569" }}>Budget</span><span style={{ color: "#cbd5e1" }}>{form.budget || "—"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: "14px 0", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#94a3b8", background: "#111730", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                    <button onClick={handleSubmit} disabled={submitting} style={{
                      flex: 1, padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "white", fontFamily: "inherit",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 8px 24px rgba(59,130,246,0.25)",
                    }}>{submitting ? "Sending..." : "Submit →"}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── INTERACTIVE SERVICE CARD (3D tilt + glow + shimmer) ───
function ServiceCard({ type, title, desc, page, navigate, index, featured, products }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -12, y: (x - 0.5) * 12 });
    setMousePos({ x: x * 100, y: y * 100 });
  };

  const handleEnter = () => setHovering(true);
  const handleLeave = () => { setHovering(false); setTilt({ x: 0, y: 0 }); };

  const icons = {
    marketing: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="9" rx="1" /><path d="M3 16h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" /><path d="M8 16v-3M16 16v-3" /></>,
    ai: <><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><circle cx="15" cy="10" r="1.5" /><path d="M9 15h6" /><path d="M8 1v3M16 1v3" /></>,
    software: <><path d="M7 8l-4 4 4 4" /><path d="M17 8l4 4-4 4" /><line x1="14" y1="4" x2="10" y2="20" /></>,
    pr: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    uiux: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
    consulting: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 17V13" /><path d="M12 17V9" /><path d="M17 17V7" /></>,
    seo: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6" /><path d="M11 8v6" /></>,
    mobile: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /><path d="M9 6h6" /></>,
    code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    branding: <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></>,
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(page)}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="service-card-wrapper cursor-pointer"
      style={{
        perspective: "800px",
        animationDelay: `${index * 0.08}s`,
        gridColumn: featured ? "span 2" : undefined,
      }}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovering ? "scale(1.03)" : "scale(1)"}`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Animated gradient border */}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-500"
          style={{
            opacity: hovering ? 1 : 0,
            background: `conic-gradient(from ${Date.now() % 360}deg at 50% 50%, #3b82f6, #06b6d4, #8b5cf6, #3b82f6)`,
            padding: "1px",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            WebkitMaskComposite: "xor",
          }}
        />

        {/* Glow effect following cursor */}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.12), transparent 60%)`,
          }}
        />

        {/* Card body */}
        <div className="relative bg-[#0d1225]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 h-full"
          style={{ borderColor: hovering ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.08)" }}>

          {/* Shimmer sweep */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{ opacity: hovering ? 1 : 0, transition: "opacity 0.4s" }}
          >
            <div className="absolute inset-0 shimmer-sweep" />
          </div>

          {/* Corner dot */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <div
              className="w-[6px] h-[6px] rounded-full transition-all duration-500"
              style={{
                backgroundColor: hovering ? "rgba(59,130,246,0.9)" : "rgba(59,130,246,0.3)",
                boxShadow: hovering ? "0 0 10px rgba(59,130,246,0.5)" : "none",
              }}
            />
          </div>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500"
            style={{
              background: hovering
                ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(6,182,212,0.15))"
                : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))",
              border: `1px solid ${hovering ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.15)"}`,
              transform: hovering ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
              boxShadow: hovering ? "0 8px 24px rgba(59,130,246,0.15)" : "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={hovering ? "#60a5fa" : "#3b82f6"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "all 0.4s", filter: hovering ? "drop-shadow(0 0 6px rgba(96,165,250,0.4))" : "none" }}>
              {icons[type]}
            </svg>
          </div>

          {/* Title */}
          <h3
            className="font-semibold text-[15px] mb-1.5 transition-all duration-300"
            style={{ color: hovering ? "#93c5fd" : "#f1f5f9" }}
          >
            {title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-[13px] leading-relaxed mb-4">{desc}</p>

          {/* Product pills (featured AI card) */}
          {products && products.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {products.map((p, pi) => (
                <span key={pi} onClick={e => { e.stopPropagation(); navigate("products"); }}
                  style={{
                    fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                    background: hovering ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.06)",
                    border: `1px solid ${hovering ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.12)"}`,
                    color: hovering ? "#93c5fd" : "#64748b", transition: "all 0.3s", cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}>{p}</span>
              ))}
            </div>
          )}

          {/* Bottom action row */}
          <div
            className="flex items-center gap-2 transition-all duration-500"
            style={{
              opacity: hovering ? 1 : 0,
              transform: hovering ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <span className="text-blue-400 text-xs font-semibold">Explore</span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"
              style={{
                transition: "transform 0.3s",
                transform: hovering ? "translateX(3px)" : "translateX(0)",
              }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ───
function Navbar({ currentPage, navigate, openForm }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);

  const links = [
    { label: "Home", page: "home" },
    { label: "AI Automation", page: "ai-automation" },
    { label: "Digital Marketing", page: "marketing-services" },
    { label: "Content Studio", page: "software-development" },
    { label: "Software Dev", page: "software-dev" },
    { label: "PR", page: "public-relations" },
    { label: "UI/UX", page: "ui-ux-design" },
    { label: "Consulting", page: "consultancy" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0e1a]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("home")} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-500 transition-colors">H</div>
          <span className="text-white font-semibold text-base tracking-tight">HotBot Studios</span>
        </button>

        <div className="hidden xl:flex items-center gap-0.5">
          {links.map(l => (
            <button key={l.page} onClick={() => navigate(l.page)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${currentPage === l.page ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden xl:flex items-center gap-3">
          <button onClick={() => openForm("get-started")} className="text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            Get Started
          </button>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden text-white p-2">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={mobileOpen ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 13h16M4 19h16"} />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="xl:hidden bg-[#0a0e1a]/98 backdrop-blur-2xl border-t border-white/[0.06] px-6 py-4 space-y-1 animate-slideDown">
          {links.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${currentPage === l.page ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"}`}>
              {l.label}
            </button>
          ))}
          <button onClick={() => { openForm("get-started"); setMobileOpen(false); }} className="block w-full text-center mt-3 text-sm font-semibold text-white bg-blue-600 px-5 py-3 rounded-lg">Get Started</button>
        </div>
      )}
    </nav>
  );
}

// ─── FOOTER ───
function Footer({ navigate }) {
  return (
    <footer className="relative z-10 border-t border-white/[0.06]" style={{ background: "transparent" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">H</div>
              <span className="text-white font-semibold">HotBot Studios</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">Pioneering Digital Outreach — the best digital marketing, AI automation, and consulting services in UK. We strategize and execute for your business growth.</p>
          </div>
          {[
            { title: "Services", items: [["AI Automation", "ai-automation"], ["Digital Marketing", "marketing-services"], ["Content Studio", "software-development"], ["Software Dev", "software-dev"], ["Public Relations", "public-relations"], ["UI/UX Design", "ui-ux-design"], ["Consulting", "consultancy"]] },
            { title: "Company", items: [["About Us", "about"], ["Blogs", "blogs"], ["Products", "products"], ["Contact", "contact"]] },
            { title: "Legal", items: [["Privacy Policy", "privacy"], ["Terms & Conditions", "privacy"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <div className="space-y-2.5">
                {col.items.map(([label, page]) => (
                  <button key={label} onClick={() => navigate(page)} className="block text-slate-400 hover:text-white text-sm transition-colors">{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">© 2024 HotBot Studios. Best digital marketing services in UK. All rights reserved.</p>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "Instagram"].map(s => <span key={s} className="text-slate-600 hover:text-white text-xs cursor-pointer transition-colors">{s}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── HERO SECTION (matching screenshot) ───
function HeroSection({ navigate }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const services = [
    { type: "ai", title: "AI Automation", desc: "Custom AI agents, voice assistants, and intelligent automation systems.", page: "ai-automation", featured: true, products: ["Heka Voice AI", "Website Keywords", "Telegram Bot", "LinkedIn Assistant", "Instagram Assistant", "Wellness AI"] },
    { type: "marketing", title: "Digital Marketing", desc: "SEO, SEM, social media, and performance marketing strategies.", page: "marketing-services" },
    { type: "software", title: "Content Production Studio", desc: "Premium websites, web apps, and professional content creation.", page: "software-development" },
    { type: "code", title: "Software Development", desc: "Custom software, mobile apps, SaaS platforms, and API integrations.", page: "software-dev" },
    { type: "pr", title: "Public Relations", desc: "Strategic PR campaigns, media outreach, and brand reputation management.", page: "public-relations" },
    { type: "uiux", title: "UI/UX Design", desc: "User-centered design, wireframing, prototyping, and conversion optimization.", page: "ui-ux-design" },
    { type: "consulting", title: "Marketing Consulting", desc: "Business strategy, digital transformation, and growth consulting.", page: "consultancy" },
    { type: "seo", title: "Analytics & Data", desc: "Real-time dashboards, attribution modelling, and conversion intelligence.", page: "marketing-services" },
  ];

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
      {/* Badge */}
      <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s" }}>
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-[13px] font-medium">Full-Service Growth Infrastructure</span>
        </div>
      </div>

      {/* Main heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-[1.1] tracking-tight mb-5"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s" }}>
        <span className="text-white">Welcome to </span>
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">HotBot Studios</span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-300 text-lg md:text-xl text-center mb-14"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(25px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s" }}>
        Choose your growth engine
      </p>

      {/* Service cards 3×3 grid */}
      <div className="services-grid max-w-6xl w-full"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s" }}>
        {services.map((s, i) => (
          <ServiceCard key={i} index={i} type={s.type} title={s.title} desc={s.desc} page={s.page} navigate={navigate} featured={s.featured} products={s.products} />
        ))}
      </div>
    </section>
  );
}

// ─── STATS SECTION ───
function StatsSection() {
  const stats = [
    { value: 200, suffix: "%", label: "Avg Conversion Increase" },
    { value: 150, suffix: "+", label: "Projects Delivered" },
    { value: 99, suffix: "%", label: "Client Satisfaction" },
    { value: 42, suffix: "+", label: "Enterprise Clients" },
  ];
  return (
    <section className="relative z-10 py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-slate-300/70 text-sm">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CLIENT LOGOS ───
function ClientLogos() {
  const clients = [
    { name: "BADIANI", short: "B" },
    { name: "MINISO", short: "M" },
    { name: "Our Chemist", short: "OC" },
    { name: "Mudra", short: "Mu" },
    { name: "Oysters", short: "Oy" },
    { name: "Times Internet", short: "TI" },
    { name: "Tribes India", short: "TI" },
    { name: "Wings 4 Fashion", short: "W4" },
    { name: "WSCC", short: "WS" },
    { name: "Namo E Waste", short: "NE" },
    { name: "Timekeeperz", short: "TK" },
    { name: "Your Brand", short: "+" },
  ];
  const [hovIdx, setHovIdx] = useState(-1);
  return (
    <section className="relative z-10 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal><p style={{ textAlign: "center", color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 40 }}>Trusted by teams worldwide</p></Reveal>
        <div className="client-logo-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
          {clients.map((c, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(-1)}
                style={{
                  background: hovIdx === i ? "#ffffff" : "rgba(255,255,255,0.95)",
                  borderRadius: 14,
                  padding: "24px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 100,
                  border: `1px solid ${hovIdx === i ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.06)"}`,
                  boxShadow: hovIdx === i ? "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(59,130,246,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.3s ease",
                  transform: hovIdx === i ? "translateY(-3px)" : "none",
                  cursor: "default",
                }}>
                {/* Placeholder for logo — replace with <img> later */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: hovIdx === i ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                  border: `1px solid ${hovIdx === i ? "transparent" : "#e2e8f0"}`,
                }}>
                  <span style={{
                    fontSize: c.short === "+" ? 20 : 13,
                    fontWeight: 700,
                    color: hovIdx === i ? "white" : "#64748b",
                    transition: "color 0.3s",
                    letterSpacing: "-0.02em",
                  }}>{c.short}</span>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: hovIdx === i ? "#1e293b" : "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  textAlign: "center",
                  lineHeight: 1.3,
                  transition: "color 0.3s",
                }}>{c.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <style>{`
          @media (max-width: 768px) { .client-logo-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media (max-width: 480px) { .client-logo-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        `}</style>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS SECTION ───
function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const timerRef = useRef(null);

  const testimonials = [
    { name: "Ravi Sharma", role: "CEO, Timekeeperz", quote: "HotBot Studios transformed our digital presence completely. Our conversions increased by 200% within the first quarter. Their Mark-Tech approach is unlike anything we've experienced with other agencies.", color: "#3b82f6", metric: "+200%", metricLabel: "Conversions" },
    { name: "Priya Kapoor", role: "Marketing Head, Oysters", quote: "The AI chatbot they deployed handles 80% of our customer queries automatically. Our team can now focus on high-value tasks instead of repetitive questions. Sales increased 25% in just three months.", color: "#8b5cf6", metric: "+25%", metricLabel: "Sales Growth" },
    { name: "Amit Verma", role: "Founder, Namo E Waste", quote: "From SEO to social media to website redesign — HotBot handled everything with precision. Our brand value grew 100% and we're now recognized as a leader in our space. Truly the best digital marketing services.", color: "#06b6d4", metric: "+100%", metricLabel: "Brand Value" },
    { name: "Sarah Cohen", role: "Director, Badiani New York", quote: "Their UI/UX consulting completely reimagined our e-commerce experience. The conversion rate jumped 65% after the redesign. They understand both aesthetics and business outcomes.", color: "#ec4899", metric: "+65%", metricLabel: "Conversion Rate" },
    { name: "Jaspreet Singh", role: "VP Digital, Times Internet", quote: "Working with HotBot on our automation infrastructure transformed our operations. They integrated 15+ platforms into a unified workflow that saved our team over 200 hours per month.", color: "#f59e0b", metric: "200hrs", metricLabel: "Saved Monthly" },
    { name: "Meera Patel", role: "CMO, Wings 4 Fashion", quote: "The PR strategy HotBot developed got us featured in 12 major publications within two months. Our brand awareness tripled and the quality of inbound leads improved dramatically.", color: "#10b981", metric: "12+", metricLabel: "Media Features" },
  ];

  // Avatar component — initials with gradient
  const Avatar = ({ name, color, size = 14, className = "" }) => {
    const initials = name.split(" ").map(n => n[0]).join("");
    return (
      <div className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
        style={{ width: size * 4, height: size * 4, background: `linear-gradient(135deg, ${color}, ${color}88)`, fontSize: size * 1.1 }}>
        {initials}
      </div>
    );
  };

  const goTo = useCallback((idx, dir) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setActive(idx);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const next = useCallback(() => goTo((active + 1) % testimonials.length, 1), [active, goTo, testimonials.length]);
  const prev = useCallback(() => goTo((active - 1 + testimonials.length) % testimonials.length, -1), [active, goTo, testimonials.length]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const resetTimer = () => { clearInterval(timerRef.current); timerRef.current = setInterval(next, 5000); };

  // Drag/swipe handling
  const onDragStart = (e) => setDragStart(e.touches ? e.touches[0].clientX : e.clientX);
  const onDragEnd = (e) => {
    if (dragStart === null) return;
    const end = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart - end;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetTimer(); }
    setDragStart(null);
  };

  const t = testimonials[active];
  const prevIdx = (active - 1 + testimonials.length) % testimonials.length;
  const nextIdx = (active + 1) % testimonials.length;

  return (
    <section className="relative z-10 py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">What Our Clients Say</h2>
          <p className="text-slate-500 text-center mb-10 max-w-lg mx-auto">Real results from real partnerships — trusted by brands worldwide.</p>
        </Reveal>

        {/* Floating Avatar Strip — clickable selector */}
        <Reveal>
          <div className="flex justify-center items-center gap-3 mb-14">
            {testimonials.map((tm, i) => (
              <button key={i} onClick={() => { goTo(i, i > active ? 1 : -1); resetTimer(); }}
                className="relative group/av transition-all duration-500"
                style={{
                  transform: i === active ? "scale(1.25) translateY(-4px)" : "scale(1)",
                  zIndex: i === active ? 10 : 1,
                }}>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden transition-all duration-500"
                  style={{
                    border: i === active ? "2px solid rgba(59,130,246,0.8)" : "2px solid rgba(255,255,255,0.08)",
                    boxShadow: i === active ? "0 0 20px rgba(59,130,246,0.3), 0 4px 15px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
                    filter: i === active ? "brightness(1.1)" : "brightness(0.6) grayscale(0.3)",
                  }}>
                  <Avatar name={tm.name} color={tm.color} size={3.5} />
                </div>
                {/* Active indicator dot */}
                {i === active && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" style={{ animation: "dotPulse 2s ease-in-out infinite" }} />
                )}
                {/* Name tooltip on hover */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/av:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] text-slate-500 font-medium">{tm.name.split(" ")[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Slider stage */}
        <div className="relative" onMouseDown={onDragStart} onMouseUp={onDragEnd} onTouchStart={onDragStart} onTouchEnd={onDragEnd}>
          {/* Side fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-20 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0e1a, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-20 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0e1a, transparent)" }} />

          {/* 3-card carousel */}
          <div className="flex items-stretch justify-center gap-5 relative select-none" style={{ minHeight: 320, perspective: "1200px" }}>

            {/* Previous card */}
            <div className="hidden lg:flex w-64 flex-shrink-0 cursor-pointer items-center" onClick={() => { prev(); resetTimer(); }}>
              <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 transition-all duration-700 hover:bg-white/[0.04]"
                style={{ opacity: 0.35, transform: "translateX(20px) scale(0.88) rotateY(6deg)", transformOrigin: "right center", filter: "blur(0.8px)" }}>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">"{testimonials[prevIdx].quote}"</p>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar name={testimonials[prevIdx].name} color={testimonials[prevIdx].color} size={1.5} className="opacity-60" />
                  <span className="text-slate-700 text-[11px]">{testimonials[prevIdx].name}</span>
                </div>
              </div>
            </div>

            {/* Active card */}
            <div className="flex-1 max-w-xl">
              <div
                key={active}
                className="relative rounded-3xl overflow-hidden h-full"
                style={{
                  animation: `slideCard${direction > 0 ? "Right" : "Left"} 0.6s cubic-bezier(0.16,1,0.3,1)`,
                  background: "linear-gradient(145deg, rgba(15,15,20,0.95) 0%, rgba(8,8,14,0.98) 50%, rgba(12,12,18,0.95) 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)",
                }}
              >
                {/* Glossy reflection on top */}
                <div className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)", borderRadius: "24px 24px 0 0" }} />
                {/* Animated top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-10">
                  <div className="h-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-borderSlide" />
                </div>
                {/* Top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-blue-500/[0.06] blur-[50px] rounded-full" />
                {/* Bottom edge glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
                {/* Edge specular */}
                <div className="absolute top-0 left-[5%] right-[5%] h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), rgba(255,255,255,0.25), rgba(255,255,255,0.15), transparent)" }} />

                <div className="relative p-8 md:p-10">
                  {/* Metric badge — top right */}
                  <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
                    <div className="relative overflow-hidden bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl px-5 py-3 text-center">
                      <div className="absolute inset-0 shimmer-sweep opacity-50" />
                      <div className="relative text-blue-400 text-2xl md:text-3xl font-bold leading-none">{t.metric}</div>
                      <div className="relative text-blue-400/50 text-[10px] font-medium mt-1 tracking-wide uppercase">{t.metricLabel}</div>
                    </div>
                  </div>

                  {/* Animated stars */}
                  <div className="flex gap-1.5 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <svg key={`${active}-${j}`} width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" className="testimonial-star" style={{ animationDelay: `${j * 0.08}s` }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote text — no overlapping icon */}
                  <div className="relative mb-8 pr-16 md:pr-24">
                    <p className="text-slate-200 text-base md:text-lg leading-relaxed font-light">"{t.quote}"</p>
                  </div>

                  {/* Small decorative quote — far bottom-right, no overlap */}
                  <svg className="absolute bottom-8 right-8 w-10 h-10 text-white/[0.03] pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                  </svg>

                  {/* Divider */}
                  <div className="w-12 h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent mb-6" />

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="rounded-full overflow-hidden transition-all duration-500"
                        style={{ border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 0 20px rgba(59,130,246,0.15)" }}>
                        <Avatar name={t.name} color={t.color} size={3.5} />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">{t.name}</p>
                      <p className="text-slate-400 text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next card */}
            <div className="hidden lg:flex w-64 flex-shrink-0 cursor-pointer items-center" onClick={() => { next(); resetTimer(); }}>
              <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 transition-all duration-700 hover:bg-white/[0.04]"
                style={{ opacity: 0.35, transform: "translateX(-20px) scale(0.88) rotateY(-6deg)", transformOrigin: "left center", filter: "blur(0.8px)" }}>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">"{testimonials[nextIdx].quote}"</p>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar name={testimonials[nextIdx].name} color={testimonials[nextIdx].color} size={1.5} className="opacity-60" />
                  <span className="text-slate-700 text-[11px]">{testimonials[nextIdx].name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button onClick={() => { prev(); resetTimer(); }}
              className="w-11 h-11 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 active:scale-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => { goTo(i, i > active ? 1 : -1); resetTimer(); }}
                  className="relative h-2 rounded-full transition-all duration-500 overflow-hidden hover:opacity-80"
                  style={{ width: i === active ? 36 : 8, background: i === active ? "transparent" : "rgba(255,255,255,0.12)" }}>
                  {i === active && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-white/[0.08]" />
                      <div key={`prog-${active}`} className="absolute inset-0 rounded-full bg-blue-500 testimonial-progress" />
                    </>
                  )}
                </button>
              ))}
            </div>

            <button onClick={() => { next(); resetTimer(); }}
              className="w-11 h-11 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 active:scale-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Slide counter */}
          <p className="text-center text-slate-600 text-xs mt-4 font-mono tracking-widest">{String(active + 1).padStart(2, "0")} <span className="text-slate-700">/</span> {String(testimonials.length).padStart(2, "0")}</p>
        </div>
      </div>

    </section>
  );
}

// ─── CTA SECTION (Clear Glass) ───
function CTASection({ navigate, openForm }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const cardRef = useRef(null);

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <section className="relative z-10 py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <div ref={cardRef} className="relative group cursor-default" onMouseMove={handleMove} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.1), transparent 70%)" }} />

            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] rounded-3xl overflow-hidden">
              <div className="absolute inset-0 animate-borderShift" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(6,182,212,0.2), rgba(139,92,246,0.15), rgba(59,130,246,0.35))" }} />
            </div>

            {/* Clear glass card — NOT frosted */}
            <div className="relative rounded-3xl overflow-hidden" style={{
              background: "linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.0) 60%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.3)",
            }}>
              {/* Cursor-following specular highlight — clear glass reflection */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: hovering ? 1 : 0.3,
                  background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.07), transparent 60%)`,
                }} />

              {/* Top edge specular — sharp glass edge reflection */}
              <div className="absolute top-0 left-[5%] right-[5%] h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), rgba(255,255,255,0.5), rgba(255,255,255,0.3), transparent)" }} />

              {/* Diagonal refraction streak */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-[0.04]">
                <div className="absolute w-[200%] h-[1px] bg-white rotate-[20deg] top-[30%] -left-[50%]" />
                <div className="absolute w-[200%] h-[1px] bg-white rotate-[20deg] top-[70%] -left-[30%]" />
              </div>

              {/* Content — visible through glass */}
              <div className="relative z-10 p-12 md:p-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                  style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-400 text-xs font-medium">Free Strategy Session</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Ready to accelerate your growth?</h2>
                <p className="text-slate-200/80 text-lg mb-10 max-w-xl mx-auto">Book a free strategy call and discover how our Mark-Tech approach can transform your business into a brand.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => openForm("strategy-call")} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                    Get Started →
                  </button>
                  <button onClick={() => openForm("contact-sales")} className="text-sm font-semibold text-slate-300 rounded-xl px-8 py-3.5 transition-all duration-300 hover:bg-white/[0.06]"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── HOME PAGE ───
function HomePage({ navigate, openForm }) {
  return (
    <>
      <HeroSection navigate={navigate} />
      <StatsSection />
      <ClientLogos />
      <TestimonialsSection />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ─── PAGE TEMPLATE ───
function PageHeader({ tag, title, subtitle }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section className="relative z-10 pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
          <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">{tag}</span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-5" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(25px)", transition: "all 0.7s ease 0.35s" }}>{title}</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(25px)", transition: "all 0.7s ease 0.5s" }}>{subtitle}</p>
      </div>
    </section>
  );
}

function ContentBlock({ children }) {
  return <section className="relative z-10 py-16"><div className="max-w-4xl mx-auto px-6">{children}</div></section>;
}

// ─── SUB-SERVICES GRID (homepage-matching glassmorphism) ───
function SubServices({ items }) {
  return (
    <section className="relative z-10 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const [hov, setHov] = useState(false);
            const [mp, setMp] = useState({ x: 50, y: 50 });
            const ref = useRef(null);
            return (
              <Reveal key={i} delay={i * 0.08}>
                <div ref={ref}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() => setHov(false)}
                  onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setMp({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
                  className="relative rounded-2xl p-6 h-full cursor-default overflow-hidden transition-all duration-500"
                  style={{
                    background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${hov ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    transform: hov ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.2), 0 0 30px rgba(59,130,246,0.06)' : 'none',
                  }}>
                  {/* Cursor glow */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500" style={{ opacity: hov ? 1 : 0, background: `radial-gradient(300px circle at ${mp.x}% ${mp.y}%, rgba(59,130,246,0.1), transparent 60%)` }} />
                  {/* Shimmer */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.4s' }}>
                    <div className="absolute inset-0 shimmer-sweep" />
                  </div>
                  {/* Corner dot */}
                  <div className="absolute top-4 right-4 w-[6px] h-[6px] rounded-full transition-all duration-500" style={{ backgroundColor: hov ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.3)', boxShadow: hov ? '0 0 10px rgba(59,130,246,0.5)' : 'none' }} />
                  {/* Icon */}
                  <div className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-500"
                    style={{
                      background: hov ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(6,182,212,0.15))' : 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))',
                      border: `1px solid ${hov ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.15)'}`,
                      transform: hov ? 'translateY(-2px) scale(1.08)' : 'none',
                      boxShadow: hov ? '0 8px 20px rgba(59,130,246,0.15)' : 'none',
                    }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={hov ? '#60a5fa' : '#3b82f6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: hov ? 'drop-shadow(0 0 6px rgba(96,165,250,0.4))' : 'none', transition: 'all 0.4s' }}>{item.icon}</svg>
                  </div>
                  <h3 className="relative text-white font-semibold text-base mb-2 transition-colors duration-300" style={{ color: hov ? '#93c5fd' : '#f1f5f9' }}>{item.title}</h3>
                  <p className="relative text-slate-300/80 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
function H2({ children }) { return <Reveal><h2 className="text-2xl md:text-3xl font-bold text-white mt-16 mb-5">{children}</h2></Reveal>; }
function H3({ children }) { return <Reveal><h3 className="text-lg font-semibold text-white mt-10 mb-3">{children}</h3></Reveal>; }
function P({ children }) { return <Reveal><p className="text-slate-200/90 leading-relaxed mb-5">{children}</p></Reveal>; }

// ─── MID-CONTENT CREATIVE SVGs ───
function MidCreative({ type }) {
  const scenes = {
    growth: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(59,130,246,0.02)" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>
        {[60,130,200,270,340,410,480,550,620].map((x,i)=><rect key={i} x={x-12} y={140-(20+i*10+(i%3)*6)} width="24" height={20+i*10+(i%3)*6} rx="3" fill={`rgba(59,130,246,${0.08+i*0.04})`}><animate attributeName="height" from="0" to={20+i*10+(i%3)*6} dur="0.8s" begin={`${i*0.06}s`} fill="freeze"/><animate attributeName="y" from="140" to={140-(20+i*10+(i%3)*6)} dur="0.8s" begin={`${i*0.06}s`} fill="freeze"/></rect>)}
        <polyline points="60,125 130,112 200,100 270,88 340,80 410,65 480,52 550,40 620,30" stroke="rgba(59,130,246,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"><animate attributeName="stroke-dasharray" from="0 800" to="800 0" dur="1.5s" fill="freeze"/></polyline>
        {[60,200,340,480,620].map((x,i)=><circle key={`d${i}`} cx={x} cy={125-i*24} r="3" fill="#3b82f6" opacity="0.5"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/></circle>)}
      </svg>
    ),
    network: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(139,92,246,0.02)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5"/>
        {[[100,50],[250,30],[400,80],[550,40],[600,110],[150,120],[350,130],[500,100]].map(([cx,cy],i)=>(<g key={i}><circle cx={cx} cy={cy} r={8+i*0.5} fill={`rgba(139,92,246,${0.05+i*0.02})`} stroke="rgba(139,92,246,0.2)" strokeWidth="0.5"><animate attributeName="r" values={`${7+i*0.5};${10+i*0.5};${7+i*0.5}`} dur={`${3+i*0.4}s`} repeatCount="indefinite"/></circle>{i<7&&<line x1={cx} y1={cy} x2={[[250,30],[400,80],[550,40],[600,110],[150,120],[350,130],[500,100]][i][0]} y2={[[250,30],[400,80],[550,40],[600,110],[150,120],[350,130],[500,100]][i][1]} stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"/>}</g>))}
        <circle r="2" fill="#8b5cf6" opacity="0.7"><animateMotion dur="4s" repeatCount="indefinite" path="M100,50 L250,30 L400,80 L550,40 L600,110"/><animate attributeName="opacity" values="0;0.8;0" dur="4s" repeatCount="indefinite"/></circle>
      </svg>
    ),
    code: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(6,182,212,0.02)" stroke="rgba(6,182,212,0.06)" strokeWidth="0.5"/>
        <rect x="20" y="12" width="660" height="136" rx="8" fill="rgba(6,182,212,0.015)"/>
        <circle cx="40" cy="26" r="4" fill="rgba(239,68,68,0.35)"/><circle cx="54" cy="26" r="4" fill="rgba(234,179,8,0.35)"/><circle cx="68" cy="26" r="4" fill="rgba(34,197,94,0.35)"/>
        {[0,1,2,3,4,5].map(i=><g key={i}><text x="38" y={50+i*18} fill="rgba(100,116,139,0.2)" fontSize="8" fontFamily="monospace">{i+1}</text><rect x={55} y={42+i*18} width={80+(i%3)*60+Math.round(Math.sin(i*1.5)*30)} height="8" rx="2" fill={`rgba(6,182,212,${0.04+i*0.015})`}/>{i%2===0&&<rect x={145+(i%3)*60} y={42+i*18} width={40+i*8} height="8" rx="2" fill="rgba(139,92,246,0.06)"/>}</g>)}
        <rect x="550" y="42" width="2" height="12" fill="rgba(6,182,212,0.6)"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>
      </svg>
    ),
    funnel: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(34,197,94,0.02)" stroke="rgba(34,197,94,0.06)" strokeWidth="0.5"/>
        {[{w:600,y:20,c:"59,130,246",l:"Awareness — 100K visitors"},{w:460,y:52,c:"139,92,246",l:"Interest — 32K engaged"},{w:320,y:84,c:"6,182,212",l:"Consideration — 8.4K leads"},{w:180,y:116,c:"34,197,94",l:"Conversion — 2.1K customers"}].map((s,i)=><g key={i}><rect x={(700-s.w)/2} y={s.y} width={s.w} height="26" rx="6" fill={`rgba(${s.c},0.06)`} stroke={`rgba(${s.c},0.15)`} strokeWidth="0.5"><animate attributeName="width" from="0" to={s.w} dur="0.6s" begin={`${i*0.15}s`} fill="freeze"/></rect><text x="350" y={s.y+17} textAnchor="middle" fill={`rgba(${s.c},0.5)`} fontSize="9" fontFamily="sans-serif">{s.l}</text></g>)}
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(236,72,153,0.02)" stroke="rgba(236,72,153,0.06)" strokeWidth="0.5"/>
        <path d="M350 20 L310 40 L310 90 C310 115 350 140 350 140 C350 140 390 115 390 90 L390 40 Z" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" strokeWidth="1"><animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/></path>
        <polyline points="335,80 345,90 365,65" stroke="rgba(34,197,94,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"><animate attributeName="stroke-dasharray" from="0 60" to="60 0" dur="1s" begin="0.5s" fill="freeze"/></polyline>
        {[[150,50,"Encryption"],[550,50,"Monitoring"],[150,110,"GDPR"],[550,110,"Pen Testing"]].map(([x,y,t],i)=>(<g key={i}><rect x={x-45} y={y-12} width="90" height="24" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"/><text x={x} y={y+4} textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize="8">{t}</text><line x1={x+(x<350?45:-45)} y1={y} x2={x<350?310:390} y2="80" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" strokeDasharray="3 3"/></g>))}
      </svg>
    ),
    users: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(234,179,8,0.02)" stroke="rgba(234,179,8,0.06)" strokeWidth="0.5"/>
        {[[120,60],[250,45],[380,70],[510,50],[640,65]].map(([cx,cy],i)=>(<g key={i}><circle cx={cx} cy={cy-14} r="14" fill={`rgba(59,130,246,${0.06+i*0.02})`} stroke="rgba(59,130,246,0.15)" strokeWidth="0.5"/><rect x={cx-16} y={cy+4} width="32" height="22" rx="8" fill={`rgba(59,130,246,${0.04+i*0.02})`}/>{i<4&&<line x1={cx+18} y1={cy} x2={[250,380,510,640][i]-18} y2={[45,70,50,65][i]} stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>}</g>))}
        <rect x="140" y="110" width="420" height="30" rx="6" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <rect x="148" y="118" width="180" height="5" rx="2" fill="rgba(59,130,246,0.1)"><animate attributeName="width" from="0" to="180" dur="2s" fill="freeze"/></rect>
        <text x="530" y="129" fill="rgba(59,130,246,0.3)" fontSize="8">4.8/5 satisfaction</text>
      </svg>
    ),
    // ─── PAGE-SPECIFIC INFOGRAPHICS ───
    seoRank: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(34,197,94,0.02)" stroke="rgba(34,197,94,0.06)" strokeWidth="0.5"/>
        {[{x:80,kw:"digital marketing",pos:1,w:520},{x:80,kw:"SEO services UK",pos:2,w:480},{x:80,kw:"social media agency",pos:3,w:440},{x:80,kw:"PPC management",pos:5,w:360}].map((r,i)=><g key={i}><rect x={r.x} y={18+i*34} width={r.w} height="26" rx="6" fill={`rgba(34,197,94,${0.08-i*0.015})`} stroke="rgba(34,197,94,0.12)" strokeWidth="0.5"><animate attributeName="width" from="0" to={r.w} dur="0.7s" begin={`${i*0.12}s`} fill="freeze"/></rect><text x={r.x+12} y={35+i*34} fill="rgba(34,197,94,0.5)" fontSize="9">{r.kw}</text><text x={r.x+r.w-30} y={35+i*34} fill="rgba(34,197,94,0.7)" fontSize="9" fontWeight="bold">#{r.pos}</text></g>)}
        <text x="620" y="50" fill="rgba(34,197,94,0.3)" fontSize="8" textAnchor="middle">Google</text><text x="620" y="62" fill="rgba(34,197,94,0.3)" fontSize="8" textAnchor="middle">Page 1</text>
      </svg>
    ),
    chatflow: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(139,92,246,0.02)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5"/>
        {[{x:40,y:30,w:180,a:"user",t:"Hi, I need help with..."},{x:480,y:30,w:190,a:"bot",t:"Of course! Let me check..."},{x:40,y:80,w:200,a:"user",t:"Can you book for Tuesday?"},{x:460,y:80,w:210,a:"bot",t:"Done! Confirmed for Tue 2pm"}].map((m,i)=><g key={i}><rect x={m.x} y={m.y} width={m.w} height="36" rx="10" fill={m.a==="user"?"rgba(255,255,255,0.04)":"rgba(139,92,246,0.06)"} stroke={m.a==="user"?"rgba(255,255,255,0.06)":"rgba(139,92,246,0.12)"} strokeWidth="0.5"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${i*0.4}s`} fill="freeze"/></rect><text x={m.x+12} y={m.y+22} fill={m.a==="user"?"rgba(255,255,255,0.4)":"rgba(139,92,246,0.5)"} fontSize="8.5">{m.t}</text></g>)}
        <circle cx="350" cy="140" r="3" fill="rgba(34,197,94,0.4)"/><text x="362" y="143" fill="rgba(34,197,94,0.35)" fontSize="7">AI resolved · 14s avg</text>
      </svg>
    ),
    pipeline: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(59,130,246,0.02)" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>
        {[{x:50,l:"Deploy",c:"59,130,246"},{x:190,l:"Test",c:"139,92,246"},{x:330,l:"Build",c:"6,182,212"},{x:470,l:"Review",c:"34,197,94"},{x:610,l:"Ship",c:"234,179,8"}].map((s,i)=><g key={i}><circle cx={s.x} cy="55" r="20" fill={`rgba(${s.c},0.06)`} stroke={`rgba(${s.c},0.2)`} strokeWidth="0.8"><animate attributeName="r" values="18;22;18" dur={`${2.5+i*0.3}s`} repeatCount="indefinite"/></circle><text x={s.x} y="58" textAnchor="middle" fill={`rgba(${s.c},0.5)`} fontSize="8" fontWeight="bold">{s.l}</text>{i<4&&<line x1={s.x+22} y1="55" x2={[190,330,470,610][i]-22} y2="55" stroke={`rgba(${s.c},0.1)`} strokeWidth="0.5" strokeDasharray="4 3"><animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.5s" repeatCount="indefinite"/></line>}</g>)}
        <rect x="120" y="100" width="460" height="8" rx="4" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.06)" strokeWidth="0.3"/>
        <rect x="120" y="100" width="0" height="8" rx="4" fill="rgba(59,130,246,0.12)"><animate attributeName="width" from="0" to="460" dur="3s" fill="freeze"/></rect>
        <text x="350" y="128" textAnchor="middle" fill="rgba(59,130,246,0.25)" fontSize="7">CI/CD Pipeline — avg 43s build</text>
      </svg>
    ),
    mediaReach: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(236,72,153,0.02)" stroke="rgba(236,72,153,0.06)" strokeWidth="0.5"/>
        <circle cx="350" cy="80" r="35" fill="rgba(236,72,153,0.04)" stroke="rgba(236,72,153,0.15)" strokeWidth="0.5"><animate attributeName="r" values="33;38;33" dur="4s" repeatCount="indefinite"/></circle>
        <text x="350" y="77" textAnchor="middle" fill="rgba(236,72,153,0.5)" fontSize="10" fontWeight="bold">BRAND</text>
        <text x="350" y="90" textAnchor="middle" fill="rgba(236,72,153,0.3)" fontSize="7">340M impressions</text>
        {[[180,40,"BBC"],[520,40,"Forbes"],[120,110,"Reuters"],[580,110,"TechCrunch"],[350,15,"The Times"],[200,130,"Guardian"],[500,130,"Wired"]].map(([x,y,n],i)=><g key={i}><rect x={x-28} y={y-9} width="56" height="18" rx="4" fill="rgba(236,72,153,0.04)" stroke="rgba(236,72,153,0.1)" strokeWidth="0.3"/><text x={x} y={y+4} textAnchor="middle" fill="rgba(236,72,153,0.4)" fontSize="7.5">{n}</text><line x1={x+(x<350?28:-28)} y1={y} x2={350+(x<350?-35:35)} y2="80" stroke="rgba(236,72,153,0.05)" strokeWidth="0.3" strokeDasharray="2 2"/></g>)}
      </svg>
    ),
    wireframe: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(6,182,212,0.02)" stroke="rgba(6,182,212,0.06)" strokeWidth="0.5"/>
        <rect x="40" y="15" width="280" height="130" rx="8" fill="rgba(6,182,212,0.02)" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5"/>
        <rect x="50" y="25" width="120" height="8" rx="2" fill="rgba(6,182,212,0.08)"/><rect x="50" y="40" width="80" height="5" rx="1" fill="rgba(6,182,212,0.04)"/>
        <rect x="50" y="55" width="260" height="40" rx="4" fill="rgba(6,182,212,0.03)" stroke="rgba(6,182,212,0.06)" strokeWidth="0.3"/>
        <rect x="50" y="105" width="120" height="28" rx="6" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5"/><text x="110" y="123" textAnchor="middle" fill="rgba(6,182,212,0.4)" fontSize="8">CTA Button</text>
        <rect x="380" y="15" width="280" height="130" rx="8" fill="rgba(139,92,246,0.02)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"/>
        {[0,1,2].map(i=><g key={i}><rect x="390" y={25+i*42} width="260" height="34" rx="4" fill="rgba(139,92,246,0.03)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.3"/><circle cx="410" cy={42+i*42} r="8" fill="rgba(139,92,246,0.06)"/><rect x="425" y={38+i*42} width="80" height="4" rx="1" fill="rgba(139,92,246,0.06)"/><rect x="425" y={46+i*42} width="50" height="3" rx="1" fill="rgba(139,92,246,0.03)"/></g>)}
        <path d="M325 80 L375 80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3 2"><animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.5s" repeatCount="indefinite"/></path>
      </svg>
    ),
    abTest: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(234,179,8,0.02)" stroke="rgba(234,179,8,0.06)" strokeWidth="0.5"/>
        <rect x="60" y="20" width="250" height="120" rx="8" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"/>
        <text x="185" y="42" textAnchor="middle" fill="rgba(59,130,246,0.5)" fontSize="10" fontWeight="bold">Variant A</text>
        <rect x="80" y="52" width="210" height="6" rx="2" fill="rgba(59,130,246,0.04)"/><rect x="80" y="52" width="130" height="6" rx="2" fill="rgba(59,130,246,0.15)"><animate attributeName="width" from="0" to="130" dur="1.2s" fill="freeze"/></rect>
        <text x="80" y="78" fill="rgba(59,130,246,0.4)" fontSize="8">CTR 3.2%</text><text x="80" y="92" fill="rgba(59,130,246,0.4)" fontSize="8">Conv 1.8%</text><text x="80" y="106" fill="rgba(59,130,246,0.4)" fontSize="8">Revenue £12.4K</text>
        <rect x="390" y="20" width="250" height="120" rx="8" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.5"/>
        <text x="515" y="42" textAnchor="middle" fill="rgba(34,197,94,0.5)" fontSize="10" fontWeight="bold">Variant B ✓</text>
        <rect x="410" y="52" width="210" height="6" rx="2" fill="rgba(34,197,94,0.04)"/><rect x="410" y="52" width="180" height="6" rx="2" fill="rgba(34,197,94,0.2)"><animate attributeName="width" from="0" to="180" dur="1.2s" fill="freeze"/></rect>
        <text x="410" y="78" fill="rgba(34,197,94,0.5)" fontSize="8">CTR 5.1% (+59%)</text><text x="410" y="92" fill="rgba(34,197,94,0.5)" fontSize="8">Conv 3.4% (+89%)</text><text x="410" y="106" fill="rgba(34,197,94,0.5)" fontSize="8">Revenue £23.1K (+86%)</text>
        <text x="350" y="155" textAnchor="middle" fill="rgba(234,179,8,0.3)" fontSize="7">Statistical significance: 98.4%</text>
      </svg>
    ),
    roadmap: (
      <svg viewBox="0 0 700 160" fill="none" className="w-full h-auto">
        <rect x="0" y="0" width="700" height="160" rx="12" fill="rgba(59,130,246,0.02)" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>
        <line x1="60" y1="80" x2="640" y2="80" stroke="rgba(59,130,246,0.08)" strokeWidth="1"/>
        {[{x:100,l:"Q1",t:"Audit & Strategy",done:true},{x:250,l:"Q2",t:"Launch Campaigns",done:true},{x:400,l:"Q3",t:"Optimise & Scale",done:false},{x:550,l:"Q4",t:"Expand Markets",done:false}].map((q,i)=><g key={i}><circle cx={q.x} cy="80" r="12" fill={q.done?"rgba(34,197,94,0.1)":"rgba(59,130,246,0.04)"} stroke={q.done?"rgba(34,197,94,0.3)":"rgba(59,130,246,0.15)"} strokeWidth="0.8"/>{q.done&&<polyline points={`${q.x-4},80 ${q.x-1},83 ${q.x+5},76`} stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" fill="none"/>}<text x={q.x} y="60" textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize="9" fontWeight="bold">{q.l}</text><text x={q.x} y="108" textAnchor="middle" fill="rgba(59,130,246,0.3)" fontSize="7.5">{q.t}</text></g>)}
        <line x1="60" y1="80" x2="250" y2="80" stroke="rgba(34,197,94,0.2)" strokeWidth="2"><animate attributeName="x2" from="60" to="250" dur="1s" fill="freeze"/></line>
      </svg>
    ),
  };
  return (
    <Reveal>
      <div className="my-8 rounded-2xl overflow-hidden" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {scenes[type] || scenes.growth}
      </div>
    </Reveal>
  );
}

// ─── INTERACTIVE SEO COMPONENTS (homepage-matched) ───

function ServiceStats({ stats }) {
  return (
    <section className="relative z-10 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className={`grid grid-cols-2 ${stats.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          {stats.map((s, i) => {
            const [hov, setHov] = useState(false);
            return (
              <Reveal key={i} delay={i * 0.1}>
                <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  className="relative rounded-2xl p-5 text-center overflow-hidden transition-all duration-500 backdrop-blur-xl"
                  style={{
                    background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${hov ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    transform: hov ? 'translateY(-3px) scale(1.02)' : 'none',
                    boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.2), 0 0 40px rgba(59,130,246,0.08)' : 'none',
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.06] to-transparent transition-opacity duration-500" style={{ opacity: hov ? 1 : 0 }} />
                  <div className="absolute top-3 right-3 w-[5px] h-[5px] rounded-full transition-all duration-500" style={{ backgroundColor: hov ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.25)', boxShadow: hov ? '0 0 8px rgba(59,130,246,0.5)' : 'none' }} />
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-bold mb-1 transition-colors duration-300" style={{ color: hov ? '#93c5fd' : '#60a5fa' }}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} duration={1800} />
                    </div>
                    <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{s.label}</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Process steps — immersive horizontal cards with icons + animated connector
function ProcessSteps({ title, steps }) {
  const [active, setActive] = useState(0);
  const stepIcons = [
    <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>,
    <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>,
    <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  ];
  return (
    <section className="relative z-10 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">{title}</h2>
          <p className="text-slate-400 text-center mb-14 max-w-lg mx-auto">Our proven methodology delivers results consistently for UK businesses</p>
        </Reveal>

        {/* Horizontal step indicators */}
        <div className="relative flex items-center justify-between mb-12 max-w-2xl mx-auto">
          {/* Connector line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.06]" />
          <div className="absolute top-1/2 left-0 h-px bg-gradient-to-r from-blue-500/60 to-blue-500/10 transition-all duration-700" style={{ width: `${(active / (steps.length - 1)) * 100}%` }} />
          {steps.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="relative z-10 flex flex-col items-center gap-2 group" style={{ width: 64 }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: active === i ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2))' : active > i ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${active === i ? 'rgba(59,130,246,0.6)' : active > i ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: active === i ? '0 0 25px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                  transform: active === i ? 'scale(1.1)' : 'scale(1)',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={active >= i ? '#60a5fa' : 'rgba(148,163,184,0.3)'}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: active === i ? 'drop-shadow(0 0 6px rgba(96,165,250,0.4))' : 'none' }}>
                  {stepIcons[i] || stepIcons[0]}
                </svg>
              </div>
              <span className="text-[10px] font-semibold transition-colors duration-300" style={{ color: active === i ? '#93c5fd' : 'rgba(148,163,184,0.4)' }}>
                Step {String(i + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* Active step content card */}
        <Reveal key={active}>
          <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-500"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 40px rgba(59,130,246,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-[20%] right-[20%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }} />
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.04] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />
            </div>
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 8px 24px rgba(59,130,246,0.1)' }}>
                <span className="text-blue-400 font-bold text-xl">{String(active + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-3">{steps[active].title}</h3>
                <p className="text-slate-200/80 leading-relaxed">{steps[active].desc}</p>
                <div className="flex items-center gap-3 mt-5">
                  {active > 0 && <button onClick={() => setActive(active - 1)} className="text-slate-500 text-xs font-medium hover:text-blue-400 transition-colors flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Previous</button>}
                  {active < steps.length - 1 && <button onClick={() => setActive(active + 1)} className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors flex items-center gap-1">Next step <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// FAQ Accordion with glassmorphism
function FAQSection({ title, faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <section className="relative z-10 py-16">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">{title}</h2>
          <p className="text-slate-400 text-center mb-10">Common questions from UK businesses</p>
        </Reveal>
        <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                className="rounded-xl overflow-hidden transition-all duration-500 backdrop-blur-xl"
                style={{
                  background: open === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${open === i ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: open === i ? '0 8px 30px rgba(0,0,0,0.15), 0 0 30px rgba(59,130,246,0.04)' : 'none',
                  transform: open === i ? 'scale(1.01)' : 'scale(1)',
                }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group" itemProp="name">
                  <span className={`font-medium text-sm pr-4 transition-colors duration-300 ${open === i ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>{faq.q}</span>
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{ background: open === i ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${open === i ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className={`transition-all duration-300 ${open === i ? 'rotate-180 text-blue-400' : 'text-slate-600'}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"
                  className="overflow-hidden transition-all duration-500" style={{ maxHeight: open === i ? 300 : 0, opacity: open === i ? 1 : 0 }}>
                  <div itemProp="text" className="px-5 pb-5 text-slate-300/80 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Highlight callout with glassmorphism glow
function Highlight({ icon, stat, label, desc }) {
  return (
    <Reveal>
      <div className="my-10 relative rounded-2xl p-6 md:p-8 overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(6,182,212,0.03))',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15), 0 0 40px rgba(59,130,246,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
        <div className="absolute top-0 left-[20%] right-[20%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent)' }} />
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.06] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-[50px] translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex items-start gap-5">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 8px 24px rgba(59,130,246,0.12)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.3))' }}>{icon}</svg>
          </div>
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-bold text-blue-300" style={{ textShadow: '0 0 20px rgba(59,130,246,0.3)' }}>{stat}</span>
              <span className="text-slate-400 text-sm font-medium">{label}</span>
            </div>
            <p className="text-slate-200/80 text-sm leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// Related services with glassmorphism hover
function RelatedServices({ current, navigate }) {
  const all = [
    { key: "marketing-services", label: "Digital Marketing", desc: "SEO, SEM, social media, and performance marketing for UK businesses." },
    { key: "ai-automation", label: "AI Automation", desc: "Chatbots, workflow engines, and intelligent systems for 24/7 operations." },
    { key: "software-development", label: "Content Studio", desc: "Professional content creation, video production, and brand storytelling." },
    { key: "software-dev", label: "Software Development", desc: "Custom applications, mobile apps, SaaS platforms, and API integrations." },
    { key: "public-relations", label: "Public Relations", desc: "Strategic PR, media relations, and brand reputation management." },
    { key: "ui-ux-design", label: "UI/UX Design", desc: "User-centered design, prototyping, and conversion optimisation." },
    { key: "consultancy", label: "Marketing Consulting", desc: "Business strategy, digital transformation, and growth roadmaps." },
  ];
  const related = all.filter(s => s.key !== current).slice(0, 3);
  return (
    <section className="relative z-10 py-14">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <h2 className="text-xl font-bold text-white text-center mb-2">Explore More Services</h2>
          <p className="text-slate-400/70 text-center text-sm mb-8">Discover how our integrated services work together for UK businesses</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {related.map((s, i) => {
            const [hov, setHov] = useState(false);
            return (
              <Reveal key={s.key} delay={i * 0.1}>
                <button onClick={() => navigate(s.key)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  className="w-full text-left rounded-xl p-5 transition-all duration-500 overflow-hidden relative"
                  style={{
                    background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${hov ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    transform: hov ? 'translateY(-3px)' : 'none',
                    boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.2), 0 0 25px rgba(59,130,246,0.06)' : 'none',
                  }}>
                  <div className="absolute top-3 right-3 w-[5px] h-[5px] rounded-full transition-all duration-500" style={{ backgroundColor: hov ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.25)', boxShadow: hov ? '0 0 8px rgba(59,130,246,0.5)' : 'none' }} />
                  <h3 className="font-semibold text-sm mb-1.5 transition-colors duration-300" style={{ color: hov ? '#93c5fd' : '#f1f5f9' }}>{s.label}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium transition-all duration-300" style={{ color: hov ? '#60a5fa' : 'rgba(59,130,246,0.4)' }}>
                    Learn more <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: hov ? 'translateX(3px)' : 'none', transition: 'transform 0.3s' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ILLUSTRATION (rich animated SVG per service) ───
function PageIllustration({ type }) {
  const scenes = {
    marketing: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Dashboard frame */}
        <rect x="50" y="20" width="800" height="300" rx="16" fill="rgba(15,18,30,0.9)" stroke="rgba(59,130,246,0.15)" strokeWidth="1"/>
        <rect x="50" y="20" width="800" height="40" rx="16" fill="rgba(59,130,246,0.04)"/>
        <circle cx="78" cy="40" r="6" fill="rgba(239,68,68,0.4)"/><circle cx="98" cy="40" r="6" fill="rgba(234,179,8,0.4)"/><circle cx="118" cy="40" r="6" fill="rgba(34,197,94,0.4)"/>
        <text x="450" y="44" textAnchor="middle" fill="rgba(148,163,184,0.4)" fontSize="11" fontFamily="monospace">analytics-dashboard.hotbot.uk</text>
        {/* Mini chart - bar graph */}
        <rect x="85" y="80" width="230" height="140" rx="10" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <text x="100" y="98" fill="rgba(148,163,184,0.5)" fontSize="9" fontFamily="sans-serif">Monthly Traffic</text>
        {[0,1,2,3,4,5,6,7].map(i=><rect key={`b${i}`} x={100+i*26} y={200-(30+i*14+(i%3)*8)} width="16" height={30+i*14+(i%3)*8} rx="3" fill={`rgba(59,130,246,${0.15+i*0.05})`}><animate attributeName="height" from="0" to={30+i*14+(i%3)*8} dur="0.8s" begin={`${i*0.08}s`} fill="freeze"/><animate attributeName="y" from="200" to={200-(30+i*14+(i%3)*8)} dur="0.8s" begin={`${i*0.08}s`} fill="freeze"/></rect>)}
        {/* Line chart */}
        <rect x="340" y="80" width="230" height="140" rx="10" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <text x="355" y="98" fill="rgba(148,163,184,0.5)" fontSize="9" fontFamily="sans-serif">Conversion Rate</text>
        <polyline points="360,195 385,180 410,185 435,160 460,155 485,135 510,120 535,100 555,95" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round"><animate attributeName="stroke-dasharray" from="0 500" to="500 0" dur="1.5s" fill="freeze"/></polyline>
        <path d="M360,195 385,180 410,185 435,160 460,155 485,135 510,120 535,100 555,95 555,200 360,200Z" fill="url(#mktFill)" opacity="0.15"/>
        {/* KPI cards */}
        <rect x="595" y="80" width="230" height="62" rx="10" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <text x="610" y="100" fill="rgba(148,163,184,0.4)" fontSize="9">Organic Sessions</text>
        <text x="610" y="126" fill="rgba(59,130,246,0.8)" fontSize="22" fontWeight="bold" fontFamily="sans-serif">124,892</text>
        <text x="750" y="126" fill="rgba(34,197,94,0.7)" fontSize="11">↑ 34%</text>
        <rect x="595" y="158" width="230" height="62" rx="10" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <text x="610" y="178" fill="rgba(148,163,184,0.4)" fontSize="9">Revenue</text>
        <text x="610" y="204" fill="rgba(59,130,246,0.8)" fontSize="22" fontWeight="bold" fontFamily="sans-serif">£2.4M</text>
        <text x="730" y="204" fill="rgba(34,197,94,0.7)" fontSize="11">↑ 67%</text>
        {/* Donut chart */}
        <circle cx="160" cy="275" r="28" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="8"/>
        <circle cx="160" cy="275" r="28" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="8" strokeDasharray="110 66" strokeLinecap="round"><animate attributeName="stroke-dasharray" from="0 176" to="110 66" dur="1s" fill="freeze"/></circle>
        <text x="160" y="279" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="12" fontWeight="bold">63%</text>
        <text x="210" y="268" fill="rgba(148,163,184,0.4)" fontSize="8">SEO</text>
        <text x="210" y="282" fill="rgba(148,163,184,0.3)" fontSize="8">Social</text>
        <text x="210" y="296" fill="rgba(148,163,184,0.3)" fontSize="8">Paid</text>
        {/* Bottom status bar */}
        <rect x="350" y="245" width="180" height="55" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.5"/>
        <circle cx="370" cy="272" r="5" fill="rgba(34,197,94,0.4)"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>
        <text x="385" y="268" fill="rgba(34,197,94,0.6)" fontSize="9">Campaign Live</text>
        <text x="385" y="284" fill="rgba(148,163,184,0.3)" fontSize="8">12 active · 3 A/B tests running</text>
        <defs><linearGradient id="mktFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Neural network brain */}
        <circle cx="450" cy="170" r="120" fill="rgba(59,130,246,0.02)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"><animate attributeName="r" values="118;124;118" dur="6s" repeatCount="indefinite"/></circle>
        <circle cx="450" cy="170" r="80" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"><animate attributeName="r" values="78;84;78" dur="5s" repeatCount="indefinite"/></circle>
        {/* Input layer */}
        {[70,130,190,250,310].map((y,i)=><g key={`in${i}`}><circle cx="120" cy={y} r="10" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.8"><animate attributeName="fill" values="rgba(59,130,246,0.08);rgba(59,130,246,0.2);rgba(59,130,246,0.08)" dur={`${2+i*0.3}s`} repeatCount="indefinite"/></circle><text x="120" y={y+3} textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize="7">x{i+1}</text></g>)}
        {/* Hidden layer 1 */}
        {[90,150,210,270].map((y,i)=><g key={`h1${i}`}><circle cx="300" cy={y} r="12" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.25)" strokeWidth="0.8"><animate attributeName="fill" values="rgba(139,92,246,0.05);rgba(139,92,246,0.2);rgba(139,92,246,0.05)" dur={`${2.5+i*0.4}s`} repeatCount="indefinite"/></circle></g>)}
        {/* Hidden layer 2 */}
        {[100,170,240].map((y,i)=><g key={`h2${i}`}><circle cx="450" cy={y} r="14" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.25)" strokeWidth="0.8"><animate attributeName="fill" values="rgba(6,182,212,0.05);rgba(6,182,212,0.25);rgba(6,182,212,0.05)" dur={`${3+i*0.5}s`} repeatCount="indefinite"/></circle></g>)}
        {/* Hidden layer 3 */}
        {[110,180,250].map((y,i)=><g key={`h3${i}`}><circle cx="600" cy={y} r="12" fill="rgba(236,72,153,0.08)" stroke="rgba(236,72,153,0.2)" strokeWidth="0.8"><animate attributeName="fill" values="rgba(236,72,153,0.05);rgba(236,72,153,0.18);rgba(236,72,153,0.05)" dur={`${2.8+i*0.3}s`} repeatCount="indefinite"/></circle></g>)}
        {/* Output layer */}
        {[130,210].map((y,i)=><g key={`out${i}`}><circle cx="780" cy={y} r="14" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" strokeWidth="1"><animate attributeName="fill" values="rgba(34,197,94,0.05);rgba(34,197,94,0.25);rgba(34,197,94,0.05)" dur={`${3+i*0.6}s`} repeatCount="indefinite"/></circle><text x="780" y={y+3} textAnchor="middle" fill="rgba(34,197,94,0.5)" fontSize="7">y{i+1}</text></g>)}
        {/* Connections - input to h1 */}
        {[70,130,190,250,310].map((y1,i)=>[90,150,210,270].map((y2,j)=><line key={`c1${i}${j}`} x1="130" y1={y1} x2="288" y2={y2} stroke={`rgba(59,130,246,${0.03+Math.random()*0.05})`} strokeWidth="0.5"/>)).flat()}
        {/* h1 to h2 */}
        {[90,150,210,270].map((y1,i)=>[100,170,240].map((y2,j)=><line key={`c2${i}${j}`} x1="312" y1={y1} x2="436" y2={y2} stroke={`rgba(139,92,246,${0.03+Math.random()*0.05})`} strokeWidth="0.5"/>)).flat()}
        {/* h2 to h3 */}
        {[100,170,240].map((y1,i)=>[110,180,250].map((y2,j)=><line key={`c3${i}${j}`} x1="464" y1={y1} x2="588" y2={y2} stroke={`rgba(6,182,212,${0.03+Math.random()*0.05})`} strokeWidth="0.5"/>)).flat()}
        {/* h3 to output */}
        {[110,180,250].map((y1,i)=>[130,210].map((y2,j)=><line key={`c4${i}${j}`} x1="612" y1={y1} x2="766" y2={y2} stroke={`rgba(236,72,153,${0.04+Math.random()*0.04})`} strokeWidth="0.5"/>)).flat()}
        {/* Pulse dots travelling along connections */}
        {[0,1,2].map(i=><circle key={`pulse${i}`} r="2.5" fill="#3b82f6" opacity="0.6"><animateMotion dur={`${3+i}s`} repeatCount="indefinite" path={`M130,${70+i*80} L288,${90+i*60} L436,${100+i*70} L588,${110+i*70} L766,${130+i*40}`}/><animate attributeName="opacity" values="0;0.8;0.8;0" dur={`${3+i}s`} repeatCount="indefinite"/></circle>)}
        {/* Labels */}
        <text x="120" y="330" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="9" fontFamily="sans-serif">INPUT</text>
        <text x="375" y="330" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="9">HIDDEN LAYERS</text>
        <text x="780" y="330" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="9">OUTPUT</text>
      </svg>
    ),
    content: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Video player frame */}
        <rect x="50" y="30" width="420" height="260" rx="14" fill="rgba(15,18,30,0.9)" stroke="rgba(59,130,246,0.12)" strokeWidth="1"/>
        <rect x="60" y="45" width="400" height="210" rx="8" fill="rgba(59,130,246,0.03)"/>
        {/* Play button */}
        <circle cx="260" cy="150" r="28" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.3)" strokeWidth="1"><animate attributeName="r" values="26;30;26" dur="3s" repeatCount="indefinite"/></circle>
        <polygon points="252,138 276,150 252,162" fill="rgba(59,130,246,0.6)"/>
        {/* Video timeline */}
        <rect x="60" y="262" width="400" height="4" rx="2" fill="rgba(255,255,255,0.05)"/>
        <rect x="60" y="262" width="160" height="4" rx="2" fill="rgba(59,130,246,0.5)"><animate attributeName="width" from="0" to="160" dur="2s" fill="freeze"/></rect>
        <circle cx="220" cy="264" r="5" fill="#3b82f6"><animate attributeName="cx" from="60" to="220" dur="2s" fill="freeze"/></circle>
        <text x="68" y="282" fill="rgba(148,163,184,0.4)" fontSize="8">1:24 / 3:45</text>
        {/* Scene thumbnails on right */}
        <rect x="500" y="30" width="175" height="80" rx="8" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.12)" strokeWidth="0.5"/>
        <text x="515" y="50" fill="rgba(148,163,184,0.4)" fontSize="8">Scene 01 – Intro</text>
        <rect x="510" y="55" width="155" height="45" rx="4" fill="rgba(139,92,246,0.06)"/>
        <polygon points="580,72 595,80 580,88" fill="rgba(139,92,246,0.3)"/>
        <rect x="500" y="120" width="175" height="80" rx="8" fill="rgba(6,182,212,0.04)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5"/>
        <text x="515" y="140" fill="rgba(148,163,184,0.4)" fontSize="8">Scene 02 – Features</text>
        <rect x="510" y="145" width="155" height="45" rx="4" fill="rgba(6,182,212,0.06)"/>
        <rect x="500" y="210" width="175" height="80" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.5"/>
        <text x="515" y="230" fill="rgba(148,163,184,0.4)" fontSize="8">Scene 03 – CTA</text>
        <rect x="510" y="235" width="155" height="45" rx="4" fill="rgba(34,197,94,0.06)"/>
        {/* Blog article mockup */}
        <rect x="700" y="30" width="175" height="260" rx="8" fill="rgba(15,18,30,0.8)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <rect x="710" y="40" width="155" height="8" rx="2" fill="rgba(59,130,246,0.15)"/>
        <rect x="710" y="56" width="120" height="6" rx="2" fill="rgba(59,130,246,0.06)"/>
        <rect x="710" y="72" width="155" height="70" rx="6" fill="rgba(59,130,246,0.04)"/>
        <text x="788" y="112" textAnchor="middle" fill="rgba(59,130,246,0.15)" fontSize="18">✎</text>
        {[0,1,2,3,4,5].map(i=><rect key={`ln${i}`} x="710" y={152+i*18} width={130-i*8+Math.round(Math.sin(i)*20)} height="6" rx="2" fill={`rgba(148,163,184,${0.06-i*0.005})`}/>)}
      </svg>
    ),
    software: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Terminal/IDE */}
        <rect x="50" y="20" width="510" height="300" rx="14" fill="rgba(12,14,24,0.95)" stroke="rgba(59,130,246,0.12)" strokeWidth="1"/>
        <rect x="50" y="20" width="510" height="36" rx="14" fill="rgba(59,130,246,0.04)"/>
        <circle cx="76" cy="38" r="5.5" fill="rgba(239,68,68,0.5)"/><circle cx="94" cy="38" r="5.5" fill="rgba(234,179,8,0.5)"/><circle cx="112" cy="38" r="5.5" fill="rgba(34,197,94,0.5)"/>
        <text x="305" y="42" textAnchor="middle" fill="rgba(148,163,184,0.35)" fontSize="10" fontFamily="monospace">main.tsx — HotBot Studios</text>
        {/* Line numbers */}
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=><text key={`ln${i}`} x="72" y={76+i*21} fill="rgba(100,116,139,0.25)" fontSize="10" fontFamily="monospace">{i+1}</text>)}
        {/* Code lines with syntax highlighting */}
        <text x="98" y="76" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">import</text><text x="140" y="76" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">{`{ useState } `}</text><text x="244" y="76" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">from</text><text x="278" y="76" fill="rgba(152,195,121,0.6)" fontSize="10" fontFamily="monospace">'react'</text>
        <text x="98" y="97" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">import</text><text x="140" y="97" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">{`{ motion } `}</text><text x="244" y="97" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">from</text><text x="278" y="97" fill="rgba(152,195,121,0.6)" fontSize="10" fontFamily="monospace">'framer-motion'</text>
        <text x="98" y="118" fill="rgba(100,116,139,0.3)" fontSize="10" fontFamily="monospace"></text>
        <text x="98" y="139" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">export default</text><text x="210" y="139" fill="rgba(86,182,194,0.6)" fontSize="10" fontFamily="monospace">{` function`}</text><text x="290" y="139" fill="rgba(229,192,123,0.6)" fontSize="10" fontFamily="monospace">{` App`}</text><text x="316" y="139" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">() {'{'}</text>
        <text x="98" y="160" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">{`  const`}</text><text x="152" y="160" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">{` [data, setData] = `}</text><text x="310" y="160" fill="rgba(86,182,194,0.6)" fontSize="10" fontFamily="monospace">useState</text><text x="378" y="160" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">([])</text>
        <text x="98" y="181" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">{`  const`}</text><text x="152" y="181" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">{` [loading] = `}</text><text x="268" y="181" fill="rgba(86,182,194,0.6)" fontSize="10" fontFamily="monospace">useFetch</text><text x="336" y="181" fill="rgba(152,195,121,0.6)" fontSize="10" fontFamily="monospace">('/api/v1')</text>
        <text x="98" y="202" fill="rgba(100,116,139,0.3)" fontSize="10" fontFamily="monospace"></text>
        <text x="98" y="223" fill="rgba(198,120,221,0.6)" fontSize="10" fontFamily="monospace">{`  return`}</text><text x="148" y="223" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">{` (`}</text>
        <text x="98" y="244" fill="rgba(224,108,117,0.6)" fontSize="10" fontFamily="monospace">{`    <Dashboard`}</text><text x="210" y="244" fill="rgba(209,154,102,0.6)" fontSize="10" fontFamily="monospace">{` data`}</text><text x="246" y="244" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">={'{'}data{'}'}</text>
        <text x="98" y="265" fill="rgba(209,154,102,0.6)" fontSize="10" fontFamily="monospace">{`      loading`}</text><text x="184" y="265" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">={'{'}loading{'}'}</text>
        <text x="98" y="286" fill="rgba(224,108,117,0.6)" fontSize="10" fontFamily="monospace">{`    />`}</text>
        {/* Cursor blink */}
        <rect x="134" y="275" width="2" height="14" fill="rgba(59,130,246,0.8)"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>
        {/* Mobile phone preview */}
        <rect x="600" y="40" width="130" height="250" rx="16" fill="rgba(12,14,24,0.95)" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
        <rect x="634" y="44" width="62" height="4" rx="2" fill="rgba(139,92,246,0.15)"/>
        <rect x="610" y="58" width="110" height="180" rx="4" fill="rgba(139,92,246,0.03)"/>
        <rect x="618" y="66" width="94" height="10" rx="2" fill="rgba(139,92,246,0.1)"/>
        <rect x="618" y="84" width="60" height="6" rx="2" fill="rgba(139,92,246,0.06)"/>
        <rect x="618" y="100" width="94" height="50" rx="6" fill="rgba(139,92,246,0.05)"/>
        <rect x="618" y="160" width="42" height="18" rx="4" fill="rgba(59,130,246,0.15)"/>
        <rect x="668" y="160" width="42" height="18" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5"/>
        <rect x="618" y="188" width="94" height="40" rx="6" fill="rgba(139,92,246,0.04)"/>
        <text x="665" y="252" textAnchor="middle" fill="rgba(148,163,184,0.25)" fontSize="8">Mobile Preview</text>
        {/* API response block */}
        <rect x="760" y="40" width="120" height="120" rx="10" fill="rgba(34,197,94,0.03)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.5"/>
        <text x="770" y="58" fill="rgba(34,197,94,0.5)" fontSize="9" fontFamily="monospace">API Response</text>
        <text x="770" y="76" fill="rgba(148,163,184,0.3)" fontSize="8" fontFamily="monospace">{'{'}</text>
        <text x="778" y="90" fill="rgba(209,154,102,0.5)" fontSize="8" fontFamily="monospace">"status"</text><text x="832" y="90" fill="rgba(148,163,184,0.3)" fontSize="8" fontFamily="monospace">: 200,</text>
        <text x="778" y="104" fill="rgba(209,154,102,0.5)" fontSize="8" fontFamily="monospace">"data"</text><text x="820" y="104" fill="rgba(148,163,184,0.3)" fontSize="8" fontFamily="monospace">: [...],</text>
        <text x="778" y="118" fill="rgba(209,154,102,0.5)" fontSize="8" fontFamily="monospace">"time"</text><text x="820" y="118" fill="rgba(152,195,121,0.4)" fontSize="8" fontFamily="monospace">: "12ms"</text>
        <text x="770" y="132" fill="rgba(148,163,184,0.3)" fontSize="8" fontFamily="monospace">{'}'}</text>
        {/* Deploy status */}
        <rect x="760" y="180" width="120" height="70" rx="10" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"/>
        <circle cx="778" cy="200" r="4" fill="rgba(34,197,94,0.6)"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
        <text x="790" y="203" fill="rgba(34,197,94,0.5)" fontSize="8">Deployed</text>
        <text x="770" y="222" fill="rgba(148,163,184,0.3)" fontSize="7" fontFamily="monospace">prod-uk-west-2</text>
        <text x="770" y="236" fill="rgba(148,163,184,0.2)" fontSize="7" fontFamily="monospace">Build #847 • 43s</text>
      </svg>
    ),
    pr: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Central brand hub */}
        <circle cx="450" cy="170" r="50" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.2)" strokeWidth="1"><animate attributeName="r" values="48;54;48" dur="4s" repeatCount="indefinite"/></circle>
        <text x="450" y="165" textAnchor="middle" fill="rgba(59,130,246,0.5)" fontSize="11" fontWeight="bold">YOUR</text>
        <text x="450" y="180" textAnchor="middle" fill="rgba(59,130,246,0.5)" fontSize="11" fontWeight="bold">BRAND</text>
        {/* Media outlets */}
        {[
          {x:150,y:80,label:"BBC News",color:"59,130,246"},
          {x:750,y:80,label:"The Guardian",color:"34,197,94"},
          {x:100,y:250,label:"Forbes UK",color:"139,92,246"},
          {x:800,y:250,label:"TechCrunch",color:"236,72,153"},
          {x:250,y:310,label:"LinkedIn",color:"6,182,212"},
          {x:650,y:310,label:"Twitter/X",color:"148,163,184"},
          {x:150,y:170,label:"Sky News",color:"234,179,8"},
          {x:750,y:170,label:"Reuters",color:"249,115,22"},
        ].map((m,i)=>(<g key={i}>
          <rect x={m.x-50} y={m.y-18} width="100" height="36" rx="8" fill={`rgba(${m.color},0.04)`} stroke={`rgba(${m.color},0.15)`} strokeWidth="0.5"/>
          <text x={m.x} y={m.y+4} textAnchor="middle" fill={`rgba(${m.color},0.6)`} fontSize="9" fontWeight="500">{m.label}</text>
          <line x1={m.x > 450 ? m.x-50 : m.x+50} y1={m.y} x2={450+(m.x>450?-50:50)} y2="170" stroke={`rgba(${m.color},0.08)`} strokeWidth="0.5" strokeDasharray="4 4"/>
          <circle r="2" fill={`rgba(${m.color},0.5)`}><animateMotion dur={`${3+i*0.5}s`} repeatCount="indefinite" path={`M${m.x > 450 ? m.x-50 : m.x+50},${m.y} L${450+(m.x>450?-50:50)},170`}/><animate attributeName="opacity" values="0;0.8;0" dur={`${3+i*0.5}s`} repeatCount="indefinite"/></circle>
        </g>))}
        {/* Sentiment meter */}
        <rect x="380" y="16" width="140" height="40" rx="8" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="0.5"/>
        <text x="395" y="32" fill="rgba(148,163,184,0.4)" fontSize="8">Sentiment Score</text>
        <text x="395" y="48" fill="rgba(34,197,94,0.7)" fontSize="16" fontWeight="bold">92%</text>
        <text x="440" y="48" fill="rgba(34,197,94,0.4)" fontSize="9">positive</text>
      </svg>
    ),
    uiux: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Wireframe phone */}
        <rect x="60" y="30" width="160" height="280" rx="20" fill="rgba(15,18,30,0.9)" stroke="rgba(59,130,246,0.15)" strokeWidth="1"/>
        <rect x="96" y="36" width="88" height="5" rx="2.5" fill="rgba(59,130,246,0.1)"/>
        <rect x="74" y="52" width="132" height="20" rx="4" fill="rgba(59,130,246,0.06)"/>
        <rect x="74" y="80" width="60" height="8" rx="2" fill="rgba(59,130,246,0.1)"/>
        <rect x="74" y="96" width="132" height="70" rx="8" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <rect x="74" y="176" width="62" height="24" rx="6" fill="rgba(59,130,246,0.12)"/>
        <rect x="144" y="176" width="62" height="24" rx="6" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"/>
        <rect x="74" y="210" width="132" height="50" rx="6" fill="rgba(59,130,246,0.03)"/>
        {[0,1,2].map(i=><rect key={i} x="82" y={218+i*14} width={100-i*15} height="6" rx="2" fill={`rgba(148,163,184,${0.06-i*0.015})`}/>)}
        <circle cx="140" cy="296" r="6" stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" fill="none"/>
        {/* Design system grid */}
        <rect x="260" y="30" width="340" height="280" rx="14" fill="rgba(15,18,30,0.85)" stroke="rgba(139,92,246,0.12)" strokeWidth="0.5"/>
        <text x="280" y="54" fill="rgba(139,92,246,0.5)" fontSize="10" fontWeight="600">Design System</text>
        {/* Color swatches */}
        <circle cx="280" cy="78" r="10" fill="rgba(59,130,246,0.4)"/><circle cx="306" cy="78" r="10" fill="rgba(139,92,246,0.4)"/><circle cx="332" cy="78" r="10" fill="rgba(6,182,212,0.4)"/><circle cx="358" cy="78" r="10" fill="rgba(34,197,94,0.4)"/><circle cx="384" cy="78" r="10" fill="rgba(236,72,153,0.4)"/>
        {/* Type scale */}
        <text x="280" y="112" fill="rgba(255,255,255,0.3)" fontSize="16" fontWeight="700">Heading 1</text>
        <text x="280" y="130" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="600">Heading 2</text>
        <text x="280" y="144" fill="rgba(255,255,255,0.15)" fontSize="10">Body Text</text>
        <text x="280" y="156" fill="rgba(255,255,255,0.1)" fontSize="8">Caption</text>
        {/* Component cards */}
        <rect x="280" y="170" width="140" height="50" rx="8" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"/>
        <rect x="290" y="180" width="80" height="10" rx="3" fill="rgba(59,130,246,0.15)"/>
        <rect x="290" y="196" width="50" height="14" rx="4" fill="rgba(59,130,246,0.2)"/>
        <rect x="440" y="170" width="140" height="50" rx="8" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5"/>
        <rect x="450" y="180" width="80" height="10" rx="3" fill="rgba(139,92,246,0.15)"/>
        <rect x="450" y="196" width="50" height="14" rx="4" fill="rgba(139,92,246,0.2)"/>
        <rect x="280" y="232" width="300" height="55" rx="8" fill="rgba(6,182,212,0.04)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5"/>
        <rect x="296" y="244" width="200" height="8" rx="2" fill="rgba(6,182,212,0.08)"/>
        <rect x="296" y="260" width="60" height="16" rx="4" fill="rgba(6,182,212,0.15)"/>
        <rect x="364" y="260" width="60" height="16" rx="4" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5"/>
        {/* Heatmap overlay */}
        <rect x="640" y="30" width="220" height="280" rx="14" fill="rgba(15,18,30,0.85)" stroke="rgba(236,72,153,0.12)" strokeWidth="0.5"/>
        <text x="660" y="54" fill="rgba(236,72,153,0.5)" fontSize="10" fontWeight="600">Click Heatmap</text>
        <rect x="655" y="66" width="190" height="120" rx="8" fill="rgba(236,72,153,0.03)"/>
        <circle cx="720" cy="100" r="22" fill="rgba(239,68,68,0.12)"><animate attributeName="r" values="18;24;18" dur="3s" repeatCount="indefinite"/></circle>
        <circle cx="720" cy="100" r="12" fill="rgba(239,68,68,0.2)"/>
        <circle cx="780" cy="130" r="15" fill="rgba(234,179,8,0.1)"/>
        <circle cx="690" cy="150" r="10" fill="rgba(34,197,94,0.08)"/>
        <text x="660" y="206" fill="rgba(148,163,184,0.3)" fontSize="8">Clicks: 12,847</text>
        <text x="660" y="220" fill="rgba(148,163,184,0.3)" fontSize="8">CTR: 4.2%</text>
        <text x="660" y="234" fill="rgba(148,163,184,0.3)" fontSize="8">Scroll depth: 68%</text>
        {/* Conversion funnel */}
        <rect x="655" y="250" width="190" height="8" rx="2" fill="rgba(59,130,246,0.06)"/><rect x="655" y="250" width="190" height="8" rx="2" fill="rgba(59,130,246,0.15)"/>
        <rect x="665" y="266" width="170" height="8" rx="2" fill="rgba(139,92,246,0.12)"/>
        <rect x="685" y="282" width="120" height="8" rx="2" fill="rgba(236,72,153,0.12)"/>
        <rect x="710" y="298" width="70" height="8" rx="2" fill="rgba(34,197,94,0.15)"/>
      </svg>
    ),
    consulting: (
      <svg viewBox="0 0 900 340" fill="none" className="w-full h-full">
        {/* Strategy board */}
        <rect x="50" y="20" width="800" height="300" rx="14" fill="rgba(15,18,30,0.85)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"/>
        <text x="450" y="48" textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize="12" fontWeight="600">Growth Strategy Dashboard</text>
        {/* Quadrant chart */}
        <line x1="300" y1="70" x2="300" y2="290" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <line x1="100" y1="180" x2="500" y2="180" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <text x="100" y="86" fill="rgba(59,130,246,0.25)" fontSize="8">High Impact</text>
        <text x="100" y="280" fill="rgba(148,163,184,0.2)" fontSize="8">Low Impact</text>
        <text x="420" y="174" fill="rgba(148,163,184,0.2)" fontSize="8">High Effort →</text>
        {/* Strategy items */}
        {[
          {x:180,y:110,r:18,label:"SEO",color:"34,197,94"},
          {x:240,y:130,r:14,label:"PPC",color:"59,130,246"},
          {x:150,y:150,r:22,label:"Content",color:"139,92,246"},
          {x:380,y:100,r:16,label:"AI",color:"6,182,212"},
          {x:420,y:160,r:12,label:"PR",color:"236,72,153"},
          {x:200,y:220,r:10,label:"Email",color:"234,179,8"},
          {x:350,y:240,r:14,label:"Social",color:"249,115,22"},
        ].map((s,i)=>(<g key={i}><circle cx={s.x} cy={s.y} r={s.r} fill={`rgba(${s.color},0.08)`} stroke={`rgba(${s.color},0.25)`} strokeWidth="0.8"><animate attributeName="r" values={`${s.r-2};${s.r+2};${s.r-2}`} dur={`${3+i*0.4}s`} repeatCount="indefinite"/></circle><text x={s.x} y={s.y+3} textAnchor="middle" fill={`rgba(${s.color},0.6)`} fontSize="7" fontWeight="500">{s.label}</text></g>))}
        {/* Revenue projection */}
        <rect x="540" y="70" width="280" height="110" rx="10" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
        <text x="560" y="90" fill="rgba(148,163,184,0.4)" fontSize="9">Revenue Projection (12mo)</text>
        <polyline points="560,165 590,155 620,150 650,140 680,125 710,110 740,98 770,85 800,78" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round"><animate attributeName="stroke-dasharray" from="0 400" to="400 0" dur="2s" fill="freeze"/></polyline>
        <polyline points="560,165 590,160 620,158 650,155 680,152 710,148 740,145 770,142 800,140" stroke="rgba(148,163,184,0.2)" strokeWidth="1" fill="none" strokeDasharray="3 3"/>
        <text x="810" y="82" fill="rgba(59,130,246,0.5)" fontSize="8">Target</text>
        <text x="810" y="144" fill="rgba(148,163,184,0.3)" fontSize="8">Baseline</text>
        {/* KPIs */}
        {[
          {label:"CAC",value:"£24",delta:"-18%",good:true},
          {label:"LTV",value:"£890",delta:"+34%",good:true},
          {label:"ROAS",value:"4.2x",delta:"+67%",good:true},
        ].map((kpi,i)=>(<g key={i}>
          <rect x={540+i*95} y="200" width="85" height="80" rx="8" fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
          <text x={582+i*95} y="222" textAnchor="middle" fill="rgba(148,163,184,0.4)" fontSize="8">{kpi.label}</text>
          <text x={582+i*95} y="248" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="18" fontWeight="bold">{kpi.value}</text>
          <text x={582+i*95} y="268" textAnchor="middle" fill={kpi.good?"rgba(34,197,94,0.6)":"rgba(239,68,68,0.6)"} fontSize="10">{kpi.delta}</text>
        </g>))}
      </svg>
    ),
  };
  return (
    <Reveal>
      <section className="relative z-10 -mt-4 mb-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#080b14]" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
            <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden p-4">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              {scenes[type] || scenes.marketing}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ═════════════════════════════════════════════
// SERVICE 1: DIGITAL MARKETING (1000+ words)
// ═════════════════════════════════════════════
function MarketingServicesPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="Best Digital Marketing Services in UK" title="Strategic Marketing That Drives Real Growth" subtitle="The best digital marketing services in UK — SEO, SEM, social media, and performance marketing that turn clicks into loyal customers across the United Kingdom." />
      <SubServices items={[
        { icon: <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>, title: "SEO & Search", desc: "Technical SEO audits, keyword strategy, content optimization, and Core Web Vitals for top UK search rankings." },
        { icon: <><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></>, title: "Social Media Marketing", desc: "Community management, content calendars, influencer partnerships, and paid social across all UK platforms." },
        { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, title: "Email Automation", desc: "Drip campaigns, lead nurturing sequences, and smart segmentation that convert subscribers into customers." },
        { icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>, title: "Paid Advertising (SEM)", desc: "Google Ads, Bing Ads, and display campaigns with precision targeting for maximum UK market ROAS." },
        { icon: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/></>, title: "Content Strategy", desc: "Blog posts, pillar content, case studies, and thought leadership that drives organic authority in UK markets." },
        { icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>, title: "Analytics & Attribution", desc: "GA4 setup, conversion tracking, custom dashboards, and multi-touch attribution modelling for UK campaigns." },
      ]} />
      <PageIllustration type="marketing" />
      <ContentBlock>
        <H2>The Modern Marketing Landscape</H2>
        <P>Digital marketing has evolved far beyond simple banner ads and email blasts. Today's competitive UK requires a multi-channel approach that reaches customers at every stage of the buying journey. At HotBot Studios, we deliver the best digital marketing services in UK — building marketing systems that generate consistent revenue growth for businesses across the United Kingdom.</P>
        <P>Our marketing team combines deep technical expertise with creative storytelling to produce campaigns that connect with audiences and deliver measurable business results. Every strategy we develop is grounded in data, informed by competitive intelligence, and optimized continuously to ensure maximum return on every marketing pound invested. We believe marketing should be accountable — every pound spent should produce a trackable, attributable result.</P>
        <P>What sets us apart from conventional UK agencies is our Mark-Tech approach — the fusion of marketing creativity with technology infrastructure. While other agencies focus solely on creative or solely on performance, we build integrated systems where creative excellence and technical precision reinforce each other, producing results that neither could achieve alone.</P>

        <H2>Search Engine Optimization (SEO)</H2>
        <H3>Technical SEO Foundation</H3>
        <P>Every successful SEO strategy begins with a rock-solid technical foundation. Our technical SEO audits examine every aspect of your website's infrastructure — from crawlability and indexation to site speed, mobile responsiveness, Core Web Vitals performance, structured data implementation, and internal linking architecture. As the best digital marketing services provider in UK, we identify and resolve the technical barriers that prevent search engines from properly understanding and ranking your content, often uncovering critical issues that have been silently suppressing your visibility for months or years.</P>
        <P>Our team implements comprehensive schema markup, optimizes XML sitemaps, configures robots.txt directives, resolves duplicate content issues, fixes broken links and redirect chains, and ensures your site architecture supports both search engine crawlers and human visitors. We also address page speed optimization through image compression, code minification, lazy loading, CDN configuration, and server-side rendering where appropriate.</P>


        <H3>Content Strategy and Creation</H3>
        <P>Content is the engine that powers organic growth. Our content strategy process begins with comprehensive keyword research that goes far beyond simple search volume analysis. We map the entire customer journey — from awareness-stage informational queries to consideration-stage comparison searches to decision-stage transactional keywords — and develop content plans that capture traffic at every stage. We identify content gaps in your market, analyze what competitors are doing well and where they fall short, and create content that is better, more thorough, and more useful than existing alternatives.</P>
        <P>Our content team produces blog posts, landing pages, pillar content, resource guides, case studies, whitepapers, and technical documentation that establishes your brand as a thought leader in your industry. Every piece is optimized for target keywords without sacrificing readability, and structured for maximum engagement with proper heading hierarchies, internal links, and multimedia elements.</P>

        <MidCreative type="seoRank" />
        <H2>Search Engine Marketing (SEM)</H2>
        <P>Paid search advertising offers immediate visibility and precise targeting capabilities that organic strategies cannot match. Our SEM team manages Google Ads, Bing Ads, and platform-specific advertising campaigns with rigorous attention to performance metrics. We structure campaigns for maximum quality scores, develop ad copy that drives high click-through rates, build landing pages optimized for conversion, and implement sophisticated bidding strategies that maximize return on ad spend.</P>
        <P>We manage keyword portfolios of thousands of terms, continuously testing ad variations, adjusting bids based on performance data, and expanding into new keyword opportunities as they emerge. Our negative keyword management eliminates wasted spend on irrelevant clicks, while our audience targeting ensures ads reach the most qualified prospects.</P>

        <H2>Social Media Marketing</H2>
        <MidCreative type="abTest" />
        <P>Social media is where brands build relationships, establish personality, and create communities of loyal advocates. Our social media management goes far beyond scheduling posts and responding to comments. We develop comprehensive social strategies that align with your business objectives, create content calendars that balance promotional messaging with value-driven engagement, and build systems for real-time community management that turns followers into fans and fans into customers.</P>
        <P>We manage presence across all major platforms — Instagram, Facebook, LinkedIn, Twitter, YouTube, and emerging channels — with platform-specific strategies that respect the unique culture and content formats of each. Our creative team produces scroll-stopping visual content, engaging video series, interactive stories, and compelling copy that drives meaningful engagement.</P>

        <H2>Email Marketing and Automation</H2>
        <P>Email remains one of the highest-ROI marketing channels available, and our email marketing programs are designed to maximize that return. We build sophisticated email automation sequences that nurture leads from initial awareness through purchase and beyond — welcome sequences for new subscribers, educational drip campaigns that build trust, cart abandonment recovery flows, post-purchase engagement series, and re-engagement campaigns for dormant contacts.</P>
        <P>Our email design team creates beautiful, responsive templates that render perfectly across all email clients and devices. We write compelling subject lines that drive open rates, develop persuasive copy that drives clicks, and implement dynamic personalization that makes every recipient feel like the email was written specifically for them.</P>

        <H2>Performance Marketing and Analytics</H2>
        <P>Every marketing dollar should produce a measurable return, and our analytics infrastructure ensures you always know exactly what your investment is producing. We implement comprehensive tracking across all channels — Google Analytics 4, conversion tracking pixels, UTM parameter frameworks, call tracking, and custom attribution models that reveal the true customer journey across touchpoints. Real-time dashboards provide at-a-glance visibility into campaign performance, while detailed monthly reports provide strategic insights and actionable recommendations.</P>
        <P>Our clients typically see 150-300% increases in qualified leads within the first six months of partnership. We achieve these results through systematic, data-driven optimization of every element of the marketing funnel. From the initial search impression to the final conversion event, every touchpoint is analyzed, tested, and refined to maximize performance.</P>

        <Highlight icon={<><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>} stat="300%" label="average lead increase" desc="Our UK clients consistently see 150–300% increases in qualified leads within the first six months, driven by systematic funnel optimisation across SEO, SEM, social, and email channels." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 300, suffix: "%", label: "Lead Increase" },
        { value: 124, suffix: "K", label: "Monthly Sessions" },
        { value: 67, suffix: "%", label: "Revenue Growth" },
        { value: 4.2, suffix: "x", label: "Average ROAS" },
      ]} />

      <ProcessSteps title="Our Digital Marketing Process" steps={[
        { title: "Discovery & Audit", desc: "We conduct a full audit of your current digital presence — SEO health, ad accounts, analytics, competitors, and market positioning across UK search." },
        { title: "Strategy & Roadmap", desc: "A bespoke 90-day roadmap with channel prioritisation, budget allocation, KPI targets, and content calendar tailored to your UK audience." },
        { title: "Launch & Execute", desc: "Campaigns go live across SEO, SEM, social, and email with real-time tracking, A/B testing, and weekly performance reporting." },
        { title: "Optimise & Scale", desc: "Continuous refinement using performance data — reallocating spend to top performers, expanding winning keywords, and scaling what works." },
      ]} />

      <FAQSection title="Digital Marketing FAQs" faqs={[
        { q: "How long before I see results from SEO in the UK?", a: "Most UK businesses see measurable ranking improvements within 3–4 months, with significant traffic growth by month 6. Competitive keywords may take 6–12 months. We provide monthly progress reports so you can track every gain." },
        { q: "What's the minimum budget for Google Ads in the UK?", a: "We recommend a minimum of £2,000/month in ad spend for meaningful UK campaigns, though optimal budgets vary by industry and competition. Our management fee is separate and ensures every pound of spend is optimised for maximum return." },
        { q: "Do you work with businesses outside London?", a: "Absolutely. We work with businesses across the entire United Kingdom — Manchester, Birmingham, Leeds, Edinburgh, Bristol, and beyond. Our strategies are tailored to your specific regional and national UK market." },
        { q: "How do you measure marketing ROI?", a: "We implement end-to-end attribution using GA4, server-side tracking, UTM frameworks, and call tracking. You get a real-time dashboard showing exactly which channels, campaigns, and keywords drive revenue — not just clicks." },
        { q: "Can you manage our social media accounts?", a: "Yes — we offer full social media management including strategy, content creation, community management, influencer partnerships, and paid social advertising across all UK platforms." },
      ]} />

      <RelatedServices current="marketing-services" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// SERVICE 2: AI & AUTOMATION (1000+ words)
// ═════════════════════════════════════════════
function AIAutomationPage({ navigate, openForm }) {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const products = [
    { name: "Heka", tag: "AI Voice Assistant", desc: "Intelligent voice assistant that handles inbound and outbound calls, qualifies leads, books appointments, and answers FAQs in natural conversation — 24/7, in multiple languages.", features: ["Natural voice conversations", "Appointment booking", "Lead qualification", "Multi-language support"], icon: <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></>, color: "139,92,246", detail: "Heka is a production-grade voice AI agent powered by Sarvam AI. It handles both inbound and outbound calls for your business — qualifying leads, answering product questions, scheduling appointments, and routing complex queries to your human team with full context. Heka speaks naturally, remembers conversation history, and works 24/7 across English and Hindi with more languages coming soon. Deployed via your existing phone system or our cloud infrastructure." },
    { name: "Website Keyword Assistant", tag: "SEO Intelligence", desc: "Monitors your website content in real time, identifies keyword gaps, suggests optimisations, and tracks ranking movements — feeding actionable SEO tasks directly to your team.", features: ["Real-time keyword tracking", "Content gap analysis", "Rank movement alerts", "Automated SEO tasks"], icon: <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>, color: "34,197,94", alts: ["Website Keyword Finder", "Website SEO Helper", "Site Keyword Pro"], detail: "Our Website Keyword Research Bot continuously crawls your site pages, analyses on-page SEO signals, and compares them against competitors in real time. It identifies missing keywords, thin content, cannibalisation risks, and ranking drops — then pushes prioritised tasks with specific fix instructions to your team via Slack, email, or project management tools. No more manual audits or guesswork." },
    { name: "Telegram Keyword Assistant", tag: "Community Intelligence", desc: "Listens across Telegram channels and groups for brand mentions, competitor activity, and industry keywords — then delivers summarised intelligence briefs to your team.", features: ["Channel monitoring", "Competitor tracking", "Keyword alerts", "Daily intelligence briefs"], icon: <><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></>, color: "6,182,212", alts: ["Telegram SEO Bot", "Keyword Bot for Telegram", "Telegram Keyword Finder"], detail: "The Telegram Keyword Research Bot monitors public Telegram channels, groups, and communities for specific keywords related to your brand, competitors, and industry trends. It captures mentions in real time, classifies sentiment, identifies emerging topics, and delivers structured daily intelligence briefs — so your team stays ahead of conversations happening in your market without manually scrolling through hundreds of channels." },
    { name: "LinkedIn Post Assistant", tag: "Content Automation", desc: "Generates on-brand LinkedIn posts from your briefs, company news, or industry trends. Schedules, publishes, and tracks engagement — turning your team into thought leaders on autopilot.", features: ["AI post generation", "Brand voice matching", "Auto-scheduling", "Engagement analytics"], icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>, color: "59,130,246", alts: ["LinkedIn Content Helper", "LinkedIn Idea Bot", "LinkedIn Auto Post"], detail: "The LinkedIn Social Bot generates post ideas based on your industry, trending topics, and your brand voice — then drafts polished LinkedIn posts ready for review. Approved posts are pushed to a Telegram channel for final sign-off before auto-publishing on your schedule. It tracks engagement metrics, learns what resonates with your audience, and continuously improves content quality. Turn your team into consistent thought leaders without the daily writing grind." },
    { name: "Instagram Post Assistant", tag: "Visual Content AI", desc: "Creates scroll-stopping Instagram posts and captions from product photos, brand assets, or text prompts. Handles carousels, reels scripts, hashtag research, and posting schedules.", features: ["AI caption writing", "Hashtag research", "Carousel generation", "Post scheduling"], icon: <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><path d="M17.5 6.5h.01"/></>, color: "236,72,153", alts: ["Instagram Content Helper", "Instagram Idea Bot", "Instagram Auto Post"], detail: "The Instagram Social Bot generates visual content ideas, writes captions optimised for engagement, researches trending hashtags, and creates carousel slide copy — all matched to your brand voice and aesthetic. Like the LinkedIn bot, it pushes drafts to a Telegram channel for approval before scheduling. It analyses your best-performing posts, identifies optimal posting times, and builds a consistent content calendar that keeps your Instagram growing on autopilot." },
    { name: "Mental Wellness Assistant", tag: "Employee Wellbeing", desc: "Confidential AI companion for workplace mental health support. Provides mood tracking, guided exercises, stress management techniques, and anonymous escalation to professional resources.", features: ["Mood tracking", "Guided exercises", "Stress management", "Professional referrals"], icon: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>, color: "234,179,8", alts: ["Mind Support Bot", "Daily Calm Chat", "Mental Health Helper"], detail: "The Mental Health Assistant Chatbot provides confidential, always-available wellbeing support for your employees. It offers daily mood check-ins, guided breathing and mindfulness exercises, cognitive behavioural techniques for stress and anxiety, and journaling prompts. When it detects signs of serious distress, it provides gentle nudges toward professional resources — all completely anonymous. Deployed on your internal Slack, Teams, or a private web portal. Helps organisations build a culture of care while reducing burnout." },
  ];

  return (
    <>
      <PageHeader tag="Best AI Automation Services in UK" title="Intelligent Automation That Never Sleeps" subtitle="The best AI automation services in UK — deploy chatbots, workflow engines, and intelligent systems that handle customer interactions across the United Kingdom 24/7." />

      {/* ─── AI PRODUCTS BLOCK ─── */}
      <section className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "#8b5cf6" }} />
                <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>Our AI Products</span>
              </div>
              <h2 style={{ color: "white", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Intelligent Assistants for Every Workflow</h2>
              <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>Purpose-built AI products that plug into your operations — handling calls, content, monitoring, and wellbeing around the clock.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => {
              const [hov, setHov] = useState(false);
              const isExpanded = expandedProduct === i;
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                    style={{
                      position: "relative", borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column",
                      background: hov ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isExpanded ? `rgba(${p.color},0.4)` : hov ? `rgba(${p.color},0.3)` : "rgba(255,255,255,0.06)"}`,
                      transition: "all 0.4s ease",
                      transform: hov ? "translateY(-4px)" : "none",
                      boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(${p.color},0.06)` : "0 4px 20px rgba(0,0,0,0.1)",
                    }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, borderRadius: "20px 20px 0 0", background: `linear-gradient(180deg, rgba(${p.color},${hov ? 0.06 : 0.02}), transparent)`, transition: "all 0.4s", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 16, right: 16, width: 6, height: 6, borderRadius: 3, background: `rgba(${p.color},${hov ? 0.9 : 0.3})`, boxShadow: hov ? `0 0 10px rgba(${p.color},0.5)` : "none", transition: "all 0.4s" }} />
                    <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: `linear-gradient(135deg, rgba(${p.color},${hov ? 0.2 : 0.1}), rgba(${p.color},0.03))`, border: `1px solid rgba(${p.color},${hov ? 0.35 : 0.15})`, transition: "all 0.4s" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`rgba(${p.color},0.8)`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: `rgba(${p.color},0.7)`, marginBottom: 6 }}>{p.tag}</span>
                    <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 8, position: "relative" }}>{p.name}</h3>
                    <p style={{ color: "rgba(203,213,225,0.8)", fontSize: 13, lineHeight: 1.6, marginBottom: 16, position: "relative", flex: isExpanded ? "none" : 1 }}>{p.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, position: "relative" }}>
                      {p.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`rgba(${p.color},0.6)`} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ color: "#cbd5e1", fontSize: 12.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ position: "relative", marginBottom: 16 }}>
                        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(${p.color},0.2), transparent)`, marginBottom: 16 }} />
                        <p style={{ color: "rgba(203,213,225,0.75)", fontSize: 12.5, lineHeight: 1.7 }}>{p.detail}</p>
                        {p.alts && (
                          <div style={{ marginTop: 12 }}>
                            <span style={{ color: "#64748b", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Also known as</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                              {p.alts.map((a, ai) => (
                                <span key={ai} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 12, background: `rgba(${p.color},0.06)`, border: `1px solid rgba(${p.color},0.12)`, color: `rgba(${p.color},0.7)` }}>{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle + CTA */}
                    <div style={{ display: "flex", gap: 8, position: "relative" }}>
                      <button onClick={(e) => { e.stopPropagation(); setExpandedProduct(isExpanded ? null : i); }}
                        style={{
                          flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                          color: `rgba(${p.color},0.8)`, background: `rgba(${p.color},0.06)`,
                          border: `1px solid rgba(${p.color},0.15)`, transition: "all 0.3s",
                        }}>{isExpanded ? "Show Less" : "Learn More"}</button>
                      <button onClick={() => openForm("get-started")}
                        style={{
                          flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                          color: "white", background: `rgba(${p.color},${hov ? 0.25 : 0.15})`,
                          border: `1px solid rgba(${p.color},${hov ? 0.5 : 0.25})`, transition: "all 0.3s",
                        }}>Get Started →</button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── AI SERVICES ─── */}
      <section className="relative z-10 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "#3b82f6" }} />
                <span style={{ color: "#60a5fa", fontSize: 12, fontWeight: 600 }}>Our AI Services</span>
              </div>
              <h2 style={{ color: "white", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Custom AI Solutions We Build for You</h2>
              <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>Beyond our products, we design and deploy bespoke AI systems tailored to your specific business workflows.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <SubServices items={[
        { icon: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>, title: "AI Chatbots", desc: "Intelligent conversational agents that handle 80% of customer queries with human-like understanding." },
        { icon: <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>, title: "Workflow Engines", desc: "Automated business processes that eliminate repetitive tasks and reduce operational costs by up to 60%." },
        { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>, title: "Data Intelligence", desc: "AI-powered analytics that surface actionable insights from your business data in real-time." },
        { icon: <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></>, title: "Voice AI Assistants", desc: "Natural language voice interfaces for customer support, IVR systems, and internal operations." },
        { icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, title: "Predictive Analytics", desc: "Machine learning models that forecast demand, churn risk, and revenue opportunities for UK businesses." },
        { icon: <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>, title: "Smart Integrations", desc: "Connect 15+ platforms into a unified workflow — CRM, email, payments, and inventory synced automatically." },
      ]} />
      <PageIllustration type="ai" />
      <ContentBlock>
        <H2>The AI Revolution in Business Operations</H2>
        <P>Artificial intelligence and automation are no longer futuristic concepts reserved for Silicon Valley giants. They are practical, accessible tools that businesses of every size across the United Kingdom can deploy today to dramatically improve efficiency, reduce costs, and deliver superior customer experiences. At HotBot Studios, we deliver the best AI automation services in UK — deploying production-grade systems that deliver measurable business impact from the very first week of operation.</P>
        <P>Our approach to AI and automation begins with understanding your business processes at the deepest level. We identify the repetitive tasks consuming your team's time, the customer touchpoints where response time matters most, the data analysis challenges that slow decision-making, and the operational bottlenecks that prevent scaling. Then we design and deploy intelligent systems that address each challenge with precision, reliability, and the kind of sophistication that makes customers see immediate operational improvements.</P>
        <P>The businesses dominating their markets today share one fundamental advantage — they have systematized their operations so completely that human capital gets allocated exclusively to creative, strategic, and relationship-building activities. Every manual data transfer, every repetitive approval process, every customer question that gets the same answer for the hundredth time — these are opportunities for automation that compound into massive competitive advantage.</P>

        <H2>Chatbots and Conversational Systems</H2>
        <H3>Advanced Natural Language Understanding</H3>
        <MidCreative type="chatflow" />
        <P>Our chatbot systems use natural language processing to understand what customers actually mean — not just what they type. They handle multi-turn conversations, remember previous interactions, and respond in your brand voice consistently, even across hundreds of simultaneous chats. They work on your website, WhatsApp, Messenger, SMS, and email from one shared intelligence layer.</P>
        <P>Every chatbot we deploy is trained on your specific business knowledge — your products, services, pricing, policies, competitive advantages, and common customer questions. They understand your industry terminology, can explain complex concepts in simple language, and know when a question requires human expertise.</P>

        <H3>Intelligent Lead Qualification</H3>
        <P>One of the most powerful applications of AI in business is automated lead qualification. Our systems engage every incoming lead in natural conversation, asking qualifying questions that feel like genuine interest rather than a survey. The AI evaluates budget signals, timeline indicators, authority markers, and need intensity in real-time, scoring each lead with sophisticated models trained on your historical conversion data. By the time a qualified lead reaches your human sales team, it arrives with a complete profile, conversation summary, and recommended next steps.</P>

        <H3>Multi-Channel Deployment</H3>
        <P>Modern customers expect to reach businesses through whatever channel is most convenient for them. Our AI systems deploy across your website, WhatsApp, Facebook Messenger, Instagram DMs, SMS, email, and custom platforms — all running from a unified intelligence layer. A conversation that starts on your website at noon can continue via WhatsApp that evening, with the AI maintaining complete context across the channel transition.</P>

        <H2>Workflow Automation</H2>
        <H3>Process Intelligence and Mapping</H3>
        <P>Before automating anything, we conduct thorough process intelligence mapping to understand your operational workflows at every level. We identify manual touchpoints, measure time and error costs, map dependencies that create bottlenecks, and prioritize automation opportunities by impact and implementation complexity. This systematic approach ensures we automate the right things in the right order, delivering maximum value with minimum disruption.</P>
        <MidCreative type="network" />

        <H3>Intelligent Workflow Design</H3>
        <P>Our automation systems go far beyond simple if-then triggers. We build multi-layered workflows incorporating conditional logic, AI-powered decision making, error handling, fallback protocols, and intelligent retry mechanisms. When a lead comes in at 2 AM with an unusual request, the system classifies intent, scores the opportunity, drafts a contextual response, and escalates to the right person with full context.</P>

        <H3>Integration Architecture</H3>
        <P>Real automation requires deep integration across your entire technology stack. We connect CRMs, marketing platforms, communication tools, payment processors, fulfillment systems, project management tools, and custom databases into a unified operational layer. Our integrations are resilient, monitored, and self-healing — when APIs update or webhook formats change, the system adapts without breaking your workflows. We have experience integrating with over 200 platforms.</P>

        <H2>AI Analytics and Business Intelligence</H2>
        <P>Raw data is worthless without the intelligence to extract actionable insights from it. Our AI analytics systems process your business data in real-time, identifying patterns, anomalies, and opportunities that would take human analysts weeks to uncover. Predictive models forecast customer behavior, demand fluctuations, and market trends. Sentiment analysis monitors customer feedback across all channels, alerting you to emerging issues before they become crises.</P>
        <P>Custom dashboards present complex data in intuitive visualizations that enable rapid decision-making. Executive dashboards provide strategic overview, operational dashboards enable day-to-day management, and detailed analytical views support deep investigation. All dashboards update in real-time and are accessible from any device.</P>

        <H2>Implementation and Results</H2>
        <P>Our AI implementation process is designed for rapid deployment with minimal disruption. Phase one typically goes live within two to four weeks, delivering immediate automation of your highest-impact processes. Our clients consistently report 60-80% reductions in response times, 40-60% reductions in operational overhead, and 200-300% improvements in lead processing capacity within the first ninety days of deployment. All systems include comprehensive monitoring, alerting, and reporting capabilities with continuous performance improvement.</P>

        <Highlight icon={<><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>} stat="80%" label="faster response times" desc="AI chatbots and workflow engines cut customer response times by up to 80% while handling unlimited concurrent conversations — delivering 24/7 service that scales with your UK business." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 80, suffix: "%", label: "Faster Responses" },
        { value: 60, suffix: "%", label: "Cost Reduction" },
        { value: 200, suffix: "+", label: "Platforms Integrated" },
        { value: 24, suffix: "/7", label: "Always-On Service" },
      ]} />

      <ProcessSteps title="Our AI Implementation Process" steps={[
        { title: "Process Audit & Mapping", desc: "We map every workflow, identify automation opportunities, and calculate the time and cost savings each automation will deliver to your UK operation." },
        { title: "AI Architecture Design", desc: "Custom system design — selecting the right AI models, integration points, fallback logic, and security architecture for your specific use case." },
        { title: "Build, Train & Deploy", desc: "We build and train AI systems on your business data, deploy in a staging environment for testing, then go live with full monitoring within 2–4 weeks." },
        { title: "Monitor & Optimise", desc: "Continuous performance tracking, conversation analysis, model retraining, and expansion into new automation opportunities as your business evolves." },
      ]} />

      <FAQSection title="AI Automation FAQs" faqs={[
        { q: "How quickly can an AI chatbot be deployed for my UK business?", a: "Most chatbots go live within 2–4 weeks. This includes business knowledge training, tone calibration, integration with your CRM and support tools, and thorough testing. Complex multi-channel deployments may take 4–6 weeks." },
        { q: "Will the AI chatbot understand UK English and cultural context?", a: "Absolutely. Our systems are specifically trained on UK English, spelling conventions, cultural references, and regional dialects. They understand British business terminology and communicate naturally with UK customers." },
        { q: "What happens when the AI can't answer a question?", a: "Smart escalation protocols route complex queries to your human team with full conversation context. The AI learns from each escalation, continuously expanding its knowledge base and reducing handoff rates over time." },
        { q: "Can you integrate with our existing CRM and tools?", a: "Yes — we integrate with 200+ platforms including Salesforce, HubSpot, Pipedrive, Slack, Teams, Zendesk, Intercom, WhatsApp Business, and custom APIs. If it has an API, we can connect it." },
        { q: "What's the ROI timeline for AI automation?", a: "Most UK clients see positive ROI within 60–90 days. The combination of reduced staff overhead, faster response times, higher lead conversion rates, and 24/7 availability compounds rapidly." },
      ]} />

      <RelatedServices current="ai-automation" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// SERVICE 3: SOFTWARE DEVELOPMENT (1000+ words)
// ═════════════════════════════════════════════
function SoftwareDevelopmentPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="Best Content Production Studio Services in UK" title="Code & Content That Drives Digital Growth" subtitle="Premium website development, web apps, mobile solutions, and professional content creation — the best content production studio services in UK for brands that demand excellence across the United Kingdom." />
      <SubServices items={[
        { icon: <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></>, title: "Brand Content Creation", desc: "Professional photography, videography, and graphic design that tells your brand story across UK markets." },
        { icon: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>, title: "Video Production", desc: "Corporate films, social reels, product demos, and animation that capture attention and drive engagement." },
        { icon: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>, title: "Copywriting & Blogs", desc: "SEO-optimised long-form content, blog posts, and editorial pieces that establish thought leadership." },
        { icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>, title: "Social Media Content", desc: "Scroll-stopping visuals, stories, carousels, and video content optimised for every platform." },
        { icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>, title: "Whitepapers & Reports", desc: "In-depth research reports, case studies, and downloadable assets that drive lead generation." },
        { icon: <><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>, title: "Podcast & Audio", desc: "Podcast production, audio branding, and voice-over services for multi-channel UK content strategies." },
      ]} />
      <PageIllustration type="content" />
      <ContentBlock>
        <H2>Building Digital Infrastructure That Lasts</H2>
        <P>Software is the backbone of modern business. Whether you need a website that converts visitors into customers, a web application that streamlines your operations, or a mobile app that keeps your brand in your customers' pockets — the quality of your software directly determines the quality of your business outcomes. At HotBot Studios, we deliver the best content production studio services in UK, ensuring that every line of code we write impacts real users, real businesses, and real revenue across the United Kingdom.</P>
        <P>Our development team comprises full-stack engineers, frontend specialists, mobile developers, DevOps architects, and QA professionals who bring experience from enterprise organizations and high-growth startups alike. We work with modern technology stacks that balance innovation with stability, choosing the right tools for each project rather than forcing every problem into a single framework.</P>

        <H2>Website Development</H2>
        <H3>Performance-First Architecture</H3>
        <P>At HotBot Studios, we build websites and portals that not only look stunning but also drive real results for your business. Using modern tech stacks, we build sites designed for both users and search engines. Our websites score consistently high on Google's Core Web Vitals — Largest Contentful Paint under 2.5 seconds, First Input Delay under 100 milliseconds, and Cumulative Layout Shift under 0.1.</P>
        <P>We build responsive websites that look and function flawlessly across every device, browser, and screen size. Our frontend code is clean, semantic, and accessible, meeting WCAG 2.1 standards. SEO is baked into every page from the beginning — proper heading hierarchies, optimized meta tags, structured data markup, fast loading times, and crawlable architecture that search engines love.</P>
        <MidCreative type="code" />

        <H3>Content Management Systems</H3>
        <P>We build content management solutions that let your team update, publish, and manage content without touching code. Whether you need WordPress with a custom theme, a headless CMS powering a JAMstack frontend, or a fully custom CMS built for your workflow, we deliver systems that balance flexibility with simplicity.</P>

        <H2>Web Application Development</H2>
        <P>We build custom web applications that drive real business growth. Our team combines proven frameworks with modern tooling to deliver fast, reliable experiences. Clean interfaces, solid architecture, and battle-tested backends — built to perform from day one.</P>
        <P>We build progressive web applications, single-page applications, and complex enterprise portals. Our backend architectures are designed for horizontal scaling — microservices, containerized deployments, and cloud-native infrastructure that grows with your business. API design follows RESTful principles or GraphQL specifications with comprehensive documentation.</P>

        <H2>Mobile Application Development</H2>
        <H3>Android Application Development</H3>
        <P>Our Android development team builds native applications using Kotlin and Java that use the full capabilities of the Android platform. We develop applications for smartphones, tablets, wearables, and Android TV, ensuring optimal performance across the diverse Android device ecosystem. Material Design guidelines inform our UI development, while platform-specific optimizations ensure efficient battery usage and memory management.</P>

        <H3>iOS Application Development</H3>
        <MidCreative type="pipeline" />
        <P>iOS applications built with Swift deliver the polished, premium experience that Apple users expect. Our iOS team follows Apple's Human Interface Guidelines while incorporating creative design elements that make your app stand out. We develop for iPhone, iPad, Apple Watch, and Apple TV, implementing platform features like widgets, App Clips, and ARKit integration where they add genuine value.</P>

        <H3>Cross-Platform Development</H3>
        <P>When budget and timeline make native development impractical, our cross-platform solutions using React Native and Flutter deliver near-native performance with shared codebases that dramatically reduce development and maintenance costs. We carefully evaluate each project to recommend the optimal approach.</P>

        <H2>Core Web Vitals and Performance</H2>
        <P>Having trouble getting noticed online? At HotBot Studios, we work our magic with the latest techniques and custom strategies to boost your website's performance on Google and beyond. We audit existing websites for performance bottlenecks, implement optimizations including code splitting, image optimization, font loading strategies, and caching policies, and monitor performance continuously as content and traffic grow.</P>

        <H2>Our Development Process</H2>
        <P>Every project follows a structured lifecycle: discovery and requirements analysis, architecture and design, iterative development with regular client reviews, comprehensive testing, staged deployment with rollback capabilities, and ongoing support. We use agile methodologies with two-week sprints, daily standups, and transparent project tracking. Code quality is maintained through automated testing, code reviews, continuous integration, and adherence to industry best practices.</P>

        <Highlight icon={<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>} stat="500+" label="content assets delivered" desc="From brand films and social reels to long-form blog series and interactive microsites — our UK content studio has delivered 500+ assets that drive measurable engagement and conversions." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 500, suffix: "+", label: "Assets Delivered" },
        { value: 98, suffix: "%", label: "Client Satisfaction" },
        { value: 45, suffix: "%", label: "Engagement Uplift" },
        { value: 12, suffix: "x", label: "Content ROI" },
      ]} />

      <ProcessSteps title="Our Content Production Workflow" steps={[
        { title: "Creative Brief & Strategy", desc: "Deep-dive into your brand, audience, and goals to build a content strategy with editorial calendar, platform mapping, and KPI targets." },
        { title: "Concept & Scripting", desc: "Our creative team develops concepts, moodboards, scripts, and storyboards — reviewed and refined with your input before production begins." },
        { title: "Production & Creation", desc: "Professional filming, photography, design, writing, and editing using industry-grade tools and UK-based talent across all content formats." },
        { title: "Distribution & Measurement", desc: "Multi-channel content distribution with real-time analytics, A/B testing, and continuous optimisation based on engagement data." },
      ]} />

      <FAQSection title="Content Production FAQs" faqs={[
        { q: "What types of content do you produce for UK businesses?", a: "Everything — brand films, social media content (reels, stories, carousels), blog posts, SEO articles, whitepapers, case studies, podcast production, infographics, email templates, website copy, and interactive digital experiences." },
        { q: "Can you handle ongoing monthly content production?", a: "Yes — most UK clients work with us on monthly retainers with defined content calendars. This ensures consistent brand voice, regular publishing cadence, and the ability to react quickly to trending topics and market changes." },
        { q: "Do you provide SEO-optimised written content?", a: "Every piece of written content is SEO-optimised from the ground up — keyword-targeted headings, internal linking, schema markup, meta descriptions, and readability scoring. Our content consistently ranks on page one for target UK keywords." },
        { q: "How quickly can you produce video content?", a: "Standard social video (15–60 seconds) can be delivered within 5–7 business days. Full brand films and product launches typically take 2–4 weeks from brief to final delivery, depending on production complexity." },
        { q: "Do you film on location across the UK?", a: "Yes — our production team operates across the entire UK with equipment and crew available in London, Manchester, Birmingham, Edinburgh, Bristol, and other major cities." },
      ]} />

      <RelatedServices current="software-development" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// SERVICE 4: PUBLIC RELATIONS (1000+ words)
// ═════════════════════════════════════════════
function PublicRelationsPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="Best Public Relations Services in UK" title="Shape Perception. Build Authority." subtitle="The best public relations services in UK — strategic PR campaigns, media relations, crisis management, and brand storytelling that position you as an industry leader across the United Kingdom." />
      <SubServices items={[
        { icon: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>, title: "Media Relations", desc: "Strategic press outreach, journalist relationships, and earned media placements in top UK publications." },
        { icon: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>, title: "Crisis Communications", desc: "Rapid response protocols, reputation management, and damage control for UK brands under pressure." },
        { icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, title: "Thought Leadership", desc: "Position your executives as industry authorities through bylines, speaking engagements, and opinion pieces." },
        { icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>, title: "Brand Monitoring", desc: "Real-time sentiment tracking, media monitoring, and share-of-voice analysis across UK media landscape." },
        { icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>, title: "Influencer Partnerships", desc: "Identify and engage UK influencers who authentically align with your brand values and target audience." },
        { icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, title: "Event PR & Launch", desc: "Product launches, press events, and experiential campaigns that generate buzz across UK media." },
      ]} />
      <PageIllustration type="pr" />
      <ContentBlock>
        <H2>The Power of Strategic Public Relations</H2>
        <P>In an era where information travels at the speed of light and public perception can shift overnight, strategic public relations isn't a luxury — it's a business necessity. Your brand reputation is one of your most valuable assets, and it requires proactive management, consistent nurturing, and expert handling when challenges arise. At HotBot Studios, we deliver the best public relations services in UK, combining traditional media expertise with digital-age strategies to build, protect, and amplify your brand's reputation across the United Kingdom.</P>
        <P>Effective PR goes far beyond press releases and media placements. It encompasses the entire ecosystem of communications that shape how your brand is perceived — from stories in major publications to conversations on social media, from analyst briefings to community engagement. Our integrated approach ensures consistent messaging and maximum impact across all touchpoints.</P>
        <P>What distinguishes our PR practice is our data-driven, results-oriented methodology. We measure success by tangible business outcomes — increased brand awareness, improved sentiment scores, higher quality inbound leads, stronger recruitment pipeline, and ultimately, revenue growth driven by the trust and authority that great PR builds.</P>

        <H2>Media Relations and Press Strategy</H2>
        <H3>Journalist and Editor Relationships</H3>
        <P>Our media relations team maintains active relationships with journalists, editors, and producers across major publications, industry trade media, broadcast outlets, and influential digital platforms. These relationships are built on trust — we pitch stories that are genuinely newsworthy and relevant to each journalist's beat, not mass-distributed press releases that clog inboxes and burn bridges.</P>
        <P>We develop comprehensive media target lists for each client based on industry, audience demographics, and strategic objectives. Our monitoring systems track coverage, sentiment, and emerging topics in real-time, allowing us to identify opportunities for timely commentary and thought leadership contributions.</P>
        <MidCreative type="mediaReach" />

        <H3>Press Coverage and Placements</H3>
        <P>We secure meaningful placements in publications that your target audience actually reads and trusts. This means going beyond simple product announcements to develop compelling story angles — trend pieces, data-driven stories, human interest angles, and contrarian perspectives that spark conversation. Every placement advances specific business objectives, whether that's market awareness, competitive positioning, or investor relations.</P>

        <H2>Thought Leadership Development</H2>
        <P>The most powerful PR isn't about getting your company name in the news — it's about establishing your leadership team as the go-to experts. Our thought leadership programs develop and amplify your executives' voices through contributed articles in tier-one publications, speaking engagements at industry conferences, podcast appearances, webinars, and social media presence building.</P>
        <P>Ghost-written articles, op-eds, and blog posts are developed through a collaborative process that ensures authenticity while maintaining strategic alignment. We identify conferences where your executives should be speaking, develop compelling abstracts and presentation materials, and provide media training for powerful, memorable presentations.</P>

        <H2>Crisis Communications</H2>
        <P>Every business will face a communications crisis at some point. The difference between businesses that survive crises and those permanently damaged comes down to preparation and response quality. Our crisis communications practice provides proactive crisis planning with vulnerability audits, scenario-specific response protocols, pre-approved messaging frameworks, and spokesperson training.</P>
        <P>When a crisis occurs, our team activates immediately — assessing the situation, developing response strategy, coordinating messaging across channels, managing media inquiries, monitoring public sentiment, and guiding leadership through every decision point until resolution. Our goal is always to emerge with your reputation intact or even strengthened.</P>
        <MidCreative type="shield" />

        <H2>Digital PR and Online Reputation</H2>
        <P>Your online reputation is often the first impression potential customers encounter. Our digital PR services encompass online reputation management, review monitoring and response strategies, search engine reputation management, and social proof amplification. We ensure that when someone searches for your brand, they find a consistent, compelling, positive narrative.</P>
        <P>Influencer relations are a core part of modern PR. Our team identifies the creators and opinion leaders who shape your industry, then builds authentic partnerships that advance your brand narrative and extend your reach to new audiences.</P>

        <H2>Measurement and Reporting</H2>
        <P>Our PR measurement framework tracks both quantitative and qualitative metrics demonstrating real business impact. We monitor media impressions, publication authority scores, sentiment analysis, share of voice relative to competitors, website traffic from PR activities, lead generation attributable to coverage, and executive visibility metrics. Monthly reports provide clear, actionable insights that inform ongoing strategy refinement and demonstrate concrete value.</P>

        <Highlight icon={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>} stat="92%" label="positive sentiment score" desc="Our UK PR campaigns consistently maintain 90%+ positive sentiment ratings through strategic narrative control, proactive media management, and authentic thought leadership positioning." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 92, suffix: "%", label: "Positive Sentiment" },
        { value: 150, suffix: "+", label: "Media Placements" },
        { value: 340, suffix: "M", label: "Impressions" },
        { value: 48, suffix: "hr", label: "Crisis Response" },
      ]} />

      <ProcessSteps title="Our PR Strategy Process" steps={[
        { title: "Brand & Media Audit", desc: "Comprehensive analysis of your current media presence, brand perception, competitor coverage, and journalist/influencer landscape in your UK sector." },
        { title: "Narrative & Positioning", desc: "Craft your core brand narrative, key messages, spokesperson talking points, and media pitch angles that differentiate you in the UK market." },
        { title: "Outreach & Placement", desc: "Targeted media outreach to relevant UK journalists, editors, and producers — pitching stories, securing interviews, and placing thought leadership content." },
        { title: "Monitor & Amplify", desc: "Real-time media monitoring, sentiment tracking, coverage amplification across social channels, and monthly performance reporting." },
      ]} />

      <FAQSection title="Public Relations FAQs" faqs={[
        { q: "How do you secure media coverage for UK businesses?", a: "We use established relationships with 500+ UK journalists, editors, and producers across national, trade, and regional media. Every pitch is carefully crafted with a newsworthy angle tailored to each outlet's audience and editorial focus." },
        { q: "Do you handle crisis communications?", a: "Yes — we provide both proactive crisis preparedness (vulnerability audits, response protocols, spokesperson training) and reactive crisis management when issues arise. Our crisis team activates within hours with coordinated messaging and media strategy." },
        { q: "What kind of businesses do you work with for PR in the UK?", a: "We work with startups through to enterprise brands across technology, fintech, SaaS, healthcare, property, professional services, and consumer brands. Our PR strategies are tailored to each sector's unique media landscape." },
        { q: "How do you measure PR success?", a: "Beyond vanity metrics, we track media impressions, publication authority scores, sentiment analysis, share-of-voice vs competitors, referral traffic, lead attribution, and brand search volume changes — all reported monthly." },
        { q: "Can you help position our CEO as a thought leader?", a: "Absolutely. Executive visibility is a core service — we secure bylined articles in leading UK publications, conference speaking opportunities, podcast appearances, and media interviews to build your leadership team's public profile." },
      ]} />

      <RelatedServices current="public-relations" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// SERVICE 5: UI & UX DESIGN (1000+ words)
// ═════════════════════════════════════════════
function UIUXDesignPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="Best UI/UX Design Services in UK" title="Design That Converts and Delights" subtitle="The best UI/UX design services in UK — user-centered research, stunning visual interfaces, and conversion-optimized experiences for businesses across the United Kingdom." />
      <SubServices items={[
        { icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></>, title: "User Research", desc: "Interviews, surveys, usability testing, and persona development that ground every design decision in real user needs." },
        { icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>, title: "Wireframing & Prototyping", desc: "Low and high-fidelity prototypes that validate concepts before a single line of code is written." },
        { icon: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>, title: "Visual Design Systems", desc: "Comprehensive design systems with components, tokens, and guidelines that ensure brand consistency at scale." },
        { icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, title: "Conversion Optimization", desc: "A/B testing, heatmap analysis, and funnel optimization that systematically increase conversion rates." },
        { icon: <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></>, title: "Mobile-First Design", desc: "Responsive interfaces optimised for every screen size, with mobile users as the primary design target." },
        { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>, title: "Accessibility (WCAG)", desc: "Inclusive design meeting WCAG 2.1 AA standards, ensuring your UK products work for every user." },
      ]} />
      <PageIllustration type="uiux" />
      <ContentBlock>
        <H2>The Business Case for Exceptional Design</H2>
        <P>Design is not decoration. In the digital economy, design is the primary interface between your business and your customers. It is the first impression that determines whether a visitor stays or leaves, the ongoing experience that determines whether a customer returns or defects, and the emotional connection that determines whether someone becomes a passive user or an active advocate. Research consistently shows every pound invested in UX design returns between £2 and £100. At HotBot Studios, we deliver the best UI/UX design services in UK, approaching design as a strategic business discipline for brands across the United Kingdom.</P>
        <P>Our design philosophy centers on the principle that the best design is invisible. Users should not notice the design — they should notice how easy, enjoyable, and efficient it is to accomplish what they came to do. When a website visitor finds the information they need within seconds, when an app user completes a complex task without a help guide, when a customer's journey feels natural and frictionless — that is exceptional design work.</P>
        <P>What makes our approach distinctive is the fusion of aesthetic excellence with rigorous usability testing and data-driven optimization. Beautiful design that confuses users is as useless as functional design that repels them. We create interfaces that are both visually stunning and intuitively usable, testing assumptions with real users at every stage.</P>

        <H2>User Experience (UX) Design</H2>
        <H3>Research and Discovery</H3>
        <P>Every design project begins with deep user research. We conduct stakeholder interviews, user interviews and surveys, competitive analysis, and analytics review of existing properties. This research produces detailed user personas, journey maps, and problem statements that guide every design decision. We define information architecture, user flows, and interaction models aligned with user expectations. Nothing is left to assumption.</P>

        <H3>Wireframing and Prototyping</H3>
        <MidCreative type="wireframe" />
        <P>Low-fidelity wireframes establish layout, hierarchy, and interaction patterns before visual design begins. Interactive prototypes enable usability testing with real users before any code is written. We test navigation patterns, form completion flows, content discovery paths, and task completion scenarios, identifying and resolving usability issues at the cheapest stage.</P>

        <H2>User Interface (UI) Design</H2>
        <H3>Visual Design Systems</H3>
        <P>Our visual design process begins with establishing a comprehensive design system — a unified language of colors, typography, spacing, iconography, and component patterns ensuring consistency. Design systems accelerate design and development work while maintaining quality. Our systems include detailed specifications, usage guidelines, and component libraries that serve as the single source of truth for your digital brand.</P>
        <P>Color palettes are selected through careful consideration of brand personality, industry conventions, accessibility requirements, and psychological impact. Typography choices balance readability with character. Spacing systems create rhythm and breathing room that makes interfaces feel polished and professional.</P>

        <H3>Responsive and Adaptive Design</H3>
        <P>Our responsive design approach ensures your interface adapts beautifully to every viewport. We consider the context of each device — touch interactions on mobile, precision on desktop, quick-glance on smartwatches — and adapt not just layout but the interaction model to suit each context optimally.</P>

        <H2>Brand Identity and Graphic Design</H2>
        <MidCreative type="users" />
        <P>Your visual identity is the foundation for all design work. Our brand identity services encompass logo design, color systems, typography selection, visual language development, photography and illustration style guidelines, and comprehensive brand books. We develop identities that are distinctive, memorable, and versatile across applications.</P>
        <P>Beyond identity systems, our graphic design team produces marketing collateral, social media graphics, presentation templates, print materials, packaging design, and environmental graphics. Every piece is created within your brand identity framework, ensuring visual consistency that builds recognition and trust.</P>

        <H2>Conversion Optimization</H2>
        <P>Design excellence should serve business objectives. Our conversion-focused methodology applies behavioral psychology principles, persuasive design patterns, and systematic A/B testing to optimize every element of the conversion path. Landing page design, form optimization, call-to-action placement, social proof integration, friction reduction, and urgency mechanisms are all designed, tested, and refined.</P>
        <P>We implement heat mapping, session recording, scroll depth tracking, and click analysis to understand exactly how users interact with your interfaces. Our clients typically see 30-80% improvements in conversion rates within the first three months of design optimization engagement.</P>

        <Highlight icon={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>} stat="80%" label="conversion rate improvement" desc="Systematic UX optimisation — heatmap analysis, A/B testing, and user research — delivers 30–80% conversion rate improvements for UK businesses within 90 days." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 80, suffix: "%", label: "Conversion Uplift" },
        { value: 12, suffix: "K+", label: "Users Tested" },
        { value: 99, suffix: "%", label: "WCAG Compliance" },
        { value: 4.8, suffix: "/5", label: "Usability Score" },
      ]} />

      <ProcessSteps title="Our Design Process" steps={[
        { title: "Research & Discovery", desc: "User interviews, surveys, analytics review, competitive audit, and persona development to build a deep understanding of your UK audience's needs." },
        { title: "Wireframe & Prototype", desc: "Low-fi wireframes through to interactive hi-fi prototypes — tested with real users and iterated before any visual design begins." },
        { title: "Visual Design & System", desc: "Pixel-perfect UI design with a comprehensive design system — components, tokens, typography, colour, and guidelines for long-term consistency." },
        { title: "Test, Handoff & Optimise", desc: "Usability testing, developer handoff with precise specs, and post-launch CRO using heatmaps, session recordings, and A/B experiments." },
      ]} />

      <FAQSection title="UI/UX Design FAQs" faqs={[
        { q: "What's the difference between UI and UX design?", a: "UX (User Experience) focuses on how a product works — research, information architecture, user flows, and interaction design. UI (User Interface) focuses on how it looks — visual design, typography, colour, spacing, and component styling. We deliver both as an integrated service." },
        { q: "How do you conduct user research for UK audiences?", a: "We use a mix of methods — moderated and unmoderated user testing, in-depth interviews, surveys, card sorting, tree testing, and analytics analysis. For UK-specific projects, we recruit UK-based participants and account for regional and demographic diversity." },
        { q: "Do you create design systems?", a: "Yes — every project includes a scalable design system with reusable components, design tokens (colours, spacing, typography), interactive states, accessibility specs, and documentation. This ensures consistency as your product grows and new team members join." },
        { q: "Can you redesign our existing product without rebuilding it?", a: "Absolutely. We frequently conduct UX audits and incremental redesigns — improving navigation, conversion flows, and visual polish without requiring a full technical rebuild. This approach minimises risk while delivering measurable improvements." },
        { q: "Do your designs meet accessibility standards?", a: "All our designs target WCAG 2.1 AA compliance as a minimum — proper colour contrast, keyboard navigation, screen reader support, focus indicators, and semantic markup. We can also target AAA compliance for public sector and regulated UK industries." },
      ]} />

      <RelatedServices current="ui-ux-design" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// SERVICE 6: CONSULTANCY (1000+ words)
// ═════════════════════════════════════════════
function ConsultancyPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="Best Marketing Consulting Services in UK" title="Strategic Guidance for Digital Transformation" subtitle="The best marketing consulting services in UK — expert business strategy, digital transformation roadmaps, and actionable growth plans for businesses across the United Kingdom." />
      <SubServices items={[
        { icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>, title: "Go-To-Market Strategy", desc: "Launch strategies designed to capture market share and accelerate early traction across UK markets." },
        { icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>, title: "Brand Positioning", desc: "Define your unique market position and craft messaging that resonates with ideal UK customers." },
        { icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>, title: "Offer Structuring", desc: "Design irresistible offers and pricing models that maximise customer lifetime value." },
        { icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, title: "Funnel Strategy", desc: "Build multi-channel acquisition funnels that convert strangers into loyal customers." },
        { icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>, title: "Customer Acquisition Systems", desc: "Scalable, repeatable systems for customer acquisition across paid and organic channels." },
        { icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>, title: "Marketing Infrastructure", desc: "Set up the tools, automations, and processes needed for sustainable marketing operations." },
      ]} />
      <PageIllustration type="consulting" />
      <ContentBlock>
        <H2>Why Strategic Consultancy Matters</H2>
        <P>Markets shift quickly — what drove results last year may not work today. Technology options multiply, buyer behaviour evolves, and competitors adapt constantly. As the provider of the best marketing consulting services in UK, we bring outside perspective, market intelligence, and clear strategic thinking that helps businesses across the United Kingdom make confident decisions and move faster.</P>
        <P>At HotBot Studios, our consultancy practice is built by operators, not theorists. Our consultants have run digital businesses, managed marketing budgets, built technology platforms, and scaled operations. They bring practical, battle-tested insights to every engagement — the kind of wisdom that only comes from having made difficult decisions under pressure and lived with the consequences.</P>
        <P>We believe the most valuable consulting makes itself unnecessary. Our goal is to build internal capability — transferring frameworks, methodologies, and analytical tools to your team so they can continue making excellent strategic decisions long after our engagement concludes.</P>

        <H2>Digital Transformation Strategy</H2>
        <H3>Current State Assessment</H3>
        <P>Every transformation journey begins with honest assessment. Our diagnostic examines your technology stack, operational workflows, customer experience touchpoints, data infrastructure, team capabilities, and organizational readiness for change. We benchmark your digital maturity against industry leaders, identifying specific gaps that represent the greatest opportunities. This assessment is conducted through stakeholder interviews, process observation, technology audits, customer research, and competitive analysis.</P>
        <P>We also assess organizational culture's readiness for digital transformation, identifying potential resistance, champions who can drive adoption, and communication strategies that build buy-in at every level. Technology transformation fails most often not because of technology but because of people.</P>
        <MidCreative type="roadmap" />

        <H3>Transformation Roadmap</H3>
        <P>We develop a phased transformation roadmap balancing ambition with pragmatism. Each phase delivers measurable value while building foundation for subsequent phases, creating momentum that maintains organizational commitment. The roadmap specifies technology investments, process changes, team development needs, partnership requirements, and success metrics for each phase.</P>

        <H2>Market Research and Competitive Intelligence</H2>
        <P>Strategic decisions are only as good as the information they're based on. We conduct primary research including customer interviews, surveys, focus groups, and ethnographic studies revealing unmet needs and purchase drivers. Secondary research synthesizes industry reports, market data, academic research, and trend analyses into clear strategic insights.</P>
        <MidCreative type="growth" />
        <P>Our competitive intelligence goes beyond surface monitoring to provide deep understanding of competitor strategies, capabilities, vulnerabilities, and likely future moves. We analyze positioning, pricing strategies, marketing approaches, technology investments, hiring patterns, and customer sentiment. This intelligence enables you to identify competitive white space and anticipate market moves.</P>

        <H2>Growth Strategy and Planning</H2>
        <P>Growth strategy connects business objectives to tactical execution. Our growth consulting clarifies your business model, unit economics, and growth levers — understanding precisely which activities drive revenue and which investments produce highest returns. We develop financial models projecting different growth strategies' impact, enabling informed resource allocation.</P>
        <P>Channel strategy identifies the most effective acquisition, retention, and expansion channels for your business. Pricing strategy analysis ensures optimal positioning. Partnership strategy identifies strategic alliances that accelerate growth beyond organic efforts. Go-to-market planning provides detailed execution frameworks for new products, markets, and segments.</P>

        <H2>Technology Advisory</H2>
        <P>Technology decisions constrain or enable your business for years. Our technology advisory provides objective, vendor-agnostic guidance ensuring you invest in the right platforms, architectures, and tools. We evaluate options against your requirements, budget, team capabilities, integration needs, and scalability projections — cutting through vendor marketing to provide honest assessments.</P>
        <P>Architecture advisory ensures your infrastructure is designed for the scale, performance, and reliability your business demands. We advise on build-versus-buy decisions, platform selection, data architecture, security requirements, compliance considerations, and technology talent strategy.</P>

        <H2>Workshop Facilitation and Executive Coaching</H2>
        <P>Our workshop facilitation brings your leadership team together for focused sessions addressing strategic challenges — market positioning, growth planning, digital transformation priorities, innovation strategy, or organizational design. Our facilitators create environments where diverse perspectives are heard, assumptions are challenged constructively, and concrete decisions emerge.</P>
        <P>Executive coaching provides one-on-one strategic guidance for leaders navigating complex digital challenges. Whether you're a CEO defining digital vision, a CMO building modern marketing, or a CTO evaluating technology investments, our coaches provide experienced sounding boards, structured thinking frameworks, and accountability that helps you make better decisions.</P>

        <Highlight icon={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} stat="4.2x" label="average client ROAS" desc="Our strategic consulting clients achieve an average 4.2x return on marketing spend through data-driven channel prioritisation, funnel optimisation, and systematic growth frameworks." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 4.2, suffix: "x", label: "Average ROAS" },
        { value: 18, suffix: "%", label: "CAC Reduction" },
        { value: 34, suffix: "%", label: "LTV Increase" },
        { value: 120, suffix: "+", label: "UK Brands Advised" },
      ]} />

      <ProcessSteps title="Our Consulting Framework" steps={[
        { title: "Strategic Audit", desc: "Comprehensive assessment of your market position, competitive landscape, customer data, current marketing performance, and growth blockers." },
        { title: "Growth Roadmap", desc: "A prioritised 90-day action plan with channel recommendations, budget allocation, KPI targets, and resource requirements for your UK market." },
        { title: "Execution Support", desc: "Hands-on guidance through implementation — agency coordination, vendor selection, campaign oversight, and weekly performance reviews." },
        { title: "Scale & Systemise", desc: "Build repeatable growth systems — documented playbooks, team training, hiring frameworks, and technology infrastructure for long-term independence." },
      ]} />

      <FAQSection title="Consulting FAQs" faqs={[
        { q: "What types of businesses benefit from marketing consulting?", a: "Any UK business looking to accelerate growth — startups seeking product-market fit, scale-ups building their first marketing function, and enterprises transforming their digital capabilities. We work across B2B, B2C, SaaS, e-commerce, and professional services." },
        { q: "How is consulting different from hiring an agency?", a: "Consulting provides strategic direction and decision-making frameworks, while agencies execute campaigns. We help you decide which channels to invest in, how to structure your team, and what technology to adopt — then connect you with the right execution partners (including our own teams)." },
        { q: "What does a typical consulting engagement look like?", a: "Most engagements start with a 2–4 week strategic audit, followed by a 90-day growth roadmap presentation. Ongoing advisory typically involves weekly 60-minute strategy sessions, monthly performance reviews, and quarterly planning workshops." },
        { q: "Can you help us build an in-house marketing team?", a: "Yes — we provide talent strategy consulting including role definitions, hiring criteria, interview frameworks, onboarding plans, and team structure recommendations. We can also serve as interim marketing leadership while you recruit permanent team members." },
        { q: "Do you work with businesses outside London?", a: "We work with UK businesses nationwide — Manchester, Birmingham, Leeds, Edinburgh, Bristol, Cardiff, and beyond. Consulting sessions are conducted both in-person and remotely, depending on your preference." },
      ]} />

      <RelatedServices current="consultancy" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// SERVICE 7: SOFTWARE DEVELOPMENT
// ═════════════════════════════════════════════
function SoftwareDevPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="Best Software Development Services in UK" title="Custom Software That Scales With You" subtitle="The best software development services in UK — bespoke applications, SaaS platforms, mobile apps, and API integrations engineered for performance across the United Kingdom." />
      <SubServices items={[
        { icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, title: "Custom Software", desc: "Bespoke applications built from scratch to solve your unique business challenges with clean, maintainable code." },
        { icon: <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></>, title: "Mobile Apps", desc: "Native iOS and Android development plus cross-platform solutions with React Native and Flutter." },
        { icon: <><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></>, title: "Cloud & SaaS Platforms", desc: "Scalable cloud-native SaaS products on AWS, Azure, and GCP with multi-tenant architecture." },
        { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>, title: "API Development", desc: "RESTful and GraphQL APIs, third-party integrations, payment gateways, and microservices architecture." },
        { icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, title: "Web Applications", desc: "Complex web apps with React, Next.js, and Node.js — dashboards, portals, marketplaces, and internal tools." },
        { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>, title: "DevOps & Security", desc: "CI/CD pipelines, automated testing, infrastructure-as-code, and security-first architecture for UK compliance." },
      ]} />
        <MidCreative type="funnel" />
      <PageIllustration type="software" />
      <ContentBlock>
        <H2>Engineering Excellence for UK Businesses</H2>
        <P>At HotBot Studios, we deliver the best software development services in UK by combining engineering rigour with business acumen. Every application we build starts with a deep understanding of your operational workflow, user needs, and growth ambitions. We don't just write code — we architect systems that scale with your business, from MVP to enterprise-grade platforms serving millions of users across the United Kingdom and beyond.</P>
        <P>Our engineering team brings experience from leading technology companies, startups, and consultancies. We work with modern, battle-tested technology stacks — React, Next.js, Node.js, Python, Go, PostgreSQL, MongoDB, Redis, Docker, Kubernetes — selecting the optimal tools for each project rather than forcing every problem through a single framework. Every project follows agile methodology with fortnightly sprints, daily standups, and transparent progress reporting.</P>

        <MidCreative type="pipeline" />
        <H2>Full-Stack Web Development</H2>
        <P>Our web development practice covers the entire stack — from pixel-perfect frontend interfaces to reliable backend APIs and scalable database architecture. We build responsive web applications that perform flawlessly across all devices and browsers, with server-side rendering for optimal SEO performance and client-side interactivity for engaging user experiences. Progressive web app capabilities ensure your application works offline and loads instantly, even on slow connections.</P>
        <P>We implement comprehensive testing strategies including unit tests, integration tests, end-to-end tests, and performance benchmarks. Code reviews are mandatory for every merge request, and our CI/CD pipelines ensure that every deployment is automated, repeatable, and rollback-safe. The result is software that ships fast without compromising quality or reliability.</P>

        <H2>Mobile Application Development</H2>
        <P>Mobile is where your customers are. Our mobile development team builds native iOS and Android applications using Swift, Kotlin, and modern platform-specific frameworks, as well as cross-platform solutions with React Native and Flutter for teams that need to maximise reach while controlling development costs. We handle the entire mobile lifecycle — from UX design and prototyping through development, testing, App Store submission, and ongoing maintenance and feature updates.</P>
        <P>Every mobile app we build includes offline-first architecture, push notification systems, analytics integration, and crash reporting. We optimise for battery life, network efficiency, and app store performance metrics that affect discoverability. Our apps consistently achieve 4.5+ star ratings and maintain crash-free rates above 99.5%.</P>

        <H2>Cloud Architecture & DevOps</H2>
        <P>Modern software demands modern infrastructure. Our DevOps practice designs and implements cloud architecture on AWS, Google Cloud, and Azure that balances performance, reliability, and cost efficiency. We implement infrastructure-as-code using Terraform and CloudFormation, container orchestration with Docker and Kubernetes, and automated scaling that handles traffic spikes without manual intervention.</P>
        <P>Security is embedded at every layer — encrypted data at rest and in transit, role-based access controls, vulnerability scanning, penetration testing, and compliance with UK data protection regulations including GDPR. Our monitoring and alerting systems provide real-time visibility into application health, enabling proactive issue resolution before users are affected.</P>

        <H2>SaaS Platform Development</H2>
        <P>Building a SaaS product requires specialised expertise in multi-tenancy, subscription billing, user management, and scalable architecture. Our team has launched multiple successful SaaS platforms and brings deep knowledge of the patterns, pitfalls, and best practices that determine whether a SaaS product thrives or struggles. From payment integration with Stripe and GoCardless to usage-based billing, team management, and white-label capabilities, we build the complete infrastructure your SaaS product needs to succeed in UK and global markets.</P>

        <Highlight icon={<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>} stat="99.9%" label="uptime guarantee" desc="Our UK-hosted applications are architected for maximum reliability — auto-scaling infrastructure, zero-downtime deployments, and 24/7 monitoring deliver 99.9% uptime SLAs." />
      </ContentBlock>

      <ServiceStats stats={[
        { value: 99.9, suffix: "%", label: "Uptime SLA" },
        { value: 43, suffix: "s", label: "Avg Build Time" },
        { value: 4.5, suffix: "★", label: "App Store Rating" },
        { value: 200, suffix: "+", label: "APIs Integrated" },
      ]} />

      <ProcessSteps title="Our Development Lifecycle" steps={[
        { title: "Discovery & Scoping", desc: "Requirements workshops, user story mapping, technical architecture design, and detailed project estimation with fixed-scope or agile engagement models." },
        { title: "Design & Prototype", desc: "UX wireframes, interactive prototypes, and visual design — tested with real users and approved before development begins, saving time and budget." },
        { title: "Build & Iterate", desc: "Fortnightly agile sprints with daily standups, code reviews, automated testing, and regular demo sessions so you see progress every step of the way." },
        { title: "Launch & Support", desc: "Staged deployment with rollback capabilities, performance monitoring, security audits, and ongoing maintenance and feature development." },
      ]} />

      <FAQSection title="Software Development FAQs" faqs={[
        { q: "What technology stack do you use?", a: "We select the best tools for each project rather than forcing a single stack. Common choices include React/Next.js and Vue for frontends, Node.js/Python/Go for backends, PostgreSQL/MongoDB for databases, and AWS/GCP/Azure for hosting. Mobile projects use Swift, Kotlin, React Native, or Flutter." },
        { q: "How long does it take to build a custom application?", a: "MVPs typically take 6–10 weeks. Full-featured applications take 3–6 months depending on complexity. SaaS platforms with multi-tenancy, billing, and admin dashboards typically require 4–8 months. We provide detailed timelines during the scoping phase." },
        { q: "Do you offer ongoing maintenance after launch?", a: "Yes — we offer SLA-backed maintenance packages including security updates, performance monitoring, bug fixes, server management, and feature development. Most UK clients stay on ongoing retainers for continuous improvement." },
        { q: "Can you take over an existing codebase?", a: "Absolutely. We regularly inherit legacy codebases, conduct thorough code audits, stabilise critical issues, and incrementally modernise the architecture. We provide honest assessments of technical debt and pragmatic roadmaps for improvement." },
        { q: "How do you handle data security and GDPR compliance?", a: "Security is embedded at every layer — encrypted data, RBAC, vulnerability scanning, penetration testing, and full GDPR compliance including data processing agreements, privacy by design, and right-to-erasure capabilities for UK and EU users." },
      ]} />

      <RelatedServices current="software-dev" navigate={navigate} />
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ═════════════════════════════════════════════
// ABOUT PAGE (1000+ words)
// ═════════════════════════════════════════════
function AboutPage({ navigate, openForm }) {
  return (
    <>
      <PageHeader tag="About Us" title="Pioneering Digital Outreach" subtitle="We are a Boutique Mark-Tech Company who are a catalyst to your Digital Success." />
      <ContentBlock>
        <H2>Our Story</H2>
        <P>HotBot Studios was born from a powerful observation: the gap between what digital technology can do for businesses and what most businesses are actually doing with it is enormous. While enterprises talk about digital transformation, the reality is that most companies are still running critical processes through spreadsheets, generic templates, and fragmented tools. Marketing campaigns launch without proper tracking. Websites go live without performance optimization. Customer interactions fall through cracks between disconnected systems. Opportunities are missed daily — not because of lack of effort, but because of lack of infrastructure.</P>
        <P>We founded HotBot Studios to close that gap. Not with flashy demos or theoretical frameworks, but with production-grade digital solutions that deliver measurable business impact. Our founding team spent years building marketing, automation, and technology systems inside high-growth companies before realizing that every business faces the same fundamental challenges — the same bottlenecks, inefficiencies, and missed opportunities. So we built a company dedicated to solving these problems systematically.</P>

        <H2>What Makes Us Different</H2>
        <H3>The Mark-Tech Approach</H3>
        <P>We coined "Mark-Tech" to describe our unique approach: the fusion of marketing creativity with technology infrastructure. Most agencies specialize in either creative or technical, leaving clients to bridge the gap. HotBot Studios operates at the intersection, ensuring every solution is both creatively compelling and technically excellent. Our marketing strategies are powered by intelligent technology. Our software solutions are designed with user psychology and brand experience in mind.</P>

        <H3>Systems Over Tactics</H3>
        <P>Individual tactics produce individual results. Systems produce compounding results. Every solution we build is a component of a larger operational system that gets more effective over time. We don't chase trends or deploy shiny tools for their own sake. We build infrastructure that works, scales, and endures. When we implement marketing automation, it connects to your CRM, feeds analytics, triggers sales processes, and informs content strategy. Everything connects. Everything compounds.</P>

        <H3>Measurement Over Assumption</H3>
        <P>We don't guess. Every system we deploy comes with comprehensive analytics showing exactly what's working, what isn't, and what to do about it. Our clients never wonder whether their investment pays off — the data makes it obvious. If something isn't producing results, we know within days, not months, and iterate immediately.</P>

        <H3>Partnership Over Transactions</H3>
        <P>We don't do one-off projects. Our best work happens in long-term partnerships where we deeply understand a business and continuously optimize over time. Our average client relationship exceeds eighteen months, with retention above ninety-four percent. That's not because of contracts — it's because results keep compounding.</P>

        <H2>Our Team</H2>
        <P>We are a distributed team of engineers, data scientists, growth strategists, designers, content creators, PR professionals, and operational specialists. Our backgrounds span enterprise SaaS, high-growth startups, management consulting, digital agencies, and academic research. What unites us is a shared belief that the best technology is invisible — it just makes things work better, faster, and more reliably.</P>
        <P>We hire for depth of expertise and breadth of curiosity. Every team member brings not just technical skill but strategic understanding — the ability to see how a technical solution connects to business outcomes. Our culture values rigorous thinking, creative problem-solving, transparent communication, and obsessive focus on results that matter.</P>

        <H2>Our Process</H2>
        <P>Every engagement starts with discovery — mapping current operations, understanding business goals, analysing competitors, and finding the highest-impact opportunities. We start with quick wins that build momentum, then scale into broader changes. Implementation is hands-on and iterative. We test, measure, and adjust continuously. After launch, we keep optimising — because launch day is just the beginning.</P>

        <H2>Our Vision</H2>
        <P>We envision a world where every business has access to digital infrastructure enabling exceptional growth. Where marketing is intelligent and personalized, customer experiences are seamless, business operations run with software-like efficiency, and data-driven decision-making is the norm. HotBot Studios exists to make that vision reality — one business, one system, one transformation at a time.</P>
      </ContentBlock>
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ─── CONTACT ───
function ContactPage({ openForm }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = useState(false);
  const handleSend = async () => {
    await LeadsDB.save({ ...form, formType: "contact-page", service: "General Inquiry", source: "contact-page" });
    setSent(true);
  };
  return (
    <>
      <PageHeader tag="Contact" title="Let's build something extraordinary" subtitle="Tell us about your business and we'll show you what's possible." />
      <section className="relative z-10 py-16">
        <div className="max-w-xl mx-auto px-6">
          <Reveal>
            <GlassCard className="p-8 md:p-10" hover={false}>
              {sent ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-5">✓</div>
                  <h3 className="text-xl font-bold text-white mb-2">Message sent</h3>
                  <p className="text-slate-400 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {[{ label: "Name", key: "name", type: "text" }, { label: "Email", key: "email", type: "email" }, { label: "Company", key: "company", type: "text" }].map(f => (
                    <div key={f.key}>
                      <label className="text-slate-400 text-sm mb-2 block">{f.label}</label>
                      <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" style={{ background: "#111730", border: "1px solid rgba(255,255,255,0.1)" }} placeholder={`Your ${f.label.toLowerCase()}`} />
                    </div>
                  ))}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Message</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5}
                      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" style={{ background: "#111730", border: "1px solid rgba(255,255,255,0.1)" }} placeholder="Tell us about your project..." />
                  </div>
                  <button onClick={handleSend} className="w-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">Send Message →</button>
                </div>
              )}
            </GlassCard>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── BLOGS ───
function BlogsPage({ navigate, openForm }) {
  const posts = [
    { title: "How AI Chatbots Are Changing Customer Service in 2026", cat: "AI Automation", date: "Feb 15, 2026", excerpt: "Discover how UK businesses use chatbots for 24/7 support, automatic lead qualification, and dramatically reduced response times." },
    { title: "The Complete Guide to Core Web Vitals Optimization", cat: "Development", date: "Feb 10, 2026", excerpt: "Google's Core Web Vitals are a confirmed ranking factor. Learn technical strategies for optimizing LCP, FID, and CLS scores." },
    { title: "Why Your Brand Needs a Digital PR Strategy", cat: "Public Relations", date: "Feb 5, 2026", excerpt: "Explore how integrating digital PR with social media marketing amplifies your brand voice and builds lasting authority." },
    { title: "The ROI of Professional UX Design", cat: "UI/UX", date: "Jan 28, 2026", excerpt: "Every dollar in UX returns $2 to $100. We break down the research and share real case studies on design investment." },
    { title: "Marketing Automation: Setup to 300% Pipeline Growth", cat: "Marketing", date: "Jan 20, 2026", excerpt: "A step-by-step guide to implementing marketing automation that actually works for lead generation and nurturing." },
    { title: "Digital Transformation: A CEO's Guide", cat: "Consulting", date: "Jan 15, 2026", excerpt: "Digital transformation fails 70% of the time. Here's how to be in the 30% that succeed." },
  ];
  return (
    <>
      <PageHeader tag="Blog" title="Insights & Ideas" subtitle="Thoughts on digital marketing, technology, design, and growth from the HotBot Studios team." />
      <section className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-5">
          {posts.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <GlassCard className="p-7 h-full flex flex-col" dot>
                <span className="text-blue-400 text-xs font-semibold tracking-wider uppercase">{p.cat}</span>
                <h3 className="text-white font-semibold mt-2 mb-3">{p.title}</h3>
                <p className="text-slate-300/80 text-sm leading-relaxed flex-1 mb-4">{p.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-xs">{p.date}</span>
                  <span className="text-blue-400 text-sm font-medium">Read →</span>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

// ─── PRODUCTS ───
function ProductsPage({ navigate, openForm }) {
  const products = [
    { name: "Heka", tag: "AI Voice Assistant", desc: "Intelligent voice assistant that handles inbound and outbound calls, qualifies leads, books appointments, and answers FAQs in natural conversation — 24/7, in multiple languages.", features: ["Natural voice conversations", "Appointment booking", "Lead qualification", "Multi-language support"], icon: <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></>, color: "139,92,246" },
    { name: "Website Keyword Assistant", tag: "SEO Intelligence", desc: "Monitors your website content in real time, identifies keyword gaps, suggests optimisations, and tracks ranking movements — feeding actionable SEO tasks directly to your team.", features: ["Real-time keyword tracking", "Content gap analysis", "Rank movement alerts", "Automated SEO tasks"], icon: <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>, color: "34,197,94" },
    { name: "Telegram Keyword Assistant", tag: "Community Intelligence", desc: "Listens across Telegram channels and groups for brand mentions, competitor activity, and industry keywords — then delivers summarised intelligence briefs to your team.", features: ["Channel monitoring", "Competitor tracking", "Keyword alerts", "Daily intelligence briefs"], icon: <><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></>, color: "6,182,212" },
    { name: "LinkedIn Post Assistant", tag: "Content Automation", desc: "Generates on-brand LinkedIn posts from your briefs, company news, or industry trends. Schedules, publishes, and tracks engagement — turning your team into thought leaders on autopilot.", features: ["AI post generation", "Brand voice matching", "Auto-scheduling", "Engagement analytics"], icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>, color: "59,130,246" },
    { name: "Instagram Post Assistant", tag: "Visual Content AI", desc: "Creates scroll-stopping Instagram posts and captions from product photos, brand assets, or text prompts. Handles carousels, reels scripts, hashtag research, and posting schedules.", features: ["AI caption writing", "Hashtag research", "Carousel generation", "Post scheduling"], icon: <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><path d="M17.5 6.5h.01"/></>, color: "236,72,153" },
    { name: "Mental Wellness Assistant", tag: "Employee Wellbeing", desc: "Confidential AI companion for workplace mental health support. Provides mood tracking, guided exercises, stress management techniques, and anonymous escalation to professional resources.", features: ["Mood tracking", "Guided exercises", "Stress management", "Professional referrals"], icon: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>, color: "234,179,8" },
  ];

  return (
    <>
      <PageHeader tag="AI Automation Products" title="Intelligent Assistants for Every Workflow" subtitle="Purpose-built AI products that plug into your business operations — handling calls, content, monitoring, and employee wellbeing around the clock." />
      <section className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => {
              const [hov, setHov] = useState(false);
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                    style={{
                      position: "relative", borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", height: "100%",
                      background: hov ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${hov ? `rgba(${p.color},0.3)` : "rgba(255,255,255,0.06)"}`,
                      transition: "all 0.4s ease",
                      transform: hov ? "translateY(-4px)" : "none",
                      boxShadow: hov ? `0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(${p.color},0.06)` : "0 4px 20px rgba(0,0,0,0.1)",
                    }}>
                    {/* Glow on hover */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, borderRadius: "20px 20px 0 0", background: `linear-gradient(180deg, rgba(${p.color},${hov ? 0.06 : 0.02}), transparent)`, transition: "all 0.4s", pointerEvents: "none" }} />
                    {/* Corner dot */}
                    <div style={{ position: "absolute", top: 16, right: 16, width: 6, height: 6, borderRadius: 3, background: `rgba(${p.color},${hov ? 0.9 : 0.3})`, boxShadow: hov ? `0 0 10px rgba(${p.color},0.5)` : "none", transition: "all 0.4s" }} />
                    {/* Icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                      background: `linear-gradient(135deg, rgba(${p.color},${hov ? 0.2 : 0.1}), rgba(${p.color},0.03))`,
                      border: `1px solid rgba(${p.color},${hov ? 0.35 : 0.15})`, transition: "all 0.4s",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`rgba(${p.color},0.8)`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
                    </div>
                    {/* Tag */}
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: `rgba(${p.color},0.7)`, marginBottom: 6 }}>{p.tag}</span>
                    {/* Name */}
                    <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 8, position: "relative" }}>{p.name}</h3>
                    {/* Desc */}
                    <p style={{ color: "rgba(203,213,225,0.8)", fontSize: 13, lineHeight: 1.6, marginBottom: 20, position: "relative", flex: 1 }}>{p.desc}</p>
                    {/* Features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, position: "relative" }}>
                      {p.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`rgba(${p.color},0.6)`} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ color: "#cbd5e1", fontSize: 12.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    {/* CTA */}
                    <button onClick={() => openForm("get-started")}
                      style={{
                        width: "100%", padding: "11px 0", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                        color: "white", background: hov ? `rgba(${p.color},0.2)` : `rgba(${p.color},0.1)`,
                        border: `1px solid rgba(${p.color},${hov ? 0.4 : 0.15})`, transition: "all 0.3s",
                      }}>Learn More →</button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <CTASection navigate={navigate} openForm={openForm} />
    </>
  );
}

// ─── PRIVACY ───
function PrivacyPage() {
  return (
    <>
      <PageHeader tag="Legal" title="Privacy Policy" subtitle="Last updated: February 2026" />
      <ContentBlock>
        <H2>Information We Collect</H2>
        <P>HotBot Studios collects information you provide directly when using our services, including name, email address, company name, phone number, and messages sent through contact forms or chat systems. We also collect usage data automatically through cookies including IP address, browser type, device information, pages visited, and interaction patterns.</P>
        <P>When you interact with our AI chat systems, conversation data is collected to provide and improve our services, including message content, session identifiers, timestamps, and routing data.</P>
        <H2>How We Use Your Information</H2>
        <P>We use collected information to provide, maintain, and improve our services, communicate about products and offerings, respond to inquiries, analyze usage patterns, and protect against fraud. Conversation data improves response quality, trains models, and ensures accurate lead qualification.</P>
        <H2>Data Sharing</H2>
        <P>We do not sell personal information. We may share data with service providers who assist platform operations, bound contractually to use data only for specified purposes. We may share data when required by law or to protect legal rights.</P>
        <H2>Data Security</H2>
        <P>We implement industry-standard security measures including encryption in transit and at rest, access controls, regular security audits, and monitoring systems. Our infrastructure uses enterprise-grade cloud platforms with SOC 2 certification.</P>
        <H2>Your Rights</H2>
        <P>Depending on jurisdiction, you may have rights to access, correct, delete, restrict processing, data portability, and withdraw consent. Contact privacy@hotbotstudios.com to exercise these rights.</P>
        <H2>Contact</H2>
        <P>Questions about this policy or data practices? Contact us at privacy@hotbotstudios.com or through our website contact form.</P>
      </ContentBlock>
    </>
  );
}

// ─── DASHBOARD ───
function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const all = await LeadsDB.getAll();
      const s = await LeadsDB.getStats();
      setLeads(all);
      setStats(s);
      setLoading(false);
    })();
  }, []);

  const handleStatus = async (id, status) => {
    await LeadsDB.updateStatus(id, status);
    const all = await LeadsDB.getAll();
    const s = await LeadsDB.getStats();
    setLeads(all);
    setStats(s);
  };

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);
  const statusColors = { new: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: "#60a5fa" }, contacted: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.2)", text: "#facc15" }, converted: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", text: "#22c55e" } };

  return (
    <section className="relative z-10 pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-xl font-bold text-white">Leads Dashboard</h1><p className="text-slate-500 text-sm">All form submissions from your website</p></div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /><span className="text-blue-400 text-xs font-medium">{stats.total} Total Leads</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: stats.total, color: "59,130,246" },
            { label: "New", value: stats.new, color: "59,130,246" },
            { label: "Contacted", value: stats.contacted, color: "234,179,8" },
            { label: "Converted", value: stats.converted, color: "34,197,94" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 text-center transition-all duration-300" style={{
              background: `rgba(${s.color},0.04)`,
              border: `1px solid rgba(${s.color},0.12)`,
            }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: `rgba(${s.color},0.8)` }}>{s.value}</div>
              <div className="text-slate-500 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "new", "contacted", "converted"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300"
              style={{
                background: filter === f ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === f ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: filter === f ? "#93c5fd" : "#94a3b8",
              }}>{f.charAt(0).toUpperCase() + f.slice(1)}{f !== "all" && ` (${f === "new" ? stats.new : f === "contacted" ? stats.contacted : stats.converted})`}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="text-slate-500 text-sm">Loading leads...</div></div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center" hover={false}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h3 className="text-white font-semibold mb-2">No leads yet</h3>
            <p className="text-slate-500 text-sm">Form submissions from your website will appear here.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ minHeight: 400 }}>
            {/* Leads list */}
            <div className="lg:col-span-1">
              <GlassCard className="overflow-hidden flex flex-col" hover={false} style={{ maxHeight: "calc(100vh - 340px)" }}>
                <div className="px-4 py-3 border-b border-white/[0.06]"><p className="text-white font-semibold text-sm">{filtered.length} Lead{filtered.length !== 1 ? 's' : ''}</p></div>
                <div className="flex-1 overflow-y-auto">
                  {filtered.map((l, i) => {
                    const sc = statusColors[l.status] || statusColors.new;
                    return (
                      <button key={l.id} onClick={() => setSel(i)}
                        className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-all ${sel === i ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
                        <div className="flex justify-between mb-1">
                          <span className="text-white text-sm font-medium truncate">{l.name || "Unknown"}</span>
                          <span className="text-slate-600 text-[10px]">{l.ts ? new Date(l.ts).toLocaleDateString("en-GB") : ""}</span>
                        </div>
                        <p className="text-slate-500 text-xs truncate mb-2">{l.email}</p>
                        <div className="flex gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.text }}>{l.status?.toUpperCase()}</span>
                          {l.service && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500">{l.service}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Lead detail */}
            <div className="lg:col-span-2">
              {sel !== null && filtered[sel] ? (() => {
                const l = filtered[sel];
                const sc = statusColors[l.status] || statusColors.new;
                return (
                  <GlassCard className="h-full overflow-hidden" hover={false}>
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{l.name}</p>
                        <p className="text-slate-500 text-xs">{l.email}{l.phone ? ` · ${l.phone}` : ""}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{l.status?.toUpperCase()}</span>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Company", value: l.company },
                          { label: "Service", value: l.service },
                          { label: "Budget", value: l.budget },
                          { label: "Source", value: l.formType },
                          { label: "Date", value: l.ts ? new Date(l.ts).toLocaleString("en-GB") : "" },
                          { label: "Lead ID", value: l.id },
                        ].map((f, j) => (
                          <div key={j}>
                            <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">{f.label}</p>
                            <p className="text-slate-300 text-sm">{f.value || "—"}</p>
                          </div>
                        ))}
                      </div>
                      {l.message && (
                        <div>
                          <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Message</p>
                          <div className="rounded-xl p-4 text-sm text-slate-400 leading-relaxed" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            {l.message}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-2">Update Status</p>
                        <div className="flex gap-2">
                          {["new", "contacted", "converted"].map(s => (
                            <button key={s} onClick={() => handleStatus(l.id, s)}
                              className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300"
                              style={{
                                background: l.status === s ? (statusColors[s]?.bg || "rgba(59,130,246,0.1)") : "rgba(255,255,255,0.03)",
                                border: `1px solid ${l.status === s ? (statusColors[s]?.border || "rgba(59,130,246,0.2)") : "rgba(255,255,255,0.06)"}`,
                                color: l.status === s ? (statusColors[s]?.text || "#60a5fa") : "#64748b",
                              }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })() : (
                <GlassCard className="h-full flex items-center justify-center p-12" hover={false}>
                  <div className="text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" className="mx-auto mb-3"><path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="text-slate-500 text-sm">Select a lead to view details</p>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── HOTBOT AI CHATBOT ───
// ─── HOTBOT AI CHATBOT ───
// ─── HOTBOT AI CHATBOT + VOICE AGENT ───
// ─── HOTBOT AI CHATBOT + VOICE (Sarvam AI via n8n) ───
function HotBotChat() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("chat");
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hey! I'm HotBot — your AI assistant. Ask me anything about our services, or tap the phone icon to talk.", ts: Date.now() }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [fabHov, setFabHov] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pulse, setPulse] = useState(0);
  const scrollRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const WEBHOOK = "https://n8n.harshpreetbhasin.com/webhook-test/hotbotstudios.com";

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    if (!recording && !playing) return;
    const t = setInterval(() => setPulse(p => (p + 1) % 360), 50);
    return () => clearInterval(t);
  }, [recording, playing]);

  // Clean up on close
  useEffect(() => {
    if (!open) {
      stopRecording();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setMode("chat");
      setPlaying(false);
      setProcessing(false);
    }
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => handleRecordingDone();
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      setMsgs(p => [...p, { role: "bot", text: "Microphone access denied. Please allow microphone permissions and try again.", ts: Date.now() }]);
      setMode("chat");
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
  };

  const handleRecordingDone = async () => {
    const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
    if (blob.size < 500) {
      setTimeout(() => startRecording(), 400);
      return;
    }
    setProcessing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      try {
        const res = await fetch(WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64,
            audioFormat: blob.type,
            mode: "voice",
            source: "hotbot-voice",
            history: msgs.slice(-10).map(m => ({ role: m.role, content: m.text })),
            timestamp: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        const botText = data?.message || data?.response || data?.text || data?.output || "I received your voice message. Our team will follow up shortly.";
        setMsgs(p => [...p, { role: "bot", text: botText, ts: Date.now() }]);

        if (data?.audio) {
          const audioType = data?.audioFormat || "audio/mp3";
          const audioBlob = await fetch("data:" + audioType + ";base64," + data.audio).then(r => r.blob());
          const url = URL.createObjectURL(audioBlob);
          const a = new Audio(url);
          audioRef.current = a;
          setPlaying(true);
          a.onended = () => {
            setPlaying(false);
            URL.revokeObjectURL(url);
            if (mode === "voice") setTimeout(() => startRecording(), 500);
          };
          a.onerror = () => {
            setPlaying(false);
            if (mode === "voice") setTimeout(() => startRecording(), 500);
          };
          a.play().catch(() => {
            setPlaying(false);
            if (mode === "voice") setTimeout(() => startRecording(), 500);
          });
        } else {
          if (mode === "voice") setTimeout(() => startRecording(), 600);
        }
      } catch {
        setMsgs(p => [...p, { role: "bot", text: "Voice message sent to our team. They'll connect via WhatsApp or Telegram.", ts: Date.now() }]);
        if (mode === "voice") setTimeout(() => startRecording(), 600);
      }
      setProcessing(false);
    };
    reader.readAsDataURL(blob);
  };

  const sendMsg = async (text) => {
    if (!text.trim()) return;
    setMsgs(p => [...p, { role: "user", text, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: "chat", source: "hotbot-website", history: msgs.slice(-10).map(m => ({ role: m.role, content: m.text })), timestamp: new Date().toISOString() }),
      });
      const data = await res.json();
      const botText = data?.message || data?.response || data?.text || data?.output || (typeof data === "string" ? data : "Thanks! Our team will reach out shortly.");
      setMsgs(p => [...p, { role: "bot", text: botText, ts: Date.now() }]);
    } catch {
      setMsgs(p => [...p, { role: "bot", text: "Message sent. Our team will connect via WhatsApp or Telegram.", ts: Date.now() }]);
    }
    setTyping(false);
  };

  const toggleVoice = () => {
    if (mode === "voice") {
      stopRecording();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlaying(false);
      setProcessing(false);
      setMode("chat");
    } else {
      setMode("voice");
      setTimeout(() => startRecording(), 300);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } };

  const ringColor = recording ? "245,158,11" : playing ? "139,92,246" : processing ? "59,130,246" : "59,130,246";
  const rings = [0, 1, 2, 3, 4];
  const rScale = (i) => {
    if (!recording && !playing) return 1;
    const s = Math.sin(((pulse + i * 40) % 360) * Math.PI / 180);
    return 1 + (recording ? 0.12 : 0.2) * Math.abs(s) * (1 - i * 0.15);
  };
  const rOpacity = (i) => {
    if (!recording && !playing) return 0.04;
    const s = Math.sin(((pulse + i * 40) % 360) * Math.PI / 180);
    return (recording ? 0.1 : 0.15) * Math.abs(s) * (1 - i * 0.15);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} onMouseEnter={() => setFabHov(true)} onMouseLeave={() => setFabHov(false)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 99998,
          width: open ? 48 : 60, height: open ? 48 : 60, borderRadius: open ? 14 : 30,
          background: open ? "#1a2240" : "linear-gradient(135deg, #3b82f6, #2563eb)",
          border: open ? "1px solid rgba(255,255,255,0.1)" : "none",
          boxShadow: open ? "0 4px 20px rgba(0,0,0,0.3)" : `0 8px 32px rgba(59,130,246,0.4), 0 0 ${fabHov ? "50" : "20"}px rgba(59,130,246,${fabHov ? "0.3" : "0.15"})`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          transform: fabHov && !open ? "scale(1.1)" : "scale(1)",
        }}>
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
          </svg>
        )}
      </button>
      {!open && <div style={{ position: "fixed", bottom: 72, right: 24, zIndex: 99998, width: 14, height: 14, borderRadius: 7, background: "#22c55e", border: "2px solid #0a0e1a" }} />}

      {open && (
        <div style={{
          position: "fixed", bottom: 84, right: 24, zIndex: 99997,
          width: 380, maxWidth: "calc(100vw - 48px)", height: 520, maxHeight: "calc(100vh - 120px)",
          borderRadius: 20, overflow: "hidden",
          background: "#0c1021", border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,130,246,0.08)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, background: "#0e1330", flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 13 }}>H</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>HotBot</div>
              <div style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4, color: mode === "voice" ? (recording ? "#f59e0b" : playing ? "#a78bfa" : processing ? "#60a5fa" : "#22c55e") : "#22c55e" }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: mode === "voice" ? (recording ? "#f59e0b" : playing ? "#a78bfa" : processing ? "#60a5fa" : "#22c55e") : "#22c55e", display: "inline-block" }} />
                {mode === "voice" ? (recording ? "Listening..." : playing ? "Speaking..." : processing ? "Processing..." : "Voice Ready") : "Online"}
              </div>
            </div>
            {/* Phone toggle */}
            <button onClick={toggleVoice}
              style={{
                width: 34, height: 34, borderRadius: 9, cursor: "pointer",
                background: mode === "voice" ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${mode === "voice" ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", flexShrink: 0,
              }}
              onMouseEnter={e => { if (mode !== "voice") { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; } }}
              onMouseLeave={e => { if (mode !== "voice") { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; } }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mode === "voice" ? "#a78bfa" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </button>
          </div>

          {mode === "voice" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
              <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: `rgba(${ringColor},0.03)`, filter: "blur(50px)", pointerEvents: "none" }} />
              <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                {rings.map(i => (
                  <div key={i} style={{
                    position: "absolute", width: 180 - i * 20, height: 180 - i * 20, borderRadius: "50%",
                    border: `1.5px solid rgba(${ringColor},${rOpacity(i) + 0.05})`,
                    background: `rgba(${ringColor},${rOpacity(i)})`,
                    transform: `scale(${rScale(i)})`,
                    transition: recording || playing ? "none" : "all 0.5s ease",
                  }} />
                ))}
                <button onClick={recording ? stopRecording : startRecording} disabled={processing || playing}
                  style={{
                    position: "relative", zIndex: 2, width: 72, height: 72, borderRadius: 36, border: "none", cursor: processing || playing ? "default" : "pointer",
                    background: recording ? "linear-gradient(135deg, #f59e0b, #d97706)" : playing ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : processing ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: `0 8px 32px rgba(${ringColor},0.3)`,
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                    opacity: processing ? 0.7 : 1,
                  }}>
                  {recording ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                  ) : playing ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  ) : processing ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><path d="M12 19v4M8 23h8"/></svg>
                  )}
                </button>
              </div>
              <p style={{ color: recording ? "#fbbf24" : playing ? "#a78bfa" : processing ? "#60a5fa" : "#94a3b8", fontSize: 14, fontWeight: 600, marginBottom: 6, transition: "color 0.3s" }}>
                {recording ? "Listening — tap to stop" : playing ? "HotBot is speaking..." : processing ? "Processing with Sarvam AI..." : "Tap to speak"}
              </p>
              <p style={{ color: "#475569", fontSize: 11, marginBottom: 12 }}>Powered by Sarvam AI</p>
              {msgs.length > 0 && msgs[msgs.length - 1].role === "bot" && !recording && (
                <div style={{ maxWidth: "90%", padding: "10px 16px", borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)", color: "#c4b5fd", fontSize: 12, textAlign: "center", lineHeight: 1.5, maxHeight: 80, overflowY: "auto" }}>
                  {msgs[msgs.length - 1].text}
                </div>
              )}
            </div>
          ) : (
            <>
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: m.role === "user" ? "#1d3a6e" : "#111730",
                      border: `1px solid ${m.role === "user" ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.06)"}`,
                      color: m.role === "user" ? "#dbeafe" : "#cbd5e1", fontSize: 13, lineHeight: "1.55", wordBreak: "break-word",
                    }}>{m.text}</div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: "flex" }}>
                    <div style={{ padding: "12px 18px", borderRadius: "16px 16px 16px 4px", background: "#111730", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: "#3b82f6", opacity: 0.6 }} />
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: "#3b82f6", opacity: 0.8 }} />
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: "#3b82f6", opacity: 1 }} />
                    </div>
                  </div>
                )}
              </div>
              {msgs.length <= 2 && (
                <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
                  {["What services do you offer?", "Talk to someone on WhatsApp", "Get a quote"].map(q => (
                    <button key={q} onClick={() => sendMsg(q)}
                      style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "#111d3a", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#162044"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#111d3a"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; }}
                    >{q}</button>
                  ))}
                </div>
              )}
              <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0e1330", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Type a message..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: "#111730", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                <button onClick={() => sendMsg(input)} disabled={!input.trim() || typing}
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
                    background: input.trim() && !typing ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#111730",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    opacity: input.trim() && !typing ? 1 : 0.4,
                  }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
// ═════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState("get-started");
  const navigate = useCallback((p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const openForm = useCallback((type = "get-started") => { setFormType(type); setFormOpen(true); }, []);

  // Google Analytics
  useEffect(() => {
    if (document.getElementById("gtag-script")) return;
    const s = document.createElement("script");
    s.id = "gtag-script";
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-5CNWV5X1KC";
    document.head.appendChild(s);
    const s2 = document.createElement("script");
    s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-5CNWV5X1KC');`;
    document.head.appendChild(s2);
  }, []);

  // Track page views
  useEffect(() => {
    if (window.gtag) window.gtag("event", "page_view", { page_title: page, page_path: "/" + page });
  }, [page]);

  // Dynamic page title for SEO
  useEffect(() => {
    const titles = {
      home: "HotBot Studios | Best Digital Marketing & AI Automation Services in UK",
      "marketing-services": "Best Digital Marketing Services in UK | HotBot Studios",
      "ai-automation": "Best AI Automation Services in UK | HotBot Studios",
      "software-development": "Best Content Production Studio Services in UK | HotBot Studios",
      "software-dev": "Best Software Development Services in UK | HotBot Studios",
      "public-relations": "Best Public Relations Services in UK | HotBot Studios",
      "ui-ux-design": "Best UI/UX Design Services in UK | HotBot Studios",
      consultancy: "Best Marketing Consulting Services in UK | HotBot Studios",
      about: "About HotBot Studios | UK Digital Marketing Agency",
      contact: "Contact HotBot Studios | Get Started Today",
      blogs: "Blog | Digital Marketing Insights | HotBot Studios",
      products: "AI Automation Products | HotBot Studios",
      dashboard: "Leads Dashboard | HotBot Studios",
    };
    document.title = titles[page] || titles.home;
  }, [page]);

  const content = useMemo(() => {
    switch (page) {
      case "home": return <HomePage navigate={navigate} openForm={openForm} />;
      case "marketing-services": return <MarketingServicesPage navigate={navigate} openForm={openForm} />;
      case "ai-automation": return <AIAutomationPage navigate={navigate} openForm={openForm} />;
      case "software-development": return <SoftwareDevelopmentPage navigate={navigate} openForm={openForm} />;
      case "software-dev": return <SoftwareDevPage navigate={navigate} openForm={openForm} />;
      case "public-relations": return <PublicRelationsPage navigate={navigate} openForm={openForm} />;
      case "ui-ux-design": return <UIUXDesignPage navigate={navigate} openForm={openForm} />;
      case "consultancy": return <ConsultancyPage navigate={navigate} openForm={openForm} />;
      case "about": return <AboutPage navigate={navigate} openForm={openForm} />;
      case "contact": return <ContactPage openForm={openForm} />;
      case "blogs": return <BlogsPage navigate={navigate} openForm={openForm} />;
      case "products": return <AIAutomationPage navigate={navigate} openForm={openForm} />;
      case "privacy": return <PrivacyPage />;
      case "dashboard": return <DashboardPage />;
      default: return <HomePage navigate={navigate} openForm={openForm} />;
    }
  }, [page, navigate, openForm]);

  return (
    <>
      <div className="min-h-screen text-white relative" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0e1a; overflow-x: hidden; }

        @keyframes glowDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,-40px) scale(1.05)} 66%{transform:translate(-30px,30px) scale(0.95)} }
        @keyframes glowDrift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,-30px)} }
        @keyframes glowDrift3 { 0%,100%{transform:translate(-50%,-50%)} 50%{transform:translate(calc(-50% + 40px),calc(-50% - 30px))} }
        @keyframes scanline { 0%{top:-5%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:105%;opacity:0} }
        @keyframes dotPulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.8)} }
        @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:600px} }

        .animate-glowDrift1{animation:glowDrift1 25s ease-in-out infinite}
        .animate-glowDrift2{animation:glowDrift2 20s ease-in-out infinite}
        .animate-glowDrift3{animation:glowDrift3 22s ease-in-out infinite}
        .animate-scanline{animation:scanline 8s linear infinite}
        .animate-slideDown{animation:slideDown 0.3s ease-out}

        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.15)}
        ::selection{background:rgba(59,130,246,0.3)}

        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 768px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .services-grid { grid-template-columns: 1fr; } .services-grid > * { grid-column: span 1 !important; } }

        @keyframes shimmerSweep {
          0% { transform: translateX(-100%) rotate(15deg); }
          100% { transform: translateX(200%) rotate(15deg); }
        }
        .shimmer-sweep {
          background: linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.06) 40%, rgba(255,255,255,0.08) 50%, rgba(59,130,246,0.06) 60%, transparent 100%);
          animation: shimmerSweep 2s ease-in-out infinite;
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .service-card-wrapper {
          animation: cardEntrance 0.6s cubic-bezier(0.16,1,0.3,1) backwards;
        }

        @keyframes borderRotate {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }

        @keyframes borderShift {
          0%,100% { transform: translateX(-30%) rotate(0deg); }
          50% { transform: translateX(30%) rotate(3deg); }
        }
        .animate-borderShift { animation: borderShift 6s ease-in-out infinite; }

        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes zoomIn { 
          0% { opacity:0; transform:scale(0.8) translateY(40px); }
          45% { opacity:1; transform:scale(1.03) translateY(-6px); }
          72% { transform:scale(0.99) translateY(2px); }
          100% { transform:scale(1) translateY(0); }
        }
        @keyframes formStepIn {
          0% { opacity:0; transform:translateX(24px); }
          100% { opacity:1; transform:translateX(0); }
        }

        /* Testimonial slider animations */
        @keyframes slideCardRight {
          0% { opacity:0; transform: translateX(80px) scale(0.92) rotateY(-8deg); }
          100% { opacity:1; transform: translateX(0) scale(1) rotateY(0deg); }
        }
        @keyframes slideCardLeft {
          0% { opacity:0; transform: translateX(-80px) scale(0.92) rotateY(8deg); }
          100% { opacity:1; transform: translateX(0) scale(1) rotateY(0deg); }
        }
        @keyframes borderSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-borderSlide { animation: borderSlide 3s ease-in-out infinite; }

        @keyframes starPop {
          0% { opacity:0; transform: scale(0) rotate(-30deg); }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { opacity:1; transform: scale(1) rotate(0deg); }
        }
        .testimonial-star { animation: starPop 0.4s cubic-bezier(0.34,1.56,0.64,1) backwards; }

        @keyframes progressFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .testimonial-progress { transform-origin: left; animation: progressFill 5s linear forwards; }

        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.55s cubic-bezier(0.34,1.56,0.64,1); }
        .animate-formStep { animation: formStepIn 0.35s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      <AnimatedGrid />
      <Navbar currentPage={page} navigate={navigate} openForm={openForm} />
      <main className="relative">{content}</main>
      {page !== "dashboard" && <Footer navigate={navigate} />}
      {/* Progressive blur overlays — top and bottom of viewport */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, rgba(10,14,26,0.9) 0%, rgba(10,14,26,0.5) 40%, transparent 100%)", pointerEvents: "none", zIndex: 40 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.6) 35%, rgba(10,14,26,0.2) 65%, transparent 100%)", pointerEvents: "none", zIndex: 40, backdropFilter: "blur(1px)", WebkitBackdropFilter: "blur(1px)" }} />
      </div>
      <FormModal isOpen={formOpen} onClose={() => setFormOpen(false)} formType={formType} />
      <HotBotChat />
    </>
  );
}
