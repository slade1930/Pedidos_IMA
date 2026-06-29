// src/features/auth/schemas/auth.schema.ts

import { z } from "zod";

// ─── MENSAJES DE ERROR REUTILIZABLES ──────────────────────

const ERROR_MESSAGES = {
  email: {
    required: "El correo electrónico es obligatorio",
    invalid: "Ingresa un correo electrónico válido",
  },
  password: {
    required: "La contraseña es obligatoria",
    min: "La contraseña debe tener al menos 8 caracteres",
  },
  full_name: {
    required: "El nombre completo es obligatorio",
    min: "El nombre debe tener al menos 2 caracteres",
  },
  cedula: {
    required: "La cédula es obligatoria",
  },
  confirm_password: {
    required: "Debes confirmar la contraseña",
    match: "Las contraseñas no coinciden",
  },
} as const;

// ─── VALIDACIONES ─────────────────────────────────────────

/** Contraseña: mínimo 8 caracteres */
const passwordSchema = z
  .string()
  .min(1, ERROR_MESSAGES.password.required)
  .min(8, ERROR_MESSAGES.password.min);

// ─── LOGIN SCHEMA ─────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.email.required)
    .email(ERROR_MESSAGES.email.invalid),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.password.required),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── REGISTER SCHEMA ──────────────────────────────────────

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, ERROR_MESSAGES.full_name.required)
      .min(2, ERROR_MESSAGES.full_name.min),
    cedula: z
      .string()
      .min(1, ERROR_MESSAGES.cedula.required),
    email: z
      .string()
      .min(1, ERROR_MESSAGES.email.required)
      .email(ERROR_MESSAGES.email.invalid),
    phone: z
      .string()
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirm_password: z
      .string()
      .min(1, ERROR_MESSAGES.confirm_password.required),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: ERROR_MESSAGES.confirm_password.match,
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;