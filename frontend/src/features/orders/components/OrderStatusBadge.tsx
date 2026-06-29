// src/features/orders/components/OrderStatusBadge.tsx

import type { OrderStatus } from "@/features/orders/types/order.types";

// ─── PROPS ─────────────────────────────────────────────────

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

// ─── CONFIGURACIÓN DE ESTADOS ──────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; dotClass: string; animateDot?: boolean }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400 backdrop-blur-md shadow-[0_2px_10px_rgba(245,158,11,0.04)] transition-all duration-300",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]",
    animateDot: true,
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-sky-450 backdrop-blur-md shadow-[0_2px_10px_rgba(14,165,233,0.04)] transition-all duration-300",
    dotClass: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.7)]",
  },
  ready: {
    label: "Lista",
    className: "bg-indigo-500/5 border-indigo-500/20 text-indigo-700 dark:text-indigo-400 backdrop-blur-md shadow-[0_2px_10px_rgba(99,102,241,0.04)] transition-all duration-300",
    dotClass: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]",
    animateDot: true,
  },
  delivered: {
    label: "Entregada",
    className: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-450 backdrop-blur-md shadow-[0_2px_10px_rgba(16,185,129,0.04)] transition-all duration-300",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-455 backdrop-blur-md shadow-[0_2px_10px_rgba(244,63,94,0.04)] transition-all duration-300",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]",
  },
  expired: {
    label: "Expirada",
    className: "bg-slate-500/5 border-slate-500/20 text-slate-600 dark:text-slate-400 backdrop-blur-md shadow-[0_2px_10px_rgba(100,116,139,0.04)] transition-all duration-300",
    dotClass: "bg-slate-400 dark:bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]",
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

// ─── COMPONENTE ────────────────────────────────────────────

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  const dotSize = DOT_SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-bold selection:bg-transparent ${SIZE_STYLES[size]} ${config.className}`}>
      <span className={`rounded-full shrink-0 ${dotSize} ${config.dotClass} ${
        config.animateDot ? "animate-pulse" : ""
      }`} />
      {config.label}
    </span>
  );
}

export default OrderStatusBadge;