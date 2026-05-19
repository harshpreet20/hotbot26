import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-primary)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          green: "#22c55e",
          amber: "#f59e0b",
          pink: "#ec4899",
        },
      },
      animation: {
        glowDrift1: "glowDrift1 25s ease-in-out infinite",
        glowDrift2: "glowDrift2 20s ease-in-out infinite",
        glowDrift3: "glowDrift3 22s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        shimmerSweep: "shimmerSweep 2s ease-in-out infinite",
        cardEntrance: "cardEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
        borderShift: "borderShift 6s linear infinite",
        borderSlide: "borderSlide 3s linear infinite",
        progressFill: "progressFill 5s ease-out forwards",
      },
      keyframes: {
        glowDrift1: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(60px,-40px) scale(1.1)" },
          "66%": { transform: "translate(-40px,60px) scale(0.9)" },
        },
        glowDrift2: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-80px,-60px) scale(1.15)" },
        },
        glowDrift3: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "40%": { transform: "translate(50px,30px) scale(0.9)" },
          "80%": { transform: "translate(-30px,-50px) scale(1.1)" },
        },
        scanline: {
          "0%": { top: "-2px" },
          "100%": { top: "100%" },
        },
        shimmerSweep: {
          "0%": { left: "-100%" },
          "100%": { left: "200%" },
        },
        cardEntrance: {
          "0%": { opacity: "0", transform: "scale(0.85) translateY(20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        borderShift: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        borderSlide: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
