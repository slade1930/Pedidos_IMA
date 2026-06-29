// src/features/orders/hooks/useOrders.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { orderService } from "@/features/orders/services/order.service";
import type { OrderFilters } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de órdenes (1 minuto — datos muy volátiles) */
const STALE_TIME = 1 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useOrders
 * 
 * Hook para obtener la lista paginada de órdenes con filtros.
 * 
 * Flujo:
 * 1. Recibe filtros opcionales (search, status, fair_id, skip, limit)
 * 2. Llama a orderService.getOrders() → GET /api/v1/orders
 * 3. Retorna datos paginados y estados de la query
 * 
 * Características:
 * - Datos previos mantenidos durante refetch (keepPreviousData)
 * - Stale time de 1 minuto (órdenes cambian frecuentemente)
 * - Query key incluye todos los filtros para cacheo granular
 * 
 * @param filters - Filtros de búsqueda, estado, feria y paginación
 * @returns Query de TanStack Query con datos paginados
 */
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => orderService.getOrders(filters),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export default useOrders;