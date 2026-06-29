// src/features/payments/hooks/usePayments.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { paymentService } from "@/features/payments/services/payment.service";
import type { PaymentFilters } from "@/features/payments/types/payment.types";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de pagos (3 minutos) */
const STALE_TIME = 3 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * usePayments
 * 
 * Hook para obtener la lista paginada de pagos con filtros.
 * 
 * Flujo:
 * 1. Recibe filtros opcionales (search, method, status, order_id, skip, limit)
 * 2. Llama a paymentService.getPayments() → GET /api/v1/payments
 * 3. Retorna datos paginados y estados de la query
 * 
 * Características:
 * - Datos previos mantenidos durante refetch (keepPreviousData)
 * - Stale time de 3 minutos
 * - Query key incluye todos los filtros para cacheo granular
 * 
 * @param filters - Filtros de búsqueda, método, estado, orden y paginación
 * @returns Query de TanStack Query con datos paginados
 */
export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: () => paymentService.getPayments(filters),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export default usePayments;