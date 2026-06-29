// src/features/fairs/hooks/useFair.ts

import { useQuery } from "@tanstack/react-query";
import { fairService } from "@/features/fairs/services/fair.service";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de feria individual (2 minutos) */
const STALE_TIME = 2 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useFair
 * 
 * Hook para obtener una feria individual por su ID.
 * 
 * Flujo:
 * 1. Recibe un ID de feria (UUID string)
 * 2. Si el ID es válido, llama a fairService.getFair(id) → GET /api/v1/fairs/{id}
 * 3. Si el ID es null/undefined/vacío, la query no se ejecuta (enabled: false)
 * 4. Retorna la feria y estados de la query
 * 
 * Características:
 * - Query condicional: no se ejecuta si id no es válido
 * - Stale time de 2 minutos
 * - Query key incluye el ID para cacheo individual
 * 
 * @param id - ID de la feria a obtener (UUID string)
 * @returns Query de TanStack Query con la feria
 * 
 * Uso:
 * ```tsx
 * const { data: fair, isPending } = useFair("abc-123-def");
 * ```
 */
export function useFair(id: string | null | undefined) {
  return useQuery({
    queryKey: ["fairs", id],
    queryFn: () => fairService.getFair(id as string),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export default useFair;