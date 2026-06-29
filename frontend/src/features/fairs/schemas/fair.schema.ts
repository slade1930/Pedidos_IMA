// src/features/fairs/schemas/fair.schema.ts

import { z } from "zod";

// ─── ESTADOS VÁLIDOS ──────────────────────────────────────

const VALID_STATUSES = ["upcoming", "active", "paused", "finished", "cancelled"] as const;

// ─── MENSAJES DE ERROR ────────────────────────────────────

const ERROR_MESSAGES = {
  name: {
    required: "El nombre de la feria es obligatorio",
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede exceder los 100 caracteres",
  },
  description: {
    required: "La descripción es obligatoria",
  },
  location: {
    required: "La ubicación es obligatoria",
  },
  province: {
    required: "La provincia es obligatoria",
  },
  start_date: {
    required: "La fecha de inicio es obligatoria",
  },
  end_date: {
    required: "La fecha de finalización es obligatoria",
    beforeStart: "La fecha de finalización debe ser posterior a la de inicio",
  },
  max_orders: {
    min: "El máximo de órdenes debe ser al menos 1",
  },
  status: {
    invalid: "Estado no válido",
  },
} as const;

// ─── SCHEMA CREAR FERIA ───────────────────────────────────

export const createFairSchema = z
  .object({
    name: z
      .string()
      .min(1, ERROR_MESSAGES.name.required)
      .min(2, ERROR_MESSAGES.name.min)
      .max(100, ERROR_MESSAGES.name.max),
    description: z.string().min(1, ERROR_MESSAGES.description.required),
    location: z.string().min(1, ERROR_MESSAGES.location.required),
    province: z.string().min(1, ERROR_MESSAGES.province.required),
    start_date: z.string().min(1, ERROR_MESSAGES.start_date.required),
    end_date: z.string().min(1, ERROR_MESSAGES.end_date.required),
    max_orders: z
      .number({ message: "Ingresa un número válido" })
      .min(1, ERROR_MESSAGES.max_orders.min)
      .optional()
      .default(500),
    status: z.enum(VALID_STATUSES, {
      message: ERROR_MESSAGES.status.invalid,
    }).optional().default("upcoming"),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) > new Date(data.start_date);
      }
      return true;
    },
    {
      message: ERROR_MESSAGES.end_date.beforeStart,
      path: ["end_date"],
    }
  );

export type CreateFairFormValues = z.infer<typeof createFairSchema>;

// ─── SCHEMA ACTUALIZAR FERIA ───────────────────────────────

export const updateFairSchema = z
  .object({
    name: z
      .string()
      .min(2, ERROR_MESSAGES.name.min)
      .max(100, ERROR_MESSAGES.name.max)
      .optional()
      .or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    province: z.string().optional().or(z.literal("")),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
    max_orders: z
      .number({ message: "Ingresa un número válido" })
      .min(1, ERROR_MESSAGES.max_orders.min)
      .optional()
      .nullable(),
    status: z.enum(VALID_STATUSES, {
      message: ERROR_MESSAGES.status.invalid,
    }).optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) > new Date(data.start_date);
      }
      return true;
    },
    {
      message: ERROR_MESSAGES.end_date.beforeStart,
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      return Object.values(data).some(
        (value) => value !== undefined && value !== null && value !== ""
      );
    },
    {
      message: "Debes modificar al menos un campo para actualizar",
    }
  );

export type UpdateFairFormValues = z.infer<typeof updateFairSchema>;