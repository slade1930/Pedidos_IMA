// src/features/payments/types/payment.types.ts 

// ─── MÉTODO DE PAGO ──────────────────────────────────────

/** Métodos de pago aceptados */
export type PaymentMethod = "yappy" | "card" | "cash";

// ─── ESTADO DEL PAGO ──────────────────────────────────────

/** Estados posibles de un pago */
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

// ─── PAGO ─────────────────────────────────────────────────

/**
 * Estructura completa de un pago retornada por el backend.
 * 
 * GET /api/v1/payments/{id}
 * GET /api/v1/payments (elemento del array data)
 */
export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transaction_id: string | null;
  reference_code: string | null;
}

// ─── CREAR PAGO ───────────────────────────────────────────

/**
 * Datos requeridos para registrar un nuevo pago.
 * 
 * POST /api/v1/payments
 */
export interface CreatePaymentPayload {
  order_id: string;
  method: PaymentMethod;
  amount: number;
  transaction_id?: string | null;
  reference_code?: string | null;
}

// ─── ACTUALIZAR PAGO ──────────────────────────────────────

/**
 * Datos para actualizar un pago existente.
 * 
 * PUT /api/v1/payments/{id}
 */
export interface UpdatePaymentPayload {
  status: PaymentStatus;
  transaction_id?: string | null;
  reference_code?: string | null;
  notes?: string | null;
}

// ─── RESPUESTAS ───────────────────────────────────────────

/** Respuesta paginada de pagos */
export interface PaymentsResponse {
  success: boolean;
  message: string;
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Respuesta al crear/actualizar un pago */
export interface PaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

// ─── FILTROS ──────────────────────────────────────────────

/** Filtros aceptados por GET /api/v1/payments */
export interface PaymentFilters {
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  order_id?: string;
  skip?: number;
  limit?: number;
}