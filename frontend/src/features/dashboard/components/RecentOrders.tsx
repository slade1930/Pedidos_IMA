"use client";

import { motion, type Variants } from "framer-motion";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import type { RecentOrdersResponse } from "@/features/dashboard/types/dashboard.types";
import type { OrderStatus } from "@/features/orders/types/order.types";

// ─── PROPS ─────────────────────────────────────────────────

interface RecentOrdersProps {
  /** Datos de órdenes recientes */
  data?: RecentOrdersResponse;
  /** Indica si está en estado de carga */
  isLoading?: boolean;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return new Date(dateString).toLocaleDateString("es-PA", {
    month: "short",
    day: "numeric",
  });
}

// ─── SKELETON ──────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-2.5 border-b border-neutral-100/50 last:border-0"
        >
          {/* Orden */}
          <div className="h-5 w-16 bg-neutral-100 rounded animate-pulse" />
          {/* Cliente */}
          <div className="h-4 w-32 bg-neutral-100 rounded flex-1 animate-pulse" />
          {/* Monto */}
          <div className="h-4 w-16 bg-neutral-100 rounded animate-pulse" />
          {/* Estado */}
          <div className="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
          {/* Hace */}
          <div className="h-4 w-12 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * RecentOrders
 * 
 * Tabla compacta de órdenes recientes para el dashboard.
 */
export function RecentOrders({ data, isLoading = false }: RecentOrdersProps) {
  // Variantes de animación para la entrada en cascada
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 350, damping: 28 },
    },
  };

  // ─── LOADING ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm"
        style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      >
        <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest mb-5 leading-none">
          Órdenes Recientes
        </h3>
        <TableSkeleton />
      </div>
    );
  }

  // ─── SIN DATOS ───────────────────────────────────────
  if (!data || !data.orders || data.orders.length === 0) {
    return (
      <div
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm"
        style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      >
        <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest mb-5 leading-none">
          Órdenes Recientes
        </h3>
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-[#E8DDD0] bg-[#E8DDD0]/10">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#E8DDD0]/35 text-[#4A3728]/60 mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#4A3728]/80">Sin actividad reciente</p>
          <p className="text-xs text-[#4A3728]/50 mt-1">Las nuevas órdenes aparecerán en este lugar.</p>
        </div>
      </div>
    );
  }

  // ─── DATOS ───────────────────────────────────────────
  return (
    <div
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm relative overflow-hidden"
      style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Órdenes Recientes
        </h3>
        <a
          href="/dashboard/orders"
          className="group flex items-center gap-1 text-[11px] font-bold text-[#4A3728]/70 hover:text-[#4A3728] tracking-wider uppercase transition-colors"
        >
          Ver todas
          <svg
            className="h-3 w-3 transform transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Tabla compacta animada */}
      <div className="space-y-1 relative z-10">
        {/* Encabezados */}
        <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider pb-2 border-b border-neutral-100">
          <span className="w-20">Orden</span>
          <span className="flex-1">Cliente</span>
          <span className="w-20 text-right">Monto</span>
          <span className="w-28 pl-4">Estado</span>
          <span className="w-16 text-right">Hace</span>
        </div>

        {/* Filas */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-neutral-100/40"
        >
          {data.orders.map((order) => (
            <motion.div
              key={order.id}
              variants={itemVariants}
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 py-3 hover:bg-[#E8DDD0]/15 transition-all duration-200 rounded-lg -mx-2 px-2"
            >
              {/* Número de orden con estilo de etiqueta fina */}
              <span className="w-20 text-xs font-mono font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200/40 px-1.5 py-0.5 rounded-md truncate">
                {order.order_number}
              </span>

              {/* Nombre de cliente */}
              <span className="flex-1 text-sm font-semibold text-neutral-700 truncate">
                {order.customer_name}
              </span>

              {/* Monto formateado */}
              <span className="w-20 text-sm font-black text-neutral-800 text-right font-mono tabular-nums">
                {formatPrice(order.total_amount)}
              </span>

              {/* Estado badge */}
              <span className="w-28 pl-4 flex items-center">
                <OrderStatusBadge
                  status={order.status as OrderStatus}
                  size="sm"
                />
              </span>

              {/* Tiempo relativo */}
              <span className="w-16 text-xs font-medium text-neutral-400 text-right tracking-tight">
                {formatRelativeTime(order.created_at)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default RecentOrders;