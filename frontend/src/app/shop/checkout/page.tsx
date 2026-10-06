"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { usePdaRestriction } from "@/features/shop/hooks/usePdaRestriction";
import { PdaRestrictionCard } from "@/features/shop/components/PdaRestrictionCard";
import { PaymentForm } from "@/features/shop/components/PaymentForm";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

// ─── COMPONENTE ────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: pdaStatus } = usePdaRestriction();
  const restriction = isAuthenticated && pdaStatus && !pdaStatus.can_purchase ? pdaStatus.restriction : null;

  // Si el ciudadano ya compró (control de beneficios), bloquear el pago
  if (restriction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[80vh] flex items-center justify-center relative overflow-hidden text-[#142b45]">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#1b4f72]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#2fd4a7]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg space-y-6">
          <PdaRestrictionCard
            restriction={restriction}
            hint="Ya realizaste tu compra del mes. El pago está bloqueado hasta que se libere tu próximo cupo."
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/shop/products")}
            className="w-full rounded-2xl bg-gradient-to-r from-[#142b45] to-[#1b4f72] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#142b45]/15 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Ir a Productos</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    );
  }

  // Si no hay items, redirigir al carrito
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[80vh] flex items-center justify-center relative overflow-hidden text-[#142b45]">
        {/* Luces de Fondo Animadas */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#1b4f72]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#2fd4a7]/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-3xl border border-[#1b4f72]/12 p-8 sm:p-12 text-center shadow-xl relative overflow-hidden"
        >
          {/* Patrón de puntos decorativo */}
          <div className="absolute inset-0 opacity-[0.02] bg-repeat pointer-events-none" style={{ backgroundImage: "radial-gradient(#1b4f72 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          
          {/* Icono de Carrito Vacío Animado */}
          <div className="relative mx-auto h-24 w-24 flex items-center justify-center mb-6">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-16 w-16 rounded-2xl bg-[#1b4f72]/8 flex items-center justify-center text-[#1b4f72] border border-[#1b4f72]/15 shadow-inner"
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
            className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-[#142b45] to-[#1b4f72] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#142b45]/15 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 mx-auto"
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