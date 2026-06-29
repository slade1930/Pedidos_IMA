// src/components/layout/DashboardContent.tsx

import type { ReactNode } from "react";

// ─── PROPS ─────────────────────────────────────────────────

interface DashboardContentProps {
  children: ReactNode;
  /** Ancho máximo del contenido */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Padding adicional */
  noPadding?: boolean;
}

// ─── ANCHOS ────────────────────────────────────────────────

const MAX_WIDTHS = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "",
} as const;

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * DashboardContent
 * 
 * Contenedor del área de contenido principal del dashboard.
 * 
 * Proporciona:
 * - Padding consistente
 * - Ancho máximo configurable
 * - Espaciado vertical entre secciones
 * 
 * Uso:
 * ```tsx
 * <DashboardContent>
 *   <h1>Dashboard</h1>
 *   <StatsCards />
 * </DashboardContent>
 * 
 * <DashboardContent maxWidth="sm" noPadding>
 *   <UserForm />
 * </DashboardContent>
 * ```
 */
export function DashboardContent({
  children,
  maxWidth = "xl",
  noPadding = false,
}: DashboardContentProps) {
  return (
    <div
      className={`
        mx-auto w-full
        ${MAX_WIDTHS[maxWidth]}
        ${noPadding ? "" : "px-4 sm:px-6 lg:px-8 py-6"}
      `}
    >
      {children}
    </div>
  );
}

export default DashboardContent;