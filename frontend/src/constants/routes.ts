// src/constants/routes.ts

// ─── RUTAS ─────────────────────────────────────────────────

/**
 * Rutas de la aplicación centralizadas.
 * 
 * Single source of truth para todas las rutas.
 * Si una ruta cambia, solo se modifica aquí.
 * 
 * Uso:
 * ```ts
 * import { ROUTES } from "@/constants/routes";
 * 
 * router.push(ROUTES.DASHBOARD.USERS.LIST);
 * router.push(ROUTES.DASHBOARD.USERS.DETAIL(5));
 * ```
 */
export const ROUTES = {
  // ─── PÚBLICO ───────────────────────────────────────
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    PUBLIC_FAIRS: {
      DETAIL: (id: number) => `/public-fairs/${id}`,
    },
  },

  // ─── DASHBOARD ─────────────────────────────────────
  DASHBOARD: {
    ROOT: "/dashboard",

    USERS: {
      LIST: "/dashboard/users",
      DETAIL: (id: number) => `/dashboard/users/${id}`,
    },

    FAIRS: {
      LIST: "/dashboard/fairs",
      DETAIL: (id: number) => `/dashboard/fairs/${id}`,
    },

    PRODUCTS: {
      LIST: "/dashboard/products",
      DETAIL: (id: number) => `/dashboard/products/${id}`,
    },

    INVENTORY: {
      LIST: "/dashboard/inventory",
    },

    ORDERS: {
      LIST: "/dashboard/orders",
      DETAIL: (id: number) => `/dashboard/orders/${id}`,
    },

    PAYMENTS: {
      LIST: "/dashboard/payments",
    },

    SETTINGS: "/dashboard/settings",
  },
} as const;

// ─── RUTAS PÚBLICAS (MIDDLEWARE) ───────────────────────────

/**
 * Rutas que no requieren autenticación.
 * Usado por el middleware para permitir acceso sin token.
 */
export const PUBLIC_ROUTES = [
  ROUTES.PUBLIC.LOGIN,
  ROUTES.PUBLIC.REGISTER,
  "/public-fairs",
] as const;

// ─── RUTAS PROTEGIDAS ──────────────────────────────────────

/**
 * Prefijo de rutas que requieren autenticación.
 * Usado por el middleware para verificar sesión.
 */
export const PROTECTED_PREFIX = "/dashboard";

// ─── RUTA POST-LOGIN ───────────────────────────────────────

/**
 * Ruta a la que redirigir después de iniciar sesión.
 */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.DASHBOARD.ROOT;

// ─── RUTA POST-LOGOUT ──────────────────────────────────────

/**
 * Ruta a la que redirigir después de cerrar sesión.
 */
export const LOGOUT_REDIRECT = ROUTES.PUBLIC.LOGIN;

// ─── OBJETO RUTAS NAVEGABLES ───────────────────────────────

/**
 * Rutas que aparecen en la navegación del dashboard.
 * Cada ruta especifica los roles que pueden verla.
 */
export const NAV_ROUTES = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD.ROOT,
    icon: "LayoutDashboard",
    roles: ["admin", "seller", "viewer"],
  },
  {
    label: "Usuarios",
    href: ROUTES.DASHBOARD.USERS.LIST,
    icon: "Users",
    roles: ["admin"],
  },
  {
    label: "Ferias",
    href: ROUTES.DASHBOARD.FAIRS.LIST,
    icon: "Store",
    roles: ["admin", "seller", "viewer"],
  },
  {
    label: "Productos",
    href: ROUTES.DASHBOARD.PRODUCTS.LIST,
    icon: "Package",
    roles: ["admin", "seller", "viewer"],
  },
  {
    label: "Inventario",
    href: ROUTES.DASHBOARD.INVENTORY.LIST,
    icon: "ClipboardList",
    roles: ["admin", "seller"],
  },
  {
    label: "Órdenes",
    href: ROUTES.DASHBOARD.ORDERS.LIST,
    icon: "ShoppingCart",
    roles: ["admin", "seller", "viewer"],
  },
  {
    label: "Pagos",
    href: ROUTES.DASHBOARD.PAYMENTS.LIST,
    icon: "CreditCard",
    roles: ["admin", "viewer"],
  },
  {
    label: "Configuración",
    href: ROUTES.DASHBOARD.SETTINGS,
    icon: "Settings",
    roles: ["admin", "seller", "viewer"],
  },
] as const;

export default ROUTES;