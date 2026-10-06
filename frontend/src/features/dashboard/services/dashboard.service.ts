// src/features/dashboard/services/dashboard.service.ts

import { apiClient } from "@/lib/api/client";
import type { DashboardStats } from "@/features/dashboard/types/dashboard.types";

// ─── SERVICIO DE DASHBOARD ────────────────────────────────

/**
 * DashboardService
 *
 * Capa de servicio que encapsula las llamadas HTTP a los
 * endpoints de estadísticas del dashboard.
 *
 * Un solo endpoint GET agrega todas las métricas reales:
 * ingresos, clientes, órdenes, inventario y evolución mensual.
 */
export const dashboardService = {
  /**
   * Obtiene todas las métricas reales del dashboard.
   *
   * GET /api/v1/dashboard/stats?months=N
   *
   * @param months Meses de evolución de ingresos a retornar (3-24)
   */
  async getStats(months: number = 12): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats", {
      params: { months },
    });
    return response.data;
  },
};

export default dashboardService;
