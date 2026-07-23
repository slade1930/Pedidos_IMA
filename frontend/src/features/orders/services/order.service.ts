// src/features/orders/services/order.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  OrdersResponse,
  OrderFilters,
} from "@/features/orders/types/order.types";

// ─── SERVICIO DE ÓRDENES ──────────────────────────────────

export const orderService = {
  /**
   * Obtiene lista paginada de órdenes con filtros opcionales.
   * 
   * GET /api/v1/orders
   */
  async getOrders(filters?: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.fair_id) params.set("fair_id", filters.fair_id);
    if (filters?.date_from) params.set("date_from", filters.date_from);  // 👈 NUEVO
    if (filters?.date_to) params.set("date_to", filters.date_to);        // 👈 NUEVO
    if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/orders?${queryString}` : "/orders";

    const response = await apiClient.get<OrdersResponse>(endpoint);
    return response.data;
  },

  /**
   * Obtiene una orden por su ID.
   * 
   * GET /api/v1/orders/{id}
   */
  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva orden.
   * 
   * POST /api/v1/orders
   */
  async createOrder(data: CreateOrderPayload): Promise<Order> {
    const response = await apiClient.post<Order>("/orders", data);
    return response.data;
  },

  /**
   * Cambia el estado de una orden.
   * 
   * PUT /api/v1/orders/{id}/status
   */
  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusPayload
  ): Promise<Order> {
    const response = await apiClient.put<Order>(
      `/orders/${id}/status`,
      data
    );
    return response.data;
  },

  /**
   * Descarga un reporte PDF con filtros opcionales.
   * 
   * GET /api/v1/orders/report
   */
  async downloadOrdersReport(filters?: {
    fair_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters?.fair_id) params.set("fair_id", filters.fair_id);
    if (filters?.date_from) params.set("date_from", filters.date_from);
    if (filters?.date_to) params.set("date_to", filters.date_to);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/orders/report?${queryString}` : "/orders/report";

    const response = await apiClient.get(endpoint, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-ordenes-ima-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default orderService;
