// src/features/products/hooks/useProduct.ts

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/features/products/services/product.service";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de producto individual (2 minutos) */
const STALE_TIME = 2 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useProduct
 * 
 * Hook para obtener un producto individual por su ID.
 * 
 * Flujo:
 * 1. Recibe un ID de producto (UUID string)
 * 2. Si el ID es válido, llama a productService.getProduct(id) → GET /api/v1/products/{id}
 * 3. Si el ID es null/undefined/vacío, la query no se ejecuta (enabled: false)
 * 4. Retorna el producto y estados de la query
 * 
 * Características:
 * - Query condicional: no se ejecuta si id no es válido
 * - Stale time de 2 minutos
 * - Query key incluye el ID para cacheo individual
 * 
 * @param id - ID del producto a obtener (UUID string)
 * @returns Query de TanStack Query con el producto
 * 
 * Uso:
 * ```tsx
 * const { data: product, isPending } = useProduct("abc-123-def");
 * ```
 */
export function useProduct(id: string | null | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getProduct(id as string),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export default useProduct;