// src/features/dashboard/hooks/useDashboardStats.ts

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { orderService } from "@/features/orders/services/order.service";
import type {
  DashboardStats,
  RevenuePeriod,
} from "@/features/dashboard/types/dashboard.types";
import type { Order } from "@/features/orders/types/order.types";

// ─── CONSTANTES ────────────────────────────────────────────

const STALE_TIME = 60 * 1000;

// ─── MAPA DE PERÍODO -> MESES ──────────────────────────────

export const PERIOD_MONTHS: Record<RevenuePeriod, number> = {
  month: 1, // Este mes (solo 1 mes → para la serie se muestran los últimos 3 para contexto)
  "6m": 6,
  "12m": 12,
  year: 12, // Año completo (año calendario actual)
};

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useDashboardStats
 *
 * Obtiene las métricas reales del dashboard desde el endpoint
 * /api/v1/dashboard/stats. El período controla cuántos meses de
 * evolución se piden al backend.
 */
export function useDashboardStats(period: RevenuePeriod = "12m") {
  // Para "Este mes" pedimos 3 meses (últimos 2 + actual) para dar contexto gráfico
  let months = PERIOD_MONTHS[period] ?? 12;
  if (period === "month") months = 3;

  const query = useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", { months }],
    queryFn: () => dashboardService.getStats(months),
    staleTime: STALE_TIME,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ["dashboard", "recent-orders"],
    queryFn: () => orderService.getOrders({ limit: 8 }),
    staleTime: STALE_TIME,
  });

  // El interceptor de axios unwrappe "data" de forma inconsistente:
  // a veces es un array directo, a veces un objeto { data, total, ... }.
  const recentOrdersData = recentOrdersQuery.data as
    | Order[]
    | { data: Order[]; total?: number }
    | undefined;

  const recentOrders = Array.isArray(recentOrdersData)
    ? recentOrdersData
    : (recentOrdersData?.data ?? []);

  return {
    data: query.data,
    stats: query.data?.totals,
    revenueSeries: query.data?.revenue_series ?? [],
    ordersByStatus: query.data?.orders_by_status ?? {},
    paymentsByMethod: query.data?.payments_by_method ?? {},
    recentOrders,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: () => {
      query.refetch();
      recentOrdersQuery.refetch();
    },
  };
}

export default useDashboardStats;
