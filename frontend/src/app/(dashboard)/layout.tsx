import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

// ─── VIEWPORT & COLOR DE TEMA ─────────────────────────────

export const viewport: Viewport = {
  themeColor: "#1b4f72",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── METADATA SEO ──────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "ITAS — Panel de Control",
    template: "%s — ITAS",
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