// src/app/layout.tsx

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import "./globals.css";

// ─── METADATA ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "IMA System",
    template: "%s — IMA System",
  },
  description: "Sistema de gestión integral IMA",
  keywords: ["IMA", "gestión", "ferias", "inventario", "órdenes"],
  authors: [{ name: "IMA System" }],
  robots: {
    index: true,
    follow: true,
  },
};

// ─── LAYOUT ────────────────────────────────────────────────

/**
 * Layout Raíz
 * 
 * Envuelve toda la aplicación con los providers en orden:
 * 1. AuthProvider — inicializa la sesión
 * 2. QueryProvider — provee TanStack Query
 * 3. ThemeProvider — provee tema claro/oscuro
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AuthProvider
          fallback={
            <div className="flex h-screen items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-sm text-gray-500">Cargando IMA System...</p>
              </div>
            </div>
          }
        >
          <QueryProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}