"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyOrders } from "@/features/shop/hooks/useMyOrders";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  ChevronRight, 
  Coins, 
  Calendar, 
  AlertTriangle,
  FileText,
  ShoppingBag,
  Store,
  Filter,
  CheckCircle2,
  FileDown
} from "lucide-react";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("es-PA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Reciente";
  }
}

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pending": return "bg-amber-50 text-amber-700 border border-amber-200/50";
    case "confirmed": return "bg-blue-50 text-blue-700 border border-blue-200/50";
    case "ready": return "bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-black animate-pulse-subtle";
    case "delivered": return "bg-green-50 text-green-700 border border-green-200/50";
    case "cancelled": return "bg-red-50 text-red-700 border border-red-200/50";
    case "expired": return "bg-gray-50 text-gray-500 border border-gray-200/50";
    default: return "bg-gray-50 text-gray-500 border border-gray-200/50";
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending": return "Pendiente";
    case "confirmed": return "Confirmada";
    case "ready": return "Listo Retiro";
    case "delivered": return "Entregada";
    case "cancelled": return "Cancelada";
    case "expired": return "Expirada";
    default: return status;
  }
}

// ─── SKELETON ──────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Estilos locales para shimmer */}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-bg {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite linear;
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-3xl border border-gray-100 p-4 flex items-center space-x-3 shadow-sm">
            <div className="h-10 w-10 rounded-2xl shimmer-bg flex-shrink-0" />
            <div className="space-y-2 w-2/3">
              <div className="h-3 w-16 rounded-md shimmer-bg" />
              <div className="h-4.5 w-24 rounded-md shimmer-bg" />
            </div>
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 bg-white rounded-3xl border border-gray-150 p-6 flex justify-between items-center shadow-sm">
          <div className="space-y-2.5 w-1/3">
            <div className="h-4 w-28 rounded-lg shimmer-bg" />
            <div className="h-3.5 w-20 rounded-lg shimmer-bg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 rounded-lg shimmer-bg" />
            <div className="h-5 w-16 rounded-full shimmer-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function OrderList() {
  const { data: orders, isPending, isError } = useMyOrders();
  const [filter, setFilter] = useState<string>("all");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (isPending) return <ListSkeleton />;

  if (isError) {
    return (
      <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-8 text-center flex flex-col items-center gap-3 max-w-md mx-auto shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-700 border border-red-200">
          <AlertTriangle size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h4 className="text-base font-black uppercase tracking-wider text-red-800">Error de Conexión</h4>
          <p className="text-sm font-semibold text-red-600 mt-1">No se pudo cargar tu historial de pedidos. Intenta nuevamente en unos momentos.</p>
        </div>
      </div>
    );
  }

  const orderList = Array.isArray(orders) ? orders : [];

  // Cálculos estadísticos rápidos para añadir valor al diseño
  const totalSpent = orderList
    .filter(o => o.status !== "cancelled" && o.status !== "expired")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingPickups = orderList.filter(o => o.status === "ready").length;
  const activeOrders = orderList.filter(o => o.status === "pending" || o.status === "confirmed").length;

  // Filtrado de pedidos
  const filteredOrders = orderList.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active") return ["pending", "confirmed", "ready"].includes(order.status);
    if (filter === "completed") return order.status === "delivered";
    if (filter === "cancelled") return ["cancelled", "expired"].includes(order.status);
    return true;
  });

  if (orderList.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/60 p-12 text-center max-w-md mx-auto shadow-sm space-y-5">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-[#3A5F26]/8 flex items-center justify-center text-[#3A5F26] border border-[#3A5F26]/15">
          <FileText size={24} strokeWidth={2} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-gray-900">No tienes pedidos</h3>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed max-w-xs mx-auto">
            Aún no has registrado transacciones en ferias libres. Realiza tu primer pedido desde el catálogo.
          </p>
        </div>
        <div className="pt-2">
          <Link 
            href="/shop/products" 
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#3A5F26] bg-[#3A5F26]/8 px-5 py-2.5 rounded-full tracking-widest uppercase border border-[#3A5F26]/12 hover:bg-[#3A5F26]/12 transition-colors"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "completed", label: "Entregados" },
    { value: "cancelled", label: "Cancelados" },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        .premium-shadow {
          box-shadow: 0 15px 30px -10px rgba(58, 95, 38, 0.08);
        }
        .glow-gold {
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.12);
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
      `}</style>

      {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invertido */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4.5 flex items-center space-x-3.5 premium-shadow">
          <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600">
            <Coins size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Total Invertido</span>
            <span className="text-base font-black text-gray-900 font-mono tracking-tight">{formatPrice(totalSpent)}</span>
          </div>
        </div>

        {/* Retiros Pendientes */}
        <div className={`bg-white rounded-3xl border p-4.5 flex items-center space-x-3.5 premium-shadow transition-all ${pendingPickups > 0 ? "border-emerald-200/70 bg-emerald-50/20" : "border-gray-100"}`}>
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${pendingPickups > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-gray-400"}`}>
            <Store size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Por Retirar</span>
            <span className={`text-base font-black font-mono tracking-tight ${pendingPickups > 0 ? "text-emerald-700 animate-pulse-subtle" : "text-gray-900"}`}>
              {pendingPickups} {pendingPickups === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
        </div>

        {/* Activos en Proceso */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4.5 flex items-center space-x-3.5 premium-shadow">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-600">
            <ShoppingBag size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">En Proceso</span>
            <span className="text-base font-black text-gray-900 font-mono tracking-tight">{activeOrders} activos</span>
          </div>
        </div>
      </div>

      {/* SELECTOR DE FILTRO REDISEÑADO */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mt-4">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#3A5F26]">
          <Filter size={14} />
          <span>Filtrar</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto max-w-[80%] pb-1 scrollbar-none">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === option.value
                  ? "bg-[#3A5F26] text-white shadow-md shadow-[#3A5F26]/10"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE PEDIDOS */}
      <motion.div 
        layout
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center"
            >
              <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">Sin resultados</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">No hay pedidos con el filtro seleccionado.</p>
            </motion.div>
          ) : (
            filteredOrders.map((order) => {
              const isReady = order.status === "ready";

              return (
                <motion.div
                  key={order.id}
                  layoutId={order.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0 }
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <div className={`relative block rounded-3xl border transition-all hover:shadow-lg premium-shadow group overflow-hidden ${
                    isReady 
                      ? "border-emerald-300 bg-gradient-to-r from-emerald-50/20 to-white" 
                      : "bg-white border-gray-150 hover:border-[#3A5F26]/30"
                  }`}>
                    {/* Indicador de Hover lateral */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                      isReady ? "bg-emerald-500" : "bg-transparent group-hover:bg-[#FBBF24]"
                    }`} />

                    <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Enlace principal */}
                      <Link
                        href={`/shop/orders/${order.id}`}
                        className="flex items-start gap-4 flex-grow min-w-0"
                      >
                        {/* Icono de Pedido */}
                        <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all ${
                          isReady 
                            ? "bg-emerald-100 border-emerald-200 text-emerald-700" 
                            : "bg-gray-50 border-gray-200 text-gray-500 group-hover:text-[#3A5F26] group-hover:bg-[#3A5F26]/5 group-hover:border-[#3A5F26]/20"
                        }`}>
                          <Receipt size={18} strokeWidth={2} />
                        </div>
                        
                        <div className="min-w-0">
                          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                            <span>Pedido</span>
                            <span className={`font-mono text-xs font-extrabold ${isReady ? "text-emerald-700" : "text-[#3A5F26]"}`}>
                              {order.order_number}
                            </span>
                          </h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                            <Calendar size={11} className="text-gray-300" />
                            <span>{order.created_at ? formatDate(order.created_at) : ""}</span>
                          </p>
                          {order.pickup_code && isReady && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200/40">
                              <CheckCircle2 size={10} /> Código: {order.pickup_code}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Métricas y Badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Monto Total</span>
                          <span className="text-base font-black text-gray-900 font-mono tracking-tight flex items-center gap-0.5 mt-0.5">
                            <Coins size={12} className="text-gray-400" />
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Botón Factura Rápida (para pedidos confirmados/entregados) */}
                          {["confirmed", "delivered", "ready"].includes(order.status) && (
                            <a
                              href={`${apiUrl}/api/v1/orders/${order.id}/invoice`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-white transition-colors flex-shrink-0"
                              title="Descargar Factura"
                            >
                              <FileDown size={14} />
                            </a>
                          )}

                          {/* Badge de Estado */}
                          <span className={`inline-flex rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest leading-none ${getStatusBadgeClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          
                          {/* Chevron de navegación */}
                          <Link href={`/shop/orders/${order.id}`} className="flex-shrink-0">
                            <ChevronRight 
                              size={16} 
                              className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" 
                              strokeWidth={2.5}
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default OrderList;