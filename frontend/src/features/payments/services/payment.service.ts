// src/features/payments/services/payment.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  Payment,
  CreatePaymentPayload,
  PaymentsResponse,
  PaymentFilters,
} from "@/features/payments/types/payment.types";

// ─── SERVICIO DE PAGOS ────────────────────────────────────

export const paymentService = {
  /**
   * Obtiene lista paginada de pagos con filtros opcionales.
   * 
   * GET /api/v1/payments
   */
  async getPayments(filters?: PaymentFilters): Promise<PaymentsResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.set("search", filters.search);
    if (filters?.method) params.set("method", filters.method);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.order_id) params.set("order_id", filters.order_id);
    if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/payments?${queryString}` : "/payments";

    const response = await apiClient.get<PaymentsResponse>(endpoint);
    return response.data;
  },

  /**
   * Obtiene un pago por su ID.
   * 
   * GET /api/v1/payments/order/{id}
   */
  async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/order/${id}`);
    return response.data;
  },

  /**
   * Registra un nuevo pago para una orden.
   * 
   * POST /api/v1/payments
   */
  async createPayment(data: CreatePaymentPayload): Promise<Payment> {
    const response = await apiClient.post<Payment>("/payments", data);
    return response.data;
  },
};

export default paymentService;