// src/features/inventory/components/InventoryTable.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Boxes, Lock, Truck, CircleDot, Box, ArrowRight } from "lucide-react";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 100;

// ─── PROPS ─────────────────────────────────────────────────

interface InventoryTableProps {
  onUpdateStock?: (item: InventoryItem) => void;
  search?: string;
  lowStockFilter?: boolean;
  locationFilter?: string;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function getStockLevel(item: InventoryItem): "critical" | "low" | "normal" {
  if (!item.is_available || item.available_stock <= 0) return "critical";
  if (item.available_stock <= item.low_stock_threshold) return "low";
  return "normal";
}

function getStockLabel(level: "critical" | "low" | "normal"): string {
  switch (level) {
    case "critical":
      return "Agotado";
    case "low":
      return "Bajo";
    case "normal":
      return "Normal";
  }
}

const STOCK_LEVEL_STYLES: Record<
  "critical" | "low" | "normal",
  { badge: string; dot: string; bar: string; glow: string; pct: string }
> = {
  critical: {
    badge:
      "bg-red-600/15 text-red-700 dark:text-red-300 border-red-600/40 shadow-[0_0_18px_rgba(220,38,38,0.18)]",
    dot: "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)]",
    bar: "from-red-700 to-red-500",
    glow: "shadow-[0_0_18px_rgba(220,38,38,0.3)]",
    pct: "text-red-700 dark:text-red-400",
  },
  low: {
    badge:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 shadow-[0_0_18px_rgba(249,115,22,0.15)]",
    dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]",
    bar: "from-orange-500 to-orange-400",
    glow: "shadow-[0_0_18px_rgba(249,115,22,0.28)]",
    pct: "text-orange-600 dark:text-orange-400",
  },
  normal: {
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-[0_0_18px_rgba(16,185,129,0.12)]",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]",
    bar: "from-[var(--itas-green)] to-[var(--itas-green-light)]",
    glow: "shadow-[0_0_18px_rgba(16,185,129,0.22)]",
    pct: "text-emerald-600 dark:text-emerald-400",
  },
};

