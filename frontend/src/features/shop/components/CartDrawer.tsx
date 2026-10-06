"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { usePdaRestriction } from "@/features/shop/hooks/usePdaRestriction";
import { PdaRestrictionCard } from "@/features/shop/components/PdaRestrictionCard";
import { CartItem } from "@/features/shop/components/CartItem";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, ArrowRight, ShoppingCart, ShieldCheck } from "lucide-react";

// ─── PROPS ─────────────────────────────────────────────────

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const totalItems = useCartStore((state) => state.getTotalItems());
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: pdaStatus } = usePdaRestriction();
  const restriction = isAuthenticated && pdaStatus && !pdaStatus.can_purchase ? pdaStatus.restriction : null;

  const handleCheckout = () => {
    if (restriction) return;
    onClose();
    router.push("/shop/checkout");
  };

  const handleGoToCart = () => {
    onClose();
    router.push("/shop/cart");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con Difuminado Premium */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0e1e33]/60 backdrop-blur-md transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Panel Lateral Deslizable Ampliado y Pulido */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] md:w-[540px] bg-gradient-to-b from-[#eef6f4] to-[#eef6f4] shadow-3xl border-l border-[#1b4f72]/15 flex flex-col h-full text-[#142b45]"
          >
            {/* Header con estilo premium */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#1b4f72]/10 bg-white/80 backdrop-blur-md relative shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#1b4f72] to-[#142b45] flex items-center justify-center text-white shadow-md shadow-[#1b4f72]/20">
                  <ShoppingBag size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[#142b45] leading-tight">Tu Carrito</h2>
                  <p className="text-[10px] text-[#1b4f72] font-bold uppercase tracking-widest mt-0.5">
                    {totalItems === 1 ? "1 Producto seleccionado" : `${totalItems} Productos seleccionados`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50/50 font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border border-red-200/50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="Vaciar carrito"
                  >
                    <Trash2 size={12} strokeWidth={2.2} />
                    <span>Vaciar</span>
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-[#142b45] hover:bg-gray-100/80 transition-all cursor-pointer border border-gray-200/40 active:scale-95"
                  aria-label="Cerrar"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Barra de progreso decorativa en la cabecera */}
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#1b4f72] via-[#2fd4a7] to-transparent" />
            </div>

            {/* Lista de Productos Maximizado */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4 grain-bg scrollbar-thin">
              <style>{`
                .grain-bg {
                  background-image: radial-gradient(rgba(58, 95, 38, 0.03) 1px, transparent 0);
                  background-size: 24px 24px;
                }
                .scrollbar-thin::-webkit-scrollbar {
                  width: 5px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                  background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                  background: rgba(58, 95, 38, 0.15);
                  border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                  background: rgba(58, 95, 38, 0.3);
                }
              `}</style>
              
              <AnimatePresence initial={false} mode="popLayout">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4"
                  >
                    <div className="h-20 w-20 rounded-3xl bg-[#1b4f72]/5 border-2 border-dashed border-[#1b4f72]/20 flex items-center justify-center text-[#1b4f72]/40 animate-pulse">
                      <ShoppingCart size={32} strokeWidth={1.8} />
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <p className="text-base font-black text-gray-700">Tu carrito está vacío</p>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        Agrega los deliciosos productos de la feria libre en la sección de catálogo.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.cartItemId}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 60, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer con diseño premium y detalles de seguridad */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-[#1b4f72]/12 bg-white px-6 py-4 space-y-5 shadow-[0_-12px_40px_rgba(30,58,30,0.06)] relative">
                {/* Indicador de seguridad */}
                <div className="flex items-center gap-1.5 justify-center text-[10px] font-black uppercase tracking-widest text-[#1b4f72]">
                  <ShieldCheck size={12} className="text-[#1b4f72]" />
                  <span>Transacción Segura · ITAS Panamá</span>
                </div>

                {/* Subtotal */}
                <div className="flex items-baseline justify-between px-1">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Subtotal Estimado</span>
                  <span className="text-3xl font-black text-[#142b45] tracking-tight tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Bloqueo por control de beneficios (PDA) */}
                  {restriction && (
                    <div className="max-h-72 overflow-y-auto scrollbar-thin">
                      <style>{`
                        .scrollbar-thin::-webkit-scrollbar { width: 5px; }
                        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(58, 95, 38, 0.15); border-radius: 10px; }
                      `}</style>
                      <PdaRestrictionCard
                        restriction={restriction}
                        hint="Ya realizaste tu compra del mes. El pago está bloqueado hasta que se libere tu próximo cupo."
                      />
                    </div>
                  )}

                  {/* Botón Principal */}
                  <button
                    onClick={handleCheckout}
                    disabled={!!restriction}
                    className="w-full rounded-2xl bg-[#1b4f72] hover:bg-[#142b45] px-5 py-4 text-sm font-black text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: "0 4px 18px rgba(58,95,38,0.25)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(58,95,38,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(58,95,38,0.25)";
                    }}
                  >
                    <span>{restriction ? "Pago bloqueado" : "Proceder al Pago"}</span>
                    <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Acciones Secundarias */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleGoToCart}
                      className="rounded-xl border border-[#1b4f72]/20 bg-transparent py-3 text-xs font-bold text-[#1b4f72] hover:bg-[#1b4f72]/5 transition-colors cursor-pointer text-center"
                    >
                      Vista Detallada
                    </button>

                    <button
                      onClick={onClose}
                      className="rounded-xl border border-dashed border-[#1b4f72]/20 hover:border-[#1b4f72] hover:bg-[#1b4f72]/5 bg-transparent py-3 text-xs font-bold text-[#1b4f72] transition-colors cursor-pointer text-center"
                    >
                      Seguir Comprando
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;