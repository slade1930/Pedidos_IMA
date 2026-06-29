// src/features/users/types/user.types.ts

import type { UserRole } from "@/features/auth/types/auth.types";

// ─── USUARIO ──────────────────────────────────────────────

/**
 * Estructura completa de un usuario retornada por el backend.
 * 
 * GET /api/v1/users/{id}
 * GET /api/v1/users (elemento del array data)
 */
export interface User {
  id: string;
  full_name: string;
  cedula: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// ─── CREAR USUARIO ────────────────────────────────────────

/**
 * Datos requeridos para crear un nuevo usuario.
 * Coincide con UserCreateSchema del backend.
 * 
 * POST /api/v1/users/register
 */
export interface CreateUserPayload {
  full_name: string;
  cedula: string;
  email: string;
  phone?: string | null;
  password: string;
  confirm_password: string;
}

// ─── ACTUALIZAR USUARIO ───────────────────────────────────

/**
 * Datos para actualizar un usuario existente.
 * Coincide con UserUpdateSchema del backend.
 * 
 * PUT /api/v1/users/me
 */
export interface UpdateUserPayload {
  full_name?: string;
  phone?: string | null;
  email?: string;
}

// ─── ACTUALIZAR USUARIO (ADMIN) ───────────────────────────

/**
 * Datos para que un admin actualice un usuario.
 * Coincide con UserAdminUpdateSchema del backend.
 * 
 * PUT /api/v1/users/{id}/admin
 */
export interface AdminUpdateUserPayload {
  role?: UserRole;
  is_active?: boolean;
  is_verified?: boolean;
}

// ─── RESPUESTAS ───────────────────────────────────────────

/** Respuesta paginada de usuarios */
export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Respuesta al crear/actualizar un usuario */
export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

// ─── FILTROS ──────────────────────────────────────────────

/** Filtros aceptados por GET /api/v1/users */
export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}