// src/components/layout/nav-items.ts

import type { UserRole } from "@/features/auth/types/auth.types";

// ─── TIPOS ─────────────────────────────────────────────────

/** Item de navegación del dashboard */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

// ─── ITEMS ─────────────────────────────────────────────────

/**
 * Items de navegación del dashboard.
 * 
 * Single source of truth para la navegación principal.
 * Usado por Sidebar, MobileNav y DashboardSidebar.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "staff", "client"],
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    icon: "Users",
    roles: ["admin"],
  },
  {
    label: "Ferias",
    href: "/dashboard/fairs",
    icon: "Store",
    roles: ["admin", "staff", "client"],
  },
  {
    label: "Productos",
    href: "/dashboard/products",
    icon: "Package",
    roles: ["admin", "staff", "client"],
  },
  {
    label: "Inventario",
    href: "/dashboard/inventory",
    icon: "ClipboardList",
    roles: ["admin", "staff"],
  },
  {
    label: "Órdenes",
    href: "/dashboard/orders",
    icon: "ShoppingCart",
    roles: ["admin", "staff", "client"],
  },
  {
    label: "Pagos",
    href: "/dashboard/payments",
    icon: "CreditCard",
    roles: ["admin", "client"],
  },
  {
    label: "Configuración",
    href: "/dashboard/settings",
    icon: "Settings",
    roles: ["admin", "staff", "client"],
  },
];

// ─── UTILITARIOS ───────────────────────────────────────────

/**
 * Filtra los items de navegación por rol.
 */
export function getNavItemsByRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/**
 * Verifica si una ruta está activa.
 */
export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(href);
}

export default NAV_ITEMS;