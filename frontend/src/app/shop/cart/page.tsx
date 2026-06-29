"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { CartItem } from "@/features/shop/components/CartItem";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight, ShoppingCart } from "lucide-react";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

// ─── COMPONENTE ────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const totalItems = useCartStore((state) => state.getTotalItems());
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#1E3A1E] min-h-screen"
    >
      <style>{`
        .yellow-btn {
          background-color: #FBBF24;
          color: #1E3A1E;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.3);
          transition: all 0.2s ease-in-out;
        }
        .yellow-btn:hover {
          background-color: #F59E0B;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }
        .green-btn {
          background-color: #3A5F26;
          color: #FFFFFF;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(58, 95, 38, 0.15);
          transition: all 0.2s ease-in-out;
        }
        .green-btn:hover {
          background-color: #253F19;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 63, 25, 0.25);
        }
        .grain-bg {
          background-image: radial-gradient(rgba(58, 95, 38, 0.02) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Botón Volver */}
      <button 
        onClick={() => router.push("/shop/products")} 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1E3A1E]/70 hover:text-[#1E3A1E] transition-colors cursor-pointer mb-8"
      >
        <ArrowLeft size={14} strokeWidth={3} />
        <span>Volver a la Tienda</span>
      </button>

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-[#3A5F26]/12 bg-white p-12 sm:p-20 text-center max-w-2xl mx-auto shadow-sm space-y-6 grain-bg"
        >
          <div className="mx-auto h-20 w-20 rounded-3xl bg-[#3A5F26]/8 flex items-center justify-center text-[#3A5F26] border-2 border-[#3A5F26]/10 shadow-inner">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShoppingCart size={36} strokeWidth={1.8} />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#1E3A1E] tracking-tight">Tu carrito está vacío</h2>
            <p className="text-sm text-gray-500 font-semibold max-w-sm mx-auto leading-relaxed">
              Explora nuestro catálogo y agrega productos frescos de la canasta básica a tu compra.
            </p>
          </div>
          <button
            onClick={() => router.push("/shop/products")}
            className="yellow-btn rounded-2xl px-8 py-3.5 text-sm uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Ver Catálogo</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Listado de Productos */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#3A5F26]/10 pb-4">
              <h1 className="text-3xl font-black tracking-tight text-[#1E3A1E]">
                Carrito de Compras
              </h1>
              <span className="text-xs font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {totalItems === 1 ? "1 item" : `${totalItems} items`}
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border-2 border-[#3A5F26]/12 p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
              {/* Decoración del Sidebar */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-lg font-black tracking-tight border-b border-[#3A5F26]/10 pb-4">
                Resumen de Compra
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Productos ({totalItems})</span>
                  <span className="text-gray-900 font-extrabold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Envío / Puesto Feria</span>
                  <span className="text-green-600 font-extrabold">Gratis</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#3A5F26]/10">
                  <span className="text-base font-black text-[#1E3A1E]">Total Estimado</span>
                  <span className="text-3xl font-black text-[#1E3A1E] tracking-tight">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => router.push("/shop/checkout")}
                  className="w-full rounded-2xl green-btn px-5 py-4 text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full rounded-2xl border-2 border-gray-200 hover:border-red-200 bg-transparent px-5 py-3 text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} strokeWidth={2} />
                  <span>Vaciar Carrito</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}