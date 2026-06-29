"use client";

import { motion, type Variants } from "framer-motion";
import type { OrderStats } from "@/features/dashboard/types/dashboard.types";

// ─── PROPS ─────────────────────────────────────────────────

interface OrdersChartProps {
  data?: OrderStats;
  isLoading?: boolean;
}

// ─── CONFIGURACIÓN DE ESTADOS (PALETA IMA) ─────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gradient-to-r from-[#F2A900] to-[#E59E00]",
  confirmed: "bg-gradient-to-r from-[#3D5A1E] to-[#2E4717]",
  ready: "bg-gradient-to-r from-[#5C8A3C] to-[#4F7831]",
  delivered: "bg-gradient-to-r from-[#2D4A0E] to-[#1F330A]",
  cancelled: "bg-gradient-to-r from-[#C94B32] to-[#B53E26]",
  expired: "bg-gradient-to-r from-[#B8A99A] to-[#A39383]",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

// ─── SKELETON ──────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-neutral-100 rounded" />
        <div className="h-4 w-16 bg-neutral-100 rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-neutral-100 rounded" />
              <div className="h-3 w-12 bg-neutral-100 rounded" />
            </div>
            <div className="h-3 bg-neutral-100 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function OrdersChart({ data, isLoading = false }: OrdersChartProps) {
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

  if (!data || !data.by_status || Object.keys(data.by_status).length === 0) {
    return (
      <div 
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm"
        style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      >
        <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest mb-5 leading-none">
          Órdenes por Estado
        </h3>
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-[#E8DDD0] bg-[#E8DDD0]/10">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#E8DDD0]/35 text-[#4A3728]/60 mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#4A3728]/80">No hay datos de órdenes</p>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data.by_status);
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  // Animation variants
  const listVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 28 } },
  };

  return (
    <div 
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm hover:shadow-md hover:shadow-[#4A3728]/5 transition-all duration-300 relative overflow-hidden"
      style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Órdenes por Estado
        </h3>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3728]/60 bg-[#E8DDD0]/30 border border-[#E8DDD0]/60 px-2.5 py-0.5 rounded-full">
          Total:{" "}
          <span className="text-[#4A3728] font-black">
            {new Intl.NumberFormat("es-PA").format(data.total_orders)}
          </span>
        </div>
      </div>

      {/* Barras horizontales */}
      <motion.div 
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="space-y-4.5 relative z-10"
      >
        {entries.map(([status, count], i) => {
          const percent = (count / maxCount) * 100;
          const percentageOfTotal =
            data.total_orders > 0
              ? ((count / data.total_orders) * 100).toFixed(1)
              : "0";

          return (
            <motion.div 
              key={status} 
              variants={itemVariants}
              whileHover={{ x: 2 }}
              className="space-y-1.5 group/row py-1 px-1.5 rounded-lg hover:bg-[#E8DDD0]/10 transition-colors duration-200"
            >
              <div className="flex items-center justify-between text-xs leading-none">
                <div className="flex items-center gap-2">
                  {/* Decorative dot with outline on hover */}
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status] || "bg-[#B8A99A]"} shadow-sm border border-white/20 transition-transform duration-300 group-hover/row:scale-110`} />
                  <span className="text-neutral-600 font-bold tracking-wide transition-colors group-hover/row:text-[#4A3728]">
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>
                <span className="text-[#4A3728]/60 font-semibold font-mono text-[11px] tabular-nums">
                  <span className="font-extrabold text-[#4A3728]">{count}</span> ({percentageOfTotal}%)
                </span>
              </div>

              {/* Redesigned thin sleek progress bar track */}
              <div 
                className="h-2.5 bg-neutral-100 rounded-full overflow-hidden p-[1px] border border-neutral-200/50"
                style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(percent, 2.5)}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.05 }}
                  className={`h-full rounded-full ${STATUS_COLORS[status] || "bg-[#B8A99A]"} relative overflow-hidden`}
                >
                  {/* Reflective top gloss line */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default OrdersChart;