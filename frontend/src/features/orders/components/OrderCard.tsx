// src/features/orders/components/OrderCard.tsx

import type { Order, OrderStatus } from "@/features/orders/types/order.types";

// ─── PROPS ─────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onStatusChange?: (order: Order) => void;
}

// ─── CONFIGURACIÓN DE ESTADOS ──────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; dotClass: string; animateDot?: boolean }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 shadow-[0_2px_10px_rgba(245,158,11,0.12)]",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]",
    animateDot: true,
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25 shadow-[0_2px_10px_rgba(14,165,233,0.12)]",
    dotClass: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.7)]",
  },
  ready: {
    label: "Lista",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25 shadow-[0_2px_10px_rgba(99,102,241,0.12)]",
    dotClass: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]",
    animateDot: true,
  },
  delivered: {
    label: "Entregada",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 shadow-[0_2px_10px_rgba(16,185,129,0.12)]",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 shadow-[0_2px_10px_rgba(244,63,94,0.12)]",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]",
  },
  expired: {
    label: "Expirada",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    dotClass: "bg-slate-400 dark:bg-slate-500",
  },
};

function getStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethodLabel(method: string): string {
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
    case "pending":
      return "Pendiente";
    case "processing":
      return "Procesando";
    case "completed":
      return "Completado";
    case "failed":
      return "Fallido";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
}

function getPaymentStatusClasses(status: string): string {
  switch (status) {
    case "completed":
      return "text-emerald-700 dark:text-emerald-400";
    case "failed":
      return "text-rose-600 dark:text-rose-400";
    case "processing":
      return "text-sky-700 dark:text-sky-400";
    default:
      return "text-amber-600 dark:text-amber-400";
  }
}

// ─── COMPONENTE ────────────────────────────────────────────

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const customerName = order.customer_name ?? order.user_id;
  const cedula = order.customer_cedula;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/90 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 p-6">
      {/* Hairline superior */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#1b4f72]/70 via-[#2fd4a7]/70 to-[#1b4f72]/70" />

      {/* Resplandores decorativos */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-200/50 to-transparent dark:from-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-amber-200/40 to-transparent dark:from-amber-500/10 blur-3xl" />

      <div className="relative">
        {/* Cabecera / Info del Ticket */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              Ticket de orden
            </p>
            <h3 className="mt-1 bg-clip-text text-transparent bg-gradient-to-r from-[#2e7d9e] to-[#2e7d9e] dark:from-[#E8B442] dark:to-[#2fd4a7] text-2xl font-black tracking-tight leading-none">
              {order.order_number}
            </h3>

            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1b4f72] to-[#20917a] text-white shadow-md">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white leading-tight">{customerName}</p>
                {cedula ? (
                  <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400">C.I. {cedula}</p>
                ) : (
                  <p className="mt-0.5 max-w-[140px] truncate font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400">{order.user_id}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {statusConfig && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${statusConfig.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass} ${statusConfig.animateDot ? "animate-pulse" : ""}`} />
                {getStatusLabel(order.status)}
              </span>
            )}
          </div>
        </div>

        {/* Primera línea troquelada divisoria (Ticket Notch) */}
        <div className="relative my-4">
          <div className="absolute left-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="absolute right-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="border-t border-dashed border-slate-200/80 dark:border-slate-700/80" />
        </div>

        {/* Detalles Técnicos */}
        <div className="space-y-3 pb-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Método de pago</span>
            <span className="flex-1 border-b border-dotted border-slate-200 dark:border-slate-700 mx-2"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {getPaymentMethodLabel(order.payment_method)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Estado del pago</span>
            <span className="flex-1 border-b border-dotted border-slate-200 dark:border-slate-700 mx-2"></span>
            <span className={`font-black inline-flex items-center gap-1.5 ${getPaymentStatusClasses(order.payment_status)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                order.payment_status === "completed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" :
                order.payment_status === "failed" ? "bg-rose-500" :
                order.payment_status === "processing" ? "bg-sky-500" : "bg-amber-500 animate-pulse"
              }`} />
              {getPaymentStatusLabel(order.payment_status)}
            </span>
          </div>

          {order.pickup_code && (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 px-4 py-3 shadow-inner">
              <div className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-amber-400/25 dark:bg-amber-500/20 blur-xl" />
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-700/70 dark:text-amber-400/70">Código de retiro</p>
              <p className="mt-1 font-mono text-lg font-black tracking-[0.25em] text-amber-700 dark:text-amber-400">
                {order.pickup_code}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ID Orden</span>
            <span className="flex-1 border-b border-dotted border-slate-200 dark:border-slate-700 mx-2"></span>
            <span className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{order.id}</span>
          </div>
        </div>

        {/* Segunda línea troquelada divisoria (Ticket Notch) */}
        <div className="relative my-4">
          <div className="absolute left-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="absolute right-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="border-t border-dashed border-slate-200/80 dark:border-slate-700/80" />
        </div>

        {/* Listado de Productos */}
        <div className="pb-3.5">
          <h4 className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Desglose de productos
            <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[9px] text-slate-500 dark:text-slate-400">
              {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
            </span>
          </h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div
                key={item.id}
                className="group/item flex items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 px-3.5 py-2.5 transition-all duration-200 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/[0.06]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1b4f72] to-[#2e7d9e] text-[10px] font-black text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.product_name}</p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {formatPrice(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-black text-slate-900 dark:text-amber-400">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Total de la Orden (Cuadro resumen de marca) */}
        <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl gradient-gold px-5 py-4 shadow-glow-gold">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0e1e33]/70">Total de la orden</span>
          <span className="font-mono text-2xl font-black tracking-tight text-[#0e1e33] leading-none">
            {formatPrice(order.total_amount)}
          </span>
        </div>

        {/* Notas del Pedido */}
        {order.notes && (
          <div className="mt-4 pl-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Notas</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{order.notes}</p>
          </div>
        )}

        {/* Fechas de Creación/Actualización */}
        {order.created_at && (
          <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 dark:border-slate-700/80 pt-3 pl-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Creado</span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{formatDateTime(order.created_at)}</span>
            </div>
            {order.updated_at && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actualizado</span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{formatDateTime(order.updated_at)}</span>
              </div>
            )}
          </div>
        )}

        {/* Botón Cambiar Estado */}
        {onStatusChange && order.status !== "delivered" && order.status !== "cancelled" && order.status !== "expired" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onStatusChange(order)}
              className="group/btn inline-flex items-center gap-2 rounded-xl border border-[#1b4f72]/30 dark:border-amber-500/30 bg-[#1b4f72]/[0.06] dark:bg-amber-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#1b4f72] dark:text-amber-400 hover:bg-[#1b4f72]/[0.14] dark:hover:bg-amber-500/20 hover:border-[#1b4f72]/50 dark:hover:border-amber-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Cambiar Estado
              <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderCard;