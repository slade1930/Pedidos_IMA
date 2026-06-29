// src/features/orders/hooks/useOrder.ts

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/features/orders/services/order.service";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de orden individual (1 minuto) */
const STALE_TIME = 1 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useOrder
 * 
 * Hook para obtener una orden individual por su ID.
 * 
 * Flujo:
 * 1. Recibe un ID de orden (UUID string)
 * 2. Si el ID es válido, llama a orderService.getOrder(id) → GET /api/v1/orders/{id}
 * 3. Si el ID es null/undefined/vacío, la query no se ejecuta (enabled: false)
 * 4. Retorna la orden completa con items, QR y estados de la query
 * 
 * Características:
 * - Query condicional: no se ejecuta si id no es válido
 * - Stale time de 1 minuto
 * - Query key incluye el ID para cacheo individual
 * 
 * @param id - ID de la orden a obtener (UUID string)
 * @returns Query de TanStack Query con la orden completa
 * 
 * Uso:
 * ```tsx
 * const { data: order, isPending } = useOrder("abc-123-def");
 * // order.items → array de OrderItem
 * // order.qr_code → string del QR
 * ```
 */
export function useOrder(id: string | null | undefined) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderService.getOrder(id as string),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export default useOrder;