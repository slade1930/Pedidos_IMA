// src/providers/index.tsx

"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";

// ─── PROPS ─────────────────────────────────────────────────

interface AppProvidersProps {
  children: ReactNode;
}

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * AppProviders
 * 
 * Compone todos los providers de la aplicación en el orden correcto.
 * 
 * Orden de anidamiento:
 * 1. AuthProvider — inicializa la sesión (debe ser el más externo)
 * 2. QueryProvider — provee TanStack Query
 * 3. ThemeProvider — (pendiente) provee el tema claro/oscuro
 * 
 * Uso en src/app/layout.tsx:
 * ```tsx
 * <AppProviders>
 *   {children}
 * </AppProviders>
 * ```
 * 
 * Beneficios:
 * - Un solo punto de importación en el layout raíz
 * - Orden de providers garantizado
 * - Fácil agregar/quitar providers en el futuro
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
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
        {children}
      </QueryProvider>
    </AuthProvider>
  );
}

export default AppProviders;