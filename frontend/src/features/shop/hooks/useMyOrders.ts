// src/features/shop/hooks/useMyOrders.ts

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Order } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

const STALE_TIME = 1 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useMyOrders
 * 
 * Hook para obtener los pedidos del usuario autenticado.
 * Usa GET /api/v1/orders/my-orders
 * 
 * @returns Query con la lista de pedidos del usuario
 */
export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>("/orders/my-orders");
      return response.data;
    },
    staleTime: STALE_TIME,
  });
}

export default useMyOrders;