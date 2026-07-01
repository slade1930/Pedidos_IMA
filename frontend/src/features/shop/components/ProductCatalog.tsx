// src/features/shop/components/ProductCatalog.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useShopProducts } from "@/features/shop/hooks/useShopProducts";
import { useDebounce } from "@/hooks/useDebounce";  // 👈 NUEVO
import type { Product } from "@/features/products/types/product.types";
import { InteractiveProductCard } from "@/components/ui/card-7";

// ─── CONSTANTES ────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── PROPS ─────────────────────────────────────────────────

interface ProductCatalogProps {
  fairId: string;
  onAddToCart?: (product: Product) => void;
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

function getImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL}${imageUrl}`;
}

// ─── SKELETON ──────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-[#2D1A10]/5 rounded-3xl border-2 border-[#3A5F26]/10 aspect-[9/12]" />
      ))}
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function ProductCatalog({ fairId, onAddToCart }: ProductCatalogProps) {
  const [searchInput, setSearchInput] = useState("");       // 👈 Valor del input
  const [categoryFilter, setCategoryFilter] = useState("");

  // 👈 Debounce: espera 300ms antes de buscar
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isPending, isError } = useShopProducts({
    fair_id: fairId,
    search: debouncedSearch || undefined,                    // 👈 Usar debounced
    category: categoryFilter || undefined,
  });

  const products = data ?? [];

  return (
    <div className="space-y-8">
      <style>{`
        .premium-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233A5F26'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        .yellow-btn {
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
        }
        .yellow-btn:hover {
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45);
        }
      `}</style>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Buscador en tiempo real */}
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3A5F26]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar productos en el catálogo..."
            className="block w-full rounded-2xl border-2 border-[#3A5F26]/20 bg-white pl-12 pr-4 py-3 text-sm text-[#1E3A1E] placeholder-gray-400 focus:outline-none focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] transition-all"
          />
        </div>
        
        {/* Selector de categoría */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="premium-select rounded-2xl border-2 border-[#3A5F26]/20 bg-white px-4 py-3 text-sm text-[#1E3A1E] focus:outline-none focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] cursor-pointer sm:w-56 transition-all"
        >
          <option value="">Todas las categorías</option>
          <option value="vegetables">Vegetales</option>
          <option value="fruits">Frutas</option>
          <option value="grains">Granos</option>
          <option value="meats">Carnes</option>
          <option value="dairy">Lácteos</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Loading */}
      {isPending && <GridSkeleton />}

      {/* Error */}
      {isError && !isPending && (
        <div className="rounded-2xl border-2 border-red-500/25 bg-red-50/50 p-6 text-center shadow-sm">
          <p className="text-red-600 font-extrabold text-base">Error al cargar productos</p>
          <p className="text-sm text-gray-500 mt-1">Intente refrescar la página</p>
        </div>
      )}

      {/* Empty */}
      {!isPending && !isError && products.length === 0 && (
        <div className="rounded-2xl border-2 border-[#3A5F26]/12 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500 font-bold text-base">No se encontraron productos disponibles</p>
          <p className="text-xs text-gray-400 mt-1.5">Intente buscando otra categoría o palabra clave</p>
        </div>
      )}

      {/* Grid de Productos */}
      {!isPending && !isError && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/products/${product.id}`} className="block">
              <InteractiveProductCard
                title={product.name}
                categoryLabel={getCategoryLabel(product.category)}
                unitLabel={getUnitLabel(product.unit)}
                price={formatPrice(product.price)}
                imageUrl={getImageUrl(product.image_url)}
                onAddToCart={() => onAddToCart?.(product)}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
