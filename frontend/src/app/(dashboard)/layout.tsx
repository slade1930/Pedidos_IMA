import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

// ─── VIEWPORT & COLOR DE TEMA ─────────────────────────────

export const viewport: Viewport = {
  themeColor: "#3D5A1E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── METADATA SEO ──────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "IMA System — Panel de Control",
    template: "%s — IMA System",
  },
  description: "Panel de administración y gestión para usuarios, ferias, inventario y pedidos de mercadeo agropecuario.",
  robots: {
    index: false,
    follow: false,
  },
};

// ─── LAYOUT ────────────────────────────────────────────────

/**
 * Layout del Dashboard
 * 
 * Route Group: (dashboard)
 * Rutas: /dashboard, /dashboard/users, /dashboard/fairs, etc.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}