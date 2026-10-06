"use client";

import { motion } from "framer-motion";
import type { JSX } from "react";

// ─── PROPS ─────────────────────────────────────────────────

interface RevenueMetricCardProps {
  title: string;
  value: number;
  comparison?: number; // valor del período anterior (si existe)
  icon: string;
  subtitle?: string;
  accent: "olive" | "gold" | "brown" | "green";
  /** true para formatear como dinero; false para número plano */
  currency?: boolean;
}

// ─── PALETA DE ACENTOS ─────────────────────────────────────

const ACCENTS = {
  olive: {
    iconBg: "bg-[#1b4f72]/10 text-[#1b4f72] border-[#1b4f72]/15",
    bar: "from-[#1b4f72] to-[#2e7d9e]",
    dot: "bg-[#1b4f72]",
    tint: "text-[#1b4f72]",
  },
  gold: {
    iconBg: "bg-[#2fbf9b]/10 text-[#20917a] border-[#2fbf9b]/20",
    bar: "from-[#2fbf9b] to-[#20917a]",
    dot: "bg-[#2fbf9b]",
    tint: "text-[#20917a]",
  },
  brown: {
    iconBg: "bg-[#142b45]/10 text-[#142b45] border-[#142b45]/15",
    bar: "from-[#142b45] to-[#6B5240]",
    dot: "bg-[#142b45]",
    tint: "text-[#142b45]",
  },
  green: {
    iconBg: "bg-[#2e7d9e]/10 text-[#2e7d9e] border-[#2e7d9e]/15",
    bar: "from-[#2e7d9e] to-[#82B25F]",
    dot: "bg-[#2e7d9e]",
    tint: "text-[#2e7d9e]",
  },
};

// ─── ICONOS ────────────────────────────────────────────────

function MetricIcon({ name }: { name: string }) {
  const cls = "h-5 w-5";
  const icons: Record<string, JSX.Element> = {
    dollarChart: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125Z" />
      </svg>
    ),
    calendar: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z" />
      </svg>
    ),
    sun: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    users: (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  };
  return icons[name] ?? null;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function RevenueMetricCard({
  title,
  value,
  comparison,
  icon,
  subtitle,
  accent = "olive",
  currency = true,
}: RevenueMetricCardProps) {
  const a = ACCENTS[accent] ?? ACCENTS.olive;

  // Variación porcentual vs período anterior
  // - Si no hay comparación → sin badge
  // - Si comparación es 0 pero hay valor actual → 100% (todo es nuevo)
  // - Si el valor es 0 y el anterior >0 → -100%
  let hasComparison = typeof comparison === "number";
  let pct: number | null = null;
  if (typeof comparison === "number") {
    if (comparison > 0) {
      pct = ((value - comparison) / comparison) * 100;
    } else if (value > 0) {
      pct = 100;
    } else {
      pct = 0; // ambos 0, sin variación real
    }
  }
  const isUp = (pct ?? 0) >= 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="group relative overflow-hidden rounded-2xl border border-[#e4f0ed] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
    >
      {/* Barra lateral decorativa */}
      <span className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${a.bar} opacity-80`} />

      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${a.iconBg}`}>
          <MetricIcon name={icon} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-none">
          {title}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          {currency ? (
            <span className="text-[1.65rem] font-black tracking-tight text-[#142b45] font-mono tabular-nums">
              {value < 1 && value > 0
                ? `$${value.toFixed(2)}`
                : `$${value.toLocaleString("es-PA", { maximumFractionDigits: 0 })}`}
            </span>
          ) : (
            <span className="text-[1.65rem] font-black tracking-tight text-[#142b45] font-mono tabular-nums">
              {value.toLocaleString("es-PA")}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] font-medium text-neutral-400 tracking-wide">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Variación vs período anterior */}
      {hasComparison && pct !== null && (
        <div
          className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
            isUp ? "bg-[#2e7d9e]/10 text-[#1b4f72]" : "bg-[#C94B32]/10 text-[#C94B32]"
          }`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            {isUp ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
            )}
          </svg>
          <span>{Math.abs(pct).toFixed(0)}%</span>
          <span className="font-medium text-neutral-400/70">
            vs período anterior
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default RevenueMetricCard;
