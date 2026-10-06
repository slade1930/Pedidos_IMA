// src/features/orders/components/OrderTable.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useOrders } from "@/features/orders/hooks/useOrders";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 100;

// ─── PROPS ─────────────────────────────────────────────────

interface FairOption {
  id: string;
  name: string;
}

interface OrderTableProps {
  onView?: (order: Order) => void;
  onStatusChange?: (order: Order) => void;
  search?: string;
  statusFilter?: string;
  fairIdFilter?: string;
  fairs?: FairOption[];
}

// ─── CONFIGURACIÓN DE ESTADOS ──────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badge: string; dot: string; rail: string; animateDot?: boolean }
> = {
  pending: {
    label: "Pendiente",
    badge: "bg-[var(--itas-gold)]/15 text-[var(--itas-gold)] border-[var(--itas-gold)]/35 shadow-[0_0_14px_rgba(var(--itas-gold-rgb),0.2)]",
    dot: "bg-[var(--itas-gold)] shadow-[0_0_8px_rgba(var(--itas-gold-rgb),0.9)]",
    rail: "bg-gradient-to-b from-[var(--itas-gold)] via-[var(--itas-gold-light)]/60 to-transparent shadow-[0_0_12px_rgba(var(--itas-gold-rgb),0.55)]",
    animateDot: true,
  },
  confirmed: {
    label: "Confirmada",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/35 shadow-[0_0_14px_rgba(14,165,233,0.2)]",
    dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]",
    rail: "bg-gradient-to-b from-sky-400 via-sky-500/60 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.55)]",
  },
  ready: {
    label: "Lista",
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/35 shadow-[0_0_14px_rgba(99,102,241,0.2)]",
    dot: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]",
    rail: "bg-gradient-to-b from-indigo-400 via-indigo-500/60 to-transparent shadow-[0_0_12px_rgba(129,140,248,0.55)]",
    animateDot: true,
  },
  delivered: {
    label: "Entregada",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_14px_rgba(16,185,129,0.2)]",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
    rail: "bg-gradient-to-b from-emerald-400 via-emerald-500/60 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.55)]",
  },
  cancelled: {
    label: "Cancelada",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-[0_0_14px_rgba(244,63,94,0.2)]",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]",
    rail: "bg-gradient-to-b from-rose-400 via-rose-500/60 to-transparent shadow-[0_0_12px_rgba(251,113,133,0.55)]",
  },
  expired: {
    label: "Expirada",
    badge: "bg-zinc-700/25 text-zinc-400 border-zinc-600/40",
    dot: "bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.6)]",
    rail: "bg-gradient-to-b from-zinc-500 via-zinc-600/60 to-transparent",
  },
};

// ─── UTILITARIOS DE DISEÑO Y PALETA ────────────────────────

function getStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
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

function getPaymentLabel(method: string): string {
  switch (method) {
    case "yappy":
      return "Yappy";
    case "card":
      return "Tarjeta";
    case "cash":
      return "Efectivo";
    default:
      return method;
  }
}

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completado";
    case "failed":
      return "Fallido";
    case "processing":
      return "Procesando";
    case "refunded":
      return "Reembolsado";
    default:
      return "Pendiente";
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-emerald-400";
    case "failed":
      return "text-rose-400";
    case "processing":
      return "text-sky-400";
    case "refunded":
      return "text-violet-400";
    default:
      return "text-amber-400";
  }
}

