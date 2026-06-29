"use client";

import { useState, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import type { RevenueStats } from "@/features/dashboard/types/dashboard.types";

// ─── PROPS ─────────────────────────────────────────────────

interface RevenueChartProps {
  data?: RevenueStats;
  isLoading?: boolean;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    month: "short",
    day: "numeric",
  });
}

// ─── SKELETON ──────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-[#E8DDD0]/40 rounded animate-pulse" />
        <div className="h-6 w-24 bg-[#E8DDD0]/50 rounded animate-pulse" />
      </div>
      <div className="flex items-end gap-2.5 h-48 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-[#E8DDD0]/15 to-[#E8DDD0]/45 rounded-full animate-pulse"
            style={{
              height: `${20 + Math.sin(i * 0.8) * 35 + 40}%`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between px-1">
        <div className="h-2 w-8 bg-[#E8DDD0]/30 rounded" />
        <div className="h-2 w-8 bg-[#E8DDD0]/30 rounded" />
        <div className="h-2 w-8 bg-[#E8DDD0]/30 rounded" />
      </div>
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div 
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm"
        style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      >
        <ChartSkeleton />
      </div>
    );
  }

  const rawData = data?.data ?? [];
  const totalRevenue = data?.total_revenue ?? 0;

  if (!data || rawData.length === 0) {
    return (
      <div 
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm"
        style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      >
        <h3 className="text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest mb-5 leading-none">
          Ingresos
        </h3>
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-[#E8DDD0] bg-[#E8DDD0]/10">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#E8DDD0]/40 text-[#3D5A1E]/80 mb-3 relative">
            <div className="absolute inset-0 rounded-full bg-[#3D5A1E]/10 animate-ping opacity-25" />
            <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#4A3728]">No hay datos de ingresos</p>
          <p className="text-[11px] text-[#4A3728]/50 mt-1 max-w-[200px]">Los registros de transacciones aparecerán aquí una vez procesados.</p>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...rawData.map((d) => d.amount), 1);
  const bars = rawData.slice(-12);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredBarIndex(null);
      }}
      className="bg-gradient-to-br from-white/95 via-[#3D5A1E]/[0.01] to-[#3D5A1E]/[0.07] backdrop-blur-md rounded-2xl border border-[#3D5A1E]/15 p-6 shadow-sm hover:shadow-md hover:shadow-[#4A3728]/5 transition-all duration-300 relative overflow-hidden"
      style={{ 
        boxShadow: isHovered
          ? "0 14px 34px -10px rgba(61, 90, 30, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
      }}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(220px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(92, 138, 60, 0.08), transparent 85%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          {/* Active status pulse dot */}
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8A3C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3D5A1E]"></span>
          </div>
          <h3 className="text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
            Ingresos
          </h3>
        </div>
        <p className="text-2xl font-black text-[#3D5A1E] bg-gradient-to-br from-[#3D5A1E] to-[#1F330A] bg-clip-text text-transparent tracking-tight leading-none">
          {formatPrice(totalRevenue)}
        </p>
      </div>

      {/* Outer wrapper to contain relative absolute grids */}
      <div className="relative h-48 w-full mt-4">
        {/* Gridlines in background */}
        <div className="absolute inset-x-0 bottom-6 top-2 flex flex-col justify-between pointer-events-none opacity-40 z-0">
          <div className="border-b border-dashed border-[#3D5A1E]/10 w-full" />
          <div className="border-b border-dashed border-[#3D5A1E]/10 w-full" />
          <div className="border-b border-dashed border-[#3D5A1E]/10 w-full" />
          <div className="border-b border-[#3D5A1E]/15 w-full" />
        </div>

        {/* Animated bars */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex items-end gap-1.5 sm:gap-2.5 h-full relative z-10 w-full"
        >
          {bars.map((point, index) => {
            const heightPercent = (point.amount / maxAmount) * 100;
            const isCurrentlyHovered = hoveredBarIndex === index;
            const isAnyBarHovered = hoveredBarIndex !== null;

            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center gap-1.5 min-w-0 h-full justify-end relative group/bar"
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {/* Custom Floating Tooltip */}
                <div 
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none transition-all duration-300 z-30 ${
                    isCurrentlyHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                  }`}
                >
                  <div className="bg-[#4A3728]/95 backdrop-blur-md text-[#E8DDD0] px-2.5 py-1.2 rounded-lg text-[10px] font-bold font-mono tracking-tight shadow-md border border-[#E8DDD0]/10 flex flex-col items-center gap-0.5 whitespace-nowrap">
                    <span className="text-[#82B25F]">{formatPrice(point.amount)}</span>
                    <span className="text-white/40 text-[8px] font-sans uppercase tracking-wider">{formatShortDate(point.date)}</span>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4A3728]/95" />
                  </div>
                </div>

                {/* Bar capsule structure */}
                <div className="w-full flex-1 flex items-end relative">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 85, damping: 16, delay: index * 0.025 }}
                    style={{ 
                      height: `${Math.max(heightPercent, 4)}%`,
                      originY: 1
                    }}
                    className={`w-full bg-gradient-to-t from-[#3D5A1E] via-[#5C8A3C] to-[#82B25F] transition-all duration-300 rounded-t-full relative overflow-hidden shadow-[0_2px_8px_rgba(61,90,30,0.08)] ${
                      isCurrentlyHovered 
                        ? 'shadow-[0_4px_16px_rgba(61,90,30,0.25)] filter brightness-110 scale-x-105' 
                        : isAnyBarHovered 
                        ? 'opacity-40 scale-x-90' 
                        : ''
                    }`}
                  >
                    {/* Glowing LED highlight at the tip of the bar */}
                    <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-white/30 via-white/70 to-white/30 shadow-[0_1px_4px_rgba(255,255,255,0.7)]" />
                    {/* Glossy reflection layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                    {/* Pulse animation overlay for hovered bar */}
                    {isCurrentlyHovered && (
                      <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    )}
                  </motion.div>
                </div>

                {/* Styled date tag */}
                <span className={`text-[9px] font-bold transition-all duration-300 uppercase font-mono tracking-wider truncate w-full text-center leading-none mt-1.5 ${
                  isCurrentlyHovered 
                    ? 'text-[#3D5A1E] scale-105 font-extrabold' 
                    : isAnyBarHovered 
                    ? 'text-neutral-400/40' 
                    : 'text-neutral-400/80'
                }`}>
                  {formatShortDate(point.date)}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default RevenueChart;