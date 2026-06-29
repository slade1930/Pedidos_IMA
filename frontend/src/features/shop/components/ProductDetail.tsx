// src/features/shop/components/ProductDetail.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProduct } from "@/features/products/hooks/useProduct";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/features/products/types/product.types";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";

// ─── CONSTANTES ────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── PROPS ─────────────────────────────────────────────────

interface ProductDetailProps {
  productId: string;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function getUnitLabel(unit: string): string {
  switch (unit) {
    case "pound": return "Libra";
    case "kilogram": return "Kilogramo";
    case "unit": return "Unidad";
    case "dozen": return "Docena";
    case "bag": return "Bolsa";
    default: return unit;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "vegetables": return "Vegetales";
    case "fruits": return "Frutas";
    case "grains": return "Granos";
    case "meats": return "Carnes";
    case "dairy": return "Lácteos";
    case "other": return "Otro";
    default: return category;
  }
}

// 👈 FUNCIÓN PARA CONSTRUIR URL COMPLETA DE IMAGEN
function getImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL}${imageUrl}`;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const { data: product, isPending, isError } = useProduct(productId);
  const addItem = useCartStore((state) => state.addItem);
  const getProductQuantity = useCartStore((state) => state.getProductQuantity);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product) return;
    setErrorMsg(null);

    const result = addItem({
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: product.price,
      max_per_user: product.max_per_user,
      stock: product.max_per_user,
    });

    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setErrorMsg(result.message || "No se pudo agregar");
    }
  };

  const cartQty = product ? getProductQuantity(product.id) : 0;
  const maxAvailable = product ? product.max_per_user - cartQty : 0;
  const isOutOfStock = maxAvailable <= 0;
  const imageUrl = product ? getImageUrl(product.image_url) : ""; // 👈 URL corregida

  // ─── LOADING ────────────────────────────────────────
  if (isPending) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto py-10 space-y-6">
        <div className="h-6 w-24 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-gray-200 rounded-xl" />
            <div className="h-6 w-1/4 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-2xl" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-black text-[#1E3A1E]">Producto no encontrado</h2>
        <p className="text-gray-500 font-medium">El producto que buscas no existe o no está disponible.</p>
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 yellow-btn rounded-xl px-5 py-3 text-sm cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Volver Atrás
        </button>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto space-y-6 text-[#1E3A1E]"
    >
      <style>{`
        .yellow-btn {
          background-color: #FBBF24;
          color: #1E3A1E;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);
          transition: all 0.2s ease-in-out;
        }
        .yellow-btn:hover {
          background-color: #F59E0B;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
        }
        .yellow-btn:active {
          transform: translateY(1px);
        }
        .green-badge {
          background-color: rgba(58, 95, 38, 0.08);
          border: 1px solid rgba(58, 95, 38, 0.2);
          color: #1E3A1E;
        }
        .info-card {
          background-color: #FFFFFF;
          border: 2px solid rgba(58, 95, 38, 0.12);
        }
      `}</style>

      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1E3A1E]/70 hover:text-[#1E3A1E] transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} strokeWidth={3} />
        <span>Volver al Catálogo</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Imagen del Producto */}
        <div className="aspect-square bg-white border-2 border-[#3A5F26]/12 rounded-3xl p-3 shadow-md flex items-center justify-center overflow-hidden">
          {imageUrl ? ( // 👈 Usar URL corregida
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover rounded-2xl" />
          ) : (
            <div className="h-full w-full bg-[#1E3A1E]/5 rounded-2xl flex items-center justify-center">
              <svg className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
          )}
        </div>

        {/* Información Detallada */}
        <div className="space-y-6 flex flex-col justify-center">
          
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-tight">{product.name}</h1>
            <p className="text-xs text-gray-500 font-extrabold mt-1 uppercase tracking-widest">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="green-badge inline-flex rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">
              {getCategoryLabel(product.category)}
            </span>
            <span className="inline-flex rounded-xl bg-black/5 border border-black/10 text-gray-700 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">
              {getUnitLabel(product.unit)}
            </span>
          </div>

          <div className="text-4xl font-black tracking-tight text-[#1E3A1E]">
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#3A5F26]">Descripción</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{product.description}</p>
            </div>
          )}

          <div className="info-card rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold border-b border-[#3A5F26]/10 pb-2">
              <span className="text-gray-500">Estado de Disponibilidad</span>
              <span className={maxAvailable > 0 ? "text-green-600" : "text-red-600"}>
                {maxAvailable > 0 ? "✓ DISPONIBLE EN FERIA" : "✕ AGOTADO"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold border-b border-[#3A5F26]/10 pb-2">
              <span className="text-gray-500">Cantidad Máxima por Usuario</span>
              <span className="text-gray-900 font-extrabold">{product.max_per_user} unidades</span>
            </div>
            {cartQty > 0 && (
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500">Agregados en tu Carrito</span>
                <span className="text-[#3A5F26] font-black">{cartQty} unidades</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-950/10 border-2 border-red-500/20 p-4"
            >
              <p className="text-sm text-red-600 font-bold">{errorMsg}</p>
            </motion.div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t-2 border-[#3A5F26]/12">
            
            <div className="flex items-center gap-2 bg-white border-2 border-[#3A5F26]/20 rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Disminuir"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="w-8 text-center font-black text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                disabled={isOutOfStock || quantity >= maxAvailable}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Aumentar"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 rounded-2xl px-6 py-3.5 text-sm font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                added
                  ? "bg-[#22C55E] text-white hover:bg-[#16A34A]"
                  : isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "yellow-btn"
              }`}
            >
              <ShoppingCart size={16} strokeWidth={2.5} />
              {isOutOfStock ? "Agotado" : added ? "¡Agregado!" : "Agregar al Carrito"}
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default ProductDetail;