function PaymentMethodIcon({ method }: { method: string }) {
  if (method === "yappy") {
    return (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    );
  }
  if (method === "card") {
    return (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 6.5c0-1.4-2.2-2.5-5-2.5s-5 1.1-5 2.5 2.2 2.5 5 2.5 5 1.1 5 2.5-2.2 2.5-5 2.5-5-1.1-5-2.5" />
    </svg>
  );
}

// ─── SKELETON SEGMENTADO ───────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer hidden sm:grid grid-cols-[2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 px-6 py-4 border border-slate-200/70 dark:border-white/5 rounded-2xl bg-slate-100/60 dark:bg-[#1D100A]/80 backdrop-blur items-center"
        >
          <div className="space-y-2">
            <div className="h-5 w-28 bg-white/10 rounded-lg" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-white/10 rounded" />
            <div className="h-2.5 w-16 bg-white/10 rounded" />
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

export function OrderTable({ onView, onStatusChange, search, statusFilter, fairIdFilter, fairs }: OrderTableProps) {
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
        <div className="hidden sm:grid grid-cols-[2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] gap-4 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-[#7c95a8]">
          <div className="pl-3">Orden</div>
          <div>Producto · Pago</div>
          <div>Total</div>
          <div>Estado</div>
          <div>Código</div>
          <div>Fecha / Hora</div>
          <div className="text-right">Acciones</div>
        </div>
      )}

      {/* Cuerpo Segmentado Flotante */}
      <div className={`space-y-3 transition-opacity duration-300 ${isFetching ? "opacity-70" : "opacity-100"}`}>
        {isPending && <TableSkeleton />}

        {/* Estado Error */}
        {isError && !isPending && (
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-rose-950/40 p-10 text-center flex flex-col items-center justify-center backdrop-blur-md shadow-panel">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 mb-4 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-rose-200 font-extrabold text-lg tracking-tight">Error al cargar órdenes</p>
            <p className="text-xs text-rose-300/80 mt-1.5 max-w-xs mx-auto">
              {(error as { message?: string })?.message || "Intenta nuevamente"}
            </p>
          </div>
        )}

        {/* Estado Vacío */}
        {!isPending && !isError && orders.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/80 shadow-panel p-14 text-center flex flex-col items-center justify-center backdrop-blur-md">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-amber-400/15 to-transparent text-amber-400/90 mb-5 border border-amber-500/20 relative animate-float">
              <span className="absolute inset-0 rounded-3xl bg-amber-400/10 animate-ping opacity-25" />
              <svg className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">No hay órdenes</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-[260px] mx-auto">No se encontraron órdenes para los filtros actuales.</p>
          </div>
        )}

        {/* Filas de Órdenes */}
        {!isPending && !isError && orders.map((order, index) => {
          const statusConfig = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.expired;
          const customerName = order.customer_name ?? order.user_id;
          const cedula = order.customer_cedula;
          const mainProduct = order.items?.[0]?.product_name;
          const productCount = order.items?.length ?? 0;
          const fairName = fairs?.find((f) => f.id === order.fair_id)?.name;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.28), ease: "easeOut" }}
              className="group relative overflow-hidden bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/80 p-5 sm:p-0 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/70 dark:border-[#1b4f72]/30 shadow-card hover:shadow-card-hover hover:border-[var(--itas-gold)]/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4 sm:grid sm:grid-cols-[2fr_1.8fr_1.2fr_1.5fr_1fr_1.8fr_1.5fr] sm:gap-4 sm:items-center"
            >
              {/* Hairline superior */}
              <div className="hidden sm:block absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#1b4f72]/60 to-transparent group-hover:via-[var(--itas-gold)]/70" />
              {/* Sheen de hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

              {/* Barra indicadora luminosa lateral */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${statusConfig.rail}`} />

              {/* Columna 1: ID / Número de Orden */}
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-1">
                <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Orden</span>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-[#0e1e33] border border-[var(--itas-gold)]/25 px-3 py-1.5 shadow-inner">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} ${statusConfig.animateDot ? "animate-pulse" : ""}`} />
                    <span className="font-mono text-xs font-black tracking-tight text-[var(--itas-gold)] dark:text-gradient-gold">
                      {order.order_number}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-bold text-slate-800 dark:text-white truncate max-w-[160px] leading-tight">{customerName}</p>
                  {cedula && (
                    <p className="text-[10px] font-medium text-slate-500 dark:text-[#7c95a8] truncate max-w-[140px]">C.I. {cedula}</p>
                  )}
                </div>
              </div>

              {/* Columna 2: Producto · Pago */}
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Producto · Pago</span>
                <div className="min-w-0 text-right sm:text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[190px]">{mainProduct || "—"}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-[#7c95a8] truncate max-w-[190px]">
                    {productCount > 0 ? `${productCount} ${productCount === 1 ? "producto" : "productos"}` : "Sin productos"}
                    {fairName ? ` · ${fairName}` : ""}
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-[#c9dad4]">
                    <span className="text-[var(--itas-gold)]/80 dark:text-[#2fd4a7]/80"><PaymentMethodIcon method={order.payment_method} /></span>
                    {getPaymentLabel(order.payment_method)}
                    <span className="text-slate-400 dark:text-[#7c95a8]">·</span>
                    <span className={`inline-flex items-center gap-1 font-bold ${getPaymentStatusColor(order.payment_status)}`}>
                      <span className={`h-1 w-1 rounded-full ${
                        order.payment_status === "completed" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" :
                        order.payment_status === "failed" ? "bg-rose-400" :
                        order.payment_status === "processing" ? "bg-sky-400" : "bg-amber-400 animate-pulse"
                      }`} />
                      {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Columna 3: Total */}
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Total</span>
                <span className="font-mono text-base font-black tracking-tight text-[var(--itas-gold)] dark:text-gradient-gold whitespace-nowrap">
                  {formatPrice(order.total_amount)}
                </span>
              </div>

              {/* Columna 4: Estado */}
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Estado</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${statusConfig.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} ${statusConfig.animateDot ? "animate-pulse" : ""}`} />
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Columna 5: Código de Retiro */}
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Código</span>
                {order.pickup_code ? (
                  <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-black tracking-widest ${order.status === "delivered" ? "text-zinc-500 line-through decoration-zinc-500/50" : "text-emerald-400"}`}>
                    {order.status === "delivered" ? (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                    )}
                    {order.pickup_code}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">—</span>
                )}
              </div>

              {/* Columna 6: Fecha */}
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 pl-2 sm:pl-0">
                <span className="sm:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Fecha</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-[#c9dad4]">
                  <svg className="h-3.5 w-3.5 text-[var(--itas-gold)]/70 dark:text-[#2fd4a7]/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
                    <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
                  </svg>
                  {order.created_at ? formatDate(order.created_at) : "—"}
                </span>
              </div>

              {/* Columna 7: Acciones */}
              <div className="w-full flex items-center justify-end gap-2 border-t border-slate-200/70 dark:border-white/10 sm:border-t-0 pt-3 sm:pt-0 pl-2 sm:pl-0">
                <button
                  onClick={() => onView?.(order)}
                  className="group/btn relative inline-flex items-center gap-1.5 rounded-xl border border-[var(--itas-gold)]/50 bg-gradient-to-b from-[var(--itas-gold-light)]/30 to-[var(--itas-gold)]/10 px-4 py-2 text-xs font-bold text-[var(--itas-gold)] hover:from-[var(--itas-gold)] hover:to-[var(--itas-gold)] hover:text-white hover:border-[var(--itas-gold)] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Ver
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onStatusChange?.(order)}
                  className="rounded-xl border border-slate-200 dark:border-white/12 bg-slate-100 dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-white/[0.12] hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Estado
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Paginación */}
      {!isPending && !isError && orders.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-[#1b4f72]/35 dark:border-[#1b4f72]/35 bg-white/70 dark:bg-[#0e1e33]/85 backdrop-blur-md rounded-2xl shadow-panel">
          <p className="text-xs font-semibold text-slate-600 dark:text-[#c9dad4]">
            Mostrando{" "}
            <span className="font-black text-slate-900 dark:text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-black text-slate-900 dark:text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-black text-[var(--itas-gold)] dark:text-gradient-gold">{totalItems}</span>{" "}órdenes
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/12 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.12] disabled:opacity-30 disabled:hover:bg-white/5 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 5l-7 7 7 7" />
              </svg>
              Anterior
            </button>
            <span className="rounded-lg bg-[var(--itas-gold)]/10 border border-[var(--itas-gold)]/20 px-3 py-1.5 text-xs font-black text-[var(--itas-gold)] dark:text-amber-300">
              Página {page} / {totalPages}
            </span>
            <button
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/12 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.12] disabled:opacity-30 disabled:hover:bg-white/5 transition-all duration-200 shadow-sm cursor-pointer"
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

export default OrderTable;