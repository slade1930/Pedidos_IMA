"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// --- PROPS INTERFACE ---
interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  categoryLabel: string;
  unitLabel: string;
  title: string;
  price: string;
  onAddToCart?: () => void;
  /** Cantidad disponible en stock (0 = agotado) */
  stock?: number;
}

// --- COMPONENT DEFINITION ---
export function InteractiveProductCard({
  className,
  imageUrl,
  categoryLabel,
  unitLabel,
  title,
  price,
  onAddToCart,
  stock,
  ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  // --- MOUSE MOVE HANDLER ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = ((y - height / 2) / (height / 2)) * -6; // Max rotation 6deg
    const rotateY = ((x - width / 2) / (width / 2)) * 6;   // Max rotation 6deg

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    });
  };

  // --- MOUSE LEAVE HANDLER ---
  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        "relative w-full aspect-[9/12] rounded-3xl bg-[#142b45] shadow-xl overflow-hidden group border-2 border-[#1b4f72]/30 hover:border-[#2fd4a7]/50 transition-all",
        "transform-style-3d",
        className
      )}
      {...props}
    >
      {/* Background Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover rounded-3xl transition-transform duration-300 group-hover:scale-105"
          style={{ transform: "translateZ(-15px) scale(1.05)" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#0e1e33] flex items-center justify-center rounded-3xl" style={{ transform: "translateZ(-15px) scale(1.05)" }}>
          <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
      )}
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent rounded-3xl" />

      {/* Content */}
      <div
        className="absolute inset-0 p-5 flex flex-col justify-between"
        style={{ transform: "translateZ(30px)" }}
      >
        {/* Category Header */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2fd4a7]">{categoryLabel}</span>
            <h3 className="text-base font-black text-white leading-tight mt-0.5 line-clamp-1">{title}</h3>
          </div>
          <span className="text-xs font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-md">
            /{unitLabel}
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="rounded-xl bg-black/55 px-3 py-2 text-base font-black text-white border border-[#2fd4a7]/30 shadow-md">
            {price}
          </div>
          {onAddToCart && (
            <div className="flex flex-col items-stretch gap-1.5">
              {typeof stock === "number" && (
                <span
                  className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    stock <= 0
                      ? "bg-red-500/20 text-red-300 border border-red-400/30"
                      : stock <= 5
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                      : "bg-white/10 text-gray-200 border border-white/10"
                  }`}
                >
                  {stock <= 0 ? "Agotado" : `Quedan ${stock}`}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart();
                }}
                disabled={typeof stock === "number" && stock <= 0}
                className={`rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-md transition-all ${
                  typeof stock === "number" && stock <= 0
                    ? "bg-gray-700/60 text-gray-400 cursor-not-allowed"
                    : "cursor-pointer hover:bg-[#2fbf9b] bg-[#2fd4a7] text-[#142b45]"
                }`}
              >
                {typeof stock === "number" && stock <= 0 ? "Agotado" : "Agregar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveProductCard;