// src/lib/api/endpoints.ts

// ─── PREFIJO ───────────────────────────────────────────────

const V1 = "/api/v1";

// ─── ENDPOINTS ─────────────────────────────────────────────

/**
 * Endpoints centralizados de la API.
 * 
 * Single source of truth para todas las rutas del backend.
 * Basado en app/api/routes/ del backend FastAPI.
 */
export const ENDPOINTS = {
  // ─── AUTH ──────────────────────────────────────────
  AUTH: {
    LOGIN: `${V1}/auth/login`,
    REFRESH: `${V1}/auth/refresh`,
    LOGOUT: `${V1}/auth/logout`,
  },

  // ─── USERS ─────────────────────────────────────────
  USERS: {
    LIST: `${V1}/users`,
    DETAIL: (id: string) => `${V1}/users/${id}`,
    REGISTER: `${V1}/users/register`,
    ME: `${V1}/users/me`,
    UPDATE_ME: `${V1}/users/me`,
    ADMIN_UPDATE: (id: string) => `${V1}/users/${id}/admin`,
    DEACTIVATE: (id: string) => `${V1}/users/${id}`,
  },

  // ─── FAIRS ─────────────────────────────────────────
  FAIRS: {
    LIST: `${V1}/fairs`,
    DETAIL: (id: string) => `${V1}/fairs/${id}`,
    CREATE: `${V1}/fairs`,
    UPDATE: (id: string) => `${V1}/fairs/${id}`,
    DELETE: (id: string) => `${V1}/fairs/${id}`,
  },

  // ─── PRODUCTS ──────────────────────────────────────
  PRODUCTS: {
    LIST: `${V1}/products`,
    DETAIL: (id: string) => `${V1}/products/${id}`,
    CREATE: `${V1}/products`,
    UPDATE: (id: string) => `${V1}/products/${id}`,
    DELETE: (id: string) => `${V1}/products/${id}`,
  },

  // ─── INVENTORY ─────────────────────────────────────
  INVENTORY: {
    LIST: `${V1}/inventory`,
    DETAIL: (id: string) => `${V1}/inventory/${id}`,
    CREATE: `${V1}/inventory`,
    UPDATE: (id: string) => `${V1}/inventory/${id}`,
  },

  // ─── ORDERS ────────────────────────────────────────
  ORDERS: {
    LIST: `${V1}/orders`,
    DETAIL: (id: string) => `${V1}/orders/${id}`,
    CREATE: `${V1}/orders`,
    UPDATE_STATUS: (id: string) => `${V1}/orders/${id}/status`,
  },

  // ─── PAYMENTS ──────────────────────────────────────
  PAYMENTS: {
    LIST: `${V1}/payments`,
    DETAIL: (id: string) => `${V1}/payments/${id}`,
    CREATE: `${V1}/payments`,
    UPDATE: (id: string) => `${V1}/payments/${id}`,
  },

  // ─── DASHBOARD ─────────────────────────────────────
  DASHBOARD: {
    STATS: `${V1}/dashboard/stats`,
    REVENUE: `${V1}/dashboard/revenue`,
    ORDERS_STATS: `${V1}/dashboard/orders-stats`,
    INVENTORY_STATS: `${V1}/dashboard/inventory-stats`,
    RECENT_ORDERS: `${V1}/dashboard/recent-orders`,
  },

  // ─── NOTIFICATIONS ─────────────────────────────────
  NOTIFICATIONS: {
    LIST: `${V1}/notifications`,
    MARK_READ: (id: string) => `${V1}/notifications/${id}/read`,
    MARK_ALL_READ: `${V1}/notifications/read-all`,
  },
} as const;

export default ENDPOINTS;