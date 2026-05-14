"use client";
import { useState } from "react";

type Country = "IN" | "US" | "UK";

interface PolicyTabsProps {
  india: React.ReactNode;
  usa: React.ReactNode;
  uk: React.ReactNode;
}

const COUNTRIES: { id: Country; label: string; flag: string }[] = [
  { id: "IN", label: "India", flag: "🇮🇳" },
  { id: "US", label: "United States", flag: "🇺🇸" },
  { id: "UK", label: "United Kingdom", flag: "🇬🇧" },
];

export function PolicyTabs({ india, usa, uk }: PolicyTabsProps) {
  const [country, setCountry] = useState<Country>("IN");
  const content: Record<Country, React.ReactNode> = { IN: india, US: usa, UK: uk };

  return (
    <div>
      {/* Country selector */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1 gap-1">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                country === c.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <span>{c.flag}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active country notice */}
      <div className="max-w-3xl mx-auto mb-8 px-4 py-3 rounded-xl bg-blue-500/[0.07] border border-blue-500/20 text-blue-300 text-sm text-center">
        Viewing policy applicable to:{" "}
        <strong>{COUNTRIES.find((c) => c.id === country)?.flag} {COUNTRIES.find((c) => c.id === country)?.label}</strong>.
        &nbsp;HotBot Studios LLP is the legal entity behind all global brand operations.
      </div>

      <div key={country}>{content[country]}</div>
    </div>
  );
}
