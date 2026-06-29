// src/features/users/schemas/user.schema.ts

import { z } from "zod";

// ─── ROLES VÁLIDOS ────────────────────────────────────────

const VALID_ROLES = ["admin", "staff", "client"] as const;

// ─── MENSAJES DE ERROR ────────────────────────────────────

const ERROR_MESSAGES = {
  full_name: {
    required: "El nombre completo es obligatorio",
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede exceder los 100 caracteres",
  },
  cedula: {
    required: "La cédula es obligatoria",
  },
  email: {
    required: "El correo electrónico es obligatorio",
    invalid: "Ingresa un correo electrónico válido",
  },
  password: {
    required: "La contraseña es obligatoria",
    min: "La contraseña debe tener al menos 8 caracteres",
  },
  confirm_password: {
    required: "Debes confirmar la contraseña",
    match: "Las contraseñas no coinciden",
  },
  role: {
    invalid: "Rol no válido. Debe ser: admin, staff o client",
  },
} as const;

// ─── SCHEMA CREAR USUARIO ─────────────────────────────────

export const createUserSchema = z
  .object({
    full_name: z
      .string()
      .min(1, ERROR_MESSAGES.full_name.required)
      .min(2, ERROR_MESSAGES.full_name.min)
      .max(100, ERROR_MESSAGES.full_name.max),
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
    password: z
      .string()
      .min(1, ERROR_MESSAGES.password.required)
      .min(8, ERROR_MESSAGES.password.min),
    confirm_password: z
      .string()
      .min(1, ERROR_MESSAGES.confirm_password.required),
    role: z.enum(VALID_ROLES, {
      message: ERROR_MESSAGES.role.invalid,
    }).optional().default("client"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: ERROR_MESSAGES.confirm_password.match,
    path: ["confirm_password"],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ─── SCHEMA ACTUALIZAR USUARIO ─────────────────────────────

export const updateUserSchema = z
  .object({
    full_name: z
      .string()
      .min(2, ERROR_MESSAGES.full_name.min)
      .max(100, ERROR_MESSAGES.full_name.max)
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email(ERROR_MESSAGES.email.invalid)
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .optional()
      .or(z.literal("")),
    role: z.enum(VALID_ROLES, {
      message: ERROR_MESSAGES.role.invalid,
    }).optional(),
    is_active: z.boolean().optional(),
    is_verified: z.boolean().optional(),
  })
  .refine(
    (data) => {
      return Object.values(data).some(
        (value) => value !== undefined && value !== ""
      );
    },
    {
      message: "Debes modificar al menos un campo para actualizar",
    }
  );

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;