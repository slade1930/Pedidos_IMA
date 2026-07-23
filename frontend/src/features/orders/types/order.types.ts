// src/features/orders/types/order.types.ts

// ─── ESTADOS DE ORDEN ─────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "delivered"
  | "cancelled"
  | "expired";

// ─── MÉTODO DE PAGO ──────────────────────────────────────

export type PaymentMethod = "yappy" | "card" | "cash";

// ─── ESTADO DE PAGO ──────────────────────────────────────

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

// ─── ITEM DE ORDEN ────────────────────────────────────────

export interface CreateOrderItemPayload {
  product_id: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// ─── ORDEN ────────────────────────────────────────────────

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  fair_id: string;
  status: OrderStatus;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  qr_code: string | null;
  qr_used: boolean;
  pickup_code: string | null;
  customer_name: string | null;
  customer_cedula: string | null;
  notes: string | null;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

// ─── CREAR ORDEN ──────────────────────────────────────────

export interface CreateOrderPayload {
  fair_id: string;
  payment_method: PaymentMethod;
  items: CreateOrderItemPayload[];
  notes?: string | null;
}

// ─── CAMBIAR ESTADO ───────────────────────────────────────

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// ─── PDA ──────────────────────────────────────────────────

export interface PdaRestriction {
  message: string;
  last_purchase_date: string;
  last_fair_name: string;
  days_remaining: number;
  next_available_date: string;
}

// ─── RESPUESTAS ───────────────────────────────────────────

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

// ─── FILTROS ──────────────────────────────────────────────

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  fair_id?: string;
  date_from?: string;  // 👈 NUEVO
  date_to?: string;    // 👈 NUEVO
  skip?: number;
  limit?: number;
}
