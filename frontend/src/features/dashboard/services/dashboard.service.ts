// src/features/dashboard/services/dashboard.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  DashboardStats,
  RevenueStats,
  OrderStats,
  InventoryStats,
  RecentOrdersResponse,
} from "@/features/dashboard/types/dashboard.types";

// ─── SERVICIO DE DASHBOARD ────────────────────────────────

/**
 * DashboardService
 * 
 * Capa de servicio que encapsula todas las llamadas HTTP
 * a los endpoints de estadísticas del dashboard.
 * 
 * A diferencia de otros servicios, el dashboard solo tiene
 * endpoints de lectura (GET). No hay operaciones CRUD.
 * 
 * Responsabilidades:
 * - Realizar requests tipados a /dashboard/*
 * - Retornar datos crudos del backend
 * - No manejar estado (responsabilidad del hook)
 */
export const dashboardService = {
  /**
   * Obtiene estadísticas generales del sistema.
   * 
   * GET /api/v1/dashboard/stats
   * 
   * @returns Totales de usuarios, ferias, productos, órdenes, ingresos
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  /**
   * Obtiene datos de ingresos para gráficos.
   * 
   * GET /api/v1/dashboard/revenue
   * 
   * @returns Ingresos totales y serie de datos por fecha
   */
  async getRevenue(): Promise<RevenueStats> {
    const response = await apiClient.get<RevenueStats>("/dashboard/revenue");
    return response.data;
  },

  /**
   * Obtiene estadísticas de órdenes.
   * 
   * GET /api/v1/dashboard/orders-stats
   * 
   * @returns Total de órdenes, distribución por estado y serie temporal
   */
  async getOrderStats(): Promise<OrderStats> {
    const response = await apiClient.get<OrderStats>("/dashboard/orders-stats");
    return response.data;
  },

  /**
   * Obtiene estadísticas de inventario.
   * 
   * GET /api/v1/dashboard/inventory-stats
   * 
   * @returns Totales y productos con stock bajo
   */
  async getInventoryStats(): Promise<InventoryStats> {
    const response = await apiClient.get<InventoryStats>(
      "/dashboard/inventory-stats"
    );
    return response.data;
  },

  /**
   * Obtiene las órdenes más recientes.
   * 
   * GET /api/v1/dashboard/recent-orders
   * 
   * @returns Lista de órdenes recientes
   */
  async getRecentOrders(): Promise<RecentOrdersResponse> {
    const response = await apiClient.get<RecentOrdersResponse>(
      "/dashboard/recent-orders"
    );
    return response.data;
  },
};

export default dashboardService;