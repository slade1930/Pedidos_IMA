"use client";

import { motion, type Variants } from "framer-motion";
import type { InventoryStats } from "@/features/dashboard/types/dashboard.types";

// ─── PROPS ─────────────────────────────────────────────────

interface InventoryChartProps {
  data?: InventoryStats;
  isLoading?: boolean;
}

// ─── SKELETON ──────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-4 w-32 bg-neutral-100 rounded" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100/50">
            <div className="h-5 w-8 bg-neutral-200 rounded mx-auto" />
            <div className="h-2 w-12 bg-neutral-100 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-3.5 bg-neutral-100 rounded-full w-full" />
      <div className="space-y-2">
        <div className="h-3 w-28 bg-neutral-100 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <div className="h-3 w-40 bg-neutral-100 rounded" />
            <div className="h-3 w-10 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function InventoryChart({ data, isLoading = false }: InventoryChartProps) {
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

  if (!data) {
    return (
      <div 
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm"
        style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      >
        <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest mb-5 leading-none">
          Estado del Inventario
        </h3>
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-[#E8DDD0] bg-[#E8DDD0]/10">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#E8DDD0]/35 text-[#4A3728]/60 mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#4A3728]/80">Sin datos de inventario</p>
        </div>
      </div>
    );
  }

  const healthyStock = data.total_products - data.low_stock_count - data.out_of_stock_count;
  const healthyPercent = data.total_products > 0 ? (healthyStock / data.total_products) * 100 : 0;
  const lowPercent = data.total_products > 0 ? (data.low_stock_count / data.total_products) * 100 : 0;
  const outPercent = data.total_products > 0 ? (data.out_of_stock_count / data.total_products) * 100 : 0;

  // Variantes de animación tipadas explícitamente para evitar errores en compilación
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 350, damping: 28 } 
    },
  };

  return (
    <div 
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/80 p-6 shadow-sm hover:shadow-md hover:shadow-[#4A3728]/5 transition-all duration-300 relative overflow-hidden"
      style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
    >
      <h3 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest mb-5 leading-none">
        Estado del Inventario
      </h3>

      {/* Indicadores en micro-cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center bg-[#5C8A3C]/5 border border-[#5C8A3C]/10 rounded-xl p-3 shadow-inner hover:bg-[#5C8A3C]/8 transition-all duration-200">
          <p className="text-2xl font-black text-[#5C8A3C] font-mono tabular-nums leading-none">{healthyStock}</p>
          <p className="text-[10px] font-bold text-[#5C8A3C]/70 uppercase tracking-wider mt-1.5 leading-none">Saludables</p>
        </div>
        <div className="text-center bg-[#F2A900]/5 border border-[#F2A900]/10 rounded-xl p-3 shadow-inner hover:bg-[#F2A900]/8 transition-all duration-200">
          <p className="text-2xl font-black text-[#C78500] font-mono tabular-nums leading-none">{data.low_stock_count}</p>
          <p className="text-[10px] font-bold text-[#C78500]/80 uppercase tracking-wider mt-1.5 leading-none">Stock Bajo</p>
        </div>
        <div className="text-center bg-[#C94B32]/5 border border-[#C94B32]/10 rounded-xl p-3 shadow-inner hover:bg-[#C94B32]/8 transition-all duration-200">
          <p className="text-2xl font-black text-[#C94B32] font-mono tabular-nums leading-none">{data.out_of_stock_count}</p>
          <p className="text-[10px] font-bold text-[#C94B32]/80 uppercase tracking-wider mt-1.5 leading-none">Agotados</p>
        </div>
      </div>

      {/* Barra de proporción animada con segmentos */}
      <div 
        className="h-3.5 bg-neutral-100 rounded-full overflow-hidden flex gap-0.5 mb-4 p-[2px] border border-neutral-200/50"
        style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}
      >
        {healthyPercent > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${healthyPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="h-full bg-gradient-to-r from-[#5C8A3C] to-[#6da148] rounded-l-full" 
          />
        )}
        {lowPercent > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${lowPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className={`h-full bg-gradient-to-r from-[#F2A900] to-[#ffb81c] ${healthyPercent <= 0 ? "rounded-l-full" : ""} ${outPercent <= 0 ? "rounded-r-full" : ""}`} 
          />
        )}
        {outPercent > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${outPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-[#C94B32] to-[#de5d43] rounded-r-full" 
          />
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-5 text-[10px] font-bold uppercase tracking-wider text-[#4A3728]/50 mb-6">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-[#5C8A3C] shadow-sm" /> Saludable</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-[#F2A900] shadow-sm" /> Bajo</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-[#C94B32] shadow-sm" /> Agotado</div>
      </div>

      {/* Productos críticos */}
      {data.low_stock_products && data.low_stock_products.length > 0 && (
        <div className="border-t border-neutral-100/60 pt-4">
          <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3 leading-none">
            Productos Críticos
          </h4>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-1.5"
          >
            {data.low_stock_products.slice(0, 5).map((product) => {
              const isOutOfStock = product.stock <= 0;
              return (
                <motion.div 
                  key={product.product_id} 
                  variants={itemVariants}
                  whileHover={{ x: 2 }}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg hover:bg-[#E8DDD0]/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    {/* Tiny Status Dot */}
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isOutOfStock ? "bg-[#C94B32] animate-pulse" : "bg-[#F2A900]"}`} />
                    <span className="text-neutral-600 font-semibold truncate text-xs">{product.product_name}</span>
                  </div>

                  {/* Stock Tag indicator */}
                  <span 
                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${
                      isOutOfStock 
                        ? "bg-[#C94B32]/10 border-[#C94B32]/15 text-[#C94B32]" 
                        : "bg-[#F2A900]/10 border-[#F2A900]/15 text-[#C78500]"
                    }`}
                  >
                    {product.stock} / {product.min_stock}
                  </span>
                </motion.div>
              );
            })}
            
            {data.low_stock_products.length > 5 && (
              <p className="text-[10px] font-bold text-[#4A3728]/45 mt-2 ml-2 tracking-wide uppercase">
                +{data.low_stock_products.length - 5} productos más en alerta
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default InventoryChart;