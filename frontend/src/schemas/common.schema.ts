// src/schemas/common.schema.ts

import { z } from "zod";

// ─── MENSAJES DE ERROR REUTILIZABLES ──────────────────────

export const COMMON_ERRORS = {
  required: "Este campo es obligatorio",
  email: {
    required: "El correo electrónico es obligatorio",
    invalid: "Ingresa un correo electrónico válido",
  },
  password: {
    required: "La contraseña es obligatoria",
    min: "La contraseña debe tener al menos 6 caracteres",
  },
  url: {
    invalid: "Ingresa una URL válida",
  },
  number: {
    required: "Este campo es obligatorio",
    invalid: "Ingresa un número válido",
    min: (min: number) => `El valor debe ser mayor o igual a ${min}`,
    max: (max: number) => `El valor debe ser menor o igual a ${max}`,
  },
} as const;

// ─── EMAIL ─────────────────────────────────────────────────

/**
 * Schema para validación de email.
 */
export const emailSchema = z
  .string()
  .min(1, COMMON_ERRORS.email.required)
  .email(COMMON_ERRORS.email.invalid);

/**
 * Schema para email opcional.
 */
export const optionalEmailSchema = z
  .string()
  .email(COMMON_ERRORS.email.invalid)
  .optional()
  .or(z.literal(""));

// ─── PASSWORD ──────────────────────────────────────────────

/**
 * Schema para validación de contraseña.
 */
export const passwordSchema = z
  .string()
  .min(1, COMMON_ERRORS.password.required)
  .min(6, COMMON_ERRORS.password.min);

/**
 * Schema para contraseña opcional.
 */
export const optionalPasswordSchema = z
  .string()
  .min(6, COMMON_ERRORS.password.min)
  .optional()
  .or(z.literal(""));

// ─── NOMBRE ────────────────────────────────────────────────

/**
 * Schema para nombre (texto general).
 */
export const nameSchema = z
  .string()
  .min(1, COMMON_ERRORS.required)
  .min(2, "Debe tener al menos 2 caracteres")
  .max(100, "No puede exceder los 100 caracteres");

/**
 * Schema para nombre opcional.
 */
export const optionalNameSchema = z
  .string()
  .min(2, "Debe tener al menos 2 caracteres")
  .max(100, "No puede exceder los 100 caracteres")
  .optional()
  .or(z.literal(""));

// ─── URL ───────────────────────────────────────────────────

/**
 * Schema para validación de URL.
 */
export const urlSchema = z.string().url(COMMON_ERRORS.url.invalid);

/**
 * Schema para URL opcional.
 */
export const optionalUrlSchema = z
  .string()
  .url(COMMON_ERRORS.url.invalid)
  .optional()
  .or(z.literal(""))
  .nullable();

// ─── NÚMEROS ───────────────────────────────────────────────

/**
 * Schema para número requerido con valor mínimo.
 */
export function numberSchema(min: number = 0) {
  return z
    .number({ message: COMMON_ERRORS.number.invalid })
    .min(min, COMMON_ERRORS.number.min(min));
}

/**
 * Schema para número opcional.
 */
export function optionalNumberSchema(min: number = 0) {
  return z
    .number({ message: COMMON_ERRORS.number.invalid })
    .min(min, COMMON_ERRORS.number.min(min))
    .optional()
    .nullable();
}

// ─── PAGINACIÓN ────────────────────────────────────────────

/**
 * Schema para parámetros de paginación.
 */
export const paginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  size: z.number().min(1).max(100).optional().default(10),
});

// ─── BÚSQUEDA ──────────────────────────────────────────────

/**
 * Schema para búsqueda por texto.
 */
export const searchSchema = z.string().optional().or(z.literal(""));

// ─── BOOLEAN ───────────────────────────────────────────────

/**
 * Schema para valor booleano opcional.
 */
export const optionalBooleanSchema = z.boolean().optional();

// ─── ID ────────────────────────────────────────────────────

/**
 * Schema para ID numérico.
 */
export const idSchema = z
  .number({ message: COMMON_ERRORS.number.invalid })
  .min(1, "El ID debe ser mayor a 0");

/**
 * Schema para ID opcional.
 */
export const optionalIdSchema = z
  .number({ message: COMMON_ERRORS.number.invalid })
  .min(1, "El ID debe ser mayor a 0")
  .optional()
  .nullable();

// ─── TIPOS INFERIDOS ───────────────────────────────────────

export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type NameInput = z.infer<typeof nameSchema>;
export type UrlInput = z.infer<typeof urlSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// ─── OBJETO COMMON_SCHEMAS ─────────────────────────────────

export const commonSchemas = {
  email: emailSchema,
  optionalEmail: optionalEmailSchema,
  password: passwordSchema,
  optionalPassword: optionalPasswordSchema,
  name: nameSchema,
  optionalName: optionalNameSchema,
  url: urlSchema,
  optionalUrl: optionalUrlSchema,
  number: numberSchema,
  optionalNumber: optionalNumberSchema,
  pagination: paginationSchema,
  search: searchSchema,
  optionalBoolean: optionalBooleanSchema,
  id: idSchema,
  optionalId: optionalIdSchema,
} as const;

export default commonSchemas;