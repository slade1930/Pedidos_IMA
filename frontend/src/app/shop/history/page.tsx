"use client";

import { useMyOrders } from "@/features/shop/hooks/useMyOrders";
import Link from "next/link";
import { motion } from "framer-motion";
import type { OrderStatus } from "@/features/orders/types/order.types";
import { 
  History, 
  ChevronRight, 
  Receipt, 
  Calendar, 
  Coins, 
  CalendarOff 
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
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "delivered": return "Entregada";
    case "cancelled": return "Cancelada";
    case "expired": return "Expirada";
    default: return status;
  }
}

// Estilo del badge según estado de orden
function getStatusBadgeStyle(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-green-50 text-green-700 border border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border border-red-200";
    case "expired":
    default:
      return "bg-gray-50 text-gray-500 border border-gray-200";
  }
}

// ─── COMPONENTE ────────────────────────────────────────────

export default function HistoryPage() {
  const { data: orders, isPending } = useMyOrders();
  const orderList = Array.isArray(orders) ? orders : [];

  // Solo pedidos completados/cancelados/expirados
  const historyOrders = orderList.filter(
    (o) => ["delivered", "cancelled", "expired"].includes(o.status)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative text-[#1E3A1E] min-h-screen">
      
      {/* Estilos CSS Locales para Efectos Premium */}
      <style>{`
        .premium-card-shadow {
          box-shadow: 0 15px 30px -10px rgba(58, 95, 38, 0.08);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(58, 95, 38, 0.08);
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* Luces de Fondo Decorativas */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#3A5F26]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FBBF24]/3 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Cabecera de Página */}
      <div className="border-b border-[#3A5F26]/10 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3A5F26]/8 border border-[#3A5F26]/15 text-[#3A5F26] text-[10px] font-black uppercase tracking-widest mb-3">
            <History size={12} strokeWidth={2.5} />
            Mi Cuenta
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1E3A1E] sm:text-4xl">
            Historial de Pedidos
          </h1>
          <p className="mt-2 text-xs text-gray-500 font-semibold leading-relaxed">
            Consulta el estado, facturación y fechas de recogida de tus compras anteriores en ferias libres.
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10">
        {isPending ? (
          /* Estado de Carga (Skeletons Shimmer Animados) */
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-150 p-6 flex justify-between items-center premium-card-shadow">
                <div className="space-y-2.5 w-1/3">
                  <div className="h-4 w-28 rounded-lg skeleton-shimmer" />
                  <div className="h-3.5 w-20 rounded-lg skeleton-shimmer" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-16 rounded-lg skeleton-shimmer" />
                  <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : historyOrders.length === 0 ? (
          /* Estado de Historial Vacío */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl border border-gray-200/60 p-12 text-center max-w-lg mx-auto shadow-sm space-y-5"
          >
            <div className="mx-auto h-16 w-16 rounded-2xl bg-[#3A5F26]/8 flex items-center justify-center text-[#3A5F26] border border-[#3A5F26]/15">
              <CalendarOff size={24} strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">Historial vacío</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed max-w-xs mx-auto">
                No tienes pedidos archivados en tu cuenta todavía.
              </p>
            </div>
            <div className="pt-2">
              <Link 
                href="/shop/products" 
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#3A5F26] bg-[#3A5F26]/8 px-5 py-2.5 rounded-full tracking-widest uppercase border border-[#3A5F26]/12 hover:bg-[#3A5F26]/12 transition-colors"
              >
                Comenzar Compra
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Lista de Pedidos en Historial */
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
            className="space-y-4"
          >
            {historyOrders.map((order) => (
              <motion.div
                key={order.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Link
                  href={`/shop/orders/${order.id}`}
                  className="block bg-white rounded-3xl border border-gray-150 p-6 hover:border-[#3A5F26]/30 transition-all hover:shadow-lg premium-card-shadow relative overflow-hidden group"
                >
                  {/* Línea lateral de interacción */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#FBBF24] transition-colors" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Icono de pedido */}
                      <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-[#3A5F26] group-hover:bg-[#3A5F26]/5 group-hover:border-[#3A5F26]/20 transition-all flex-shrink-0">
                        <Receipt size={16} strokeWidth={2} />
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                          <span>Pedido</span>
                          <span className="font-mono text-xs font-extrabold text-[#3A5F26]">{order.order_number}</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                          <Calendar size={11} className="text-gray-300" />
                          <span>{order.created_at ? formatDate(order.created_at) : ""}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Total Pagado</span>
                        <span className="text-base font-black text-gray-900 font-mono tracking-tight flex items-center gap-0.5 mt-0.5">
                          <Coins size={12} className="text-gray-400" />
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Badge de Estado */}
                        <span className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest leading-none ${getStatusBadgeStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        
                        {/* Chevron de navegación */}
                        <ChevronRight 
                          size={16} 
                          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" 
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

    </div>
  );
}