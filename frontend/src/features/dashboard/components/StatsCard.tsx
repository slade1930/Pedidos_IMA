"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { JSX } from "react";

// ─── PROPS ─────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "olive" | "gold" | "brown" | "green" | "red" | "sand";
  subtitle?: string;
  isLoading?: boolean;
}

// ─── COLORES PREMIUM CON GRADIENTES Y DESTELLOS ────────────

const COLOR_STYLES: Record<
  StatsCardProps["color"],
  {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
    dot: string;
    glowColor: string;
  }
> = {
  olive: {
    bg: "bg-gradient-to-br from-white/95 via-[#3D5A1E]/[0.02] to-[#3D5A1E]/[0.08] backdrop-blur-md",
    border: "border-[#3D5A1E]/15 hover:border-[#3D5A1E]/30",
    text: "text-[#3D5A1E] bg-gradient-to-br from-[#3D5A1E] to-[#233512] bg-clip-text text-transparent",
    iconBg: "bg-gradient-to-br from-[#3D5A1E]/10 to-[#3D5A1E]/20 text-[#3D5A1E] shadow-inner",
    dot: "bg-[#3D5A1E]",
    glowColor: "rgba(61, 90, 30, 0.12)",
  },
  gold: {
    bg: "bg-gradient-to-br from-white/95 via-[#F2A900]/[0.01] to-[#F2A900]/[0.08] backdrop-blur-md",
    border: "border-[#F2A900]/20 hover:border-[#F2A900]/40",
    text: "text-[#C78500] bg-gradient-to-br from-[#C78500] to-[#8E5F00] bg-clip-text text-transparent",
    iconBg: "bg-gradient-to-br from-[#F2A900]/10 to-[#F2A900]/20 text-[#C78500] shadow-inner",
    dot: "bg-[#F2A900]",
    glowColor: "rgba(242, 169, 0, 0.12)",
  },
  brown: {
    bg: "bg-gradient-to-br from-white/95 via-[#4A3728]/[0.01] to-[#4A3728]/[0.07] backdrop-blur-md",
    border: "border-[#4A3728]/15 hover:border-[#4A3728]/35",
    text: "text-[#4A3728] bg-gradient-to-br from-[#4A3728] to-[#2E2219] bg-clip-text text-transparent",
    iconBg: "bg-gradient-to-br from-[#4A3728]/8 to-[#4A3728]/18 text-[#4A3728] shadow-inner",
    dot: "bg-[#4A3728]",
    glowColor: "rgba(74, 55, 40, 0.10)",
  },
  green: {
    bg: "bg-gradient-to-br from-white/95 via-[#5C8A3C]/[0.02] to-[#5C8A3C]/[0.08] backdrop-blur-md",
    border: "border-[#5C8A3C]/15 hover:border-[#5C8A3C]/35",
    text: "text-[#5C8A3C] bg-gradient-to-br from-[#5C8A3C] to-[#395625] bg-clip-text text-transparent",
    iconBg: "bg-gradient-to-br from-[#5C8A3C]/10 to-[#5C8A3C]/20 text-[#5C8A3C] shadow-inner",
    dot: "bg-[#5C8A3C]",
    glowColor: "rgba(92, 138, 60, 0.12)",
  },
  red: {
    bg: "bg-gradient-to-br from-white/95 via-[#C94B32]/[0.01] to-[#C94B32]/[0.07] backdrop-blur-md",
    border: "border-[#C94B32]/15 hover:border-[#C94B32]/35",
    text: "text-[#C94B32] bg-gradient-to-br from-[#C94B32] to-[#8F3320] bg-clip-text text-transparent",
    iconBg: "bg-gradient-to-br from-[#C94B32]/8 to-[#C94B32]/18 text-[#C94B32] shadow-inner",
    dot: "bg-[#C94B32]",
    glowColor: "rgba(201, 75, 50, 0.10)",
  },
  sand: {
    bg: "bg-gradient-to-br from-white/95 via-[#E8DDD0]/[0.1] to-[#E8DDD0]/[0.35] backdrop-blur-md",
    border: "border-[#E8DDD0] hover:border-[#4A3728]/25",
    text: "text-[#4A3728] bg-gradient-to-br from-[#4A3728] to-[#2E2219] bg-clip-text text-transparent",
    iconBg: "bg-gradient-to-br from-[#E8DDD0]/40 to-[#E8DDD0]/80 text-[#4A3728] shadow-inner",
    dot: "bg-[#4A3728]",
    glowColor: "rgba(232, 221, 208, 0.25)",
  },
};

// ─── ICONOS ────────────────────────────────────────────────

function StatsIcon({ name }: { name: string }) {
  const className = "h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3";

  const icons: Record<string, JSX.Element> = {
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    store: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
      </svg>
    ),
    package: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    shoppingCart: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    currencyDollar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    exclamationTriangle: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    clock: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    checkCircle: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return icons[name] ?? null;
}

// ─── COUNT UP ──────────────────────────────────────────────

function CountUp({ end }: { end: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasAnimated.current = true;
          const duration = 800;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.floor(eased * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{current.toLocaleString("es-PA")}</span>;
}

// ─── SKELETON ──────────────────────────────────────────────

function StatsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white/60 p-5 backdrop-blur-md shadow-sm">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[pulse_1.5s_infinite] bg-gradient-to-r from-transparent via-neutral-100/30 to-transparent" />
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 bg-neutral-100 rounded-xl animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
          <div className="h-5 w-24 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
  isLoading = false,
}: StatsCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  const styles = COLOR_STYLES[color] ?? COLOR_STYLES.olive;
  const numericValue = typeof value === "number" ? value : parseInt(value as string) || 0;
  const isCurrency = title.toLowerCase().includes("ingreso");
  const displayValue = typeof value === "number" && isCurrency
    ? new Intl.NumberFormat("es-PA", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    : typeof value === "number"
    ? value
    : value;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-colors duration-300 ${styles.bg} ${styles.border}`}
      style={{
        boxShadow: isHovered
          ? `0 14px 34px -10px ${styles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.6)`
          : "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(140px circle at ${mousePosition.x}px ${mousePosition.y}px, ${styles.glowColor}, transparent 80%)`,
        }}
      />

      {/* Decorative pulse indicator */}
      <div className="absolute top-4 right-4 flex items-center justify-center h-4 w-4">
        <span className={`absolute h-2.5 w-2.5 rounded-full ${styles.dot} opacity-20 animate-ping`} />
        <span className={`relative h-1.5 w-1.5 rounded-full ${styles.dot} opacity-40`} />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Icon Container with double borders */}
        <div className={`flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${styles.iconBg} border border-white/20 shadow-sm relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <StatsIcon name={icon} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none truncate mb-1">
            {title}
          </p>
          <h3 className={`text-2xl font-black tracking-tight leading-none ${styles.text}`}>
            {typeof displayValue === "number" ? (
              isCurrency ? (
                displayValue
              ) : (
                <CountUp end={numericValue} />
              )
            ) : (
              displayValue
            )}
          </h3>
          {subtitle && (
            <p className="text-[11px] font-medium text-neutral-400/80 dark:text-neutral-500/80 mt-1.5 tracking-wide leading-none flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;