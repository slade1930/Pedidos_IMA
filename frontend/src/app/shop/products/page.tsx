"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCatalog } from "@/features/shop/components/ProductCatalog";
import { useCartStore } from "@/stores/cart.store";
import { useFairs } from "@/features/fairs/hooks/useFairs";
import type { Product } from "@/features/products/types/product.types";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, ShieldAlert, CheckCircle2, ArrowRight, Store, MapPin } from "lucide-react";

// ─── COMPONENTE ────────────────────────────────────────────

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const fairIdFromUrl = searchParams.get("fair_id") || "";

  const [selectedFairId, setSelectedFairId] = useState(fairIdFromUrl);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const setFairId = useCartStore((state) => state.setFairId);

  const { data: fairsData } = useFairs({ limit: 100 });
  const fairs = Array.isArray(fairsData) ? fairsData : fairsData?.data ?? [];

  useEffect(() => {
    if (fairIdFromUrl) {
      setSelectedFairId(fairIdFromUrl);
      setFairId(fairIdFromUrl);
    }
  }, [fairIdFromUrl, setFairId]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleAddToCart = (product: Product) => {
    if (!selectedFairId) {
      setFeedback({ message: "Selecciona una feria primero", type: "error" });
      return;
    }

    const result = addItem({
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      max_per_user: product.max_per_user,
      stock: product.max_per_user,
    });

    if (result.success) {
      setFeedback({ message: `${product.name} agregado al carrito`, type: "success" });
    } else {
      setFeedback({ message: result.message || "No se pudo agregar", type: "error" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-[#1E3A1E] min-h-screen"
    >
      {/* Estilos CSS locales de la paleta Verde, Blanco y Amarillo */}
      <style>{`
        .premium-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233A5F26'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 48px;
        }
        .soft-glow-yellow {
          box-shadow: 0 10px 30px -10px rgba(251, 191, 36, 0.15);
        }
        .soft-glow-green {
          box-shadow: 0 10px 30px -10px rgba(58, 95, 38, 0.1);
        }
        .grain-bg {
          background-image: radial-gradient(rgba(58, 95, 38, 0.03) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Notificaciones flotantes (Toasts) */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed top-6 right-6 z-50 rounded-2xl px-6 py-4 shadow-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3.5 border-2 backdrop-blur-md ${
              feedback.type === "success"
                ? "bg-[#22C55E]/95 border-[#16A34A] text-white"
                : "bg-[#EF4444]/95 border-[#DC2626] text-white"
            }`}
          >
            {feedback.type === "success" ? (
              <div className="bg-white/20 p-1 rounded-lg">
                <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
              </div>
            ) : (
              <div className="bg-white/20 p-1 rounded-lg">
                <ShieldAlert size={16} className="text-white" strokeWidth={3} />
              </div>
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabecera y Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 border-b border-[#3A5F26]/10 pb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3A5F26]/8 border border-[#3A5F26]/15 text-[#3A5F26] text-xs font-extrabold tracking-wider uppercase mb-3">
            <Store size={12} strokeWidth={2.5} />
            IMA Panamá
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1E3A1E] sm:text-5xl">
            Productos Disponibles
          </h1>
          <p className="mt-3 text-base text-gray-500 font-medium leading-relaxed">
            Explora y selecciona de forma directa los productos frescos del productor local habilitados para abastecer a tu comunidad.
          </p>
        </div>

        {/* Selector de Feria */}
        <div className="w-full lg:w-80">
          <label htmlFor="fair-select" className="flex items-center gap-1.5 text-xs font-black text-[#1E3A1E] mb-2.5 uppercase tracking-widest">
            <MapPin size={12} className="text-[#3A5F26]" />
            Selecciona tu feria
          </label>
          <div className="relative">
            <select
              id="fair-select"
              value={selectedFairId}
              onChange={(e) => {
                setSelectedFairId(e.target.value);
                setFairId(e.target.value);
              }}
              className="premium-select block w-full rounded-2xl border-2 border-[#3A5F26]/20 bg-white px-5 py-4 text-sm font-semibold text-[#1E3A1E] focus:outline-none focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] cursor-pointer hover:border-[#3A5F26]/40 transition-all shadow-sm"
            >
              <option value="" className="text-gray-400 font-medium">Selecciona una feria libre</option>
              {fairs.map((fair: { id: string; name: string }) => (
                <option key={fair.id} value={fair.id} className="text-[#1E3A1E] font-medium">
                  {fair.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <AnimatePresence mode="wait">
        {!selectedFairId ? (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="soft-glow-yellow rounded-3xl border-2 border-[#FBBF24]/30 bg-white p-12 sm:p-20 text-center max-w-2xl mx-auto shadow-sm space-y-6 relative overflow-hidden grain-bg"
          >
            {/* Círculo decorativo */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBBF24]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3A5F26]/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            
            <div className="mx-auto h-20 w-20 rounded-3xl bg-[#3A5F26]/8 flex items-center justify-center text-[#3A5F26] border-2 border-[#3A5F26]/10 shadow-inner relative z-10">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Landmark size={36} strokeWidth={1.8} />
              </motion.div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-black text-[#1E3A1E] tracking-tight">Feria Requerida</h3>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed max-w-md mx-auto px-2">
                Para ver el catálogo de alimentos y precios locales, por favor selecciona tu feria más cercana usando el menú superior.
              </p>
            </div>

            <div className="pt-2 relative z-10 flex justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-black text-[#3A5F26] bg-[#3A5F26]/8 px-4 py-2.5 rounded-full tracking-wider uppercase border border-[#3A5F26]/12">
                Elegir Ubicación
                <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="catalog-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCatalog fairId={selectedFairId} onAddToCart={handleAddToCart} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}