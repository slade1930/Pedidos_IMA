// src/features/orders/components/OrderCard.tsx

import type { Order, OrderStatus } from "@/features/orders/types/order.types";

// ─── PROPS ─────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onStatusChange?: (order: Order) => void;
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

// ─── COMPONENTE ────────────────────────────────────────────

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-850 shadow-[0_8px_30px_rgba(74,55,40,0.012)] hover:shadow-[0_15px_35px_rgba(74,55,40,0.025)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-6">
      
      <div>
        {/* Cabecera / Info del Ticket */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug">
              Orden #{order.order_number}
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold font-mono tracking-wider uppercase mt-1">
              Usuario: {order.user_id}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide border backdrop-blur-md shadow-sm ${getStatusBadgeClass(order.status)}`}>
              <span className={`w-1 h-1 rounded-full ${
                order.status === "ready" || order.status === "pending" ? "bg-amber-500 animate-pulse" :
                order.status === "delivered" ? "bg-emerald-500" :
                order.status === "confirmed" ? "bg-sky-500" : "bg-rose-500"
              }`} />
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Primera línea troquelada divisoria (Ticket Notch) */}
        <div className="relative my-4">
          <div className="absolute left-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="absolute right-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="border-t border-dashed border-slate-200/80 dark:border-slate-850" />
        </div>

        {/* Detalles Técnicos */}
        <div className="space-y-3 pb-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Método de pago</span>
            <span className="flex-1 border-b border-dotted border-slate-150 dark:border-slate-850 mx-2"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-350">
              {getPaymentMethodLabel(order.payment_method)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Estado del pago</span>
            <span className="flex-1 border-b border-dotted border-slate-150 dark:border-slate-850 mx-2"></span>
            <span className={`font-extrabold flex items-center gap-1.5 ${
              order.payment_status === "completed" ? "text-emerald-700 dark:text-emerald-450" :
              order.payment_status === "failed" ? "text-rose-600 dark:text-rose-450" :
              "text-amber-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                order.payment_status === "completed" ? "bg-emerald-500" :
                order.payment_status === "failed" ? "bg-rose-500" : "bg-amber-500 animate-pulse"
              }`} />
              {getPaymentStatusLabel(order.payment_status)}
            </span>
          </div>

          {order.pickup_code && (
            <div className="flex items-center justify-between bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-xl px-4 py-2.5 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Código de retiro</span>
              <span className="text-sm font-black text-indigo-650 dark:text-indigo-400 tracking-widest font-mono">
                {order.pickup_code}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ID Orden</span>
            <span className="flex-1 border-b border-dotted border-slate-150 dark:border-slate-850 mx-2"></span>
            <span className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200/20 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{order.id}</span>
          </div>
        </div>

        {/* Segunda línea troquelada divisoria (Ticket Notch) */}
        <div className="relative my-4">
          <div className="absolute left-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="absolute right-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-30" />
          <div className="border-t border-dashed border-slate-200/80 dark:border-slate-850" />
        </div>

        {/* Listado de Productos */}
        <div className="pb-3.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 pl-1">
            Desglose de Productos
          </h4>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-900/40 last:border-0 pl-1">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-250 truncate">{item.product_name}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                    {formatPrice(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-250 shrink-0">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        {/* Total de la Orden (Cuadro resumen de marca) */}
        <div className="flex items-center justify-between bg-[#E8DDD0]/15 dark:bg-slate-900/40 border border-[#E8DDD0]/35 dark:border-slate-800/80 rounded-2xl p-4 shadow-inner mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de la Orden</span>
          <span className="text-xl font-black text-[#4A3728] dark:text-white leading-none">
            {formatPrice(order.total_amount)}
          </span>
        </div>

        {/* Notas del Pedido */}
        {order.notes && (
          <div className="mb-4 pl-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Notas</h4>
            <p className="text-xs text-slate-600 dark:text-slate-405 leading-relaxed font-normal">{order.notes}</p>
          </div>
        )}

        {/* Fechas de Creación/Actualización */}
        {order.created_at && (
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-900/50 pt-3 pl-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-semibold text-slate-400">Creado</span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{formatDateTime(order.created_at)}</span>
            </div>
            {order.updated_at && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold text-slate-400">Actualizado</span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{formatDateTime(order.updated_at)}</span>
              </div>
            )}
          </div>
        )}

        {/* Botón Cambiar Estado */}
        {onStatusChange && order.status !== "delivered" && order.status !== "cancelled" && order.status !== "expired" && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900/50 flex justify-end">
            <button 
              onClick={() => onStatusChange(order)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-[#3D5A1E] dark:text-[#5C8A3C] hover:bg-[#3D5A1E]/8 hover:border-[#3D5A1E]/30 active:scale-95 transition-all duration-200 text-center"
            >
              Cambiar Estado
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default OrderCard;