// src/features/fairs/hooks/useFairs.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fairService } from "@/features/fairs/services/fair.service";
import type { FairFilters } from "@/features/fairs/types/fair.types";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de ferias (5 minutos) */
const STALE_TIME = 5 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useFairs
 * 
 * Hook para obtener la lista paginada de ferias con filtros.
 * 
 * Flujo:
 * 1. Recibe filtros opcionales (search, status, fechas, skip, limit)
 * 2. Llama a fairService.getFairs() → GET /api/v1/fairs
 * 3. Retorna datos paginados y estados de la query
 * 
 * Características:
 * - Datos previos mantenidos durante refetch (keepPreviousData)
 * - Stale time de 5 minutos
 * - Query key incluye todos los filtros para cacheo granular
 * 
 * @param filters - Filtros de búsqueda, estado, fechas y paginación
 * @returns Query de TanStack Query con datos paginados
 */
export function useFairs(filters?: FairFilters) {
  return useQuery({
    queryKey: ["fairs", filters],
    queryFn: () => fairService.getFairs(filters),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export default useFairs;