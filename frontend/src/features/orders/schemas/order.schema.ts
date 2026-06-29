// src/features/orders/schemas/order.schema.ts

import { z } from "zod";

// ─── ESTADOS VÁLIDOS ──────────────────────────────────────

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "ready",
  "delivered",
  "cancelled",
  "expired",
] as const;

const VALID_PAYMENT_METHODS = ["yappy", "card", "cash"] as const;

// ─── MENSAJES DE ERROR ────────────────────────────────────

const ERROR_MESSAGES = {
  fair_id: {
    required: "La feria es obligatoria",
  },
  payment_method: {
    required: "El método de pago es obligatorio",
    invalid: "Método de pago no válido",
  },
  items: {
    required: "Debe haber al menos un producto en la orden",
    empty: "La orden debe tener al menos un producto",
  },
  product_id: {
    required: "El producto es obligatorio",
  },
  quantity: {
    required: "La cantidad es obligatoria",
    min: "La cantidad debe ser al menos 1",
    max: "Máximo 10 productos por item",
  },
  status: {
    invalid: "Estado no válido",
  },
} as const;

// ─── ITEM DE ORDEN ────────────────────────────────────────

const orderItemSchema = z.object({
  product_id: z.string().min(1, ERROR_MESSAGES.product_id.required),
  quantity: z
    .number({ message: ERROR_MESSAGES.quantity.required })
    .min(1, ERROR_MESSAGES.quantity.min)
    .max(10, ERROR_MESSAGES.quantity.max),
});

// ─── SCHEMA CREAR ORDEN ───────────────────────────────────

export const createOrderSchema = z.object({
  fair_id: z.string().min(1, ERROR_MESSAGES.fair_id.required),
  payment_method: z.enum(VALID_PAYMENT_METHODS, {
    message: ERROR_MESSAGES.payment_method.invalid,
  }),
  items: z.array(orderItemSchema).min(1, ERROR_MESSAGES.items.empty),
  notes: z.string().optional().nullable().or(z.literal("")),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

// ─── SCHEMA ACTUALIZAR ORDEN ───────────────────────────────

export const updateOrderSchema = z.object({
  notes: z.string().optional().nullable().or(z.literal("")),
});

export type UpdateOrderFormValues = z.infer<typeof updateOrderSchema>;

// ─── SCHEMA CAMBIAR ESTADO ─────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status: z.enum(VALID_STATUSES, {
    message: ERROR_MESSAGES.status.invalid,
  }),
});

export type UpdateOrderStatusFormValues = z.infer<typeof updateOrderStatusSchema>;