// src/features/products/hooks/useProducts.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { productService } from "@/features/products/services/product.service";
import type { ProductFilters } from "@/features/products/types/product.types";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de productos (5 minutos) */
const STALE_TIME = 5 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useProducts
 * 
 * Hook para obtener la lista paginada de productos con filtros.
 * 
 * Flujo:
 * 1. Recibe filtros opcionales (search, category, precio, skip, limit)
 * 2. Llama a productService.getProducts() → GET /api/v1/products
 * 3. Retorna datos paginados y estados de la query
 * 
 * Características:
 * - Datos previos mantenidos durante refetch (keepPreviousData)
 * - Stale time de 5 minutos
 * - Query key incluye todos los filtros para cacheo granular
 * 
 * @param filters - Filtros de búsqueda, categoría, precio y paginación
 * @returns Query de TanStack Query con datos paginados
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export default useProducts;