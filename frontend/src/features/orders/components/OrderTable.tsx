// src/features/orders/components/OrderTable.tsx

"use client";

import { useState } from "react";
import { useOrders } from "@/features/orders/hooks/useOrders";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 100;

// ─── PROPS ─────────────────────────────────────────────────

interface OrderTableProps {
  onView?: (order: Order) => void;
  onStatusChange?: (order: Order) => void;
  search?: string;
  statusFilter?: string;
  fairIdFilter?: string;
}

// ─── UTILITARIOS DE DISEÑO Y PALETA ────────────────────────

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
    case "confirmed":
      return "bg-sky-500/15 text-sky-300 border-sky-500/35 shadow-[0_0_12px_rgba(14,165,233,0.15)]";
    case "ready":
      return "bg-indigo-500/15 text-indigo-300 border-indigo-500/35 shadow-[0_0_12px_rgba(99,102,241,0.15)]";
    case "delivered":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
    case "cancelled":
      return "bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
    case "expired":
      return "bg-zinc-700/25 text-zinc-400 border-zinc-600/30";
    default:
      return "bg-zinc-700/25 text-zinc-400 border-zinc-600/30";
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmada";
    case "ready":
      return "Lista";
    case "delivered":
      return "Entregada";
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    default:
      return status;
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── SKELETON SEGMENTADO ───────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i} 
          className="hidden sm:grid grid-cols-[2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 px-6 py-4 border border-white/5 rounded-2xl bg-white/[0.03] backdrop-blur animate-pulse items-center"
        >
          <div className="h-5 w-28 bg-white/10 rounded-lg" />
          <div className="space-y-2">
            <div className="h-3.5 w-20 bg-white/10 rounded" />
            <div className="h-2.5 w-12 bg-white/10 rounded" />
          </div>
          <div className="h-5 w-16 bg-white/10 rounded" />
          <div className="h-6 w-24 bg-white/10 rounded-full" />
          <div className="h-4 w-14 bg-white/10 rounded" />
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-8 w-24 bg-white/10 rounded-xl justify-self-end" />
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function OrderTable({ onView, onStatusChange, search, statusFilter, fairIdFilter }: OrderTableProps) {
  const [skip, setSkip] = useState(0);
  const page = Math.floor(skip / PAGE_SIZE) + 1;

  const filters = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter && statusFilter !== "" && { status: statusFilter as OrderStatus }),
    ...(fairIdFilter && fairIdFilter !== "" && { fair_id: fairIdFilter }),
  };

  const { data, isPending, isError, error, isFetching } = useOrders(filters);

  const orders = Array.isArray(data) ? data : data?.data ?? [];
  const totalPages = !Array.isArray(data) ? data?.pages ?? 1 : 1;
  const totalItems = !Array.isArray(data) ? data?.total ?? orders.length : orders.length;

  return (
    <div className="space-y-4 w-full p-2 sm:p-4">
      {/* Encabezado de Columnas (Modo Desktop) */}
      {!isPending && !isError && orders.length > 0 && (
        <div className="hidden sm:grid grid-cols-[2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-[#D4C4B5]">
          <div className="pl-3">Orden</div>
          <div>Detalles de Pago</div>
          <div>Total</div>
          <div>Estado</div>
          <div>QR</div>
          <div>Fecha / Hora</div>
          <div className="text-right">Acciones</div>
        </div>
      )}

      {/* Cuerpo Segmentado Flotante */}
      <div className="space-y-3">
        {isPending && <TableSkeleton />}

        {/* Estado Error */}
        {isError && !isPending && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-8 text-center flex flex-col items-center justify-center backdrop-blur-md shadow-lg">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 mb-3 border border-rose-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-rose-200 font-bold text-lg">Error al cargar órdenes</p>
            <p className="text-xs text-rose-300/80 mt-1.5 max-w-xs mx-auto">
              {(error as { message?: string })?.message || "Intenta nuevamente"}
            </p>
          </div>
        )}

        {/* Estado Vacío */}
        {!isPending && !isError && orders.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#1A0D07]/60 backdrop-blur-md p-14 text-center flex flex-col items-center justify-center shadow-inner">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/5 text-amber-400/80 mb-4 border border-white/10 relative">
              <div className="absolute inset-0 rounded-2xl bg-amber-400/10 animate-ping opacity-25" />
              <svg className="h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">No hay órdenes</h3>
            <p className="mt-1.5 text-xs text-[#D4C4B5] max-w-[240px] mx-auto">No se encontraron órdenes registradas.</p>
          </div>
        )}

        {/* Filas de Órdenes */}
        {!isPending && !isError && orders.map((order) => {
          const indicatorColor = 
            order.status === "pending" ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]" :
            order.status === "confirmed" ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]" :
            order.status === "ready" ? "bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]" :
            order.status === "delivered" ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" :
            "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.6)]";

          return (
            <div 
              key={order.id}
              className="relative overflow-hidden bg-[#1D100A]/90 p-4.5 sm:p-0 sm:px-6 sm:py-4 rounded-2xl border border-[#3A5F26]/35 hover:border-amber-400/50 hover:bg-[#25150D] hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:scale-[1.005] hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:grid sm:grid-cols-[2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 items-center"
            >
              {/* Barra indicadora luminosa lateral */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${indicatorColor}`} />

              {/* Columna 1: ID / Número de Orden */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-[#A38F80]">Orden</span>
                <div className="font-mono text-xs font-semibold bg-[#150C07] border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 shadow-inner flex items-center gap-1.5 w-fit">
                  <svg className="w-3.5 h-3.5 text-amber-400/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {order.order_number}
                </div>
              </div>

              {/* Columna 2: Detalles de Pago */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-[#A38F80]">Detalles de Pago</span>
                <div className="text-xs text-left">
                  <p className="font-bold text-white">
                    {order.payment_method === "yappy" ? "Yappy" : order.payment_method === "card" ? "Tarjeta" : "Efectivo"}
                  </p>
                  <p className={`text-[11px] font-bold mt-0.5 flex items-center gap-1.5 ${
                    order.payment_status === "completed" ? "text-emerald-400" :
                    order.payment_status === "failed" ? "text-rose-400" :
                    order.payment_status === "processing" ? "text-sky-400" : "text-amber-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      order.payment_status === "completed" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" :
                      order.payment_status === "failed" ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" : "bg-amber-400 animate-pulse"
                    }`} />
                    {order.payment_status === "completed" ? "Completado" : order.payment_status === "failed" ? "Fallido" : order.payment_status === "processing" ? "Procesando" : "Pendiente"}
                  </p>
                </div>
              </div>

              {/* Columna 3: Total */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-[#A38F80]">Total</span>
                <span className="text-sm font-black text-[#FBBF24] tracking-tight">
                  {formatPrice(order.total_amount)}
                </span>
              </div>

              {/* Columna 4: Estado */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-[#A38F80]">Estado</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${getStatusBadgeClass(order.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    order.status === "ready" || order.status === "pending" ? "bg-amber-400 animate-pulse" :
                    order.status === "delivered" ? "bg-emerald-400" : "bg-rose-400"
                  }`} />
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Columna 5: Código QR */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-[#A38F80]">QR</span>
                {order.qr_used ? (
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Usado</span>
                ) : order.qr_code ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    Activo
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">—</span>
                )}
              </div>

              {/* Columna 6: Fecha */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-[#A38F80]">Fecha</span>
                <span className="text-xs font-medium text-[#D4C4B5]">
                  {order.created_at ? formatDate(order.created_at) : "—"}
                </span>
              </div>

              {/* Columna 7: Acciones */}
              <div className="w-full sm:w-auto flex items-center justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 pl-2 sm:pl-0 gap-2">
                <button 
                  onClick={() => onView?.(order)}
                  className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Ver
                </button>
                <button 
                  onClick={() => onStatusChange?.(order)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-zinc-200 hover:bg-white/15 hover:text-white active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Estado
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {!isPending && !isError && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-[#3A5F26]/35 bg-[#150C07]/80 backdrop-blur-md rounded-2xl shadow-inner mt-6">
          <p className="text-xs font-medium text-[#D4C4B5]">
            Mostrando{" "}
            <span className="font-extrabold text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-extrabold text-[#FBBF24]">{totalItems}</span> órdenes
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 transition-all duration-200 shadow-sm cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-amber-300">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 transition-all duration-200 shadow-sm cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTable;
