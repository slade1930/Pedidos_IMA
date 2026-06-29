// src/features/orders/components/OrderTable.tsx

"use client";

import { useState } from "react";
import { useOrders } from "@/features/orders/hooks/useOrders";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 10;

// ─── PROPS ─────────────────────────────────────────────────

interface OrderTableProps {
  onView?: (order: Order) => void;
  onStatusChange?: (order: Order) => void;
  search?: string;
  statusFilter?: string;
  fairIdFilter?: string;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
    case "confirmed":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25";
    case "ready":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/25";
    case "cancelled":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-455 border-rose-500/25";
    case "expired":
      return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800";
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
    <div className="space-y-3.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i} 
          className="hidden sm:grid grid-cols-[2.2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/10 backdrop-blur animate-pulse"
        >
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-850 rounded" />
            <div className="h-2.5 w-10 bg-slate-200 dark:bg-slate-850 rounded" />
          </div>
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-850 rounded-full" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-850 rounded" />
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-850 rounded-xl justify-self-end" />
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
    <div className="space-y-4 w-full">
      {/* Encabezado de Columnas (Modo Desktop) */}
      {!isPending && !isError && orders.length > 0 && (
        <div className="hidden sm:grid grid-cols-[2.2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-[#4A3728]/60 dark:text-slate-500">
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
      <div className="space-y-3.5">
        {isPending && <TableSkeleton />}

        {isError && !isPending && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center flex flex-col items-center justify-center backdrop-blur-md">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 mb-4 border border-red-200/50 dark:border-red-900/50">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-red-700 dark:text-red-405 font-bold text-lg leading-none">Error al cargar órdenes</p>
            <p className="text-xs text-neutral-400 mt-2.5 max-w-xs mx-auto">
              {(error as { message?: string })?.message || "Intenta nuevamente"}
            </p>
          </div>
        )}

        {!isPending && !isError && orders.length === 0 && (
          <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur p-16 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 mb-4 relative border border-slate-200 dark:border-slate-850">
              <div className="absolute inset-0 rounded-2xl bg-slate-400/10 animate-ping opacity-25" />
              <svg className="mx-auto h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">No hay órdenes</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">No se encontraron órdenes registradas.</p>
          </div>
        )}

        {!isPending && !isError && orders.map((order) => {
          const indicatorColor = 
            order.status === "pending" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" :
            order.status === "confirmed" ? "bg-sky-505 shadow-[0_0_10px_rgba(14,165,233,0.4)]" :
            order.status === "ready" ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
            order.status === "delivered" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
            "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]";

          return (
            <div 
              key={order.id}
              className="relative overflow-hidden bg-white/90 dark:bg-slate-950/70 p-4.5 sm:p-0 sm:px-6 sm:py-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 hover:border-[#3D5A1E]/30 dark:hover:border-[#5C8A3C]/40 hover:shadow-[0_8px_25px_rgba(74,55,40,0.02)] hover:scale-[1.008] hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:grid sm:grid-cols-[2.2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 items-center"
            >
              {/* Barra indicadora luminosa lateral (Toque Exótico) */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${indicatorColor}`} />

              {/* Columna 1: ID / Número de Orden */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Orden</span>
                <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 shadow-inner flex items-center gap-1.5 w-fit">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {order.order_number}
                </div>
              </div>

              {/* Columna 2: Detalles de Pago */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles de Pago</span>
                <div className="text-xs text-left">
                  <p className="font-bold text-slate-700 dark:text-slate-350">
                    {order.payment_method === "yappy" ? "Yappy" : order.payment_method === "card" ? "Tarjeta" : "Efectivo"}
                  </p>
                  <p className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
                    order.payment_status === "completed" ? "text-emerald-700 dark:text-emerald-450" :
                    order.payment_status === "failed" ? "text-rose-600" :
                    order.payment_status === "processing" ? "text-blue-600" : "text-amber-600"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      order.payment_status === "completed" ? "bg-emerald-500" :
                      order.payment_status === "failed" ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                    }`} />
                    {order.payment_status === "completed" ? "Completado" : order.payment_status === "failed" ? "Fallido" : order.payment_status === "processing" ? "Procesando" : "Pendiente"}
                  </p>
                </div>
              </div>

              {/* Columna 3: Total */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-sm font-black text-[#4A3728] dark:text-white">
                  {formatPrice(order.total_amount)}
                </span>
              </div>

              {/* Columna 4: Estado */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md shadow-sm ${getStatusBadgeClass(order.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    order.status === "ready" || order.status === "pending" ? "bg-amber-500 animate-pulse" :
                    order.status === "delivered" ? "bg-emerald-500" : "bg-rose-500"
                  }`} />
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Columna 5: Código QR */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">QR</span>
                {order.qr_used ? (
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Usado</span>
                ) : order.qr_code ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-705 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Activo
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>

              {/* Columna 6: Fecha */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start pl-2 sm:pl-0">
                <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {order.created_at ? formatDate(order.created_at) : "—"}
                </span>
              </div>

              {/* Columna 7: Acciones */}
              <div className="w-full sm:w-auto flex items-center justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-900/50 pt-3 sm:pt-0 pl-2 sm:pl-0 gap-2">
                <button 
                  onClick={() => onView?.(order)}
                  className="rounded-xl border border-slate-205 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:scale-95 transition-all duration-200"
                >
                  Ver
                </button>
                <button 
                  onClick={() => onStatusChange?.(order)}
                  className="rounded-xl border border-slate-205 dark:border-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all duration-200"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md rounded-2xl shadow-inner mt-8">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mostrando{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{totalItems}</span> órdenes
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

export default OrderTable;