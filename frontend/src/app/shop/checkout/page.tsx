"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { PaymentForm } from "@/features/shop/components/PaymentForm";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

// ─── COMPONENTE ────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);

  // Si no hay items, redirigir al carrito
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[80vh] flex items-center justify-center relative overflow-hidden text-[#1E3A1E]">
        {/* Luces de Fondo Animadas */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#3A5F26]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-3xl border border-[#3A5F26]/12 p-8 sm:p-12 text-center shadow-xl relative overflow-hidden"
        >
          {/* Patrón de puntos decorativo */}
          <div className="absolute inset-0 opacity-[0.02] bg-repeat pointer-events-none" style={{ backgroundImage: "radial-gradient(#3A5F26 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          
          {/* Icono de Carrito Vacío Animado */}
          <div className="relative mx-auto h-24 w-24 flex items-center justify-center mb-6">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-16 w-16 rounded-2xl bg-[#3A5F26]/8 flex items-center justify-center text-[#3A5F26] border border-[#3A5F26]/15 shadow-inner"
            >
              <ShoppingBag size={30} strokeWidth={1.8} />
            </motion.div>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tu carrito está vacío</h2>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed max-w-sm mx-auto">
              Aún no has seleccionado productos agrícolas frescos. Agrega artículos a tu carrito para iniciar el proceso de checkout.
            </p>
          </div>

          {/* Botón de acción */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/shop/products")}
            className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-[#1E3A1E] to-[#3A5F26] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#1E3A1E]/15 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 mx-auto"
          >
            <span>Ver Productos</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <PaymentForm />
    </motion.div>
  );
}