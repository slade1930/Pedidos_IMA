// src/features/auth/types/auth.types.ts

// ─── ENUMS Y LITERALES ────────────────────────────────────

/** Roles de usuario definidos en el backend */
export type UserRole = "admin" | "staff" | "client";

// ─── USUARIO ──────────────────────────────────────────────

/** Estructura del usuario autenticado retornada por el backend */
export interface AuthUser {
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

// ─── CREDENCIALES ─────────────────────────────────────────

/** Datos requeridos para iniciar sesión */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Datos requeridos para registrar un nuevo usuario */
export interface RegisterData {
  full_name: string;
  cedula: string;
  email: string;
  phone?: string | null;
  password: string;
  confirm_password: string;
}

// ─── RESPUESTAS DEL BACKEND ───────────────────────────────

/** Respuesta del backend en login y refresh */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** Envoltura de respuesta del backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
  meta?: Record<string, unknown> | null;
}

/** Respuesta del backend al refrescar el token */
export type RefreshTokenResponse = TokenResponse;

/** Respuesta del backend al hacer logout */
export interface LogoutResponse {
  message: string;
}

// ─── ESTADO DE AUTENTICACIÓN ──────────────────────────────

/** Estado completo del store de autenticación (usado por Zustand) */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// ─── ERRORES ──────────────────────────────────────────────

/** Estructura de error del backend */
export interface ApiError {
  success: false;
  message: string;
  detail?: unknown;
  code?: string;
  timestamp?: string;
}