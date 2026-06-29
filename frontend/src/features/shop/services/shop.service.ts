// src/features/shop/services/shop.service.ts

import { apiClient } from "@/lib/api/client";
import type { Product } from "@/features/products/types/product.types";
import type { Order } from "@/features/orders/types/order.types";
import type { CreateOrderPayload } from "@/features/orders/types/order.types";

// ─── SERVICIO DE TIENDA ───────────────────────────────────

/**
 * ShopService
 * 
 * Servicios específicos para la tienda (cliente).
 * Usa endpoints públicos y autenticados.
 */
export const shopService = {
  /**
   * Obtiene productos disponibles para la tienda.
   * Endpoint público.
   * 
   * GET /api/v1/products/public
   */
  async getProducts(fairId: string, category?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    params.set("fair_id", fairId);
    if (category) params.set("category", category);
    if (search) params.set("search", search);

    const response = await apiClient.get<Product[]>(
      `/products/public?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtiene las ferias disponibles públicamente.
   * 
   * GET /api/v1/fairs/public
   */
  async getPublicFairs() {
    const response = await apiClient.get<Array<{ id: string; name: string }>>(
      "/fairs/public"
    );
    return response.data;
  },

  /**
   * Crea una nueva orden desde el carrito.
   * Requiere autenticación.
   * 
   * POST /api/v1/orders
   */
  async createOrder(data: CreateOrderPayload): Promise<Order> {
    const response = await apiClient.post<Order>("/orders", data);
    return response.data;
  },

  /**
   * Obtiene los pedidos del usuario autenticado.
   * 
   * GET /api/v1/orders/my-orders
   */
  async getMyOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>("/orders/my-orders");
    return response.data;
  },

  /**
   * Obtiene un pedido específico por ID.
   * 
   * GET /api/v1/orders/{id}
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);
    return response.data;
  },
};

export default shopService;