// ─── SKELETON SEGMENTADO ───────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="hidden sm:grid grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_1.5fr_1.8fr] gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/10 backdrop-blur animate-shimmer"
        >
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-850 rounded-md" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-850 rounded-md" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-850 rounded-md" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-850 rounded-md" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-850 rounded-md" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-850 rounded-full" />
          <div className="h-8 w-28 bg-slate-200 dark:bg-slate-850 rounded-xl justify-self-end" />
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function InventoryTable({
  onUpdateStock,
  search,
  lowStockFilter,
  locationFilter,
}: InventoryTableProps) {
  const [skip, setSkip] = useState(0);
  const page = Math.floor(skip / PAGE_SIZE) + 1;

  const filters = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(lowStockFilter !== undefined && { low_stock: lowStockFilter }),
    ...(locationFilter && locationFilter !== "" && { fair_id: locationFilter }),
  };

  const { data, isPending, isError, error, isFetching } = useInventory(filters);

  const items = Array.isArray(data) ? data : data?.data ?? [];
  const totalPages = !Array.isArray(data) ? data?.pages ?? 1 : 1;
  const totalItems = !Array.isArray(data) ? data?.total ?? items.length : items.length;

  return (
    <div className="space-y-4 w-full">
      {/* Encabezado de Columnas (Modo Desktop) */}
      {!isPending && !isError && items.length > 0 && (
        <div className="hidden sm:grid grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_1.5fr_1.8fr] gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <div className="pl-3">Producto</div>
          <div>Total</div>
          <div>Reservado</div>
          <div>Entregado</div>
          <div>Disponible</div>
          <div>Nivel de Stock</div>
          <div className="text-right">Acciones</div>
        </div>
      )}

      {/* Cuerpo del Inventario */}
      <div className="space-y-3.5">
        {isPending && <TableSkeleton />}

        {isError && !isPending && (
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-500/5 to-transparent p-10 text-center flex flex-col items-center justify-center backdrop-blur-md shadow-panel">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-rose-500/15 blur-3xl" />
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 mb-4 border border-rose-500/25 shadow-[0_0_24px_rgba(244,63,94,0.15)]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-rose-700 dark:text-rose-300 font-bold text-lg leading-none">Error al cargar inventario</p>
            <p className="text-xs text-slate-500 mt-2.5 max-w-xs mx-auto">
              {(error as { message?: string })?.message || "Intenta nuevamente"}
            </p>
          </div>
        )}

        {!isPending && !isError && items.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-900/60 dark:to-transparent backdrop-blur p-16 text-center flex flex-col items-center justify-center shadow-panel">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-gradient-to-br from-[var(--itas-soft-green)] to-transparent dark:from-[var(--itas-green)]/10 blur-3xl animate-float" />
            <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--itas-soft-green)] to-transparent dark:from-[var(--itas-green)]/15 text-[var(--itas-green)] mb-5 border border-[var(--itas-green)]/20 shadow-card">
              <Box className="h-8 w-8" strokeWidth={1.6} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">Inventario vacío</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">No se encontraron registros de inventario.</p>
          </div>
        )}

        {!isPending && !isError && items.map((item, index) => {
          const stockLevel = getStockLevel(item);
          const levelStyle = STOCK_LEVEL_STYLES[stockLevel];
          const pct =
            item.total_stock > 0
              ? Math.max(0, Math.min(100, Math.round((item.available_stock / item.total_stock) * 100)))
              : 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.28), ease: "easeOut" }}
              className="group relative overflow-hidden bg-gradient-to-b from-white to-white/70 dark:from-slate-900 dark:to-slate-950/70 p-4.5 sm:p-0 sm:px-6 sm:py-4.5 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-[var(--itas-green)]/40 dark:hover:border-[var(--itas-green)]/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:grid sm:grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_1.5fr_1.8fr] gap-4 sm:items-center"
            >
              {/* Hairline superior */}
              <div className="hidden sm:block absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--itas-green)]/40 to-transparent group-hover:via-[var(--itas-gold)]/60" />
              {/* Sheen de hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[var(--itas-green)]/[0.03] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

              {/* Barra indicadora luminosa lateral */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl ${levelStyle.bar} ${levelStyle.glow}`} />

              {/* Columna 1: NOMBRE DEL PRODUCTO */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-1">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Producto</span>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="hidden sm:inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[var(--itas-soft-green)] to-transparent dark:from-[var(--itas-green)]/20 text-[var(--itas-green)] border border-[var(--itas-green)]/20 shadow-card">
                    <Package className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
                      {item.product_name || "Sin nombre"}
                    </span>
                    <span className="mt-0.5 hidden sm:block text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                      ID {item.product_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna 2: Stock Total */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Boxes className="hidden sm:block h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  {item.total_stock}
                </span>
              </div>

              {/* Columna 3: Reservado */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Reservado</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Lock className="hidden sm:block h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  {item.reserved_stock}
                </span>
              </div>

              {/* Columna 4: Entregado */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Entregado</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Truck className="hidden sm:block h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  {item.delivered_stock}
                </span>
              </div>

              {/* Columna 5: Disponible + Barra de progreso */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0 sm:flex-col sm:items-start sm:gap-1.5">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Disponible</span>
                <div className="inline-flex items-center gap-1.5">
                  <CircleDot className={`hidden sm:block h-3.5 w-3.5 ${levelStyle.pct}`} strokeWidth={2.2} />
                  <span className={`text-base font-black ${levelStyle.pct}`}>
                    {item.available_stock}
                  </span>
                </div>
                <div className="hidden sm:block w-14 h-1 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${levelStyle.bar} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Columna 6: Nivel de Stock Badge */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Nivel</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${levelStyle.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${levelStyle.dot} ${stockLevel === "critical" || stockLevel === "low" ? "animate-pulse" : ""}`} />
                  {getStockLabel(stockLevel)}
                </span>
              </div>

              {/* Columna 7: Acciones */}
              <div className="w-full sm:w-auto flex items-center justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 pt-3 sm:pt-0 pl-2 sm:pl-0">
                <button
                  onClick={() => onUpdateStock?.(item)}
                  className="group/btn relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--itas-green)]/30 bg-gradient-to-b from-[var(--itas-soft-green)] to-transparent dark:from-[var(--itas-green)]/15 dark:to-transparent px-4 py-2 text-xs font-bold text-[var(--itas-green)] hover:from-[var(--itas-green)] hover:to-[var(--itas-green-light)] hover:text-white hover:border-transparent active:scale-95 transition-all duration-200 shadow-card cursor-pointer"
                >
                  Actualizar Stock
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={2.4} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Paginación */}
      {!isPending && !isError && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800/40 bg-gradient-to-r from-white/70 to-white/40 dark:from-slate-900/60 dark:to-slate-950/40 backdrop-blur-md rounded-2xl shadow-panel mt-8">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mostrando{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-black text-gradient-green">{totalItems}</span> registros
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-40 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 5l-7 7 7 7" />
              </svg>
              Anterior
            </button>
            <span className="rounded-lg bg-[var(--itas-soft-green)] dark:bg-[var(--itas-green)]/15 border border-[var(--itas-green)]/20 px-3 py-1.5 text-xs font-black text-[var(--itas-green)]">
              Página {page} / {totalPages}
            </span>
            <button
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-40 transition-all duration-200 shadow-sm cursor-pointer"
            >
              Siguiente
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryTable;
