"use client";
import { useState } from "react";
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
      className="p-6 rounded-2xl border transition-all duration-500 cursor-default"
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
      <p className="text-slate-400 text-sm leading-relaxed mb-5">{product.description}</p>
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
    </div>
  );
}
