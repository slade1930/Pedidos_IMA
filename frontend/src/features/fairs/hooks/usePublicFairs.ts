// src/features/fairs/hooks/usePublicFairs.ts

import { useQuery } from "@tanstack/react-query";
import { fairService } from "@/features/fairs/services/fair.service";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de ferias públicas (5 minutos) */
const STALE_TIME = 5 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * usePublicFairs
 *
 * Hook para obtener las ferias activas y próximas sin
 * autenticación — el catálogo de la tienda (GET /api/v1/fairs/public).
 * Devuelve el array completo (no paginado) con las ferias en
 * las que un cliente puede hacer pedidos.
 */
export function usePublicFairs() {
  return useQuery({
    queryKey: ["fairs", "public"],
    queryFn: () => fairService.getPublicFairs(),
    staleTime: STALE_TIME,
  });
}

export default usePublicFairs;