// src/features/shop/hooks/usePdaRestriction.ts

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth.store";
import type { PdaStatus } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

const STALE_TIME = 1 * 60 * 1000;

/**
 * usePdaRestriction
 *
 * Consulta el control de beneficios (PDA): si el usuario autenticado
 * ya compró, no puede añadir productos ni pagar hasta que pasen 8 días.
 * Usa GET /api/v1/orders/pda-restriction
 */
export function usePdaRestriction() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["pda-restriction"],
    queryFn: async () => {
      const response = await apiClient.get<PdaStatus>("/orders/pda-restriction");
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}

export default usePdaRestriction;