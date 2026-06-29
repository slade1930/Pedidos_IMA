"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Order } from "@/features/orders/types/order.types";
import { 
  Check, 
  MapPin, 
  ShoppingBag, 
  Receipt, 
  Calendar, 
  Store,
  ChevronRight,
  ArrowRight
} from "lucide-react";

// ─── PROPS ─────────────────────────────────────────────────

interface OrderConfirmationProps {
  order: Order;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

// ─── COMPONENTE ────────────────────────────────────────────

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto px-4 py-8 relative text-[#1E3A1E] space-y-8">
      {/* Estilos CSS Locales para Diseño Premium */}
      <style>{`
        .premium-shadow {
          box-shadow: 0 20px 40px -15px rgba(58, 95, 38, 0.15);
        }
        .gold-glow-border {
          border: 2px dashed #FBBF24;
          box-shadow: 0 0 25px rgba(251, 191, 36, 0.12);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(58, 95, 38, 0.08);
        }
        .gold-stamp-gradient {
          background: linear-gradient(135deg, #1E3A1E, #122412);
          border: 2px solid #FBBF24;
        }
        @keyframes pulse-gold {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        .glow-pulse {
          animation: pulse-gold 3s infinite ease-in-out;
        }
      `}</style>

      {/* Luces de Fondo Decorativas */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#3A5F26]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera / Estado de Éxito */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-4"
      >
        <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-green-500/30"
          />
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/25">
            <Check size={26} strokeWidth={3} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">¡Pedido Confirmado!</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">IMA Panamá — Compra Registrada</p>
        </div>

        <p className="text-sm text-gray-500 font-semibold leading-relaxed max-w-sm mx-auto">
          Tu pedido número <span className="text-gray-900 font-extrabold font-mono text-sm bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">{order.order_number}</span> ha sido registrado exitosamente.
        </p>
      </motion.div>

      {/* CÓDIGO DE RETIRO (DISEÑO STAMP GOLD PREMIUM) */}
      {order.pickup_code && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          className="gold-stamp-gradient text-white rounded-3xl p-6 text-center relative overflow-hidden premium-shadow"
        >
          {/* Pulso de fondo */}
          <div className="absolute inset-0 bg-[#FBBF24] glow-pulse pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="text-[10px] text-[#FBBF24] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
              <MapPin size={12} /> Código de Retiro Autorizado
            </span>
            
            <div className="gold-glow-border rounded-2xl p-4.5 bg-black/35 flex flex-col items-center justify-center">
              <p className="text-4xl sm:text-5xl font-black tracking-widest text-[#FBBF24] font-mono leading-none">
                {order.pickup_code}
              </p>
              
              {/* Código de barras decorativo */}
              <div className="flex gap-0.5 h-6 mt-3.5 opacity-60">
                {[2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 2, 1, 3, 2, 4].map((width, idx) => (
                  <div key={idx} className="bg-white h-full" style={{ width: `${width}px` }} />
                ))}
              </div>
            </div>

            <p className="text-xs text-white/80 font-bold uppercase tracking-wider leading-relaxed">
              Muestra este código al personal de la feria libre para recoger tus productos.
            </p>
          </div>
        </motion.div>
      )}

      {/* Detalles del Pedido */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-panel rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-[#3A5F26]/10 pb-3 mb-1">
          <Receipt size={16} className="text-[#3A5F26]" />
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">Resumen de la Transacción</h2>
        </div>

        <div className="space-y-3 text-xs font-bold">
          
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500 flex items-center gap-1.5"><ShoppingBag size={13} className="text-[#3A5F26]" /> Orden de Compra</span>
            <span className="font-mono text-gray-900 font-extrabold">{order.order_number}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={13} className="text-[#3A5F26]" /> Estado de Transacción</span>
            <span className="text-green-700 font-extrabold bg-green-50 px-2 py-0.5 rounded-lg border border-green-200 uppercase text-[10px] tracking-wider">Confirmada</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
            <span className="text-[#3A5F26] uppercase tracking-wider flex items-center gap-1.5"><Store size={13} /> Importe Total Cobrado</span>
            <span className="text-lg font-black text-gray-900 font-mono">{formatPrice(order.total_amount)}</span>
          </div>

        </div>
      </motion.div>

      {/* Acciones */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/shop/orders")}
          className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-[#1E3A1E] to-[#3A5F26] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#1E3A1E]/15 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Ver Mis Pedidos</span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(58, 95, 38, 0.04)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/shop/products")}
          className="w-full sm:w-auto rounded-2xl border-2 border-gray-200 bg-transparent px-8 py-3.5 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Seguir Comprando</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default OrderConfirmation;