// src/features/shop/schemas/checkout.schema.ts

import { z } from "zod";

// ─── MENSAJES DE ERROR ────────────────────────────────────

const ERROR_MESSAGES = {
  payment_method: {
    required: "Selecciona un método de pago",
  },
} as const;

// ─── SCHEMA CHECKOUT ──────────────────────────────────────

export const checkoutSchema = z.object({
  payment_method: z.enum(["yappy", "card", "cash"], {
    message: ERROR_MESSAGES.payment_method.required,
  }),
  notes: z.string().optional().or(z.literal("")),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;