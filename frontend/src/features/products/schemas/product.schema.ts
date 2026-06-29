// src/features/products/schemas/product.schema.ts

import { z } from "zod";

// ─── VALORES VÁLIDOS ─────────────────────────────────────

const VALID_UNITS = ["pound", "kilogram", "unit", "dozen", "bag"] as const;

const VALID_CATEGORIES = [
  "vegetables",
  "fruits",
  "grains",
  "meats",
  "dairy",
  "other",
] as const;

// ─── MENSAJES DE ERROR ────────────────────────────────────

const ERROR_MESSAGES = {
  name: {
    required: "El nombre del producto es obligatorio",
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede exceder los 100 caracteres",
  },
  sku: {
    required: "El SKU es obligatorio",
  },
  description: {
    required: "La descripción es obligatoria",
  },
  price: {
    required: "El precio es obligatorio",
    min: "El precio debe ser mayor a 0",
    invalid: "Ingresa un precio válido",
  },
  unit: {
    required: "La unidad es obligatoria",
    invalid: "Unidad no válida",
  },
  category: {
    required: "La categoría es obligatoria",
    invalid: "Categoría no válida",
  },
  fair_id: {
    required: "La feria es obligatoria",
  },
  image_url: {
    invalid: "URL de imagen no válida",
  },
  max_per_user: {
    min: "Debe ser al menos 1",
  },
} as const;

// ─── SCHEMA CREAR PRODUCTO ────────────────────────────────

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.name.required)
    .min(2, ERROR_MESSAGES.name.min)
    .max(100, ERROR_MESSAGES.name.max),
  sku: z.string().min(1, ERROR_MESSAGES.sku.required),
  description: z.string().optional().or(z.literal("")),
  price: z
    .number({ message: ERROR_MESSAGES.price.invalid })
    .min(0.01, ERROR_MESSAGES.price.min),
  unit: z.enum(VALID_UNITS, { message: ERROR_MESSAGES.unit.invalid }),
  category: z.enum(VALID_CATEGORIES, {
    message: ERROR_MESSAGES.category.invalid,
  }),
  fair_id: z.string().min(1, ERROR_MESSAGES.fair_id.required),
  image_url: z
    .string()
    .url({ message: ERROR_MESSAGES.image_url.invalid })
    .optional()
    .or(z.literal(""))
    .nullable(),
  max_per_user: z
    .number({ message: "Ingresa un número válido" })
    .min(1, ERROR_MESSAGES.max_per_user.min)
    .optional()
    .default(1),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

// ─── SCHEMA ACTUALIZAR PRODUCTO ────────────────────────────

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(2, ERROR_MESSAGES.name.min)
      .max(100, ERROR_MESSAGES.name.max)
      .optional()
      .or(z.literal("")),
    sku: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    price: z
      .number({ message: ERROR_MESSAGES.price.invalid })
      .min(0.01, ERROR_MESSAGES.price.min)
      .optional()
      .nullable(),
    unit: z.enum(VALID_UNITS, { message: ERROR_MESSAGES.unit.invalid }).optional(),
    category: z
      .enum(VALID_CATEGORIES, { message: ERROR_MESSAGES.category.invalid })
      .optional(),
    image_url: z
      .string()
      .url({ message: ERROR_MESSAGES.image_url.invalid })
      .optional()
      .or(z.literal(""))
      .nullable(),
    max_per_user: z
      .number({ message: "Ingresa un número válido" })
      .min(1, ERROR_MESSAGES.max_per_user.min)
      .optional()
      .nullable(),
    is_active: z.boolean().optional(),
  })
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

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;