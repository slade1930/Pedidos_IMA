// src/constants/app.constants.ts

// ─── APLICACIÓN ────────────────────────────────────────────

/** Nombre de la aplicación */
export const APP_NAME = "IMA System";

/** Versión actual */
export const APP_VERSION = "1.0.0";

/** Descripción corta */
export const APP_DESCRIPTION = "Sistema de gestión integral IMA";

// ─── API ───────────────────────────────────────────────────

/** URL base de la API */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Versión de la API */
export const API_VERSION = "/api/v1";

/** Timeout por defecto para requests (ms) */
export const API_TIMEOUT = 15000;

// ─── PAGINACIÓN ────────────────────────────────────────────

/** Tamaño de página por defecto para tablas */
export const DEFAULT_PAGE_SIZE = 10;

/** Tamaños de página disponibles */
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

// ─── DEBOUNCE ──────────────────────────────────────────────

/** Tiempo de debounce para inputs de búsqueda (ms) */
export const SEARCH_DEBOUNCE_MS = 300;

// ─── TOAST ─────────────────────────────────────────────────

/** Duración por defecto de notificaciones toast (ms) */
export const TOAST_DURATION_MS = 4000;

/** Máximo de toasts visibles simultáneamente */
export const MAX_TOASTS = 5;

// ─── FECHAS ────────────────────────────────────────────────

/** Formato de fecha por defecto */
export const DATE_FORMAT = "es-PA";

/** Zona horaria por defecto */
export const TIMEZONE = "America/Panama";

// ─── ALMACENAMIENTO LOCAL ──────────────────────────────────

/** Prefijo para claves de localStorage */
export const STORAGE_PREFIX = "ima_";

/** Claves de localStorage */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: `${STORAGE_PREFIX}access_token`,
  REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
  CART: `${STORAGE_PREFIX}cart`,
  THEME: `${STORAGE_PREFIX}theme`,
  SIDEBAR_STATE: `${STORAGE_PREFIX}sidebar_state`,
  SESSION_COOKIE: "has_session",
} as const;

// ─── ROLES ─────────────────────────────────────────────────

/** Roles disponibles en el sistema */
export const ROLES = ["admin", "seller", "viewer"] as const;

/** Etiquetas de roles en español */
export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  seller: "Vendedor",
  viewer: "Observador",
};

// ─── ESTADOS ───────────────────────────────────────────────

/** Estados de una orden */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_preparation",
  "ready",
  "delivered",
  "cancelled",
] as const;

/** Estados de una feria */
export const FAIR_STATUSES = [
  "planned",
  "active",
  "completed",
  "cancelled",
] as const;

/** Estados de un pago */
export const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;

/** Métodos de pago */
export const PAYMENT_METHODS = ["cash", "card", "transfer", "other"] as const;

// ─── BREAKPOINTS ───────────────────────────────────────────

/** Breakpoints de diseño responsive */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// ─── OBJETO APP ────────────────────────────────────────────

/**
 * Objeto que agrupa todas las constantes de la aplicación.
 * 
 * Uso:
 * ```ts
 * import { APP } from "@/constants/app.constants";
 * 
 * APP.NAME // "IMA System"
 * APP.STORAGE.ACCESS_TOKEN // "ima_access_token"
 * ```
 */
export const APP = {
  NAME: APP_NAME,
  VERSION: APP_VERSION,
  DESCRIPTION: APP_DESCRIPTION,
  API_URL,
  API_VERSION,
  API_TIMEOUT,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SEARCH_DEBOUNCE_MS,
  TOAST_DURATION_MS,
  MAX_TOASTS,
  DATE_FORMAT,
  TIMEZONE,
  STORAGE: STORAGE_KEYS,
  ROLES,
  ROLE_LABELS,
  ORDER_STATUSES,
  FAIR_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  BREAKPOINTS,
} as const;

export default APP;