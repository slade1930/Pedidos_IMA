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
        "relative w-full aspect-[9/12] rounded-3xl bg-[#2D1A10] shadow-xl overflow-hidden group border-2 border-[#3A5F26]/30 hover:border-[#FBBF24]/50 transition-all",
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
        <div className="absolute inset-0 bg-[#1E120C] flex items-center justify-center rounded-3xl" style={{ transform: "translateZ(-15px) scale(1.05)" }}>
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
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FBBF24]">{categoryLabel}</span>
            <h3 className="text-base font-black text-white leading-tight mt-0.5 line-clamp-1">{title}</h3>
          </div>
          <span className="text-xs font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-md">
            /{unitLabel}
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="rounded-xl bg-black/55 px-3 py-2 text-base font-black text-white border border-[#FBBF24]/30 shadow-md">
            {price}
          </div>
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              className="rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-md cursor-pointer hover:bg-[#F59E0B] transition-all bg-[#FBBF24] text-[#1E3A1E]"
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveProductCard;