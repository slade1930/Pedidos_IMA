// src/features/inventory/components/StockBadge.tsx

// ─── TIPOS ─────────────────────────────────────────────────

export type StockLevel = "critical" | "low" | "normal";

// ─── PROPS ─────────────────────────────────────────────────

interface StockBadgeProps {
  availableStock: number;
  threshold: number;
  size?: "sm" | "md";
  dotOnly?: boolean;
}

// ─── CONFIGURACIÓN DE ESTADOS ──────────────────────────────

const STOCK_CONFIG: Record<
  StockLevel,
  { label: string; className: string; dotColor: string }
> = {
  critical: {
    label: "Agotado",
    className: "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400 backdrop-blur-md shadow-[0_2px_10px_rgba(244,63,94,0.04)] transition-all duration-300",
    dotColor: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]",
  },
  low: {
    label: "Bajo",
    className: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400 backdrop-blur-md shadow-[0_2px_10px_rgba(245,158,11,0.04)] transition-all duration-300",
    dotColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]",
  },
  normal: {
    label: "Normal",
    className: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-450 backdrop-blur-md shadow-[0_2px_10px_rgba(16,185,129,0.04)] transition-all duration-300",
    dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]",
  },
};

const SIZE_STYLES = {
  sm: "px-2.5 py-1 text-[9px] font-extrabold tracking-wider uppercase border leading-none",
  md: "px-3 py-1.5 text-[9px] sm:px-3.5 sm:py-1.5 sm:text-[10px] font-extrabold tracking-widest uppercase border leading-none",
} as const;

const DOT_SIZES = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
} as const;

// ─── UTILITARIO ────────────────────────────────────────────

export function getStockLevel(availableStock: number, threshold: number): StockLevel {
  if (availableStock <= 0) return "critical";
  if (availableStock <= threshold) return "low";
  return "normal";
}

// ─── COMPONENTE ────────────────────────────────────────────

export function StockBadge({
  availableStock,
  threshold,
  size = "md",
  dotOnly = false,
}: StockBadgeProps) {
  const level = getStockLevel(availableStock, threshold);
  const config = STOCK_CONFIG[level];

  if (dotOnly) {
    return (
      <span
        className={`inline-block rounded-full shrink-0 ${DOT_SIZES[size]} ${config.dotColor}`}
        title={config.label}
        aria-label={config.label}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-bold selection:bg-transparent ${SIZE_STYLES[size]} ${config.className}`}>
      <span className={`rounded-full shrink-0 ${DOT_SIZES[size]} ${config.dotColor} ${
        level === "critical" || level === "low" ? "animate-pulse" : ""
      }`} />
      {config.label}
    </span>
  );
}

export default StockBadge;