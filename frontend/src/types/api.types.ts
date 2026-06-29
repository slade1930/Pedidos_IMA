// src/types/api.types.ts

// ─── RESPUESTA PAGINADA ───────────────────────────────────

/**
 * Estructura de respuesta paginada del backend FastAPI.
 * 
 * Usada por todos los endpoints que retornan listas.
 * 
 * @template T - Tipo de los items en la lista
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── ERROR DE API ──────────────────────────────────────────

/**
 * Estructura de error estandarizada del interceptor Axios.
 */
export interface ApiError {
  status: number;
  message: string;
  originalError?: unknown;
}

// ─── ERROR DE VALIDACIÓN ───────────────────────────────────

/**
 * Detalle de error de validación de FastAPI/Pydantic.
 */
export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Error de validación completo del backend.
 */
export interface ValidationError {
  detail: ValidationErrorDetail[];
}

// ─── PARÁMETROS DE PAGINACIÓN ──────────────────────────────

/**
 * Parámetros comunes de paginación para requests.
 */
export interface PaginationParams {
  page?: number;
  size?: number;
}

// ─── PARÁMETROS DE ORDENAMIENTO ────────────────────────────

/**
 * Dirección de ordenamiento.
 */
export type SortDirection = "asc" | "desc";

/**
 * Parámetros de ordenamiento.
 */
export interface SortParams {
  sort_by?: string;
  sort_dir?: SortDirection;
}

// ─── RESPUESTA GENÉRICA ────────────────────────────────────

/**
 * Respuesta simple con mensaje.
 * Usada por endpoints como logout.
 */
export interface MessageResponse {
  message: string;
}

/**
 * Respuesta de éxito genérica.
 */
export interface SuccessResponse<T = void> {
  success: true;
  data?: T;
  message?: string;
}

// ─── REQUEST GENÉRICO ──────────────────────────────────────

/**
 * Filtros base que todos los filtros de búsqueda extienden.
 */
export interface BaseFilters extends PaginationParams, SortParams {
  search?: string;
}

// ─── METADATA DE API ───────────────────────────────────────

/**
 * Información de la versión de la API.
 */
export interface ApiVersion {
  version: string;
  environment: "development" | "staging" | "production";
  timestamp: string;
}

// ─── ESTADO DE MUTACIÓN ────────────────────────────────────

/**
 * Estado genérico para mutations (create, update, delete).
 * Útil para tipar respuestas de useMutation.
 */
export interface MutationState<T> {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: ApiError | null;
  data: T | undefined;
  mutate: (data: T) => void;
  reset: () => void;
}