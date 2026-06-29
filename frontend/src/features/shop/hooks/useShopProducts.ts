// src/features/shop/hooks/useShopProducts.ts

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Product } from "@/features/products/types/product.types";

// ─── TIPOS ─────────────────────────────────────────────────

interface ShopProductsFilters {
  fair_id?: string;
  category?: string;
  search?: string;
}

// ─── CONSTANTES ────────────────────────────────────────────

const STALE_TIME = 2 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useShopProducts
 * 
 * Hook para obtener productos públicos de la tienda.
 * Usa el endpoint público GET /api/v1/products/public
 * 
 * @param filters - Filtros: fair_id, category, search
 * @returns Query con la lista de productos
 */
export function useShopProducts(filters?: ShopProductsFilters) {
  return useQuery<Product[]>({
    queryKey: ["shop-products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.fair_id) params.set("fair_id", filters.fair_id);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.search) params.set("search", filters.search);

      const queryString = params.toString();
      const endpoint = queryString 
        ? `/products/public?${queryString}` 
        : "/products/public";

      const response = await apiClient.get<Product[]>(endpoint);
      return response.data;
    },
    staleTime: STALE_TIME,
    enabled: !!filters?.fair_id,
  });
}

export default useShopProducts;