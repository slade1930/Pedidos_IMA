// src/features/inventory/components/InventoryTable.tsx

"use client";

import { useState } from "react";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 10;

// ─── PROPS ─────────────────────────────────────────────────

interface InventoryTableProps {
  onUpdateStock?: (item: InventoryItem) => void;
  search?: string;
  lowStockFilter?: boolean;
  locationFilter?: string;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function getStockLevel(item: InventoryItem): "critical" | "low" | "normal" {
  if (!item.is_available) return "critical";
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

// ─── SKELETON SEGMENTADO ───────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i} 
          className="hidden sm:grid grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_1.5fr_1.8fr] gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/10 backdrop-blur animate-pulse"
        >
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-850 rounded-full" />
          <div className="h-7 w-24 bg-slate-200 dark:bg-slate-850 rounded-xl justify-self-end" />
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
        <div className="hidden sm:grid grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_1.5fr_1.8fr] gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-[#4A3728]/60 dark:text-slate-500">
          <div className="pl-3">Producto / Referencia</div>
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
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center flex flex-col items-center justify-center backdrop-blur-md">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 mb-4 border border-red-200/50 dark:border-red-900/50">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-red-700 dark:text-red-405 font-bold text-lg leading-none">Error al cargar inventario</p>
            <p className="text-xs text-neutral-400 mt-2.5 max-w-xs mx-auto">
              {(error as { message?: string })?.message || "Intenta nuevamente"}
            </p>
          </div>
        )}

        {!isPending && !isError && items.length === 0 && (
          <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur p-16 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 mb-4 relative border border-slate-200 dark:border-slate-850">
              <div className="absolute inset-0 rounded-2xl bg-slate-400/10 animate-ping opacity-25" />
              <svg className="mx-auto h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">Inventario vacío</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">No se encontraron registros de inventario.</p>
          </div>
        )}

        {!isPending && !isError && items.map((item) => {
          const stockLevel = getStockLevel(item);
          const indicatorColor = 
            stockLevel === "critical" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" :
            stockLevel === "low" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" :
            "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";

          return (
            <div 
              key={item.id} 
              className="relative overflow-hidden bg-white/90 dark:bg-slate-950/70 p-4.5 sm:p-0 sm:px-6 sm:py-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 hover:border-[#3D5A1E]/30 dark:hover:border-[#5C8A3C]/40 hover:shadow-[0_8px_25px_rgba(74,55,40,0.02)] hover:scale-[1.008] hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:grid sm:grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_1.5fr_1.8fr] gap-4 items-center"
            >
              {/* Barra indicadora luminosa lateral (Toque Exótico) */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${indicatorColor}`} />

              {/* Columna 1: ID de Producto */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Producto</span>
                <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 shadow-inner flex items-center gap-1.5 w-fit">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {item.product_id}
                </div>
              </div>

              {/* Columna 2: Stock Total */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-350">{item.total_stock}</span>
              </div>

              {/* Columna 3: Reservado */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Reservado</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.reserved_stock}</span>
              </div>

              {/* Columna 4: Entregado */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Entregado</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.delivered_stock}</span>
              </div>

              {/* Columna 5: Disponible */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Disponible</span>
                <span className={`text-base font-black ${
                  stockLevel === "critical" ? "text-rose-600" : stockLevel === "low" ? "text-amber-600" : "text-slate-800 dark:text-white"
                }`}>
                  {item.available_stock}
                </span>
              </div>

              {/* Columna 6: Nivel de Stock Badge */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Nivel</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md shadow-sm ${
                  stockLevel === "critical" ? "bg-rose-500/10 text-rose-700 border-rose-500/30" :
                  stockLevel === "low" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" :
                  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/30"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    stockLevel === "critical" ? "bg-rose-500 animate-pulse" :
                    stockLevel === "low" ? "bg-amber-500 animate-pulse" :
                    "bg-emerald-500"
                  }`} />
                  {getStockLabel(stockLevel)}
                </span>
              </div>

              {/* Columna 7: Acciones */}
              <div className="w-full sm:w-auto flex items-center justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-900/50 pt-3 sm:pt-0 pl-2 sm:pl-0">
                <button 
                  onClick={() => onUpdateStock?.(item)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-[#3D5A1E] dark:text-[#5C8A3C] hover:bg-[#3D5A1E]/8 hover:border-[#3D5A1E]/30 active:scale-95 transition-all duration-200 text-center"
                >
                  Actualizar Stock
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {!isPending && !isError && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md rounded-2xl shadow-inner mt-8">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mostrando{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{totalItems}</span> registros
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-[#E8DDD0]/15 hover:bg-[#E8DDD0]/25 disabled:opacity-40 disabled:hover:bg-white/85 transition-all duration-200 shadow-sm"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-[#E8DDD0]/15 hover:bg-[#E8DDD0]/25 disabled:opacity-40 disabled:hover:bg-white/85 transition-all duration-200 shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryTable;