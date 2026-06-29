// src/features/inventory/hooks/useInventory.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import type { InventoryFilters } from "@/features/inventory/types/inventory.types";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de inventario (2 minutos — datos más volátiles) */
const STALE_TIME = 2 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useInventory
 * 
 * Hook para obtener la lista paginada de inventario con filtros.
 * 
 * Flujo:
 * 1. Recibe filtros opcionales (search, low_stock, location, skip, limit)
 * 2. Llama a inventoryService.getInventory() → GET /api/v1/inventory
 * 3. Retorna datos paginados y estados de la query
 * 
 * Características:
 * - Datos previos mantenidos durante refetch (keepPreviousData)
 * - Stale time de 2 minutos (inventario cambia más frecuentemente)
 * - Query key incluye todos los filtros para cacheo granular
 * 
 * @param filters - Filtros de búsqueda, stock bajo, ubicación y paginación
 * @returns Query de TanStack Query con datos paginados
 */
export function useInventory(filters?: InventoryFilters) {
  return useQuery({
    queryKey: ["inventory", filters],
    queryFn: () => inventoryService.getInventory(filters),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export default useInventory;