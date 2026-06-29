// src/lib/auth/guards.ts

import type { UserRole } from "@/features/auth/types/auth.types";
import { tokenStorage } from "@/lib/auth/token";

// ─── TIPOS ─────────────────────────────────────────────────

interface AuthCheck {
  isAuthenticated: boolean;
  reason?: "no_token" | "token_expired";
}

// ─── VERIFICACIÓN DE AUTENTICACIÓN ─────────────────────────

export function checkAuth(): AuthCheck {
  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();

  if (!accessToken && !refreshToken) {
    return { isAuthenticated: false, reason: "no_token" };
  }

  return { isAuthenticated: true };
}

// ─── VERIFICACIÓN DE ROLES ─────────────────────────────────

export function hasRole(
  userRole: UserRole | undefined | null,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

// ─── VERIFICACIÓN DE PERMISOS ──────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "users:read", "users:create", "users:update", "users:delete",
    "fairs:read", "fairs:create", "fairs:update", "fairs:delete",
    "products:read", "products:create", "products:update", "products:delete",
    "inventory:read", "inventory:update",
    "orders:read", "orders:create", "orders:update", "orders:delete",
    "payments:read", "payments:create",
    "settings:read", "settings:update",
  ],
  staff: [
    "users:read",
    "fairs:read",
    "products:read",
    "inventory:read", "inventory:update",
    "orders:read", "orders:create", "orders:update",
    "payments:read", "payments:create",
    "settings:read", "settings:update",
  ],
  client: [
    "users:read",
    "fairs:read",
    "products:read",
    "inventory:read",
    "orders:read",
    "payments:read",
    "settings:read",
  ],
};

export function hasPermission(
  userRole: UserRole | undefined | null,
  permission: string
): boolean {
  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;

  return permissions.includes(permission);
}

// ─── RUTAS POR ROL ─────────────────────────────────────────

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/fairs",
    "/dashboard/products",
    "/dashboard/inventory",
    "/dashboard/orders",
    "/dashboard/payments",
    "/dashboard/settings",
  ],
  staff: [
    "/dashboard",
    "/dashboard/fairs",
    "/dashboard/products",
    "/dashboard/inventory",
    "/dashboard/orders",
    "/dashboard/settings",
  ],
  client: [
    "/dashboard",
    "/dashboard/fairs",
    "/dashboard/products",
    "/dashboard/orders",
    "/dashboard/payments",
    "/dashboard/settings",
  ],
};

export function canAccessRoute(
  userRole: UserRole | undefined | null,
  pathname: string
): boolean {
  if (!userRole) return false;

  const routes = ROLE_ROUTES[userRole];
  if (!routes) return false;

  return routes.some((route) => pathname.startsWith(route));
}

// ─── OBJETO GUARD ──────────────────────────────────────────

export const guard = {
  checkAuth,
  hasRole,
  hasPermission,
  canAccessRoute,
} as const;

export default guard;