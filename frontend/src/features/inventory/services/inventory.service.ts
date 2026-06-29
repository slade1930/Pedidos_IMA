// src/features/inventory/services/inventory.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  InventoryItem,
  CreateInventoryPayload,
  UpdateStockPayload,
  InventoryResponse,
  InventoryFilters,
} from "@/features/inventory/types/inventory.types";

// ─── SERVICIO DE INVENTARIO ───────────────────────────────

export const inventoryService = {
  /**
   * Obtiene lista paginada de inventario con filtros opcionales.
   * 
   * GET /api/v1/inventory
   */
  async getInventory(filters?: InventoryFilters): Promise<InventoryResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.set("search", filters.search);
    if (filters?.fair_id) params.set("fair_id", filters.fair_id);
    if (filters?.low_stock !== undefined) params.set("low_stock", String(filters.low_stock));
    if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/inventory?${queryString}` : "/inventory";

    const response = await apiClient.get<InventoryResponse>(endpoint);
    return response.data;
  },

  /**
   * Crea un nuevo registro de inventario para un producto.
   * 
   * POST /api/v1/inventory
   */
  async createInventory(data: CreateInventoryPayload): Promise<InventoryItem> {
    const response = await apiClient.post<InventoryItem>("/inventory", data);
    return response.data;
  },

  /**
   * Actualiza el stock de un producto en inventario.
   * 
   * PUT /api/v1/inventory/{id}
   */
  async updateStock(id: string, data: UpdateStockPayload): Promise<InventoryItem> {
    const response = await apiClient.put<InventoryItem>(`/inventory/${id}`, data);
    return response.data;
  },
};

export default inventoryService;