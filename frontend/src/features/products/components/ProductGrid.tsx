// src/features/products/components/ProductGrid.tsx

"use client";

import { useState } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types/product.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 12;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── PROPS ─────────────────────────────────────────────────

interface ProductGridProps {
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  search?: string;
  categoryFilter?: string;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function getUnitLabel(unit: string): string {
  switch (unit) {
    case "pound": return "lb";
    case "kilogram": return "kg";
    case "unit": return "u";
    case "dozen": return "doc";
    case "bag": return "bolsa";
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

function getCategoryGradient(category: string): { from: string; to: string } {
  switch (category) {
    case "vegetables":
      return { from: "#10b981", to: "#4ade80" };
    case "fruits":
      return { from: "#f59e0b", to: "#f97316" };
    case "grains":
      return { from: "#d97706", to: "#854d0e" };
    case "meats":
      return { from: "#ef4444", to: "#f43f5e" };
    case "dairy":
      return { from: "#38bdf8", to: "#3b82f6" };
    default:
      return { from: "#4A3728", to: "#E8DDD0" };
  }
}

function getFallbackImage(category: string, id: string): string {
  const images: Record<string, string[]> = {
    vegetables: [
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80",
    ],
    fruits: [
      "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1519996521430-02b798c1d881?auto=format&fit=crop&w=500&q=80",
    ],
    grains: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80",
    ],
    meats: [
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=80",
    ],
    dairy: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80",
    ],
    other: [
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80",
    ],
  };

  const list = images[category] || images["other"];
  const index = id ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % list.length : 0;
  return list[index];
}

// 👈 FUNCIÓN PARA CONSTRUIR URL COMPLETA DE IMAGEN
function getImageUrl(product: Product): string {
  if (product.image_url) {
    if (product.image_url.startsWith("http")) {
      return product.image_url;
    }
    return `${API_URL}${product.image_url}`;
  }
  return getFallbackImage(product.category, product.id);
}

// ─── SKELETON EN CUADRÍCULA ────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between aspect-[4/5]">
          <div>
            <div className="w-full aspect-[16/10] bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl mb-4" />
            <div className="h-5 w-2/3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md mb-2" />
            <div className="h-3.5 w-1/2 bg-slate-200/30 dark:bg-slate-800/30 rounded-md mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-4 w-12 bg-slate-200/30 dark:bg-slate-800/30 rounded-full" />
              <div className="h-4 w-10 bg-slate-200/30 dark:bg-slate-800/30 rounded-full" />
            </div>
          </div>
          <div>
            <div className="h-6 w-20 bg-slate-200/40 dark:bg-slate-800/40 rounded mb-4" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-slate-200/30 dark:bg-slate-800/30 rounded-xl" />
              <div className="h-8 flex-1 bg-slate-200/25 dark:bg-slate-800/25 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function ProductGrid({ onEdit, onDelete, search, categoryFilter }: ProductGridProps) {
  const [skip, setSkip] = useState(0);
  const page = Math.floor(skip / PAGE_SIZE) + 1;

  const filters = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(categoryFilter && categoryFilter !== "" && { category: categoryFilter }),
  };

  const { data, isPending, isError, error, isFetching } = useProducts(filters);

  const products = Array.isArray(data) ? data : data?.data ?? [];
  const totalPages = !Array.isArray(data) ? data?.pages ?? 1 : 1;
  const totalItems = !Array.isArray(data) ? data?.total ?? products.length : products.length;

  return (
    <div className="space-y-6 w-full">
      {isPending && <GridSkeleton />}

      {isError && !isPending && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center flex flex-col items-center justify-center backdrop-blur-md">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 mb-4 border border-red-200/50 dark:border-red-900/50">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-700 dark:text-red-405 font-bold text-lg leading-none">Error al cargar productos</p>
          <p className="text-xs text-neutral-400 mt-2.5 max-w-xs mx-auto">
            {(error as { message?: string })?.message || "Intenta nuevamente"}
          </p>
        </div>
      )}

      {!isPending && !isError && products.length === 0 && (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur p-16 text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 mb-4 relative border border-slate-200 dark:border-slate-850">
            <div className="absolute inset-0 rounded-2xl bg-slate-400/10 animate-ping opacity-25" />
            <svg className="mx-auto h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">No hay productos</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">No se encontraron productos con los filtros actuales.</p>
        </div>
      )}

      {/* Grid de Productos */}
      {!isPending && !isError && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const { from, to } = getCategoryGradient(product.category);
            const imageUrl = getImageUrl(product); // 👈 Usar la función corregida

            return (
              <div key={product.id} className="group relative w-full transition-all duration-500">
                {/* Paneles Skew de Fondo */}
                <span
                  className="absolute top-0 left-[15px] w-[calc(100%-30px)] h-full rounded-2xl transform skew-x-[4deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-0 group-hover:w-full"
                  style={{
                    background: `linear-gradient(315deg, ${from}, ${to})`,
                  }}
                />
                <span
                  className="absolute top-0 left-[15px] w-[calc(100%-30px)] h-full rounded-2xl transform skew-x-[4deg] blur-[15px] opacity-50 transition-all duration-500 group-hover:skew-x-0 group-hover:left-0 group-hover:w-full"
                  style={{
                    background: `linear-gradient(315deg, ${from}, ${to})`,
                  }}
                />

                {/* Contenedor principal de la tarjeta de producto */}
                <div className="relative z-20 w-full p-4 bg-white/95 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-slate-850/85 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-500 group-hover:bg-white/100 group-hover:dark:bg-slate-950/95 group-hover:border-transparent group-hover:translate-y-[-4px] flex flex-col justify-between h-full min-h-[410px]">
                  
                  <div>
                    {/* Contenedor de Imagen de Producto */}
                    <div className="relative w-full aspect-[16/10] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-850">
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackImage(product.category, product.id);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-80" />

                      {/* Badge inactivo overlay */}
                      {!product.is_active && (
                        <div className="absolute top-2.5 right-2.5 z-30">
                          <span className="flex-shrink-0 inline-flex items-center rounded-full bg-rose-500/10 backdrop-blur-md text-rose-600 border border-rose-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide">
                            Inactivo
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información Básica */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal min-h-[32px]">
                        {product.description || "Sin descripción"}
                      </p>
                    </div>

                    {/* Chips de Detalles */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-[#E8DDD0]/15 dark:bg-slate-900/50 text-[#4A3728] dark:text-slate-350 border border-[#E8DDD0]/35 dark:border-slate-800/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-[#5C8A3C] mr-1 shrink-0" />
                        {getCategoryLabel(product.category)}
                      </span>
                      <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        {getUnitLabel(product.unit)}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Fila de precio */}
                    <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-900/50 pt-2.5">
                      <span className="text-lg font-black text-[#4A3728] dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Por {getUnitLabel(product.unit)}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-150/80 dark:border-slate-900/50">
                      <button 
                        onClick={() => onEdit?.(product)}
                        className="flex-1 rounded-xl bg-white/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 px-2 py-2 text-xs font-bold text-indigo-650 dark:text-indigo-450 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-900 active:scale-95 transition-all duration-200 text-center"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => onDelete?.(product)}
                        className="flex-1 rounded-xl bg-white/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 px-2 py-2 text-xs font-bold text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-900 active:scale-95 transition-all duration-200 text-center"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {!isPending && !isError && products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md rounded-2xl shadow-inner mt-8">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mostrando{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{totalItems}</span> productos
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white/85 transition-all duration-200 shadow-sm"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white/85 transition-all duration-200 shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;