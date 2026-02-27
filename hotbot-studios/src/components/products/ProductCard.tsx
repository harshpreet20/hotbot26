"use client";
import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovering, setHovering] = useState(false);
  const openForm = useAppStore((s) => s.openForm);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="p-6 rounded-2xl border transition-all duration-500 cursor-default flex flex-col"
      style={{
        background: hovering ? `${product.color}08` : "rgba(255,255,255,0.02)",
        borderColor: hovering ? `${product.color}30` : "rgba(255,255,255,0.08)",
        transform: hovering ? "translateY(-4px)" : "none",
        boxShadow: hovering ? `0 20px 40px ${product.color}15` : "none",
      }}
    >
      <div className="text-3xl mb-3">{product.icon}</div>
      <div
        className="text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: product.color }}
      >
        AI Product
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
      <p className="text-sm mb-2" style={{ color: `${product.color}cc` }}>
        {product.tagline}
      </p>
      <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{product.description}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => openForm("get-started")}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: `${product.color}15`,
            border: `1px solid ${product.color}30`,
            color: product.color,
          }}
        >
          Get Access →
        </button>
        {product.href && (
          <Link
            href={product.href}
            className="text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5"
            style={{ color: `${product.color}80` }}
          >
            Learn more
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
