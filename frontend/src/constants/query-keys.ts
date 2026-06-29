// src/constants/query-keys.ts

// ─── QUERY KEYS ────────────────────────────────────────────

/**
 * Query keys centralizadas para TanStack Query.
 * 
 * Usar estas keys en useQuery y en invalidateQueries
 * para mantener consistencia en el cacheo.
 * 
 * Estructura:
 * - Cada módulo tiene su propio objeto con factories
 * - Las factories retornan arrays de keys
 * - `all` retorna la key base para invalidar todo el módulo
 * - `list` retorna keys para listas (con filtros)
 * - `detail` retorna keys para items individuales
 * 
 * Uso:
 * ```ts
 * useQuery({ queryKey: queryKeys.users.list(filters) });
 * queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
 * ```
 */
export const queryKeys = {
  // ─── AUTH ──────────────────────────────────────────
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  // ─── USERS ─────────────────────────────────────────
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.users.all, "detail", id] as const,
  },

  // ─── FAIRS ─────────────────────────────────────────
  fairs: {
    all: ["fairs"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.fairs.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.fairs.all, "detail", id] as const,
  },

  // ─── PRODUCTS ──────────────────────────────────────
  products: {
    all: ["products"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.products.all, "detail", id] as const,
  },

  // ─── INVENTORY ─────────────────────────────────────
  inventory: {
    all: ["inventory"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.inventory.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.inventory.all, "detail", id] as const,
  },

  // ─── ORDERS ────────────────────────────────────────
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.orders.all, "detail", id] as const,
  },

  // ─── PAYMENTS ──────────────────────────────────────
  payments: {
    all: ["payments"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.payments.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.payments.all, "detail", id] as const,
  },

  // ─── DASHBOARD ─────────────────────────────────────
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    revenue: () => [...queryKeys.dashboard.all, "revenue"] as const,
    ordersStats: () =>
      [...queryKeys.dashboard.all, "orders-stats"] as const,
    inventoryStats: () =>
      [...queryKeys.dashboard.all, "inventory-stats"] as const,
    recentOrders: () =>
      [...queryKeys.dashboard.all, "recent-orders"] as const,
  },
} as const;

export default queryKeys;