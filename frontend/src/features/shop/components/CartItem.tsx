"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import type { CartItem as CartItemType } from "@/stores/cart.store";
import { Trash2, Plus, Minus, AlertCircle, Sparkles, Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── PROPS ─────────────────────────────────────────────────

interface CartItemProps {
  item: CartItemType;
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

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMaxedOut = item.max_per_user > 0 && item.quantity >= item.max_per_user;
  const isOutOfStock = item.stock > 0 && item.quantity >= item.stock;
  const cantAddMore = isMaxedOut || isOutOfStock;

  const handleDecrease = () => {
    setErrorMsg(null);
    updateQuantity(item.cartItemId, item.quantity - 1);
  };

  const handleIncrease = () => {
    setErrorMsg(null);
    const result = updateQuantity(item.cartItemId, item.quantity + 1);
    if (!result.success) {
      setErrorMsg(result.message || "No se puede agregar más");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  // Buscamos si existe alguna imagen en el item (intentamos con image, image_url o fallback)
  const productImg = (item as any).image_url || (item as any).image || (item as any).imgUrl;

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="space-y-1.5"
    >
      <div className="p-4 bg-white border border-[#3A5F26]/12 rounded-2xl shadow-sm hover:border-[#FBBF24]/50 transition-all duration-300 flex items-stretch gap-4 relative overflow-hidden group">
        
        {/* Decoración superior sutil */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FBBF24]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Lado Izquierdo: Imagen o Fallback de Producto Agrícola */}
        <div className="h-20 w-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#F4F6F3] to-[#EBF0E8] border border-[#3A5F26]/10 flex-shrink-0 flex items-center justify-center relative">
          {productImg ? (
            <img
              src={productImg}
              alt={item.product_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ""; // Resetea para mostrar fallback
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#3A5F26]/40">
              <Sprout size={24} strokeWidth={1.8} className="animate-pulse" />
              <span className="text-[7px] font-black tracking-wider uppercase mt-1">FRESCO</span>
            </div>
          )}
        </div>

        {/* Lado Derecho: Información completa organizada horizontalmente */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Fila Superior: Badge, Título, Delete */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider text-[#3A5F26] bg-[#3A5F26]/8 px-1.5 py-0.5 rounded">
                  Feria Libre
                </span>
                {item.max_per_user > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[8px] text-[#B45309] bg-[#FBBF24]/12 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                    <Sparkles size={8} /> Max: {item.max_per_user}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-[#1E3A1E] mt-1.5 line-clamp-1 leading-snug">
                {item.product_name}
              </h4>
              <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                {formatPrice(item.unit_price)} / unidad
              </p>
            </div>

            <button
              onClick={() => removeItem(item.cartItemId)}
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title="Eliminar"
            >
              <Trash2 size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Fila Inferior: Controles de cantidad y precio subtotal */}
          <div className="flex items-center justify-between border-t border-[#3A5F26]/8 pt-2 mt-2 gap-2">
            {/* Controles de Cantidad */}
            <div className="flex items-center bg-[#F9FAF9] border border-[#3A5F26]/12 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={handleDecrease}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-[#1E3A1E] transition-all cursor-pointer shadow-sm"
                aria-label="Disminuir cantidad"
              >
                <Minus size={10} strokeWidth={2.5} />
              </button>
              <span className="w-7 text-center text-xs font-black text-[#1E3A1E]">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                disabled={cantAddMore}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  cantAddMore
                    ? "opacity-30 cursor-not-allowed text-gray-300"
                    : "text-gray-500 hover:bg-white hover:text-[#1E3A1E] shadow-sm"
                }`}
                title={isMaxedOut ? "Límite alcanzado" : isOutOfStock ? "Stock agotado" : "Agregar más"}
                aria-label="Aumentar cantidad"
              >
                <Plus size={10} strokeWidth={2.5} />
              </button>
            </div>

            {/* Subtotal del Item */}
            <div className="text-right">
              <span className="text-[10px] text-[#3A5F26]/60 font-black uppercase tracking-wider block leading-none">Total</span>
              <span className="text-base font-black text-[#1E3A1E] mt-1 block tracking-tight tabular-nums">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Mensaje de error temporal con animación */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 text-[11px] text-red-600 font-bold px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl overflow-hidden"
          >
            <AlertCircle size={11} className="text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CartItem;